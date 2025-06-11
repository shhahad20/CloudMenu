export async function verifyPayment(req, res) {
    const stripe = req.app.get('stripe');
    const sessionId = req.query.session_id;
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session_id' });
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            // TODO: save order to DB, send confirmation email…
            return res.json({ paid: true });
        }
        else {
            return res.status(402).json({ paid: false });
        }
    }
    catch (err) {
        console.error('Verify payment error', err);
        return res.status(500).json({ error: 'Verification failed' });
    }
}
