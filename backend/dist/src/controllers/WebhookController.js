import { stripe } from "../config/stripe.js";
import { adminSupabase } from "../config/supabaseClient.js";
import "dotenv/config";
import { updateUserPlan } from "./PlansController.js";
import { cloneTemplateService } from "../services/templateService.js";
export const config = {
    api: { bodyParser: false }, // raw body needed for signature verification
};
const getRawBody = (req) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => {
            chunks.push(chunk);
        });
        req.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        req.on("error", (error) => {
            reject(error);
        });
    });
};
// This is your fulfillment logic
export async function handleCheckoutSessionCompleted(session) {
    console.log("   ➡️  handleCheckoutSessionCompleted start");
    const userId = session.metadata?.userId;
    console.log("   session metadata.userId =", userId);
    if (!userId)
        throw new Error("Missing userId");
    const amountCents = session.amount_total;
    const currency = session.currency.toUpperCase();
    const createdAt = new Date(session.created * 1000).toISOString();
    const { data: invoice, error: invErr } = await adminSupabase
        .from("invoices")
        .insert({
        user_id: userId,
        amount_cents: amountCents,
        currency,
        status: "paid",
        created_at: createdAt,
    })
        .select("id")
        .single();
    console.log("   inserted invoice:", invoice, "error:", invErr);
    if (invErr)
        throw invErr;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
    });
    console.log(`   got ${lineItems.data.length} line items from Stripe`);
    const itemsToInsert = lineItems.data.map((li) => ({
        invoice_id: invoice.id,
        description: li.description,
        quantity: li.quantity,
        unit_cents: li.amount_subtotal / li.quantity,
        total_cents: li.amount_subtotal,
    }));
    const { error: itemsErr } = await adminSupabase
        .from("invoice_items")
        .insert(itemsToInsert);
    console.log("   inserted invoice_items error:", itemsErr);
    if (itemsErr)
        throw itemsErr;
    console.log("   ✔️  handleCheckoutSessionCompleted done");
}
// Internal helper for creating an invoice record (same logic as your controller)
async function createInvoiceRecord(params) {
    const { userId, items, currency, stripeSessionId, amountTotal } = params;
    // 1) Insert invoice header
    const { data: invData, error: invError } = await adminSupabase
        .from("invoices")
        .insert({
        user_id: userId,
        subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        tax: 0,
        total: amountTotal / 100,
        status: "paid",
        stripe_txn_id: stripeSessionId,
        currency,
    })
        .select("id")
        .single();
    if (invError || !invData) {
        console.error("createInvoiceRecord header error:", invError);
        throw new Error(`Could not create invoice header: ${invError?.message}`);
    }
    const invoiceId = invData.id;
    // 2) Insert line items
    const lineItems = items.map((i) => ({
        invoice_id: invoiceId,
        product_id: i.id,
        description: i.name,
        unit_price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
    }));
    const { error: itemsError } = await adminSupabase
        .from("invoice_items")
        .insert(lineItems);
    if (itemsError) {
        throw new Error("Could not create invoice items");
    }
    return invoiceId;
}
export const stripeWebhook = async (req, res) => {
    // 1) Only POST
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end("Method Not Allowed");
    }
    // 2) Read & verify signature
    const sig = req.headers["stripe-signature"];
    const rawBody = await getRawBody(req);
    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("✔️  Signature verified, event type:", event.type);
    }
    catch (err) {
        console.error("❌  Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // 3) Immediately ACKNOWLEDGE
    res.status(200).json({ received: true });
    // 4) Fire‑and‑forget your fulfillment logic
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        void handleCheckoutSession(session).catch((err) => {
            // if this errors, Stripe will not retry (we already sent 200).
            // log so you can debug in your log aggregator
            console.error("❌ Error in background job:", err);
        });
    }
};
export async function handleCheckoutSession(session) {
    // 1) Unwrap metadata
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    if (!userId) {
        throw new Error("Missing userId in session.metadata");
    }
    let planIdsRaw = [];
    const rawPlans = metadata.plans || metadata.planIds;
    if (rawPlans) {
        try {
            const parsed = JSON.parse(rawPlans);
            if (!Array.isArray(parsed))
                throw new Error();
            planIdsRaw = parsed;
        }
        catch {
            throw new Error("Invalid plans metadata; must be JSON array of strings or objects with `id`");
        }
    }
    // 2) Normalize into exactly "Free" | "Pro" | "Enterprise"
    const PLAN_MAP = {
        "plan-Free": "Free",
        "plan-Pro": "Pro",
        "plan-Enterprise": "Enterprise",
    };
    const planIds = planIdsRaw.map((p) => {
        const rawId = typeof p === "string" ? p : p.id;
        const normalized = PLAN_MAP[rawId];
        if (!normalized) {
            throw new Error(`Unknown plan ID "${rawId}" in metadata`);
        }
        return normalized;
    });
    console.log("📦 [Webhooks] normalized planIds:", planIds);
    // 3) Retrieve the session with line items expanded
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
    });
    const lineItems = (fullSession.line_items?.data || []);
    let cartItems = [];
    const rawCart = metadata.cart || metadata.cartItems;
    if (rawCart) {
        try {
            cartItems = JSON.parse(rawCart);
            if (!Array.isArray(cartItems))
                throw new Error();
        }
        catch {
            throw new Error("Invalid cart metadata; must be JSON array of items");
        }
    }
    else {
        throw new Error("Missing cart metadata in session.metadata");
    }
    console.log(`🛒 [Webhooks] Parsed cartItems:`, cartItems);
    // 5) Update user plan(s)
    if (planIds.length) {
        await Promise.all(planIds.map((planId) => {
            console.log(`🔄 Updating user ${userId} → ${planId}`);
            return updateUserPlan(userId, planId);
        }));
    }
    // 6) Fetch the user's (new) plan from Supabase
    const { data: profile, error: profErr } = await adminSupabase
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
    if (profErr || !profile?.plan) {
        throw new Error(profErr?.message || "Could not retrieve updated user plan");
    }
    const userPlan = profile.plan;
    // 7) Clone each template under the user's new plan
    await Promise.all(cartItems.map(async (item) => {
        try {
            await cloneTemplateService(item.id, userId, userPlan);
        }
        catch (cloneErr) {
            console.error(`❌ [Webhooks] cloneTemplateService failed for item ${item.id}:`, cloneErr);
            // decide whether to rethrow or continue – here we rethrow to reject the webhook
            throw cloneErr;
        }
    }));
    // 8) Create an invoice record in your database
    await createInvoiceRecord({
        userId,
        items: cartItems,
        currency: session.currency,
        stripeSessionId: session.id,
        amountTotal: session.amount_total, // cents
    });
    console.log(`✅ [Webhooks] Successfully processed session ${session.id} for user ${userId}`);
}
