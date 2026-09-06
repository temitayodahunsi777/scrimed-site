// Local regression only. No deployment, authentication or release authority.
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const routes = ['/pilot', '/scrimed-p34'];
function failures(s) {
  return [s.status !== 200 && 'status', s.origin !== 'http://127.0.0.1:3000' && 'origin',
    s.width > s.viewport + 1 && 'overflow', s.main !== 1 && 'main',
    !/synthetic/i.test(s.text) && 'synthetic-boundary',
    !/no[\s-]*phi|do not.{0,80}phi/i.test(s.text) && 'no-phi-boundary',
    s.errors.length > 0 && 'runtime-errors'].filter(Boolean);
}
if (process.argv.includes('--self-test')) {
  const good = {status:200, origin:'http://127.0.0.1:3000', width:390, viewport:390, main:1, text:'Synthetic. No PHI.', errors:[]};
  assert.deepEqual(failures(good), []);
  for (const delta of [{status:401}, {origin:'https://example.com'}, {width:410}, {main:0}, {text:'Welcome'}, {errors:['error']}]) {
    assert.ok(failures({...good, ...delta}).length);
  }
  console.log('
