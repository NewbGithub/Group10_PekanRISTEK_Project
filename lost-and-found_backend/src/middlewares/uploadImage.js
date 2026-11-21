// Middleware upload foto memakai multer.
// multer membaca request multipart/form-data: field teks -> req.body, file -> req.file.
// Untuk request JSON biasa, multer otomatis dilewati.
const multer = require('multer');
const AppError = require('../utils/AppError');
const { IMAGE } = require('../constants');
const { detectImageType } = require('../utils/imageSignature');

const maxMb = IMAGE.MAX_BYTES / 1024 / 1024;
const UNSUPPORTED = 'Unsupported image type. Use JPEG, PNG, or WEBP';

const upload = multer({
  storage: multer.memoryStorage(),                    // simpan file di RAM (Buffer), lalu kita kirim ke Cloudinary
  limits: { fileSize: IMAGE.MAX_BYTES, files: 1 },    // maksimal 5 MB dan 1 file
  fileFilter: (req, file, cb) => {                    // filter awal berdasarkan mimetype dari klien
    if (IMAGE.ALLOWED_MIME_TYPES.includes(file.mimetype)) return cb(null, true);
    return cb(new AppError(415, UNSUPPORTED));
  },
});

// Dibungkus agar error multer diubah menjadi AppError dengan status yang sesuai kontrak
function uploadImage(req, res, next) {
  upload.single(IMAGE.FIELD_NAME)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(413, `Image is too large. Maximum size is ${maxMb} MB`));
        }
        return next(new AppError(400, `Invalid upload: ${err.message}`)); // mis. nama field salah
      }
      return next(err); // termasuk AppError 415 dari fileFilter
    }

    // Pemeriksaan kedua: isi file sebenarnya (mimetype dari klien bisa dipalsukan)
    if (req.file && !detectImageType(req.file.buffer)) {
      return next(new AppError(415, UNSUPPORTED));
    }
    return next();
  });
}

module.exports = uploadImage;
