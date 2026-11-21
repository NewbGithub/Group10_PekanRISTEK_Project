// Validator = "satpam input". Memeriksa data dari pengguna SEBELUM diproses.
// Tidak memakai library validasi supaya logikanya terlihat jelas.
// Setiap fungsi mengembalikan { errors, value }:
//   errors = daftar masalah [{ field, message }]  (kosong = valid)
//   value  = data yang sudah dibersihkan (trim, normalisasi, nilai default)

const {
  REPORT_TYPES, CONTACT_METHODS, SORT_OPTIONS, PAGINATION, FIELD_LIMITS,
} = require('../constants');
const { CONTACT_FIELD_BY_METHOD } = require('../utils/contactMethods');
const config = require('../config');

// true jika nilai "dianggap tidak diisi": undefined, null, atau string kosong/spasi saja
const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/* =========================================================
 * 1) Validasi query string untuk GET /reports
 * ========================================================= */
function validateListQuery(query = {}) {
  const errors = [];
  const value = {};

  // Membaca satu parameter sebagai string. Jika dikirim berulang (?q=a&q=b) Express memberi array -> tolak.
  const readString = (name) => {
    const raw = query[name];
    if (isBlank(raw)) return undefined;
    if (typeof raw !== 'string') {
      errors.push({ field: name, message: `${name} must be a single value` });
      return undefined;
    }
    return raw.trim();
  };

  // Membaca integer dengan batas min-max; param kosong -> pakai nilai default
  const readInt = (name, defaultValue, min, max) => {
    const raw = readString(name);
    if (raw === undefined) return defaultValue;
    const n = Number(raw);
    if (!/^\d+$/.test(raw) || n < min || n > max) {
      errors.push({ field: name, message: `${name} must be an integer between ${min} and ${max}` });
      return defaultValue;
    }
    return n;
  };

  const q = readString('q');
  if (q !== undefined) {
    if (q.length > FIELD_LIMITS.QUERY_TEXT_MAX) {
      errors.push({ field: 'q', message: `q must be at most ${FIELD_LIMITS.QUERY_TEXT_MAX} characters` });
    } else {
      value.q = q;
    }
  }

  const type = readString('type');
  if (type !== undefined) {
    if (!REPORT_TYPES.includes(type)) errors.push({ field: 'type', message: 'type must be LOST or FOUND' });
    else value.type = type;
  }

  // slug kategori & lokasi: cukup string; slug yang tidak dikenal = hasil kosong (bukan error)
  const category = readString('category');
  if (category !== undefined) value.category = category;
  const location = readString('location');
  if (location !== undefined) value.location = location;

  const sort = readString('sort');
  if (sort === undefined) value.sort = 'newest';
  else if (!SORT_OPTIONS.includes(sort)) errors.push({ field: 'sort', message: 'sort must be newest or oldest' });
  else value.sort = sort;

  value.page = readInt('page', PAGINATION.DEFAULT_PAGE, 1, PAGINATION.MAX_PAGE);
  value.limit = readInt('limit', PAGINATION.DEFAULT_LIMIT, 1, PAGINATION.MAX_LIMIT);

  return { errors, value };
}

/* =========================================================
 * 2) Validasi body untuk POST /reports
 * ========================================================= */

// Aturan tiap kontak: normalize = merapikan nilai, test = cek format
const CONTACT_RULES = {
  contactWhatsapp: {
    normalize: (v) => v.replace(/[\s-]/g, ''),                 // hapus spasi dan strip: "0812-3456 7890" -> "081234567890"
    test: (v) => /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(v),
    message: 'contactWhatsapp must be a valid Indonesian phone number',
  },
  contactInstagram: {
    normalize: (v) => v.replace(/^@/, ''),                     // "@budi" -> "budi"
    test: (v) => /^[A-Za-z0-9._]{1,30}$/.test(v),
    message: 'contactInstagram must be 1-30 characters (letters, digits, dot, underscore)',
  },
  contactLine: {
    normalize: (v) => v,
    test: (v) => /^[A-Za-z0-9._-]{4,20}$/.test(v),
    message: 'contactLine must be 4-20 characters (letters, digits, dot, underscore, dash)',
  },
  contactEmail: {
    normalize: (v) => v,
    test: (v) => v.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: 'contactEmail must be a valid email (max 100 characters)',
  },
};

