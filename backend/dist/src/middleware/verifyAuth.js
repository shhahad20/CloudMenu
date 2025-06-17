import { createClient } from "@supabase/supabase-js";
export const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Missing or malformed Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    // 1) Use Service Role key to verify the JWT and fetch Supabase user
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr, } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
        console.error("[verifyAuth] auth.getUser error:", authErr);
        return res.status(401).json({ error: "Invalid or expired token." });
    }
    // 2) Attach user info
    const authReq = req;
    authReq.user = { id: user.id, email: user.email };
    // 3) Create request‑scoped Supabase client (anon key + user JWT) for RLS
    authReq.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
    // 4) Optionally fetch additional user data (e.g. plan)
    const { data: profile, error: profErr } = await authReq.supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
    if (profErr || !profile) {
        console.error("[verifyAuth] could not fetch profile:", profErr);
        return res.status(500).json({ error: "Could not load user profile." });
    }
    authReq.user.plan = profile.plan;
    next();
};
