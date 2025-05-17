// src/controllers/invoices.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyAuth.js';
import { adminSupabase } from '../config/supabaseClient.js';
import { ListOptions, listService } from '../services/listService.js';

interface LineItem {
  id: string;
  name: string;
  price: number;     // DECIMAL(10,2)
  quantity: number;
} 

// GET /api/invoices
export async function listInvoices(
  req: AuthRequest,
  res: Response
) {
try {
    // 1) parse query-string
    const page     = parseInt(req.query.page  as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const sortBy   = (req.query.sortBy  as string) || "invoice_date";
    const order    = (req.query.order   as string) as "asc"|"desc" || "desc";
    const q        = (req.query.q       as string) || "";

    // 2) build service options
    const opts: ListOptions = {
      table: "invoices",
      select: "id, invoice_date, subtotal, tax, total, status",
      filters: { user_id: req.user!.id },
      search: q
        ? { term: q, columns: ["status", "id"] }
        : undefined,
      sort: { column: sortBy, order },
      pagination: { page, pageSize },
    };

    // 3) call listService
    const { data, total } = await listService(adminSupabase, opts);

    // 4) respond with data + pagination meta
    res.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    console.error("listInvoices error:", err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/invoices/:id
export async function getInvoice(
  req: AuthRequest,
  res: Response
) {
  const userId = req.user!.id;
  const invoiceId = Number(req.params.id);

  // fetch invoice header
  const { data: inv, error: invErr } = await adminSupabase
    .from('invoices')
    .select('id, invoice_date, subtotal, tax, total, status')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single();

  if (invErr || !inv) {
    console.error('getInvoice header error:', invErr);
    return res.status(404).json({ error: 'Invoice not found.' });
  }

  // fetch line items
  const { data: items, error: itemsErr } = await adminSupabase
    .from('invoice_items')
    .select('id, product_id, description, unit_price, quantity, line_total')
    .eq('invoice_id', invoiceId);

  if (itemsErr) {
    console.error('getInvoice items error:', itemsErr);
    // still return header even if items fetch failed
  }

  res.json({ invoice: inv, items: items || [] });
}

// POST /api/invoices
export async function createInvoice(
  req: AuthRequest,
  res: Response
) {
  const userId = req.user!.id;
  const { items } = req.body as { items: LineItem[] };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided.' });
  }

  // 1) compute decimals
  const withTotals = items.map(i => ({
    ...i,
    lineTotal: parseFloat((i.price * i.quantity).toFixed(2)),
  }));
  const subtotal = parseFloat(
    withTotals.map(i => i.lineTotal).reduce((a, b) => a + b, 0).toFixed(2)
  );
  const tax = 0;
  const total = parseFloat((subtotal + tax).toFixed(2));

  // 2) insert invoice header
  const { data: invData, error: invError } = await adminSupabase
    .from('invoices')
    .insert({
      user_id:   userId,
      subtotal,
      tax,
      total,
      status: 'paid',
      // invoice_date will default
    })
    .select('id')
    .single();

  if (invError || !invData) {
    console.error('createInvoice header error:', invError);
    return res.status(500).json({ error: 'Could not create invoice.' });
  }
  const invoiceId = invData.id;

  // 3) insert line items
  const itemsPayload = withTotals.map(i => ({
    invoice_id:  invoiceId,
    product_id:  i.id,
    description: i.name,
    unit_price:  parseFloat(i.price.toFixed(2)),
    quantity:    i.quantity,
    line_total:  i.lineTotal,
  }));

  const { error: itemsError } = await adminSupabase
    .from('invoice_items')
    .insert(itemsPayload);

  if (itemsError) {
    console.error('createInvoice items error:', itemsError);
    return res.status(500).json({ error: 'Could not create invoice items.' });
  }

  // 4) return the new invoice ID
  res.status(201).json({ invoiceId });
}
