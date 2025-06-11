import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyAuth.js';

// PATCH /api/profiles/me/plan
export async function updateMyPlan(
  req: AuthRequest,
  res: Response
) {
  const { plan } = req.body;
  const userId = req.user!.id;

  if (!['Free','Pro','Enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan.' });
  }

  const { data, error } = await req.supabase!
    .from('profiles')
    .update({ plan })
    .eq('id', userId)
    .select('id,plan')
    .single();

  if (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Plan updated', profile: data });
}
