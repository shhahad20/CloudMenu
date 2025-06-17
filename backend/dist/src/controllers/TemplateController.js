import { adminSupabase, supabase } from "../config/supabaseClient.js";
import { handleUpload } from "../helper/helper.js";
import { listService } from "../services/listService.js";
import QRCode from "qrcode";
import { cloneTemplateService } from "../services/templateService.js";
// Helper to compute size of a JS object when serialized
export function byteSize(obj) {
    return Buffer.byteLength(JSON.stringify(obj), "utf8");
}
export const planLimits = {
    Free: { maxProjects: 2, maxStorageMB: 50 },
    Pro: { maxProjects: 10, maxStorageMB: 50 * 1024 },
    Enterprise: { maxProjects: Infinity, maxStorageMB: 100 * 1024 }, // 100 GB
};
function bytesToMB(bytes) {
    return bytes / 1024 / 1024;
}
// GET /templates
export const listUserTemplates = async (req, res) => {
    try {
        // parse query-string params
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || "created_at";
        const sortOrder = req.query.order || "desc";
        const search = req.query.q || "";
        const opts = {
            table: "menu_templates",
            filters: { user_id: req.user.id },
            search: search
                ? { term: search, columns: ["name", "description"] }
                : undefined,
            sort: { column: sortBy, order: sortOrder },
            pagination: { page, pageSize },
        };
        const { data, total } = await listService(adminSupabase, opts);
        res.json({
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
    // const userId = req.user!.id;
    // const { data, error } = await supabase
    //   .from("menu_templates")
    //   .select("*")
    //   .eq("user_id", userId);
    // if (error) return res.status(400).json({ error: error.message });
    // res.json(data);
};
export const listLibraryTemplates = async (req, res) => {
    // const { data, error } = await supabase.from("library_templates").select("*");
    // if (error) return res.status(400).json({ error: error.message });
    // res.json(data);
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 9;
        const sortBy = req.query.sortBy || "view_count";
        const order = req.query.order || "asc";
        const q = req.query.q || "";
        const opts = {
            table: "library_templates",
            search: q ? { term: q, columns: ["name", "category"] } : undefined,
            sort: { column: sortBy, order },
            pagination: { page, pageSize },
        };
        const { data, total } = await listService(supabase, opts);
        res.json({
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
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
        // const { config } = req.body as { config: any };
        const { name, preview_url, price, category, config: config, } = req.body;
        // 1) optionally upload and inject into config
        // const imageUrl = await handleUpload(req.file);
        // const finalConfig = {
        //   ...config,
        //   ...(imageUrl ? { headerImageUrl: imageUrl } : {}),
        // };
        // 2) compute byte size of the config
        // const size_bytes = byteSize(finalConfig);
        // 3) insert into DB
        const { data, error } = await supabase
            .from("library_templates")
            .insert([
            {
                user_id: userId,
                name,
                // config: finalConfig,
                preview_url: preview_url ?? null,
                price: price ?? null,
                category: category ?? null,
                // size_bytes,
            },
        ])
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
    const userId = req.user.id;
    const plan = req.user.plan;
    const templateId = req.params.id;
    if (!plan || !planLimits[plan]) {
        return res.status(400).json({
            error: "Invalid or missing subscription plan. Please ensure your account has a valid plan to proceed.",
        });
    }
    const { maxProjects, maxStorageMB } = planLimits[plan];
    try {
        // 1) Fetch existing template
        console.log("Template id: " + templateId);
        console.debug("👀 req.body:", req.body);
        console.debug("👀 req.file:", req.file ? req.file.originalname : null);
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
        let bodyConfig = {};
        if (req.body.config) {
            if (typeof req.body.config === "string") {
                try {
                    bodyConfig = JSON.parse(req.body.config);
                }
                catch {
                    return res.status(400).json({ error: "Invalid JSON in config" });
                }
            }
            else {
                bodyConfig = req.body.config;
            }
        }
        // b) Merge into existing.config
        let newConfig = {
            ...existing.config,
            ...bodyConfig,
        };
        if (req.file) {
            const imageUrl = await handleUpload(req.file, templateId, userId);
            console.log("The image received: " + imageUrl);
            // Debug: Log what we're looking for
            console.debug("🔍 Looking for sectionId:", req.body.sectionId);
            console.debug("🔍 Looking for itemId:", req.body.itemId);
            console.debug("🔍 Available sections:", newConfig.sections?.map((s) => s.id));
            // update header if present
            if ("header_image" in newConfig) {
                newConfig.header_image = imageUrl;
            }
            // update the one item in sections
            if (Array.isArray(newConfig.sections)) {
                let itemFound = false;
                newConfig.sections = newConfig.sections.map((sec) => {
                    console.debug(`→ checking section ${sec.id} vs ${req.body.sectionId}`);
                    // Make sure we're comparing the right types (string vs string)
                    if (String(sec.id) !== String(req.body.sectionId)) {
                        console.debug(`   skipping section ${sec.id}`);
                        return sec;
                    }
                    console.debug(`✔ matched section ${sec.id}, checking items...`);
                    console.debug(`   items in section:`, sec.items?.map((i) => i.id));
                    const updatedItems = sec.items.map((item) => {
                        console.debug(`   → checking item ${item.id} vs ${req.body.itemId}`);
                        // Make sure we're comparing the right types
                        if (String(item.id) !== String(req.body.itemId)) {
                            console.debug(`     skipping item ${item.id}`);
                            return item;
                        }
                        console.debug(`     ✔ matched item ${item.id}, setting image to:`, imageUrl);
                        itemFound = true;
                        return { ...item, image: imageUrl };
                    });
                    return { ...sec, items: updatedItems };
                });
                if (!itemFound) {
                    console.error("❌ Item not found! sectionId:", req.body.sectionId, "itemId:", req.body.itemId);
                    console.error("Available sections and items:");
                    newConfig.sections.forEach((sec) => {
                        console.error(`  Section ${sec.id}:`, sec.items?.map((i) => i.id));
                    });
                }
                else {
                    console.log("✅ Item found and updated successfully");
                }
            }
        }
        // 3) Enforce plan quotas
        // a) Check project count
        if (plan !== "Enterprise") {
            const { count: cnt, error: cntErr } = await adminSupabase
                .from("menu_templates")
                .select("id", { head: true, count: "exact" })
                .eq("user_id", userId);
            if (cntErr)
                throw cntErr;
            if ((cnt || 0) > maxProjects) {
                return res.status(403).json({
                    error: `${plan} plan allows up to ${maxProjects} projects.`,
                });
            }
        }
        // b) Check storage usage
        const { data: allRows, error: dbErr } = await adminSupabase
            .from("menu_templates")
            .select("size_bytes")
            .eq("user_id", userId);
        if (dbErr)
            throw dbErr;
        const dbBytes = (allRows || []).reduce((sum, r) => sum + (r.size_bytes || 0), 0) -
            (existing.size_bytes || 0);
        // sum file-storage bytes
        const prefix = `templates/${userId}`;
        const { data: files, error: filesErr } = await adminSupabase.storage
            .from("users-menu-images")
            .list(prefix, { limit: 1000 });
        if (filesErr)
            throw filesErr;
        const fileBytes = (files || []).reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
        // new template size
        const newBytes = byteSize(newConfig);
        const projectedMB = bytesToMB(dbBytes + fileBytes + newBytes);
        if (projectedMB > maxStorageMB) {
            return res.status(403).json({
                error: `${plan} plan storage limit exceeded: ${projectedMB.toFixed(2)} / ${maxStorageMB} MB`,
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
            .single();
        if (updateErr)
            throw updateErr;
        // Debug: Check what we're returning
        console.log("🎯 Final response config sections:", data.config.sections?.length);
        const targetSection = data.config.sections?.find((s) => String(s.id) === String(req.body.sectionId));
        const targetItem = targetSection?.items?.find((i) => String(i.id) === String(req.body.itemId));
        console.log("🎯 Target item image URL:", targetItem?.image);
        return res.json({ config: data.config });
    }
    catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: err.message });
    }
};
// DELETE /templates/:id
export const deleteTemplate = async (req, res) => {
    const userId = req.user.id;
    const templateId = req.params.id;
    // 1) Delete from DB
    const { error: deleteErr } = await adminSupabase
        .from("menu_templates")
        .delete()
        .eq("id", templateId)
        .eq("user_id", userId);
    if (deleteErr) {
        return res.status(400).json({ error: deleteErr.message });
    }
    // 2) Delete from storage
    const { error: storageErr } = await adminSupabase.storage
        .from("users-menu-images")
        .remove([`templates/${userId}/${templateId}`]);
    if (storageErr) {
        console.error("Failed to delete from storage:", storageErr);
        // proceed anyway
    }
    res.json({ ok: true });
};
// POST /templates/clone/:id
// export const cloneTemplate = async (req: AuthRequest, res: Response) => {
//   const userId = req.user!.id;
//   const plan = req.user!.plan;
//   if (!plan || !planLimits[plan]) {
//     return res.status(400).json({ error: `Invalid or missing plan.` });
//   }
//   const libraryId = req.params.libraryId;
//   const { maxProjects, maxStorageMB } = planLimits[plan];
//   try {
//     // 1) Fetch library template
//     const { data: lib, error: libErr } = await supabase
//       .from("library_templates")
//       .select("config,name,preview_url")
//       .eq("id", libraryId)
//       .single();
//     if (libErr || !lib) {
//       return res.status(404).json({ error: "Library template not found." });
//     }
//     // 2) Enforce plan quotas
//     // a) project count
//     if (plan !== "Enterprise") {
//       const { count: cnt, error: cntErr } = await adminSupabase
//         .from("menu_templates")
//         .select("id", { head: true, count: "exact" })
//         .eq("user_id", userId);
//       if (cntErr) throw cntErr;
//       if ((cnt || 0) >= maxProjects) {
//         return res.status(403).json({
//           error: `${plan} plan allows up to ${maxProjects} projects.`,
//         });
//       }
//     }
//     // b) storage usage
//     const { data: dbRows, error: dbErr } = await adminSupabase
//       .from("menu_templates")
//       .select("size_bytes")
//       .eq("user_id", userId);
//     if (dbErr) throw dbErr;
//     const dbBytes = dbRows!.reduce((sum, r) => sum + (r.size_bytes || 0), 0);
//     const { data: files, error: filesErr } = await adminSupabase.storage
//       .from("users-menu-images")
//       .list(userId, { limit: 1000 });
//     if (filesErr) throw filesErr;
//     const fileBytes = files!.reduce(
//       (sum, f) => sum + (f.metadata?.size || 0),
//       0
//     );
//     const newBytes = byteSize(lib.config);
//     const projectedMB = bytesToMB(dbBytes + fileBytes + newBytes);
//     if (projectedMB > maxStorageMB) {
//       return res.status(403).json({
//         error: `${plan} plan storage limit exceeded: ${projectedMB.toFixed(
//           2
//         )} / ${maxStorageMB} MB`,
//       });
//     }
//     // 3) Insert clone
//     const { data, error } = await adminSupabase
//       .from("menu_templates")
//       .insert([
//         {
//           user_id: userId,
//           library_id: libraryId,
//           name: lib.name,
//           preview_url: lib.preview_url,
//           config: lib.config,
//           size_bytes: newBytes,
//         },
//       ])
//       .select("id, name, preview_url, config, size_bytes")
//       .single();
//     // .single<{
//     //   id: string;
//     //   name: string;
//     //   preview_url: string;
//     //   config: any;
//     //   size_bytes: number;
//     // }>();
//     if (error) throw error;
//     const clonedId = data.id;
//     // 4) Generate QR right away
//     const url = `${process.env.FRONTEND_URL}/templates/qr/${clonedId}`;
//     const qrDataUrl = await QRCode.toDataURL(url);
//     res.json({
//       ...data,
//       qr: qrDataUrl,
//     });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// };
export const cloneTemplate = async (req, res) => {
    const userId = req.user.id;
    const plan = req.user.plan;
    if (!plan || !planLimits[plan]) {
        return res.status(400).json({ error: `Invalid or missing plan.` });
    }
    const libraryId = req.params.libraryId;
    const { maxProjects, maxStorageMB } = planLimits[plan];
    try {
        const inserted = await cloneTemplateService(req.params.libraryId, req.user.id, req.user.plan);
        const clonedId = inserted.id;
        // 4) Generate QR right away
        const url = `${process.env.FRONTEND_URL}/templates/qr/${clonedId}`;
        const qrDataUrl = await QRCode.toDataURL(url);
        res.json({
            ...inserted,
            qr: qrDataUrl,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
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
// GET /templates/:id/qr
export const getTemplateQRCode = async (req, res) => {
    const { id } = req.params;
    const url = `${process.env.FRONTEND_URL}/templates/qr/${id}`;
    try {
        // generates a data-URL PNG
        const dataUrl = await QRCode.toDataURL(url);
        // strip header so we can return raw base64 if you want:
        // const b64 = dataUrl.split(",")[1];
        res.json({ qr: dataUrl });
    }
    catch (err) {
        console.error("Failed to generate QR:", err);
        res.status(500).json({ error: "QR generation failed" });
    }
};
