import { createClient } from '@supabase/supabase-js';
export const verifyAuth = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    const token = header.split(' ')[1];
    // Validate token (using your global anon client)
    const { data, error } = await createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY).auth.getUser(token);
    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    // Attach user info
    const authReq = req;
    authReq.user = { id: data.user.id, email: data.user.email };
    // Create a request-scoped Supabase client that carries the JWT
    authReq.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
    // **New**: fetch the plan from your profiles table
    const { data: profile, error: profErr } = await authReq.supabase
        .from('profiles')
        .select('plan')
        .eq('id', authReq.user.id)
        .single();
    if (profErr || !profile) {
        return res.status(500).json({ error: 'Could not load user profile.' });
    }
    // Attach the plan
    authReq.user.plan = profile.plan;
    next();
};
