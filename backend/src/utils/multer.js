const multer = require('multer');
const path   = require('path');

// Use memory storage — works on both local and Vercel serverless (no disk writes)
// Files are available as req.file.buffer
// For local dev, files are saved to /uploads manually in the controller
// For production on Vercel, integrate Cloudinary or similar for persistent storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extValid  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
