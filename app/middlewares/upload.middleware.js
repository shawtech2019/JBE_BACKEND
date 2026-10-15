const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { HttpError } = require("../utils/http-error");

/** Where avatar files live on disk (JBE_BACKEND/uploads/avatars). */
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
    return cb(new HttpError(400, "Only image files are allowed"));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
