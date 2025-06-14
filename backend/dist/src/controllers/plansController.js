import { adminSupabase, supabase } from '../config/supabaseClient.js';
// GET /plans
export async function getPlans(req, res) {
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
export async function updatePlan(req, res) {
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
export async function updateUserPlan(userId, plan) {
    if (!['Free', 'Pro', 'Enterprise'].includes(plan)) {
        throw new Error('Invalid plan.');
    }
    const { data, error } = await adminSupabase
        .from('profiles')
        .update({ plan })
        .eq('id', userId)
        .select('id,plan')
        .maybeSingle();
    if (error) {
        console.error('Error updating plan:', error);
        throw new Error(error.message);
    }
    // 3) Handle the case where no row was updated
    if (!data) {
        console.warn(`⚠️ No profile found for user ${userId}; plan not updated`);
        // You can choose to throw here or simply return null
        return null;
    }
    console.log(`✅ Updated plan for user ${userId} → ${data.plan}`);
    return data;
}
// export async function updateMyPlan(
//   req: AuthRequest,
//   res: Response
// ) {
//   const { plan } = req.body;
//   const userId = req.user!.id;
//   try {
//     const data = await updateUserPlan(userId, plan, req.supabase!);
//     res.json({ message: 'Plan updated', profile: data });
//   } catch (error: any) {
//     if (error.message === 'Invalid plan.') {
//       return res.status(400).json({ error: error.message });
//     }
//     res.status(500).json({ error: error.message });
//   }
// }
