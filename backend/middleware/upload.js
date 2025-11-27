import multer from "multer";
import path from "path";
import crypto from "crypto";

// Storage for event images
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "events"));
  },
  filename: (req, file, cb) => {
    const random = crypto.randomBytes(6).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${random}${ext}`;
    cb(null, filename);
  },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, WEBP files are allowed"));
  }
};

// Export upload middleware for event images
export const uploadEventImages = multer({
  storage: eventStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
