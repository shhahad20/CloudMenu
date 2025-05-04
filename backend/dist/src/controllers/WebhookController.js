import { stripe } from '../config/stripe';
export const stripeWebhook = (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // TODO: fulfill the purchase (e.g. mark order paid, send emails)
        console.log('Payment succeeded for user:', session.metadata?.userId);
    }
    res.json({ received: true });
};
