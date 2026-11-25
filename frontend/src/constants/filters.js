// Local fallback for the backend reference endpoints. Mirrors
// lost-and-found_backend/mock-data/meta.json exactly. When the backend is available,
// useReferenceData() replaces these with GET /categories and GET /locations.
//
// The API filters by slug, while the UI renders `name`.

export const CATEGORY_OPTIONS = [
  { slug: 'card-document', name: 'Kartu & Dokumen' },
  { slug: 'electronics', name: 'Elektronik' },
  { slug: 'bags-wallets', name: 'Tas & Dompet' },
  { slug: 'drinkware', name: 'Tumbler & Botol' },
  { slug: 'keys', name: 'Kunci' },
  { slug: 'clothing', name: 'Pakaian & Aksesori' },
  { slug: 'stationery', name: 'Buku & Alat Tulis' },
  { slug: 'other', name: 'Lainnya' },
];

export const LOCATION_OPTIONS = [
  { slug: 'gedung-lama', name: 'Gedung Lama' },
  { slug: 'gedung-baru', name: 'Gedung Baru' },
  { slug: 'perpustakaan', name: 'Perpustakaan' },
  { slug: 'kantin', name: 'Kantin' },
  { slug: 'sekretariat', name: 'Sekretariat (Sekre)' },
  { slug: 'pos-satpam', name: 'Pos Satpam' },
  { slug: 'musholla', name: 'Musholla' },
  { slug: 'area-parkir', name: 'Area Parkir' },
  { slug: 'lainnya', name: 'Lainnya' },
];

export const REPORT_TYPES = ['LOST', 'FOUND'];

const findOption = (options, value) =>
  (Array.isArray(options) ? options : []).find(
    (option) => option.slug === value || option.name === value,
  );

// Accept either a slug (what the UI now sends) or a display name (legacy URL),
// using whichever option list is currently loaded. The Array.isArray guard
// also keeps these safe when passed directly to Array.map().
export const toCategorySlug = (value, options = CATEGORY_OPTIONS) =>
  value ? findOption(options, value)?.slug ?? value : value;

export const toCategoryName = (value, options = CATEGORY_OPTIONS) =>
  value ? findOption(options, value)?.name ?? value : value;

export const toLocationSlug = (value, options = LOCATION_OPTIONS) =>
  value ? findOption(options, value)?.slug ?? value : value;

export const toLocationName = (value, options = LOCATION_OPTIONS) =>
  value ? findOption(options, value)?.name ?? value : value;
