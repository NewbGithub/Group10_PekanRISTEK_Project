// Mengurus foto di Cloudinary. Cloudinary dimuat "malas" (lazy) agar aplikasi tetap bisa jalan
// tanpa Cloudinary selama Checkpoint 2.
const config = require('../config');
const { IMAGE } = require('../constants');

let client = null;

// Mengembalikan klien Cloudinary, atau null jika kredensial belum diisi
function getClient() {
  if (!config.cloudinaryConfigured) return null;
  if (!client) {
    const { v2 } = require('cloudinary');
    v2.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true, // selalu https
    });
    client = v2;
  }
  return client;
}

// Upload satu file (Buffer di RAM) ke Cloudinary. Mengembalikan { url, publicId } atau null.
async function uploadImage(file) {
  const cloudinary = getClient();
  if (!cloudinary) {
    console.warn('[image] Cloudinary belum dikonfigurasi: foto diabaikan (imageUrl = null)');
    return null;
  }

  // upload_stream memakai callback -> dibungkus Promise supaya bisa di-await
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: IMAGE.CLOUDINARY_FOLDER, resource_type: 'image' },
      (error, uploaded) => (error ? reject(error) : resolve(uploaded))
    );
    stream.end(file.buffer); // kirim isi file lalu tutup stream
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// Hapus foto (dipakai untuk "bersih-bersih" jika penyimpanan ke database gagal). Tidak pernah melempar error.
async function deleteImage(publicId) {
  try {
    const cloudinary = getClient();
    if (cloudinary && publicId) await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[image] gagal menghapus foto:', error.message);
  }
}

module.exports = { uploadImage, deleteImage };
