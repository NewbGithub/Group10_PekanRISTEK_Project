// Repository versi MEMORI (Checkpoint 2). Data awal diambil dari mock-data/.
// PERHATIAN: data hilang saat server restart. Itu sebabnya Checkpoint 3 memakai PostgreSQL.
const crypto = require('crypto');
const meta = require('../../mock-data/meta.json');
const seedReports = require('../../mock-data/reports.json');
const { CONTACT_FIELD_BY_METHOD } = require('../utils/contactMethods');

// Beri id angka (1, 2, 3...) seperti autoincrement di database
const categories = meta.categories.map((c, i) => ({ id: i + 1, slug: c.slug, name: c.name }));
const locations = meta.locations.map((l, i) => ({ id: i + 1, slug: l.slug, name: l.name }));

// Mengubah item mock (bentuk API) menjadi "record internal" (bentuk yang sama dengan tabel database):
// kontak publik disimpan di kolom kontak yang sesuai, kolom kontak lain null.
function seedToRecord(r) {
  const record = {
    id: r.id,
    type: r.type,
    itemName: r.itemName,
    description: r.description,
    category: categories.find((c) => c.slug === r.category.slug),
    location: locations.find((l) => l.slug === r.location.slug),
    locationDetail: r.locationDetail,
    eventDate: new Date(r.eventDate),
    imageUrl: r.imageUrl,
    imagePublicId: null,
    reporterName: r.reporterName,
    contactWhatsapp: null,
    contactInstagram: null,
    contactLine: null,
    contactEmail: null,
    publicContactMethod: r.contact.method,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
  record[CONTACT_FIELD_BY_METHOD[r.contact.method]] = r.contact.value;
  return record;
}

const reports = seedReports.map(seedToRecord);

// Apakah satu laporan cocok dengan semua filter yang diberikan? (AND)
function matches(report, { q, type, category, location }) {
  if (q && !report.itemName.toLowerCase().includes(q.toLowerCase())) return false;
  if (type && report.type !== type) return false;
  if (category && report.category.slug !== category) return false;
  if (location && report.location.slug !== location) return false;
  return true;
}

// Pembanding untuk sort: utama createdAt, tie-break id supaya urutan selalu stabil
function comparator(sort) {
  const dir = sort === 'oldest' ? 1 : -1;
  return (a, b) => {
    const timeDiff = a.createdAt - b.createdAt;
    if (timeDiff !== 0) return timeDiff * dir;
    const idDiff = a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    return idDiff * dir;
  };
}

async function findMany({ q, type, category, location, sort, page, limit }) {
  const filtered = reports.filter((r) => matches(r, { q, type, category, location }));
  filtered.sort(comparator(sort));
  const start = (page - 1) * limit;
  return { items: filtered.slice(start, start + limit), totalItems: filtered.length };
}

async function findById(id) {
  return reports.find((r) => r.id === id) || null;
}

async function create(data) {
  const now = new Date();
  const record = {
    id: crypto.randomUUID(),
    type: data.type,
    itemName: data.itemName,
    description: data.description,
    category: categories.find((c) => c.id === data.categoryId),
    location: locations.find((l) => l.id === data.locationId),
    locationDetail: data.locationDetail ?? null,
    eventDate: new Date(data.eventDate),
    imageUrl: data.imageUrl ?? null,
    imagePublicId: data.imagePublicId ?? null,
    reporterName: data.reporterName,
    contactWhatsapp: data.contactWhatsapp ?? null,
    contactInstagram: data.contactInstagram ?? null,
    contactLine: data.contactLine ?? null,
    contactEmail: data.contactEmail ?? null,
    publicContactMethod: data.publicContactMethod,
    createdAt: now,
    updatedAt: now,
  };
  reports.push(record);
  return record;
}

const findCategories = async () => categories;
const findLocations = async () => locations;
const findCategoryBySlug = async (slug) => categories.find((c) => c.slug === slug) || null;
const findLocationBySlug = async (slug) => locations.find((l) => l.slug === slug) || null;
const disconnect = async () => {}; // memori tidak punya koneksi untuk ditutup

module.exports = {
  findMany, findById, create,
  findCategories, findLocations, findCategoryBySlug, findLocationBySlug,
  disconnect,
};
