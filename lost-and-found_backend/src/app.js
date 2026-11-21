// Merakit aplikasi Express. Urutan app.use() PENTING: request melewati dari atas ke bawah.
const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by'); // jangan umumkan "Express" di header response (keamanan kecil)

// 1) CORS: izinkan hanya alamat frontend yang terdaftar di CORS_ORIGIN
app.use(cors({
  origin: config.corsOrigins.includes('*') ? '*' : config.corsOrigins,
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
