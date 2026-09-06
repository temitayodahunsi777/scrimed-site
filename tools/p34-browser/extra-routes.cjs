// Local regression only. No deployment, authentication or release authority.
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
  console.log('7 supplemental route policy tests passed');
} else {
  (async () => {
    const out = 'artifacts/ui-verification/p34-pinned-ci';
    mkdirSync(out, {recursive:true});
    const browser = await chromium.launch();
    const results = [];
    try {
      for (const width of [1440,390]) {
        for (const route of routes) {
          const context = await browser.newContext({viewport:{width,height:1000}});
          try {
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', () => errors.push('page-error'));
            page.on('console', msg => { if(msg.type() === 'error') errors.push('console-error'); });
            const response = await page.goto('http://127.0.0.1:3000' + route, {waitUntil:'networkidle',timeout:30000});
            const snapshot = await page.evaluate(() => ({origin:location.origin,width:document.documentElement.scrollWidth,viewport:innerWidth,main:document.querySelectorAll('main').length,text:document.body.innerText}));
            const found = failures({...snapshot,status:response?.status(),errors});
            results.push({route,width,failures:found});
            await page.screenshot({path:`${out}/supplement-${width}-${route.slice(1)}.png`,fullPage:true});
          } catch (error) {
            results.push({route,width,failures:['navigation-or-capture-failure']});
          } finally { await context.close(); }
        }
      }
    } finally { await browser.close(); }
    const passed = results.length === 4 && results.every(r => r.failures.length === 0);
    writeFileSync(out + '/supplemental-routes.json',JSON.stringify({scope:'local_regression_only',deploymentAcceptance:false,passed,results},null,2));
    if (!passed) process.exitCode = 1;
  })().catch(() => { console.error('Supplemental runner failed'); process.exitCode = 1; });
}
