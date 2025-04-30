import multer from "multer";

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(), // Store the file in memory temporarily
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export const uploadMiddleware = upload.single("image_url"); // Expecting a single file under the 'image_url' key