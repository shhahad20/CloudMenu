import { Request, Response } from "express";
import { adminSupabase, supabase } from "../config/supabaseClient.js";
import { AuthRequest } from "../middleware/verifyAuth.js";
import { handleUpload } from "../helper/helper.js";

// Helper to compute size of a JS object when serialized
function byteSize(obj: any) {
  return Buffer.byteLength(JSON.stringify(obj), "utf8");
}
const planLimits: Record<
  string,
  { maxProjects: number; maxStorageMB: number }
> = {
  Free: { maxProjects: 2, maxStorageMB: 50 },
  Pro: { maxProjects: 10, maxStorageMB: 50 * 1024 }, // 50 GB
  Enterprise: { maxProjects: Infinity, maxStorageMB: 100 * 1024 }, // 100 GB
};

function bytesToMB(bytes: number) {
  return bytes / 1024 / 1024;
}
// GET /templates
export const listUserTemplates = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { data, error } = await supabase
    .from("menu_templates")
    .select("*")
    .eq("user_id", userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const listLibraryTemplates = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("library_templates").select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const getLibraryTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data: template, error: fetchError } = await supabase
    .from("library_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !template) {
    return res.status(404).json({ error: "Template not found." });
  }

  // 2) Bump view_count by reading + writing
  const newCount = (template.view_count || 0) + 1;
  const { error: updateError } = await adminSupabase
    .from("library_templates")
    .update({ view_count: newCount })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update view_count:", updateError);
    // proceed anyway
  }

  res.json(template);
};
// POST /templates
export const createTemplate = async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { config } = req.body as { config: any };

    // 1) optionally upload and inject into config
    const imageUrl = await handleUpload(req.file);
    const finalConfig = {
      ...config,
      ...(imageUrl ? { headerImageUrl: imageUrl } : {}),
    };

    // 2) compute byte size of the config
    const size_bytes = byteSize(finalConfig);

    // 3) insert into DB
    const { data, error } = await supabase
      .from("menu_templates")
      .insert([{ user_id: userId, config: finalConfig, size_bytes }])
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /templates/:id
export const getTemplate = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const templateId = req.params.id;

  // Fetch only this user’s copy
  const { data: template, error: fetchError } = await adminSupabase
    .from("menu_templates")
    .select("*")
    .eq("id", templateId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !template) {
    return res.status(404).json({ error: "Template not found." });
  }
  // 2) Bump view_count by reading + writing
  // const newCount = (template.view_count || 0) + 1;
  // const { error: updateError } = await adminSupabase
  //   .from("menu_templates")
  //   .update({ view_count: newCount })
  //   .eq("id", templateId);

  // if (updateError) {
  //   console.error("Failed to update view_count:", updateError);
  //   // proceed anyway
  // }

  // Respond with the full template row
  return res.json(template);
};

