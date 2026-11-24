// Merakit aplikasi Express. Urutan app.use() PENTING: request melewati dari atas ke bawah.
const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by'); // jangan umumkan "Express" di header response (keamanan kecil)

// 1) CORS: izinkan alamat frontend yang terdaftar di CORS_ORIGIN
//    plus URL preview Vercel (contoh: group10pekanristekproject-abc123.vercel.app).
const VERCEL_PREVIEW = /^https:\/\/group10pekanristekproject-[a-z0-9-]+\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    // Tanpa Origin (server-to-server, curl, health check platform) -> izinkan.
    if (!origin) return callback(null, true);
    // CORS_ORIGIN=* -> izinkan semua.
    if (config.corsOrigins.includes('*')) return callback(null, true);
    // Origin terdaftar atau URL preview Vercel -> izinkan.
    if (config.corsOrigins.includes(origin) || VERCEL_PREVIEW.test(origin)) {
      return callback(null, true);
    }
    // Selain itu tolak tanpa melempar error (browser yang memblokir response).
    return callback(null, false);
  },
  exposedHeaders: ['Location'], // agar frontend boleh membaca header Location
}));

// 2) Baca body JSON -> req.body (multipart ditangani multer di rute POST /reports)
app.use(express.json());

// 3) Health check: dipakai untuk mengecek server hidup (juga oleh platform hosting)
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', data: { status: 'ok' } });
});

// 4) Semua rute aplikasi: /reports, /reports/:id, /categories, /locations
app.use(routes);

// 5) Terakhir: 404 untuk rute tak dikenal, lalu penangkap semua error
app.use(notFound);
app.use(errorHandler);

module.exports = app;
