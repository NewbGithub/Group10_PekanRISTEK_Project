const test = require('node:test');
const assert = require('node:assert/strict');
const toPublicReport = require('../src/utils/toPublicReport');

const record = {
  id: 'abc',
  type: 'FOUND',
  itemName: 'Dompet',
  description: 'Dompet cokelat ditemukan.',
  category: { id: 3, slug: 'bags-wallets', name: 'Tas & Dompet' },
  location: { id: 7, slug: 'musholla', name: 'Musholla' },
  locationDetail: null,
  eventDate: new Date('2026-11-11'),
  imageUrl: null,
  imagePublicId: 'secret/public-id',
  reporterName: 'Rina',
  contactWhatsapp: '081200009999',
  contactInstagram: 'rina.private',
  contactLine: 'rina_line',
  contactEmail: 'rina@example.com',
  publicContactMethod: 'INSTAGRAM',
  createdAt: new Date('2026-11-12T11:00:00.000Z'),
  updatedAt: new Date('2026-11-12T11:00:00.000Z'),
};

test('only the selected contact is exposed', () => {
  const out = toPublicReport(record);
  assert.deepEqual(out.contact, { method: 'INSTAGRAM', value: 'rina.private' });
});

test('private contacts and imagePublicId never appear anywhere in the output', () => {
  const json = JSON.stringify(toPublicReport(record));
  for (const secret of ['081200009999', 'rina_line', 'rina@example.com', 'secret/public-id', 'contactWhatsapp', 'imagePublicId']) {
    assert.ok(!json.includes(secret), `leaked: ${secret}`);
  }
});

test('shape matches the API contract', () => {
  const out = toPublicReport(record);
  assert.equal(out.eventDate, '2026-11-11');
  assert.equal(out.imageUrl, null);
  assert.deepEqual(out.category, { slug: 'bags-wallets', name: 'Tas & Dompet' });
  assert.equal(out.createdAt, '2026-11-12T11:00:00.000Z');
});
