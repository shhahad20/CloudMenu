import { Response, Request, RequestHandler } from "express";
import { stripe } from "../config/stripe.js";
import Stripe from "stripe";

export interface CartItem {
  id: string;
  name: string;
  price: number; // whole units
  quantity: number;
}
interface CheckoutRequestBody {
  items: CartItem[];
  currency: 'USD' | 'SAR';
}

export const createCheckoutSession: RequestHandler<
  {},                // no URL params
  { url?: string; error?: string; code?: string },   // response body shape (optional)
  CheckoutRequestBody // request body shape
> = async (req, res) => {
  const { items, currency } = req.body;
  const userId = (req as any).user.id;

  if (!items?.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
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
      },
    });

    return res.json({ url: session.url! });
  } catch (err: any) {
    console.error('Stripe session error:', err);
    return res.status(500).json({
      error: 'Payment system error',
      code: err.code || 'STRIPE_UNHANDLED',
    });
  }
};

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
