import { stripe } from "../config/stripe.js";
export const createCheckoutSession = async (req, res) => {
    const { items, currency } = req.body;
    const userId = req.user.id;
    if (!items?.length) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    try {
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
