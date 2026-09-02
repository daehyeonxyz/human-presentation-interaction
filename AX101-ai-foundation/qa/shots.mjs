/* 쪽마다 정지 상태와 End 완료 상태를 캡처하고 콘솔 오류와 넘침을 기록한다.
     NODE_PATH=/opt/node22/lib/node_modules node qa/shots.mjs [쪽번호...] */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const pw = await import(process.env.PW_DIR ? process.env.PW_DIR : '/opt/node22/lib/node_modules/playwright/index.mjs');
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(pathToFileURL(path.join(ROOT, 'deliverables', 'AX101.html')).href, { waitUntil: 'load' });
await page.waitForTimeout(500);
const n = await page.evaluate('document.querySelectorAll(".slide").length');
const only = process.argv.slice(2).map(Number);
const probe = `(() => {
  const stage = document.getElementById('stage'); const sr = stage.getBoundingClientRect(); const s = sr.width / stage.offsetWidth;
  const sec = document.querySelector('.slide.active'); let bad = [];
  sec.querySelectorAll('*').forEach((el) => {
    const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') return;
    let hid = false; for (let a = el.parentElement; a && a !== stage; a = a.parentElement) { const ac = getComputedStyle(a); if (ac.opacity === '0' || ac.visibility === 'hidden' || ac.display === 'none') { hid = true; break; } }
    if (hid) return;
    let r = el.getBoundingClientRect(); if (!r.width && !r.height) return;
    let node = el.parentElement, L2 = r.left, T2 = r.top, R2 = r.right, B2 = r.bottom;
    while (node && node !== stage.parentElement) { const c = getComputedStyle(node); const cr = node.getBoundingClientRect();
      if (c.overflowX !== 'visible') { L2 = Math.max(L2, cr.left); R2 = Math.min(R2, cr.left + node.clientWidth * s); }
      if (c.overflowY !== 'visible') { T2 = Math.max(T2, cr.top); B2 = Math.min(B2, cr.top + node.clientHeight * s); } node = node.parentElement; }
    if (R2 <= L2 || B2 <= T2) return;
    const L = (L2 - sr.left) / s, T = (T2 - sr.top) / s, R = (R2 - sr.left) / s, B = (B2 - sr.top) / s;
    if (L < 79 || R > 1841 || T < 79 || B > 1001) bad.push((el.className || el.tagName).toString().slice(0, 30) + ' L' + Math.round(L) + ' T' + Math.round(T) + ' R' + Math.round(R) + ' B' + Math.round(B) + ' [' + (el.textContent || '').trim().slice(0, 16) + ']');
    /* 자동 줄바꿈 감지: 한 줄 요소인데 높이가 행간의 1.6배를 넘는 것 */
    if (el.classList.contains('ln') && r.height / s > parseFloat(st.lineHeight) * 1.6) bad.push('WRAP ' + (el.textContent || '').trim().slice(0, 20));
  });
  return bad.slice(0, 8);
})()`;
for (let p = 1; p <= n; p++) {
  if (only.length && only.indexOf(p) < 0) continue;
  await page.evaluate(`go(${p - 1})`); await page.waitForTimeout(900);
  const b1 = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, `p${String(p).padStart(2, '0')}-rest.png`) });
  await page.keyboard.press('End'); await page.waitForTimeout(700);
  const b2 = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, `p${String(p).padStart(2, '0')}-done.png`) });
  console.log(`p${p}` + (b1.length ? ' REST: ' + b1.join(' | ') : '') + (b2.length ? ' DONE: ' + b2.join(' | ') : ''));
}
console.log(errors.length ? errors.join('\n') : 'no js errors');
await browser.close();
