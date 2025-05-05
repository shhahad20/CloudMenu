import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient.js';

// GET /plans
export async function getPlans(req: Request, res: Response) {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('price_cents', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({ error: error.message });
  }

  // convert cents → dollars
//   const plans = data!.map((p) => ({
//     name: p.name,
//     price: (p.price_cents / 100).toFixed(2),
//   }));
  res.json(data);
}

// PUT /plans/:name
// (admin-only) update price for a plan
export async function updatePlan(req: Request, res: Response) {
  const { name } = req.params;
  const { price_cents } = req.body;

  if (typeof price_cents !== 'number') {
    return res.status(400).json({ error: 'price_cents must be a number' });
  }

  const { data, error } = await supabase
    .from('plans')
    .update({ price_cents, updated_at: new Date().toISOString() })
    .eq('name', name)
    .single();

  if (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Plan updated', plan: data });
}
