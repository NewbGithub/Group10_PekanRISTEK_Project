// SATU-SATUNYA pintu keluar data laporan ke publik.
// Mengubah record internal (yang punya semua kontak + imagePublicId) menjadi bentuk response API.
// Karena semua response lewat sini, kontak yang tidak dipilih TIDAK PERNAH bisa bocor.
const { CONTACT_FIELD_BY_METHOD } = require('./contactMethods');

function toPublicReport(record) {
  // Ambil hanya kolom kontak milik metode yang dipilih pelapor
  const contactField = CONTACT_FIELD_BY_METHOD[record.publicContactMethod];

  return {
    id: record.id,
    type: record.type,
    itemName: record.itemName,
    description: record.description,
    category: { slug: record.category.slug, name: record.category.name },
    location: { slug: record.location.slug, name: record.location.name },
    locationDetail: record.locationDetail ?? null,
    eventDate: new Date(record.eventDate).toISOString().slice(0, 10), // 'YYYY-MM-DD'
    imageUrl: record.imageUrl ?? null,       // null = FE menampilkan placeholder
    reporterName: record.reporterName,
    contact: {
      method: record.publicContactMethod,
      value: record[contactField],
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
    // Sengaja TIDAK ada: contactWhatsapp/Instagram/Line/Email lain, imagePublicId
  };
}

module.exports = toPublicReport;
