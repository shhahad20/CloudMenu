import { adminSupabase, supabase } from "../config/supabaseClient.js";


// Helper to handle optional file upload & return a public URL
// export async function handleUpload(
//   file?: Express.Multer.File,
//   templateId?: string,
//   userId?: string
// ): Promise<string | undefined> {
//   if (!file || !userId) return;

//   const path = `templates/${userId}/${templateId}/header.png`;

//   const { data, error } = await adminSupabase.storage
//     .from("users-menu-images")
//         .upload(path, file.buffer, { upsert: true });

//   if (error) throw new Error("Storage upload failed: " + error.message);

//   const imageUrl = supabase.storage
//   .from("users-menu-images")
//   .getPublicUrl(path).data.publicUrl + `?v=${Date.now()}`;

//   return imageUrl;
// }

// src/utils/upload.ts
import { randomUUID } from "crypto";

/**
 * Uploads a file buffer to Supabase Storage under a unique name
 * so you can store multiple images per template without collisions.
 *
 * @param file      The Multer file upload (must have buffer & originalname)
 * @param templateId The template’s ID (for folder partitioning)
 * @param userId     The user’s ID (for folder partitioning)
 * @returns          A publicly-accessible URL for the uploaded image
 */
export async function handleUpload(
  file: Express.Multer.File,
  templateId: string,
  userId: string
): Promise<string> {
  // Generate a unique filename to avoid collisions
  const ext       = file.originalname.split(".").pop();
  const filename  = `${randomUUID()}.${ext}`;
  // You can further nest by section/item if you like:
  const path = `templates/${userId}/${templateId}/${filename}`;

  // Upload to Supabase (upsert: false so we don’t overwrite by accident)
  const { data, error } = await adminSupabase.storage
    .from("users-menu-images")
    .upload(path, file.buffer, { upsert: false });

  if (error) {
    throw new Error("Storage upload failed: " + error.message);
  }

  // Build a cache-busting public URL
  const publicUrl = supabase.storage
    .from("users-menu-images")
    .getPublicUrl(path).data.publicUrl;
  return `${publicUrl}?v=${Date.now()}`;
}
