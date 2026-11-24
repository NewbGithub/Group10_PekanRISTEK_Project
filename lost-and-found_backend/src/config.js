// Membaca semua environment variable di SATU tempat.
// File lain cukup `require('./config')`, tidak perlu menyentuh process.env langsung.
// Catatan: server.js memanggil dotenv.config() lebih dulu, sehingga .env sudah terbaca di sini.

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,

  // "a,b" -> ['a', 'b']; trim membuang spasi; filter(Boolean) membuang string kosong
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // 'memory' = data di array (Checkpoint 2), 'prisma' = PostgreSQL (Checkpoint 3)
  storage: (process.env.STORAGE || 'memory').toLowerCase(),
  databaseUrl: process.env.DATABASE_URL,

  // Zona waktu untuk menentukan "hari ini" saat validasi tanggal (tanggal tidak boleh di masa depan)
  timezone: process.env.APP_TIMEZONE || 'Asia/Jakarta',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

// Fail fast: lebih baik gagal jelas saat start daripada error aneh saat ada request.
if (!['memory', 'prisma'].includes(config.storage)) {
  throw new Error(`STORAGE harus "memory" atau "prisma", bukan "${config.storage}"`);
}
if (config.storage === 'prisma' && !config.databaseUrl) {
  throw new Error('DATABASE_URL wajib diisi ketika STORAGE=prisma');
}

// true hanya jika ketiga kredensial Cloudinary terisi
config.cloudinaryConfigured = Boolean(
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
);

module.exports = config;
