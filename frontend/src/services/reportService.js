import mockReportsSeed from '../data/mockReports.json';
import {
  CATEGORY_OPTIONS,
  LOCATION_OPTIONS,
  toCategorySlug,
  toLocationSlug,
} from '../constants/filters';

const MOCK_KEY = 'reports_mock';
const MOCK_VERSION_KEY = 'reports_mock_version';
const MOCK_VERSION = '3';

// Backend contract: GET /reports defaults to limit=10, max=50.
const API_DEFAULT_LIMIT = 10;
const API_MAX_LIMIT = 50;
// Safety cap for the client-side filter fallback (50 * 40 = 2000 reports).
const API_MAX_PAGES = 40;

const DATE_RANGE_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

// Shared with the backend: lostfound-backend/mock-data/reports.json
// (kept byte-identical in src/data/mockReports.json).
const MOCK_DATA = mockReportsSeed;

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seed = () => {
  if (
    localStorage.getItem(MOCK_VERSION_KEY) !== MOCK_VERSION ||
    localStorage.getItem(MOCK_KEY) === null
  ) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(MOCK_DATA));
    localStorage.setItem(MOCK_VERSION_KEY, MOCK_VERSION);
  }
};

const readAll = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(MOCK_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const writeAll = (reports) => localStorage.setItem(MOCK_KEY, JSON.stringify(reports));

const createMockId = () =>
  globalThis.crypto?.randomUUID?.() || `report-${Date.now()}`;

const isDateWithinRange = (createdAt, range) => {
  const rangeMs = DATE_RANGE_MS[range];
  if (!rangeMs) return true;
  const timestamp = new Date(createdAt).getTime();
  return !Number.isNaN(timestamp) && timestamp >= Date.now() - rangeMs;
};

// The backend already returns the exact shape the UI needs: category and
// location are `{ slug, name }` objects. No client-side normalization.

// ---------------------------------------------------------------------------
// API mode helpers
// ---------------------------------------------------------------------------

const apiGet = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await response.json().catch(() => null);
  return { response, json };
};

const assertSuccess = (response, json) => {
  if (!response.ok || !json || json.success !== true) {
    throw new Error(
      json?.message || `Request failed: ${response.status} ${response.statusText}`,
    );
  }
  return json;
};

const buildReportsQuery = ({ q, type, category, location, page, limit }) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (type && type !== 'ALL') params.set('type', type);
  if (category) params.set('category', category);
  if (location) params.set('location', location);
  params.set('page', String(page || 1));
  params.set('limit', String(limit || API_DEFAULT_LIMIT));
  return params.toString();
};

const fetchReportPage = async (filters) => {
  const { response, json } = await apiGet(`/reports?${buildReportsQuery(filters)}`);
  assertSuccess(response, json);

  const pagination = json.meta?.pagination ?? {};
  const data = Array.isArray(json.data) ? json.data : [];

  return {
    reports: data,
    page: pagination.page ?? filters.page ?? 1,
    limit: pagination.limit ?? filters.limit ?? API_DEFAULT_LIMIT,
    total: pagination.totalItems ?? data.length,
    totalPages: pagination.totalPages ?? 0,
  };
};

// Used only when the UI needs a filter the backend cannot express
// (multi-category OR, or the frontend-only date range).
const fetchAllReports = async (filters) => {
  const collected = [];
  let page = 1;
  let totalPages;

  do {
    const result = await fetchReportPage({
      ...filters,
      page,
      limit: API_MAX_LIMIT,
    });
    collected.push(...result.reports);
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages && page <= API_MAX_PAGES);

  return collected;
};

