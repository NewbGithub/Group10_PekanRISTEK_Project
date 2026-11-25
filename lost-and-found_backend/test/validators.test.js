const test = require('node:test');
const assert = require('node:assert/strict');
const { validateListQuery, validateCreateBody } = require('../src/validators/reportValidator');

const TODAY = '2026-11-21';
const validBody = () => ({
  type: 'LOST',
  itemName: 'Tumbler Biru',
  description: 'Tumbler biru tertinggal di kelas.',
  category: 'drinkware',
  location: 'gedung-lama',
  eventDate: '2026-11-20',
  reporterName: 'Raka',
  contactWhatsapp: '081200000001',
  publicContactMethod: 'WHATSAPP',
});

test('list query: default values', () => {
  const { errors, value } = validateListQuery({});
  assert.deepEqual(errors, []);
  assert.deepEqual(value, { sort: 'newest', page: 1, limit: 10 });
});

test('list query: valid filters are kept and trimmed', () => {
  const { errors, value } = validateListQuery({ q: '  charger ', type: 'LOST', category: 'electronics', page: '2', limit: '5' });
  assert.deepEqual(errors, []);
  assert.equal(value.q, 'charger');
  assert.equal(value.page, 2);
  assert.equal(value.limit, 5);
});

test('list query: empty params are treated as not provided', () => {
  const { errors, value } = validateListQuery({ q: '', type: '', page: '' });
  assert.deepEqual(errors, []);
  assert.equal(value.type, undefined);
  assert.equal(value.page, 1);
});

test('list query: invalid values produce errors', () => {
  const { errors } = validateListQuery({ type: 'ABC', page: '0', limit: '100', sort: 'random' });
  assert.deepEqual(errors.map((e) => e.field).sort(), ['limit', 'page', 'sort', 'type']);
});

test('list query: repeated param (array) is rejected', () => {
  const { errors } = validateListQuery({ q: ['a', 'b'] });
  assert.equal(errors[0].field, 'q');
});

test('create: valid body passes and unselected contacts are null', () => {
  const { errors, value } = validateCreateBody(validBody(), { today: TODAY });
  assert.deepEqual(errors, []);
  assert.equal(value.contactWhatsapp, '081200000001');
  assert.equal(value.contactEmail, null);
  assert.equal(value.locationDetail, null);
});

test('create: empty body reports all required fields', () => {
  const { errors } = validateCreateBody({}, { today: TODAY });
  const fields = errors.map((e) => e.field);
  for (const f of ['type', 'itemName', 'description', 'category', 'location', 'eventDate', 'reporterName', 'publicContactMethod']) {
    assert.ok(fields.includes(f), `missing error for ${f}`);
  }
});

test('create: selected contact method must be filled', () => {
  const body = { ...validBody(), publicContactMethod: 'EMAIL' };
  const { errors } = validateCreateBody(body, { today: TODAY });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].field, 'contactEmail');
});

test('create: future date is rejected, today is accepted', () => {
  assert.equal(validateCreateBody({ ...validBody(), eventDate: '2026-11-22' }, { today: TODAY }).errors[0].field, 'eventDate');
  assert.deepEqual(validateCreateBody({ ...validBody(), eventDate: TODAY }, { today: TODAY }).errors, []);
});

test('create: impossible date is rejected', () => {
  const { errors } = validateCreateBody({ ...validBody(), eventDate: '2026-02-31' }, { today: TODAY });
  assert.equal(errors[0].field, 'eventDate');
});

test('create: whatsapp is normalized, instagram loses the @', () => {
  const body = { ...validBody(), contactWhatsapp: '0812-0000 0001', contactInstagram: '@raka.pacil' };
  const { errors, value } = validateCreateBody(body, { today: TODAY });
  assert.deepEqual(errors, []);
  assert.equal(value.contactWhatsapp, '081200000001');
  assert.equal(value.contactInstagram, 'raka.pacil');
});

test('create: invalid optional contact is still rejected', () => {
  const { errors } = validateCreateBody({ ...validBody(), contactEmail: 'bukan-email' }, { today: TODAY });
  assert.equal(errors[0].field, 'contactEmail');
});

test('create: non-text value (number) is rejected', () => {
  const { errors } = validateCreateBody({ ...validBody(), itemName: 12345 }, { today: TODAY });
  assert.equal(errors[0].field, 'itemName');
  assert.equal(errors.filter((e) => e.field === 'itemName').length, 1);
});

test('create: too short / too long text is rejected', () => {
  const { errors } = validateCreateBody({ ...validBody(), itemName: 'ab', description: 'x'.repeat(1001) }, { today: TODAY });
  assert.deepEqual(errors.map((e) => e.field).sort(), ['description', 'itemName']);
});
