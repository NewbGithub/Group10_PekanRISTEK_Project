// Mengisi data awal ke PostgreSQL.
//   node prisma/seed.js                 -> kategori & lokasi (WAJIB, dipakai dropdown & validasi)
//   node prisma/seed.js --with-reports  -> + 12 laporan contoh (untuk demo; hanya jika tabel masih kosong)
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const meta = require('../mock-data/meta.json');
const reports = require('../mock-data/reports.json');
const { CONTACT_FIELD_BY_METHOD } = require('../src/utils/contactMethods');

const prisma = new PrismaClient();

async function main() {
  // upsert = update jika sudah ada, insert jika belum -> aman dijalankan berkali-kali
  for (const c of meta.categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
  }
  for (const l of meta.locations) {
    await prisma.location.upsert({ where: { slug: l.slug }, update: { name: l.name }, create: l });
  }
  console.log('Seeded categories and locations');

  if (!process.argv.includes('--with-reports')) return;

  if ((await prisma.report.count()) > 0) {
    console.log('Reports table is not empty, skipping demo reports');
    return;
  }

  // peta slug -> id untuk mengisi foreign key
  const categoryId = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  const locationId = Object.fromEntries((await prisma.location.findMany()).map((l) => [l.slug, l.id]));

  for (const r of reports) {
    await prisma.report.create({
      data: {
        id: r.id,
        type: r.type,
        itemName: r.itemName,
        description: r.description,
        categoryId: categoryId[r.category.slug],
        locationId: locationId[r.location.slug],
        locationDetail: r.locationDetail,
        eventDate: new Date(r.eventDate),
        imageUrl: r.imageUrl,
        reporterName: r.reporterName,
        [CONTACT_FIELD_BY_METHOD[r.contact.method]]: r.contact.value, // hanya kontak publik yang diisi
        publicContactMethod: r.contact.method,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      },
    });
  }
  console.log(`Seeded ${reports.length} demo reports`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
