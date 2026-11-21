// Service = otak aplikasi: aturan bisnis. Tidak tahu apa-apa tentang req/res (HTTP).
const repository = require('../repositories');
const imageService = require('./imageService');
const toPublicReport = require('../utils/toPublicReport');
const AppError = require('../utils/AppError');

// Daftar laporan + informasi pagination
async function listReports(filters) {
  const { items, totalItems } = await repository.findMany(filters);
  const { page, limit } = filters;
  const totalPages = Math.ceil(totalItems / limit); // 0 jika tidak ada data

  return {
    data: items.map(toPublicReport), // lewat mapper privasi
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

async function getReportById(id) {
  const record = await repository.findById(id);
  if (!record) throw new AppError(404, 'Report not found');
  return toPublicReport(record);
}

// input = data yang sudah divalidasi; file = req.file dari multer (boleh undefined)
async function createReport(input, file) {
  // 1) Pastikan kategori & lokasi yang dipilih benar-benar ada
  const [category, location] = await Promise.all([
    repository.findCategoryBySlug(input.category),
    repository.findLocationBySlug(input.location),
  ]);
  const errors = [];
  if (!category) errors.push({ field: 'category', message: 'category does not exist' });
  if (!location) errors.push({ field: 'location', message: 'location does not exist' });
  if (errors.length > 0) throw new AppError(400, 'Validation failed', errors);

  // 2) Upload foto (jika ada) SETELAH semua validasi lolos, supaya tidak ada upload sia-sia
  const uploaded = file ? await imageService.uploadImage(file) : null;

  // 3) Simpan ke penyimpanan. Jika gagal, hapus foto yang sudah terlanjur diupload.
  try {
    const record = await repository.create({
      type: input.type,
      itemName: input.itemName,
      description: input.description,
      categoryId: category.id,
      locationId: location.id,
      locationDetail: input.locationDetail,
      eventDate: input.eventDate,
      imageUrl: uploaded ? uploaded.url : null,
      imagePublicId: uploaded ? uploaded.publicId : null,
      reporterName: input.reporterName,
      contactWhatsapp: input.contactWhatsapp,
      contactInstagram: input.contactInstagram,
      contactLine: input.contactLine,
      contactEmail: input.contactEmail,
      publicContactMethod: input.publicContactMethod,
    });
    return toPublicReport(record);
  } catch (error) {
    if (uploaded) await imageService.deleteImage(uploaded.publicId);
    throw error;
  }
}

const pickPublic = ({ slug, name }) => ({ slug, name }); // jangan bocorkan id internal

const listCategories = async () => (await repository.findCategories()).map(pickPublic);
const listLocations = async () => (await repository.findLocations()).map(pickPublic);

module.exports = { listReports, getReportById, createReport, listCategories, listLocations };
