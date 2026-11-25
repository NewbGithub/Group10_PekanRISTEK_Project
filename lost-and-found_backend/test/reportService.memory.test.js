// Menguji service + repository versi memori (tanpa database, tanpa Express).
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/services/reportService');
const AppError = require('../src/utils/AppError');

const defaults = { sort: 'newest', page: 1, limit: 10 };

test('list: default returns first 10 of 12, newest first, with pagination', async () => {
  const res = await service.listReports(defaults);
  assert.equal(res.data.length, 10);
  assert.equal(res.pagination.totalItems, 12);
  assert.equal(res.pagination.totalPages, 2);
  assert.equal(res.pagination.hasNextPage, true);
  assert.equal(res.pagination.hasPrevPage, false);
  const times = res.data.map((r) => r.createdAt);
  assert.deepEqual(times, [...times].sort().reverse());
});

test('list: page 2 has the remaining 2 items', async () => {
  const res = await service.listReports({ ...defaults, page: 2 });
  assert.equal(res.data.length, 2);
  assert.equal(res.pagination.hasNextPage, false);
  assert.equal(res.pagination.hasPrevPage, true);
});

test('list: page beyond totalPages gives empty data (not an error)', async () => {
  const res = await service.listReports({ ...defaults, page: 99 });
  assert.deepEqual(res.data, []);
  assert.equal(res.pagination.totalPages, 2);
});

test('list: filters combine with AND', async () => {
  const lost = await service.listReports({ ...defaults, type: 'LOST' });
  assert.ok(lost.data.every((r) => r.type === 'LOST'));
  const both = await service.listReports({ ...defaults, type: 'LOST', category: 'electronics' });
  assert.deepEqual(both.data.map((r) => r.itemName), ['Charger Laptop Asus 65W', 'Earphone TWS Putih']);
});

test('list: search by item name is case-insensitive', async () => {
  const res = await service.listReports({ ...defaults, q: 'CHARGER' });
  assert.equal(res.data.length, 1);
  assert.equal(res.data[0].itemName, 'Charger Laptop Asus 65W');
});

test('list: unknown category slug gives empty result, zero pages', async () => {
  const res = await service.listReports({ ...defaults, category: 'nope' });
  assert.deepEqual(res.data, []);
  assert.equal(res.pagination.totalPages, 0);
});

test('list: oldest sort reverses the order', async () => {
  const res = await service.listReports({ ...defaults, sort: 'oldest' });
  assert.equal(res.data[0].itemName, 'Flashdisk Sandisk 64GB');
});

test('detail: found and not found (404)', async () => {
  const ok = await service.getReportById('a1b2c3d4-0000-4000-8000-000000000001');
  assert.equal(ok.itemName, 'Tumbler Tupperware Biru');
  await assert.rejects(() => service.getReportById('does-not-exist'), (e) => e instanceof AppError && e.status === 404);
});

test('mock data contact privacy: seeded reports expose exactly one contact', async () => {
  const res = await service.listReports({ ...defaults, limit: 50 });
  for (const r of res.data) assert.deepEqual(Object.keys(r.contact), ['method', 'value']);
});

test('categories/locations expose slug + name only', async () => {
  const cats = await service.listCategories();
  assert.equal(cats.length, 8);
  assert.deepEqual(Object.keys(cats[0]), ['slug', 'name']);
  assert.equal((await service.listLocations()).length, 9);
});

test('create: stores report, hides private contacts, then it is listed', async () => {
  const input = {
    type: 'LOST', itemName: 'Topi Hitam', description: 'Topi hitam polos hilang di kantin.',
    category: 'clothing', location: 'kantin', locationDetail: null, eventDate: '2026-11-20',
    reporterName: 'Tes', contactWhatsapp: '081211112222', contactInstagram: 'tes.private',
    contactLine: null, contactEmail: null, publicContactMethod: 'WHATSAPP',
  };
  const created = await service.createReport(input, undefined);
  assert.equal(created.itemName, 'Topi Hitam');
  assert.equal(created.imageUrl, null);
  assert.deepEqual(created.contact, { method: 'WHATSAPP', value: '081211112222' });
  assert.ok(!JSON.stringify(created).includes('tes.private'));

  const detail = await service.getReportById(created.id);
  assert.equal(detail.id, created.id);
  const list = await service.listReports(defaults);
  assert.equal(list.data[0].id, created.id); // paling baru di urutan pertama
  assert.equal(list.pagination.totalItems, 13);
});

test('create: unknown category/location -> 400 with field errors', async () => {
  const input = {
    type: 'LOST', itemName: 'X Y Z', description: 'deskripsi cukup panjang', category: 'nope', location: 'nowhere',
    locationDetail: null, eventDate: '2026-11-20', reporterName: 'Tes', contactWhatsapp: null,
    contactInstagram: null, contactLine: null, contactEmail: 'a@b.co', publicContactMethod: 'EMAIL',
  };
  await assert.rejects(() => service.createReport(input), (e) =>
    e instanceof AppError && e.status === 400 && e.errors.length === 2);
});

test('create: a file is ignored (imageUrl null) when Cloudinary is not configured', async () => {
  const input = {
    type: 'FOUND', itemName: 'Kunci Kos', description: 'kunci kos ditemukan di lobi', category: 'keys', location: 'gedung-baru',
    locationDetail: 'Lobi', eventDate: '2026-11-19', reporterName: 'Tes', contactWhatsapp: null,
    contactInstagram: null, contactLine: null, contactEmail: 'a@b.co', publicContactMethod: 'EMAIL',
  };
  const created = await service.createReport(input, { buffer: Buffer.from('x'), mimetype: 'image/png' });
  assert.equal(created.imageUrl, null);
});
