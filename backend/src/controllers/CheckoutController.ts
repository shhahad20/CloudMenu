import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/verifyAuth.js';
import { stripe } from '../config/stripe.js';

interface CartItem {
  id: string;
  name: string;
  price: number;    // whole units
  quantity: number;
}

export async function createCheckoutSession(
  req: AuthRequest<{ items: CartItem[]; currency: 'USD' | 'SAR' }>,
  res: Response
) {
  const { items, currency } = req.body;
  const userId = req.user!.id;    // from verifyAuth

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
  } catch (err: any) {
    console.error('Error creating Stripe session:', err);
    res.status(500).json({ error: err.message });
  }
}



export async function getSession(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    res.json({ customer_email: session.customer_details?.email });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