// '2026-11-14' valid? Pastikan formatnya benar DAN tanggalnya nyata (bukan 2026-02-31)
function isRealDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Tanggal "hari ini" (YYYY-MM-DD) di zona waktu tertentu. 'en-CA' kebetulan berformat YYYY-MM-DD.
const todayIn = (timeZone) => new Date().toLocaleDateString('en-CA', { timeZone });

// options.today dipakai agar bisa diuji dengan tanggal palsu
function validateCreateBody(body = {}, options = {}) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  const hasError = (field) => errors.some((e) => e.field === field);

  // Baca field teks. Jika bukan string (mis. angka dari JSON) -> catat error.
  const readText = (field) => {
    const raw = body[field];
    if (isBlank(raw)) return undefined;
    if (typeof raw !== 'string') {
      add(field, `${field} must be text`);
      return undefined;
    }
    return raw.trim();
  };

  // Field teks wajib dengan batas panjang [min, max]
  const requiredText = (field, [min, max]) => {
    const v = readText(field);
    if (v === undefined) {
      if (!hasError(field)) add(field, `${field} is required`);
      return undefined;
    }
    if (v.length < min || v.length > max) {
      add(field, `${field} must be between ${min} and ${max} characters`);
      return undefined;
    }
    return v;
  };

  // Field enum wajib (type, publicContactMethod)
  const requiredEnum = (field, allowed, message) => {
    const v = readText(field);
    if (v === undefined) {
      if (!hasError(field)) add(field, `${field} is required`);
      return undefined;
    }
    if (!allowed.includes(v)) { add(field, message); return undefined; }
    return v;
  };

  const type = requiredEnum('type', REPORT_TYPES, 'type must be LOST or FOUND');
  const itemName = requiredText('itemName', FIELD_LIMITS.ITEM_NAME);
  const description = requiredText('description', FIELD_LIMITS.DESCRIPTION);
  const category = requiredText('category', [1, 50]);   // slug; keberadaannya dicek di service
  const location = requiredText('location', [1, 50]);
  const reporterName = requiredText('reporterName', FIELD_LIMITS.REPORTER_NAME);

  // locationDetail opsional
  let locationDetail = readText('locationDetail');
  if (locationDetail !== undefined && locationDetail.length > FIELD_LIMITS.LOCATION_DETAIL[1]) {
    add('locationDetail', `locationDetail must be at most ${FIELD_LIMITS.LOCATION_DETAIL[1]} characters`);
    locationDetail = undefined;
  }

  // eventDate: format benar, tanggal nyata, tidak di masa depan
  let eventDate = readText('eventDate');
  if (eventDate === undefined) {
    if (!hasError('eventDate')) add('eventDate', 'eventDate is required');
  } else if (!isRealDate(eventDate)) {
    add('eventDate', 'eventDate must be a valid date in YYYY-MM-DD format');
    eventDate = undefined;
  } else if (eventDate > (options.today || todayIn(config.timezone))) {
    add('eventDate', 'eventDate cannot be in the future'); // string YYYY-MM-DD aman dibandingkan secara alfabet
    eventDate = undefined;
  }

  // Kontak: semua opsional, tapi kalau diisi formatnya harus benar
  const contacts = {};
  for (const [field, rule] of Object.entries(CONTACT_RULES)) {
    const raw = readText(field);
    if (raw === undefined) {
      contacts[field] = null;
      continue;
    }
    const normalized = rule.normalize(raw);
    if (!rule.test(normalized)) {
      add(field, rule.message);
      contacts[field] = null;
    } else {
      contacts[field] = normalized;
    }
  }

  // Metode kontak publik wajib dipilih, dan kontak yang dipilih wajib terisi
  const publicContactMethod = requiredEnum(
    'publicContactMethod', CONTACT_METHODS, 'publicContactMethod must be WHATSAPP, INSTAGRAM, LINE, or EMAIL'
  );
  if (publicContactMethod) {
    const selectedField = CONTACT_FIELD_BY_METHOD[publicContactMethod];
    if (!contacts[selectedField] && !hasError(selectedField)) {
      add(selectedField, `${selectedField} is required when publicContactMethod is ${publicContactMethod}`);
    }
  }

  return {
    errors,
    value: {
      type, itemName, description, category, location,
      locationDetail: locationDetail ?? null,
      eventDate, reporterName,
      ...contacts,
      publicContactMethod,
    },
  };
}

module.exports = { validateListQuery, validateCreateBody };
