import { Response } from "express";
import { AuthRequest } from "../middleware/verifyAuth.js";
import { adminSupabase } from "../config/supabaseClient.js";

export async function getTotalUsage(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  try {
    const { data: tplRows, error: tplErr } = await adminSupabase
      .from("menu_templates")
      .select("size_bytes")
      .eq("user_id", userId); // ← filter by user
    if (tplErr) throw tplErr;
    const dbBytes = tplRows!.reduce((sum, r) => sum + (r.size_bytes || 0), 0);
    // --- 2) Sum Storage usage under this user’s folder ---
    const { data: files, error: filesErr } = await adminSupabase.storage
      .from(`users-menu-images/templates/${userId}`)
      .list(userId, {
        // ← your user “directory”
        limit: 1000,
        // recursive: true            // ← include nested files
      });
    if (filesErr) throw filesErr;
    const fileBytes = files!.reduce((sum, f) => {
      if (f.metadata && f.metadata.isFolder) {
        // Handle nested files manually if needed
        return sum; // Skip folders
      }
      return sum + (f.metadata?.size || 0);
    }, 0);

    // --- 3) Combine & convert ---
    const usedMB = +((dbBytes + fileBytes) / 1024 / 1024).toFixed(2);
    res.json({ usedMB });
  } catch (err: any) {
    console.error("getTotalUsage error:", err);
    res.status(500).json({ error: err.message });
  }
}
