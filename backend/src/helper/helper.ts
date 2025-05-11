import { adminSupabase, supabase } from '../config/supabaseClient.js';

// Helper to handle optional file upload & return a public URL
export async function handleUpload(
  file?: Express.Multer.File,
  templateId?: string,
  userId?: string
): Promise<string | undefined> {
  if (!file || !userId) return;
  console.log(`${userId} user Id`)
const path = `templates/${userId}/${templateId}/${file.originalname}`;
  const { data, error } = await adminSupabase.storage
    .from('users-menu-images')
    .upload(path, file.buffer, { upsert: false });
  if (error) throw new Error('Storage upload failed: ' + error.message);

  const { data: urlData } = adminSupabase.storage
    .from('users-menu-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}