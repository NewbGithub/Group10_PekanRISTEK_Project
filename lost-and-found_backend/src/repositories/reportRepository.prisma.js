// Repository versi POSTGRESQL (Checkpoint 3) memakai Prisma Client.
// Fungsi dan bentuk datanya sama persis dengan versi memori.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(); // satu koneksi/pool untuk seluruh aplikasi

// Sertakan data kategori & lokasi di setiap laporan (seperti JOIN di SQL)
const include = { category: true, location: true };

// Menyusun kondisi WHERE dari filter. Hanya filter yang diisi yang dipakai.
function buildWhere({ q, type, category, location }) {
  const where = {};
  if (q) where.itemName = { contains: q, mode: 'insensitive' }; // LIKE '%q%' tanpa peduli huruf besar/kecil
  if (type) where.type = type;
  if (category) where.category = { slug: category };            // filter lewat relasi
  if (location) where.location = { slug: location };
  return where;
}

async function findMany({ q, type, category, location, sort, page, limit }) {
  const where = buildWhere({ q, type, category, location });
  const direction = sort === 'oldest' ? 'asc' : 'desc';

  // $transaction menjalankan dua query bersamaan: ambil data halaman ini + hitung total
  const [items, totalItems] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      include,
      orderBy: [{ createdAt: direction }, { id: direction }],
      skip: (page - 1) * limit, // lewati data halaman sebelumnya
      take: limit,              // ambil sebanyak limit
    }),
    prisma.report.count({ where }),
  ]);

  return { items, totalItems };
}

const findById = (id) => prisma.report.findUnique({ where: { id }, include });

const create = (data) =>
  prisma.report.create({
    data: { ...data, eventDate: new Date(data.eventDate) },
    include,
  });

const findCategories = () => prisma.category.findMany({ orderBy: { id: 'asc' } });
const findLocations = () => prisma.location.findMany({ orderBy: { id: 'asc' } });
const findCategoryBySlug = (slug) => prisma.category.findUnique({ where: { slug } });
const findLocationBySlug = (slug) => prisma.location.findUnique({ where: { slug } });
const disconnect = () => prisma.$disconnect();

module.exports = {
  findMany, findById, create,
  findCategories, findLocations, findCategoryBySlug, findLocationBySlug,
  disconnect,
};
