import Stripe from "stripe";
import { Request, Response } from "express";

export async function verifyPayment(req: Request, res: Response) {
  const stripe: Stripe = req.app.get('stripe');
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      // TODO: save order to DB, send confirmation email…
      return res.json({ paid: true });
    } else {
      return res.status(402).json({ paid: false });
    }
  } catch (err: any) {
    console.error('Verify payment error', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}