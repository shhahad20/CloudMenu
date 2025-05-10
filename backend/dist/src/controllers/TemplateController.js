import { adminSupabase, supabase } from "../config/supabaseClient.js";
import { handleUpload } from "../helper/helper.js";
// Helper to compute size of a JS object when serialized
function byteSize(obj) {
    return Buffer.byteLength(JSON.stringify(obj), "utf8");
}
// GET /templates
export const listUserTemplates = async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("menu_templates")
        .select("*")
        .eq("user_id", userId);
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
export const listLibraryTemplates = async (_req, res) => {
    const { data, error } = await supabase.from("library_templates").select("*");
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
export const getLibraryTemplate = async (req, res) => {
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
export const createTemplate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { config } = req.body;
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
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// GET /templates/:id
export const getTemplate = async (req, res) => {
    const userId = req.user.id;
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
export const updateTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        const userId = req.user.id;
        // 1) Fetch existing config
        const { data: existing, error: fetchErr } = await adminSupabase
            .from("menu_templates")
            .select("config")
            .eq("id", templateId)
            .eq("user_id", userId)
            .single();
        if (fetchErr || !existing) {
            console.error("Fetch template error:", fetchErr);
            return res.status(404).json({ error: "Template not found." });
        }
        // 2) Start newConfig as a clone of the old
        let newConfig = { ...existing.config };
        // 3) If there’s a JSON body with edits, merge them in
        if (req.body.config) {
            // shallow merge top-level keys; for deep merging you could use lodash.merge
            newConfig = { ...newConfig, ...req.body.config };
        }
        // 4) If there’s a file, upload & replace header_image
        if (req.file) {
            const imageUrl = await handleUpload(req.file, templateId);
            newConfig.header_image = imageUrl;
        }
        // compute new size
        const size_bytes = byteSize(newConfig);
        // 5) Persist back to Supabase
        const { data, error: updateErr } = await adminSupabase
            .from("menu_templates")
            .update({ config: newConfig, updated_at: "now()", size_bytes })
            .eq("id", templateId)
            .single();
        if (updateErr) {
            return res
                .status(500)
                .json({ error: "DB update failed: " + updateErr.message });
        }
        return res.json(data);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
// DELETE /templates/:id
export const deleteTemplate = async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    // ensure this template belongs to the user
    const { count } = await adminSupabase
        .from("menu_templates")
        .select("id", { count: "exact" })
        .eq("id", id)
        .eq("user_id", userId);
    if (!count) {
        return res
            .status(403)
            .json({ error: "Not authorized to delete this template." });
    }
    const { error } = await adminSupabase
        .from("menu_templates")
        .delete()
        .eq("id", id);
    if (error)
        return res.status(400).json({ error: error.message });
    res.json({ message: "Template deleted." });
};
// POST /templates/clone/:libraryId
export const cloneTemplate = async (req, res) => {
    const userId = req.user.id;
    const plan = req.user.plan;
    const libraryId = req.params.libraryId;
    //0) If free plan
    if (plan === "free") {
        const { count: templateCount, error: countErr } = await adminSupabase
            .from("menu_templates")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId);
        if (countErr)
            return res.status(500).json({ error: countErr.message });
        if ((templateCount || 0) >= 2) {
            return res.status(403).json({ error: "Free plan users can only have 2 templates." });
        }
        // b) compute existing usage
        // — get DB bytes
        const { data: dbRows, error: dbErr } = await adminSupabase
            .from("menu_templates")
            .select("size_bytes")
            .eq("user_id", userId);
        if (dbErr)
            return res.status(500).json({ error: dbErr.message });
        const dbBytes = (dbRows || []).reduce((s, r) => s + (r.size_bytes || 0), 0);
        // — get file-storage bytes (page through if you have >1k files)
        const { data: files, error: filesErr } = await adminSupabase
            .storage
            .from("user-menu-images")
            .list(userId, { limit: 1000 });
        if (filesErr)
            return res.status(500).json({ error: filesErr.message });
        const fileBytes = (files || []).reduce((s, f) => s + (f.metadata?.size || 0), 0);
        const usedMB = (dbBytes + fileBytes) / 1024 / 1024;
        // c) fetch the library config to compute its size
        const { data: lib, error: libErr } = await supabase
            .from("library_templates")
            .select("config, name, preview_url")
            .eq("id", libraryId)
            .single();
        if (libErr)
            return res.status(404).json({ error: libErr.message });
        const newBytes = byteSize(lib.config);
        if (usedMB + newBytes / 1024 / 1024 > 50) {
            return res
                .status(403)
                .json({ error: "Free plan storage limit (50MB) exceeded." });
        }
    }
    // 1) fetch the library config
    const { data: lib, error: libErr } = await supabase
        .from("library_templates")
        .select("config, name,preview_url")
        .eq("id", libraryId)
        .single();
    if (libErr)
        return res.status(404).json({ error: libErr.message });
    const size_bytes = byteSize(lib.config);
    // 2) insert into user templates
    const { data, error } = await supabase
        .from("menu_templates")
        .insert([
        {
            user_id: userId,
            library_id: libraryId,
            name: lib.name,
            preview_url: lib.preview_url,
            config: lib.config,
            size_bytes,
        },
    ])
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    return res.json(data);
};
// POST /:id/view
export async function recordTemplateView(req, res) {
    const templateId = req.params.id;
    const userId = req.user.id;
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
export async function recordLibraryView(req, res) {
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
