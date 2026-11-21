// Nilai tetap yang dipakai di banyak file.
// Satu sumber kebenaran: kalau aturan berubah, cukup ubah di sini.

const REPORT_TYPES = ['LOST', 'FOUND'];                          // jenis laporan
const CONTACT_METHODS = ['WHATSAPP', 'INSTAGRAM', 'LINE', 'EMAIL']; // metode kontak yang boleh dipilih
const SORT_OPTIONS = ['newest', 'oldest'];                        // urutan daftar laporan

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,        // batas jumlah item per halaman (mencegah orang meminta 1 juta data sekaligus)
  MAX_PAGE: 1000000,    // batas atas page supaya perhitungan skip tidak meluap
};

const IMAGE = {
  FIELD_NAME: 'image',                                           // nama field file pada form-data
  MAX_BYTES: 5 * 1024 * 1024,                                    // 5 MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDER: 'lostfound/reports',                        // folder tujuan di Cloudinary
};

const FIELD_LIMITS = {
  ITEM_NAME: [3, 100],
  DESCRIPTION: [10, 1000],
  LOCATION_DETAIL: [1, 100],
  REPORTER_NAME: [2, 60],
  QUERY_TEXT_MAX: 100,
};

module.exports = { REPORT_TYPES, CONTACT_METHODS, SORT_OPTIONS, PAGINATION, IMAGE, FIELD_LIMITS };
