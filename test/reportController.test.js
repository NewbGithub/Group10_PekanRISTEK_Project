// Menguji controller dengan req/res palsu (tanpa Express) untuk memastikan status code & format response.
const test = require('node:test');
const assert = require('node:assert/strict');
const controller = require('../src/controllers/reportController');
const { errorHandler } = require('../src/middlewares/errorHandler');

function fakeRes() {
  return {
    statusCode: 200, body: null, headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    location(url) { this.headers.Location = url; return this; },
    headersSent: false,
  };
}

// Menjalankan controller; jika melempar error, teruskan ke errorHandler seperti yang dilakukan Express
async function run(handler, req) {
  const res = fakeRes();
  await handler(req, res, (err) => errorHandler(err, req, res, () => {}));
  return res;
}

const validBody = () => ({
  type: 'FOUND', itemName: 'Payung Merah', description: 'Payung merah ditemukan di parkiran.',
  category: 'other', location: 'area-parkir', eventDate: '2026-11-01', reporterName: 'Tes',
  contactEmail: 'tes@example.com', contactLine: 'tes_line', publicContactMethod: 'EMAIL',
});

test('GET /reports -> 200 with envelope and pagination meta', async () => {
  const res = await run(controller.getReports, { query: { type: 'LOST', limit: '3' } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.length, 3);
  assert.equal(res.body.meta.pagination.limit, 3);
});

test('GET /reports invalid query -> 400 with errors[]', async () => {
  const res = await run(controller.getReports, { query: { type: 'ABC', limit: '100' } });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Validation failed');
  assert.equal(res.body.errors.length, 2);
});

test('GET /reports/:id -> 200 / 404', async () => {
  const ok = await run(controller.getReportById, { params: { id: 'a1b2c3d4-0000-4000-8000-000000000002' } });
  assert.equal(ok.statusCode, 200);
  assert.equal(ok.body.data.contact.method, 'INSTAGRAM');
  const missing = await run(controller.getReportById, { params: { id: 'nope' } });
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(missing.body, { success: false, message: 'Report not found' });
});

test('POST /reports valid -> 201 + Location header, private contact hidden', async () => {
  const res = await run(controller.createReport, { body: validBody() });
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.message, 'Report created successfully');
  assert.equal(res.headers.Location, `/reports/${res.body.data.id}`);
  assert.deepEqual(res.body.data.contact, { method: 'EMAIL', value: 'tes@example.com' });
  assert.ok(!JSON.stringify(res.body).includes('tes_line'));
});

test('POST /reports invalid -> 400 listing every problem', async () => {
  const res = await run(controller.createReport, { body: { itemName: 'ab' } });
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.errors.length >= 6);
});

test('POST /reports with no body at all (undefined) -> 400, not a crash', async () => {
  const res = await run(controller.createReport, { body: undefined });
  assert.equal(res.statusCode, 400);
});

test('unexpected errors become 500 without leaking details', async () => {
  const res = fakeRes();
  const original = console.error; console.error = () => {};
  errorHandler(new Error('db password is hunter2'), {}, res, () => {});
  console.error = original;
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: 'Internal server error' });
});