const resolveCategorySlugs = (categories, legacyCategory) => {
  const values =
    categories && categories.length > 0
      ? categories
      : legacyCategory && legacyCategory !== 'ALL'
        ? [legacyCategory]
        : [];

  return [
    ...new Set(values.map((value) => toCategorySlug(value)).filter(Boolean)),
  ];
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getReports = async ({
  search,
  type,
  category,
  categories = [],
  dateRange,
  location,
  page = 1,
  limit,
} = {}) => {
  if (USE_MOCK) {
    seed();
    await delay(300);

    let reports = [...readAll()];

    // Newest first, so the Home page's `limit: 4` preview and paging stay stable.
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const q = (search || '').trim().toLowerCase();
    const categorySet = new Set(resolveCategorySlugs(categories, category));
    const locationSlug =
      location && location !== 'ALL' ? toLocationSlug(location) : null;

    // Mock reports use the same `{ slug, name }` references as the API.
    // The string checks also tolerate older locally stored data.
    const reportCategorySlug = (report) =>
      report.category && typeof report.category === 'object'
        ? report.category.slug
        : toCategorySlug(report.category);
    const reportLocationSlug = (report) =>
      report.location && typeof report.location === 'object'
        ? report.location.slug
        : toLocationSlug(report.location);

    reports = reports.filter((report) => {
      if (q && !report.itemName?.toLowerCase().includes(q)) return false;
      if (type && type !== 'ALL' && report.type !== type) return false;
      if (categorySet.size > 0 && !categorySet.has(reportCategorySlug(report))) {
        return false;
      }
      if (dateRange && !isDateWithinRange(report.createdAt, dateRange)) return false;
      if (locationSlug && reportLocationSlug(report) !== locationSlug) return false;
      return true;
    });

    const total = reports.length;
    const totalPages = limit ? Math.max(1, Math.ceil(total / limit)) : 1;
    const paginated = limit ? reports.slice((page - 1) * limit, page * limit) : reports;

    return {
      reports: paginated,
      total,
      page,
      limit: limit || total,
      totalPages,
    };
  }

  // API mode
  const q = (search || '').trim();
  const typeFilter = type && type !== 'ALL' ? type : undefined;
  const locationSlug =
    location && location !== 'ALL' ? toLocationSlug(location) : undefined;
  const categorySlugs = resolveCategorySlugs(categories, category);
  const needsClientFilter = categorySlugs.length > 1 || Boolean(dateRange);

  if (!needsClientFilter) {
    // Everything is supported by GET /reports, so let the backend paginate.
    const result = await fetchReportPage({
      q,
      type: typeFilter,
      category: categorySlugs[0],
      location: locationSlug,
      page,
      limit,
    });

    return {
      reports: result.reports,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.max(1, result.totalPages),
    };
  }

  // The backend only accepts one category slug and has no date range, so these
  // filters are applied on the merged result set and paginated locally.
  let merged;
  if (categorySlugs.length > 1) {
    const groups = await Promise.all(
      categorySlugs.map((slug) =>
        fetchAllReports({
          q,
          type: typeFilter,
          category: slug,
          location: locationSlug,
        }),
      ),
    );
    const byId = new Map();
    groups.flat().forEach((report) => byId.set(String(report.id), report));
    merged = [...byId.values()];
  } else {
    merged = await fetchAllReports({
      q,
      type: typeFilter,
      category: categorySlugs[0],
      location: locationSlug,
    });
  }

  if (dateRange) {
    merged = merged.filter((report) =>
      isDateWithinRange(report.createdAt, dateRange),
    );
  }

  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const resolvedLimit = limit || merged.length || 1;
  const total = merged.length;
  const totalPages = Math.max(1, Math.ceil(total / resolvedLimit));
  const start = (page - 1) * resolvedLimit;

  return {
    reports: merged.slice(start, start + resolvedLimit),
    total,
    page,
    limit: resolvedLimit,
    totalPages,
  };
};

export const getReportById = async (id) => {
  if (USE_MOCK) {
    seed();
    await delay(300);
    const reports = readAll();
    return reports.find((report) => String(report.id) === String(id)) || null;
  }

  const { response, json } = await apiGet(`/reports/${encodeURIComponent(id)}`);

  // The backend returns 404 for a missing (or invalid) UUID. That is a
  // "not found" result for the detail page, not a fetch failure.
  if (response.status === 404) return null;

  assertSuccess(response, json);
  return json.data;
};

const toReference = (value, options) => {
  if (!value) return value;
  if (typeof value === 'object' && value.slug && value.name) return value;
  const match = options.find(
    (option) => option.slug === value || option.name === value,
  );
  return match ? { ...match } : value;
};

const CONTACT_FIELDS = {
  WHATSAPP: 'contactWhatsapp',
  INSTAGRAM: 'contactInstagram',
  LINE: 'contactLine',
  EMAIL: 'contactEmail',
};

const resolveContact = (payload) => {
  if (payload.contact && typeof payload.contact === 'object') {
    return payload.contact;
  }
  const method = payload.publicContactMethod;
  const field = CONTACT_FIELDS[method];
  const value = field ? payload[field] : undefined;
  return method && value ? { method, value } : undefined;
};

// Mirrors the multipart fields documented in
// lostfound-backend/docs/API_CONTRACT.md section 9.
const CREATE_FIELDS = [
  'type',
  'itemName',
  'description',
  'category',
  'location',
  'locationDetail',
  'eventDate',
  'reporterName',
  'contactWhatsapp',
  'contactInstagram',
  'contactLine',
  'contactEmail',
  'publicContactMethod',
];

const buildCreateFormData = (payload) => {
  const formData = new FormData();

  CREATE_FIELDS.forEach((field) => {
    let value = payload[field];
    if (value === undefined || value === null || value === '') return;
    if (field === 'category') value = toCategorySlug(value);
    if (field === 'location') value = toLocationSlug(value);
    formData.append(field, value);
  });

  if (payload.image) formData.append('image', payload.image);
  return formData;
};

export const createReport = async (payload) => {
  if (USE_MOCK) {
    seed();
    await delay(500);
    const reports = readAll();
    const now = new Date().toISOString();

    // Store the same shape the backend returns: `{ slug, name }` references,
    // a single public `contact`, and no internal form fields.
    const report = {
      id: createMockId(),
      type: payload.type,
      itemName: payload.itemName,
      description: payload.description,
      category: toReference(payload.category, CATEGORY_OPTIONS),
      location: toReference(payload.location, LOCATION_OPTIONS),
      locationDetail: payload.locationDetail ?? null,
      eventDate: payload.eventDate,
      imageUrl: payload.image ? null : payload.imageUrl ?? null,
      reporterName: payload.reporterName,
      contact: resolveContact(payload),
      createdAt: now,
      updatedAt: now,
    };

    writeAll([...reports, report]);
    return report;
  }

  // Do not set Content-Type: the browser adds the multipart boundary.
  const body = payload instanceof FormData ? payload : buildCreateFormData(payload);

  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body,
  });
  const json = await response.json().catch(() => null);
  assertSuccess(response, json);

  return json.data;
};
