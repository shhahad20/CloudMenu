import { stripe } from '../config/stripe.js';
export async function createCheckoutSession(req, res) {
    const { items, currency } = req.body;
    const userId = req.user.id; // from verifyAuth
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    try {
        const line_items = items.map(item => ({
            price_data: {
                currency: currency.toLowerCase(),
                product_data: { name: item.name },
                unit_amount: item.price * 100, // still in cents for Stripe
            },
            quantity: item.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            metadata: { userId },
        });
        res.json({ url: session.url });
    }
    catch (err) {
        console.error('Error creating Stripe session:', err);
        res.status(500).json({ error: err.message });
    }
}
