const test = require('node:test');
const assert = require('node:assert/strict');
const { detectImageType } = require('../src/utils/imageSignature');

const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

test('detects JPEG, PNG, WEBP', () => {
  assert.equal(detectImageType(pad([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(detectImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(4)]);
  assert.equal(detectImageType(webp), 'image/webp');
});

test('rejects text disguised as an image, and tiny buffers', () => {
  assert.equal(detectImageType(Buffer.from('<?php echo 1; ?> not an image at all')), null);
  assert.equal(detectImageType(Buffer.from([1, 2, 3])), null);
  assert.equal(detectImageType(null), null);
});
