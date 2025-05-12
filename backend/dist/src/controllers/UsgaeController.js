import { adminSupabase } from "../config/supabaseClient.js";
// export async function getTotalUsage(req: AuthRequest, res: Response) {
//   const userId = req.user!.id;
//   const BUCKET = "users-menu-images";
//   const FOLDER = `templates/${userId}`;
//   try {
//     const { data: tplRows, error: tplErr } = await adminSupabase
//       .from("menu_templates")
//       .select("size_bytes")
//       .eq("user_id", userId); // ← filter by user
//     if (tplErr) throw tplErr;
//     const totalDbBytes = tplRows!.reduce(
//       (sum, r) => sum + (r.size_bytes ?? 0),
//       0
//     );
//     // --- 2) Sum Storage usage under this user’s folder ---
//     const { data: files, error: filesErr } = await adminSupabase.storage
//       .from(BUCKET) // ← just the bucket
//       .list(FOLDER, {
//         // ← your “directory” inside the bucket
//         limit: 1000,
//         // recursive: true,          // if you want all nested files
//       });
//     if (filesErr) throw filesErr;
//     const totalFileBytes = files!.reduce((sum, f) => {
//       if (f.metadata?.isFolder) return sum;
//       return sum + (f.metadata?.size ?? 0);
//     }, 0);
//     // --- 3) Combine & convert ---
//     const grandTotalBytes = totalDbBytes + totalFileBytes;
//     const usedMB = +(grandTotalBytes / 1024 / 1024);
//     res.json({ usedMB });
//   } catch (err: any) {
//     console.error("getTotalUsage error:", err);
//     res.status(500).json({ error: err.message });
//   }
// }
export async function getAnalytics(req, res) {
    const uid = req.user.id;
    const BUCKET = "users-menu-images";
    const FOLDER = `templates/${uid}`;
    try {
        // 1) Get all templates for this user (but only need the count)
        const { data: tplRows, error: tplErr } = await adminSupabase
            .from("menu_templates")
            .select("size_bytes", { count: "exact" })
            .eq("user_id", uid);
        if (tplErr)
            throw tplErr;
        const usedMenus = tplRows.length;
        // 2) Sum database bytes
        const totalDbBytes = tplRows.reduce((sum, r) => sum + (r.size_bytes ?? 0), 0);
        // 3) Sum storage bytes
        const { data: files, error: filesErr } = await adminSupabase.storage
            .from(BUCKET)
            .list(FOLDER, { limit: 1000 });
        if (filesErr)
            throw filesErr;
        const totalFileBytes = files.reduce((sum, f) => {
            if (f.metadata?.isFolder)
                return sum;
            return sum + (f.metadata?.size ?? 0);
        }, 0);
        const usedMB = +(totalDbBytes + totalFileBytes) / 1024 / 1024;
        // 4) Fetch this user’s plan limits
        const { data: plan, error: planErr } = await adminSupabase
            .from("plans")
            .select("limit_menus, limit_storage_mb")
            .eq("name", req.user.plan)
            .single();
        if (planErr)
            throw planErr;
        // 5) Return a single JSON blob
        res.json({
            usedMenus,
            usedMB: +usedMB.toFixed(2),
            limitMenus: plan.limit_menus,
            limitStorageMB: plan.limit_storage_mb,
        });
    }
    catch (err) {
        console.error("getAnalytics error:", err);
        res.status(500).json({ error: err.message });
    }
}
