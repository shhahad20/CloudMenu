import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../config/stripe.js';
import { adminSupabase } from '../config/supabaseClient.js';
import 'dotenv/config'


// This is your fulfillment logic
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('   ➡️  handleCheckoutSessionCompleted start');
  const userId = session.metadata?.userId as string;
  console.log('   session metadata.userId =', userId);
  if (!userId) throw new Error('Missing userId');

  const amountCents = session.amount_total!;
  const currency    = session.currency!.toUpperCase();
  const createdAt   = new Date(session.created! * 1000).toISOString();

  const { data: invoice, error: invErr } = await adminSupabase
    .from('invoices')
    .insert({
      user_id:       userId,
      amount_cents:  amountCents,
      currency,
      status:        'paid',
      created_at:    createdAt,
    })
    .select('id')
    .single();

  console.log('   inserted invoice:', invoice, 'error:', invErr);
  if (invErr) throw invErr;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id!, { limit: 100 });
  console.log(`   got ${lineItems.data.length} line items from Stripe`);

  const itemsToInsert = lineItems.data.map(li => ({
    invoice_id:  invoice.id,
    description: li.description!,
    quantity:    li.quantity!,
    unit_cents:  li.amount_subtotal! / li.quantity!,
    total_cents: li.amount_subtotal!,
  }));

  const { error: itemsErr } = await adminSupabase
    .from('invoice_items')
    .insert(itemsToInsert);

  console.log('   inserted invoice_items error:', itemsErr);
  if (itemsErr) throw itemsErr;

  console.log('   ✔️  handleCheckoutSessionCompleted done');
}

export const stripeWebhook = async (req: Request, res: Response) => {
  console.log('🔥  Webhook received at', new Date().toISOString());
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✔️  Signature verified, event type:', event.type);
  } catch (err: any) {
    console.error('❌  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutSessionCompleted(session);
    } catch (err) {
      console.error('❌  Error in fulfillment logic:', err);
    }
  } else {
    console.log('⏭  Event type not handled:', event.type);
  }

  // Acknowledge receipt immediately
  res.json({ received: true });
};

