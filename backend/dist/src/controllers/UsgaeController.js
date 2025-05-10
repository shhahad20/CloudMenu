import { adminSupabase } from "../config/supabaseClient.js";
export async function getStorageUsage(req, res) {
    const userId = req.user.id;
    // assume you keep all user uploads under prefix `${userId}/…`
    const { data: files, error } = await adminSupabase
        .storage
        .from("user-menu-images")
        .list(userId, { limit: 1000, offset: 0 });
    if (error)
        return res.status(500).json({ error: error.message });
    const totalBytes = files.reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0);
    const usedMB = +(totalBytes / 1024 / 1024).toFixed(2);
    res.json({ usedMB });
}
