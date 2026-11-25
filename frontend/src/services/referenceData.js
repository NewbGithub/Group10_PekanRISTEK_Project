import mockReports from '../data/mockReports.json';
import { CATEGORY_OPTIONS, LOCATION_OPTIONS } from '../constants/filters';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

// The fallback comes from the canonical mock reports, so mock and live API
// modes filter on exactly the same slugs. Canonical reference options are
// merged in to keep the documented order and include values no report uses
// yet (e.g. the "Lainnya" location).
const uniqueBySlug = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
};

const localOptions = (key, canonical) =>
  uniqueBySlug([
    ...canonical,
    ...mockReports.map((report) => report[key]).filter(Boolean),
  ]);

const LOCAL_DATA = {
  categories: localOptions('category', CATEGORY_OPTIONS),
  locations: localOptions('location', LOCATION_OPTIONS),
};

let cached = null;
let inFlight = null;

const isValidList = (value) =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item.slug === 'string' &&
      typeof item.name === 'string',
  );

const fetchList = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || json?.success !== true || !isValidList(json.data)) {
    throw new Error(json?.message || `Failed to fetch ${path}`);
  }
  return json.data;
};

/**
 * Loads the reference lists from the backend (GET /categories, GET /locations).
 * Falls back to the local mirror of meta.json when mock mode is on, when the
 * endpoints are not implemented yet, or when a request fails.
 */
export const getReferenceData = async () => {
  if (cached) return cached;

  if (USE_MOCK || !API_BASE_URL) {
    cached = LOCAL_DATA;
    return cached;
  }

  if (!inFlight) {
    inFlight = Promise.all([
      fetchList('/categories'),
      fetchList('/locations'),
    ])
      .then(([categories, locations]) => {
        cached = { categories, locations };
        return cached;
      })
      .catch(() => {
        cached = LOCAL_DATA;
        return cached;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};
