import { adminSupabase, supabase } from "../config/supabaseClient.js";
// Helper to handle optional file upload & return a public URL
export async function handleUpload(file, templateId, userId) {
    if (!file || !userId)
        return;
    // const path = `templates/${userId}/${templateId}/${file.originalname}`;
    const path = `templates/${userId}/${templateId}/header.png`;
    const { data, error } = await adminSupabase.storage
        .from("users-menu-images")
        // .upload(path, file.buffer, { upsert: false });
        .upload(path, file.buffer, { upsert: true });
    if (error)
        throw new Error("Storage upload failed: " + error.message);
    // const { data: urlData } = adminSupabase.storage
    //   .from("users-menu-images")
    //   .getPublicUrl(data.path);
    const imageUrl = supabase.storage
        .from("users-menu-images")
        .getPublicUrl(path).data.publicUrl + `?v=${Date.now()}`;
    return imageUrl;
}
