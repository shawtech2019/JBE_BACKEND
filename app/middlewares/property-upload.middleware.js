const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { HttpError } = require("../utils/http-error");

/** Where property media lives (JBE_BACKEND/uploads/properties/{images,videos}). */
const BASE_DIR = path.join(__dirname, "..", "..", "uploads", "properties");

const IMAGE_MIME = /^image\/(png|jpe?g|webp|gif)$/;
const VIDEO_MIME = /^video\/(mp4|quicktime|webm|x-msvideo|x-matroska|3gpp)$/;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = file.fieldname === "videos" ? "videos" : "images";
    const dir = path.join(BASE_DIR, sub);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || "").toLowerCase();
    cb(
      null,
      `property-${req.user.id}-${Date.now()}-${Math.round(
        Math.random() * 1e6
      )}${ext}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (!IMAGE_MIME.test(file.mimetype) && !VIDEO_MIME.test(file.mimetype)) {
    return cb(new HttpError(400, "Only image and video files are allowed"));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (videos)
});
