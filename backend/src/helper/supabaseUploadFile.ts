import { supabase } from "../config/supabaseClient.js"; // Import the Supabase client

export const uploadImageToSupabase = async (
  file: Express.Multer.File,
  userId: string | undefined
): Promise<string | null> => {
  const fileName = `${userId}/${userId}_${file.originalname}`; // Generate a unique folder + file name

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("menu_images") // Bucket name
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Image upload failed:", error);
    return null;
  }

  // Generate the public URL for the uploaded file
  const { publicUrl } = supabase.storage
    .from("menu_images")
    .getPublicUrl(fileName).data;

  return publicUrl || null;
};
export const deleteImageFromSupabase = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the relative path after the bucket name
    const path = imageUrl.split("/menu_images/")[1]; // Get "userId/userId_filename"

    if (!path) {
      console.error("Invalid image URL format:", imageUrl);
      return false;
    }

    // Delete the image from Supabase storage
    const { error } = await supabase.storage.from("menu_images").remove([path]);

    if (error) {
      console.error("Error deleting image from Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Unexpected error during image deletion:", error);
    return false;
  }
};