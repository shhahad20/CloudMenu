import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyAuth.js';
import { adminSupabase } from '../config/supabaseClient.js';

// GET /api/invoices
export async function listInvoices(
  req: AuthRequest, res: Response
) {
  const userId = req.user!.id;
  const { data, error } = await adminSupabase
    .from('invoices')
    .select('id,amount_cents,currency,status,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /api/invoices/:id
export async function getInvoice(
  req: AuthRequest, res: Response
) {
  const userId = req.user!.id;
  const invoiceId = req.params.id;

  // fetch invoice header
  const { data: inv, error: invErr } = await adminSupabase
    .from('invoices')
    .select('id,amount_cents,currency,status,created_at')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single();

  if (invErr || !inv) return res.status(404).json({ error: 'Invoice not found.' });

  // fetch line items
  const { data: items, error: itemsErr } = await adminSupabase
    .from('invoice_items')
    .select('id,description,quantity,unit_cents,total_cents')
    .eq('invoice_id', invoiceId);

  if (itemsErr) console.error('Could not fetch invoice items', itemsErr);

  res.json({ invoice: inv, items: items || [] });
}
