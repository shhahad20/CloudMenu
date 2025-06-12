import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../config/stripe.js';
import { adminSupabase } from '../config/supabaseClient.js';
import 'dotenv/config'
import { updateUserPlan } from './PlansController.js';
import { cloneTemplate } from './TemplateController.js';
import { createInvoice } from './InvoiceController.js';
import { cloneTemplateService } from '../services/templateService.js';
 
export const config = {
  api: { bodyParser: false },  // raw body needed for signature verification
};
const getRawBody = (req: Request): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    
    req.on('data', (chunk: any) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
};
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
// Internal helper for creating an invoice record (same logic as your controller)
async function createInvoiceRecord(params: {
  userId: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  currency: string;
  stripeSessionId: string;
  amountTotal: number;
}) {
  const { userId, items, currency, stripeSessionId, amountTotal } = params;

  // 1) Insert invoice header
  const { data: invData, error: invError } = await adminSupabase
    .from('invoices')
    .insert({
      user_id:       userId,
      subtotal:      items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      tax:           0,
      total:         amountTotal / 100,       // assuming amountTotal is in cents
      status:        'paid',
      stripe_txn_id: stripeSessionId,
      currency,
    })
    .select('id')
    .single();

  if (invError || !invData) {
    throw new Error('Could not create invoice header');
  }
  const invoiceId = invData.id;

  // 2) Insert line items
  const lineItems = items.map(i => ({
    invoice_id:  invoiceId,
    product_id:  i.id,
    description: i.name,
    unit_price:  i.price,
    quantity:    i.quantity,
    line_total:  i.price * i.quantity,
  }));

  const { error: itemsError } = await adminSupabase
    .from('invoice_items')
    .insert(lineItems);

  if (itemsError) {
    throw new Error('Could not create invoice items');
  }

  return invoiceId;
}

export const stripeWebhook = async (req: Request, res: Response) => {
  console.log('👉 Received webhook:', req.method, req.url, JSON.stringify(req.headers));
    if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  console.log('🔥  Webhook received at', new Date().toISOString());
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = await getRawBody(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✔️  Signature verified, event type:', event.type);
  } catch (err: any) {
    console.error('❌  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
 // 2) React only to a successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
// Safely unwrap metadata
    const metadata = session.metadata ?? {};
    const userId = metadata.userId;
    if (!userId) {
      console.error('⚠️  Missing userId in session.metadata');
      return res.status(400).end();
    }

    // Parse plan IDs and cart items
    let planIds: string[] = [];
    let cartItems: Array<{ id: string; name: string; price: number; quantity: number }> = [];

  try {
    // 1) First, update user plan(s)
    if (planIds.length) {
      await Promise.all(
        planIds.map(planId => updateUserPlan(userId, planId))
      );
    }

    // 2) Then fetch the updated plan from your DB
    const { data: profile, error: profErr } = await adminSupabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (profErr || !profile?.plan) {
      throw new Error('Could not retrieve user plan');
    }
    const userPlan = profile.plan as 'Free' | 'Pro' | 'Enterprise';

    // 3) Now clone templates under that plan
    await Promise.all(
      cartItems.map(item =>
        cloneTemplateService(item.id, userId, userPlan)
      )
    );

      // 4) Create an invoice
      await createInvoiceRecord({
        userId,
        items: cartItems,
        currency: session.currency!,
        stripeSessionId: session.id,
        amountTotal: session.amount_total!,  // in cents
      });

      console.log(`✅ Fulfilled order for session ${session.id}`);
    } catch (fulfillErr) {
      console.error('❌ Error fulfilling order:', fulfillErr);
      // Returning non-2xx tells Stripe to retry this webhook
      return res.status(500).end();
    }
  }

  // 5) Always respond 2xx to acknowledge receipt
  res.json({ received: true });
}