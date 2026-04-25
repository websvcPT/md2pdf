const test = require('node:test');
const assert = require('node:assert/strict');
const { getSiblingPdfPath } = require('../../src/exportTargets');

test('sibling pdf path uses the same directory and base name', () => {
  assert.equal(
    getSiblingPdfPath('/workspace/docs/guide.md'),
    '/workspace/docs/guide.pdf'
  );
});

test('sibling pdf path falls back to document.pdf when file stem is empty', () => {
  assert.equal(
    getSiblingPdfPath('/workspace/docs/.md'),
    '/workspace/docs/document.pdf'
  );
});
