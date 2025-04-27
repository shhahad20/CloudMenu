import { supabase } from '../config/supabaseClient.js';
export const requireAdmin = async (req, res, next) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }
    // fetch this user's role
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    if (error || !profile) {
        return res.status(403).json({ error: 'Cannot verify user role.' });
    }
    if (profile.role !== 'admin') {
        return res.status(403).json({ error: 'Admins only.' });
    }
    next();
};
