const AppError = require('../utils/AppError');

// Dijalankan jika tidak ada rute yang cocok (diletakkan SETELAH semua rute di app.js)
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

// Penangkap semua error. Harus punya 4 parameter agar dikenali Express sebagai error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Jika response sudah terlanjur dikirim, serahkan ke handler bawaan Express
  if (res.headersSent) return next(err);

  // 1) Error yang kita lempar sendiri (validasi, not found, file terlalu besar, ...)
  if (err instanceof AppError) {
    const body = { success: false, message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.status).json(body);
  }

  // 2) Error bawaan body-parser: JSON rusak / body terlalu besar
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }

  // 3) Selain itu = bug / kegagalan tak terduga. Catat di log, jangan bocorkan detail ke klien.
  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
