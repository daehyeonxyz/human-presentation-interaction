/* 모든 장의 모든 단계를 캡처한다. node deck/shots.mjs [장 번호...] */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
const browser = await pw.chromium.launch(); const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = []; page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(pathToFileURL(path.join(ROOT, 'AX101.html')).href, { waitUntil: 'load' }); await page.waitForTimeout(400);
const n = await page.evaluate('document.querySelectorAll(".s").length'); const only = process.argv.slice(2).map(Number);
const overflow = `(() => { const s = document.querySelector('.s.active'); const st = document.getElementById('stage'); const sr = st.getBoundingClientRect(); const k = sr.width / 1920; let bad = [];
  s.querySelectorAll('*').forEach((el) => { const cs = getComputedStyle(el); if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none') return; const r = el.getBoundingClientRect(); if (!r.width) return;
    const L = (r.left - sr.left) / k, T = (r.top - sr.top) / k, R = (r.right - sr.left) / k, B = (r.bottom - sr.top) / k;
    const lim = el.closest('.foot') || s.classList.contains('cover') || s.classList.contains('blue') ? [-1,-1,1921,1081] : [79,79,1842,1002]; if (L < lim[0] || T < lim[1] || R > lim[2] || B > lim[3]) bad.push((el.className || el.tagName).toString().slice(0, 24) + ' ' + Math.round(L) + ',' + Math.round(T) + ',' + Math.round(R) + ',' + Math.round(B)); });
  return bad.slice(0, 5); })()`;
for (let p = 1; p <= n; p++) {
  if (only.length && !only.includes(p)) continue;
  await page.evaluate(`go(${p})`); await page.waitForTimeout(800);
  const steps = await page.evaluate('+document.querySelector(".s.active").dataset.steps || 0');
  for (let k = 0; k <= steps; k++) {
    if (k > 0) { await page.evaluate('nextStep()'); await page.waitForTimeout(k === 1 && p === 15 ? 4200 : 700); }
    const bad = await page.evaluate(overflow);
    await page.screenshot({ path: path.join(OUT, `p${String(p).padStart(2, '0')}-${k}.png`) });
    if (bad.length) console.log(`p${p} step${k} overflow:`, bad.join(' | '));
  }
}
console.log(errors.length ? errors.join('\n') : 'no js errors'); await browser.close();
