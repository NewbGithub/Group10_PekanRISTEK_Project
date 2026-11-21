// Pintu masuk aplikasi. dotenv HARUS dimuat paling awal agar .env terbaca oleh file lain.
require('dotenv').config();

const app = require('./app');
const config = require('./config');
const repository = require('./repositories');

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} (storage: ${config.storage})`);
});

// Saat platform hosting menghentikan aplikasi (SIGTERM) atau kamu menekan Ctrl+C (SIGINT):
// berhenti menerima request baru, tutup koneksi database, lalu keluar dengan rapi.
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await repository.disconnect();
    process.exit(0);
  });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