// PATCH /templates/:id
export const updateTemplate = async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response
) => {
  const userId = req.user!.id;
  const plan = req.user!.plan;
  const templateId = req.params.id;

  if (!plan || !planLimits[plan]) {
    return res
      .status(400)
      .json({
        error:
          "Invalid or missing subscription plan. Please ensure your account has a valid plan to proceed.",
      });
  }
  const { maxProjects, maxStorageMB } = planLimits[plan];

  try {
    // 1) Fetch existing template
    const templateId = req.params.id;
    const { data: existing, error: fetchErr } = await adminSupabase
      .from("menu_templates")
      .select("config,size_bytes")
      .eq("id", templateId)
      .eq("user_id", userId)
      .single();
    if (fetchErr || !existing) {
      return res.status(404).json({ error: "Template not found." });
    }

    // 2) Build newConfig
    let newConfig = { ...existing.config, ...(req.body.config || {}) };
    if (req.file) {
      const imageUrl = await handleUpload(req.file,templateId,  userId);
      newConfig.header_image = imageUrl;
    }

    // 3) Enforce plan quotas
    // a) Check project count
    if (plan !== "Enterprise") {
      const { count: cnt, error: cntErr } = await adminSupabase
        .from("menu_templates")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", userId);
      if (cntErr) throw cntErr;
      if ((cnt || 0) > maxProjects) {
        return res
          .status(403)
          .json({
            error: `${plan} plan allows up to ${maxProjects} projects.`,
          });
      }
    }

    // b) Check storage usage
    //  • sum existing DB bytes minus this template’s old size_bytes
    const { data: allRows, error: dbErr } = await adminSupabase
      .from("menu_templates")
      .select("size_bytes")
      .eq("user_id", userId);
    if (dbErr) throw dbErr;
    const dbBytes =
      (allRows || []).reduce((sum, r) => sum + (r.size_bytes || 0), 0) -
      (existing.size_bytes || 0);

    // sum file-storage bytes
    const prefix = `templates/${userId}`;
    const { data: files, error: filesErr } = await adminSupabase.storage
      .from("users-menu-images")
      .list(prefix, { limit: 1000 });
    if (filesErr) throw filesErr;
    const fileBytes = (files || []).reduce((sum, f) => sum + (f.metadata?.size || 0), 0);

    // new template size
    const newBytes = byteSize(newConfig);
    const projectedMB = bytesToMB(dbBytes + fileBytes + newBytes);
    if (projectedMB > maxStorageMB) {
      return res.status(403).json({
        error: `${plan} plan storage limit exceeded: ${projectedMB.toFixed(
          2
        )} / ${maxStorageMB} MB`,
      });
    }

    // 4) Persist update
    const { data, error: updateErr } = await adminSupabase
      .from("menu_templates")
      .update({
        config: newConfig,
        size_bytes: newBytes,
        updated_at: "now()",
      })
      .eq("id", templateId)
      .select("config")
      .single<{ config: any }>();
    if (updateErr) throw updateErr;
      console.log("Updated template", data.config);
    return res.json({ config: data.config });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /templates/:id
export const deleteTemplate = async (req: AuthRequest, res: Response) => {};
// POST /templates/:id/clone
export const cloneTemplate = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const plan = req.user!.plan;
  if (!plan || !planLimits[plan]) {
    return res.status(400).json({ error: `Invalid or missing plan.` });
  }

  const libraryId = req.params.libraryId;
  const { maxProjects, maxStorageMB } = planLimits[plan];

  try {
    // 1) Fetch library template
    const { data: lib, error: libErr } = await supabase
      .from("library_templates")
      .select("config,name,preview_url")
      .eq("id", libraryId)
      .single();
    if (libErr || !lib) {
      return res.status(404).json({ error: "Library template not found." });
    }

    // 2) Enforce plan quotas
    // a) project count
    if (plan !== "Enterprise") {
      const { count: cnt, error: cntErr } = await adminSupabase
        .from("menu_templates")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", userId);
      if (cntErr) throw cntErr;
      if ((cnt || 0) >= maxProjects) {
        return res
          .status(403)
          .json({
            error: `${plan} plan allows up to ${maxProjects} projects.`,
          });
      }
    }

    // b) storage usage
    const { data: dbRows, error: dbErr } = await adminSupabase
      .from("menu_templates")
      .select("size_bytes")
      .eq("user_id", userId);
    if (dbErr) throw dbErr;
    const dbBytes = dbRows!.reduce((sum, r) => sum + (r.size_bytes || 0), 0);

    const { data: files, error: filesErr } = await adminSupabase.storage
      .from("users-menu-images")
      .list(userId, { limit: 1000 });
    if (filesErr) throw filesErr;
    const fileBytes = files!.reduce(
      (sum, f) => sum + (f.metadata?.size || 0),
      0
    );

    const newBytes = byteSize(lib.config);
    const projectedMB = bytesToMB(dbBytes + fileBytes + newBytes);
    if (projectedMB > maxStorageMB) {
      return res.status(403).json({
        error: `${plan} plan storage limit exceeded: ${projectedMB.toFixed(
          2
        )} / ${maxStorageMB} MB`,
      });
    }

    // 3) Insert clone
    const { data, error } = await supabase
      .from("menu_templates")
      .insert([
        {
          user_id: userId,
          library_id: libraryId,
          name: lib.name,
          preview_url: lib.preview_url,
          config: lib.config,
          size_bytes: newBytes,
        },
      ])
      .single();
    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /:id/view
export async function recordTemplateView(req: AuthRequest, res: Response) {
  const templateId = req.params.id;
  const userId = req.user!.id;

  // 1) Optional: verify that template belongs to this user
  const { data: tpl, error: fetchTplErr } = await adminSupabase
    .from("menu_templates")
    .select("id, view_count")
    .eq("id", templateId)
    .eq("user_id", userId)
    .single();
  if (fetchTplErr || !tpl) {
    return res.status(404).json({ error: "Template not found." });
  }

  // 2) Insert a view event
  const { error: insertErr } = await adminSupabase
    .from("menu_template_views")
    .insert([{ template_id: templateId }]);

  if (insertErr) {
    console.error("Failed to insert into template_views:", insertErr);
    // continue anyway
  }

  // 3) Increment the aggregate counter
  const newCount = (tpl.view_count || 0) + 1;
  const { error: updateErr } = await adminSupabase
    .from("menu_templates")
    .update({ view_count: newCount })
    .eq("id", templateId);

  if (updateErr) {
    console.error("Failed to bump view_count:", updateErr);
    // continue anyway
  }

  res.json({ ok: true });
}

// POST /lib/:id/view
export async function recordLibraryView(req: AuthRequest, res: Response) {
  const templateId = req.params.id;

  // 1) Read current count
  const { data: tmpl, error: fetchError } = await adminSupabase
    .from("library_templates")
    .select("view_count")
    .eq("id", templateId)
    .single();

  if (fetchError || !tmpl) {
    console.error("View tracking: template not found", fetchError);
    return res.status(404).json({ error: "Template not found." });
  }

  // 2) Write back incremented value
  const newCount = (tmpl.view_count || 0) + 1;
  const { error: updateError } = await adminSupabase
    .from("library_templates")
    .update({ view_count: newCount })
    .eq("id", templateId);

  if (updateError) {
    console.error("View tracking: failed to increment", updateError);
    // proceed anyway
  }

  // 3) Return success (optionally include newCount)
  res.json({ ok: true, view_count: newCount });
}
