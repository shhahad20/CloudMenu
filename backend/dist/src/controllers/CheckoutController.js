import { stripe } from "../config/stripe.js";
import { adminSupabase } from "../config/supabaseClient.js";
export const createCheckoutSession = async (req, res) => {
    const { items, currency } = req.body;
    const userId = req.user.id;
    if (!items?.length) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    try {
        // STEP 1: Quick validation that doesn't need database
        const planItems = items.filter(item => item.id.startsWith('plan-'));
        // Check: Multiple plans in cart
        if (planItems.length > 1) {
            return res.status(400).json({
                error: 'You can only purchase one plan at a time',
                code: 'MULTIPLE_PLANS'
            });
        }
        // Check: Valid plan IDs
        const VALID_PLANS = ['plan-Free', 'plan-Pro', 'plan-Enterprise'];
        const invalidPlan = planItems.find(item => !VALID_PLANS.includes(item.id));
        if (invalidPlan) {
            return res.status(400).json({
                error: `Invalid plan: ${invalidPlan.id}`,
                code: 'INVALID_PLAN'
            });
        }
        // STEP 2: Database validation ONLY if there are plans
        let currentUserPlan = null;
        if (planItems.length > 0) {
            console.log(`🔍 Validating plan purchase for user ${userId}`);
            const { data: profile, error: profErr } = await adminSupabase
                .from("profiles")
                .select("plan, updated_at")
                .eq("id", userId)
                .single();
            if (profErr) {
                console.error('Failed to fetch user profile for checkout:', profErr);
                return res.status(500).json({ error: 'Unable to verify current plan' });
            }
            currentUserPlan = profile.plan;
            const targetPlan = planItems[0].id.replace('plan-', '');
            // Check: Already has this plan
            if (currentUserPlan === targetPlan) {
                return res.status(400).json({
                    error: `You already have the ${targetPlan} plan active`,
                    code: 'PLAN_ALREADY_ACTIVE'
                });
            }
            // !!!🧧!!! Check: Business rule - can't switch between paid plans
            // if (currentUserPlan &&
            //     currentUserPlan !== 'Free' &&
            //     targetPlan !== 'Free') {
            //   return res.status(400).json({ 
            //     error: `You're currently on the ${currentUserPlan} plan. Please contact support to switch plans.`,
            //     code: 'PLAN_CONFLICT'
            //   });
            // }
            console.log(`✅ Plan validation passed: ${currentUserPlan} → ${targetPlan}`);
        }
        // STEP 3: Create Stripe session (validation passed)
        console.log(`💳 Creating Stripe session for user ${userId}`);
        const line_items = items.map(item => ({
            price_data: {
                currency: currency.toLowerCase(),
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
                tax_behavior: 'unspecified',
            },
            quantity: item.quantity,
            adjustable_quantity: { enabled: false },
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            metadata: {
                userId,
                cart: JSON.stringify(items),
                plans: JSON.stringify(items.filter(i => i.id.startsWith('plan-'))),
            },
        });
        return res.json({ url: session.url });
    }
    catch (err) {
        console.error('Stripe session error:', err);
        return res.status(500).json({
            error: 'Payment system error',
            code: err.code || 'STRIPE_UNHANDLED',
        });
    }
};
export async function getSession(req, res) {
    const { id } = req.params;
    try {
        const session = await stripe.checkout.sessions.retrieve(id);
        res.json({ customer_email: session.customer_details?.email });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
