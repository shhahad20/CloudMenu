import multer from "multer";
// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(), // Store the file in memory temporarily
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            cb(null, true); // Accept the file
        }
        else {
            cb(new Error("Only .png and .jpg files are allowed!")); // Reject the file
        }
    },
});
export const uploadMiddleware = upload.single("image_url"); // Expecting a single file under the 'image_url' key
