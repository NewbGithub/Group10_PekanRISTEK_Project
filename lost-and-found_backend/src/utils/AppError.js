// Error "yang kita sengaja lempar" dengan kode status HTTP.
// Contoh: throw new AppError(404, 'Report not found');
// errorHandler akan mengubahnya menjadi response JSON yang rapi.
class AppError extends Error {
  constructor(status, message, errors) {
    super(message);        // mengisi err.message
    this.name = 'AppError';
    this.status = status;  // kode HTTP: 400, 404, 413, ...
    this.errors = errors;  // (opsional) daftar error per field untuk validasi
  }
}

module.exports = AppError;
