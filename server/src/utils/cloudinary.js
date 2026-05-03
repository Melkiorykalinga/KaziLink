const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// ============================================================
// Cloudinary Configuration
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always return https URLs
});

// ============================================================
// Multer: Memory storage + file filter (validate before upload)
// ============================================================
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('Only JPG and PNG images are allowed'), false);
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
});

// ============================================================
// Upload buffer to Cloudinary and return secure URL
// ============================================================
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    // If not configured, mock success for local dev/testing
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('[Dev Mode] Skipping Cloudinary upload, returning local mock URL');
      return resolve(`https://mock-cloudinary-url.com/payment_${Date.now()}.jpg`);
    }

    const ext = path.extname(originalName).toLowerCase().replace('.', '');
    const publicId = `payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'kazilink_payments',
        public_id: publicId,
        resource_type: 'image',
        format: ext === 'jpg' ? 'jpeg' : ext,
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' } // optimize
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// ============================================================
// Multer error handler middleware
// ============================================================
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 2MB' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { cloudinary, upload, uploadToCloudinary, handleUploadError };
