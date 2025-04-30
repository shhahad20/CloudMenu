import { adminSupabase, supabase } from '../config/supabaseClient.js';

// Helper to handle optional file upload & return a public URL
export async function handleUpload(
  file?: Express.Multer.File,
  userId?: string
): Promise<string | undefined> {
  if (!file || !userId) return;
  const path = `templates/${userId}/${file.originalname}`;
  const { data, error } = await adminSupabase.storage
    .from('users-menu-images')
    .upload(path, file.buffer, { upsert: false });
  if (error) throw new Error('Storage upload failed ,' + error.message);
  
  // Corrected property name here: publicUrl instead of publicURL
  const { data: { publicUrl } } = adminSupabase.storage
    .from('users-menu-images')
    .getPublicUrl(data.path);
  
  return publicUrl;
}