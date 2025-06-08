import { stripe } from "../config/stripe.js";
export async function createCheckoutSession(req, res) {
    const { items, currency } = req.body;
    const userId = req.user.id; // from verifyAuth
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }
    try {
        const line_items = items.map((item) => ({
            // price_data: {
            //   currency: currency.toLowerCase(),
            //   product_data: { name: item.name },
            //   unit_amount: item.price * 100, // still in cents for Stripe
            // },
            // quantity: item.quantity,
            price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                    name: item.name,
                    // description: item.description || '',
                    metadata: { your_product_id: item.id }, // Internal reference
                },
                unit_amount: Math.round(item.price),
                tax_behavior: 'unspecified', // Required for some countries
            },
            quantity: item.quantity,
            adjustable_quantity: {
                enabled: false, // Set true if allowing quantity changes
            },
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items,
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            metadata: {
                userId,
                cart: JSON.stringify(items.map((i) => ({ id: i.id, qty: i.quantity }))),
            },
            payment_intent_data: {
                metadata: {
                    userId, // Duplicate for easier webhook access
                },
            },
        });
        // Return session URL for redirect
        res.json({ url: session.url });
    }
    catch (err) {
        console.error("Stripe session error:", {
            message: err.message,
            stack: err.stack,
            raw: err.raw, // Stripe-specific errors
        });
        res.status(500).json({
            error: "Payment system error",
            code: err.code || "STRIPE_UNHANDLED",
        });
    }
}
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
