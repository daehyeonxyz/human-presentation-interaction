/* 게이트: 말풍선 잘림 · 파란 글자 수 · 행간 없는 크기 규칙 · 여백 밖. node deck/gate.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..');
const css = fs.readFileSync(path.join(HERE, 'styles.css'), 'utf8');
const bad = [];
for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) { const sel = m[1].trim(), body = m[2]; if (sel.startsWith(':root') || /\.(k|st|pj|menu|brief|pcell)\b/.test(sel)) continue; if (/font-size:/.test(body) && !/line-height:/.test(body)) bad.push(sel.slice(0, 60)); }
console.log('font-size without line-height (deck rules):', bad.length, bad);
const pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
const browser = await pw.chromium.launch(); const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(pathToFileURL(path.join(ROOT, 'AX101.html')).href, { waitUntil: 'load' }); await page.waitForTimeout(500);
const n = await page.evaluate('document.querySelectorAll(".s").length');
const probe = `(() => { const s = document.querySelector('.s.active'); const st = document.getElementById('stage').getBoundingClientRect(); const k = st.width / 1920; const out = { clip: [], blue: [] };
  s.querySelectorAll('.k-msgs').forEach(m => { const mr = m.getBoundingClientRect(); [...m.children].forEach(c => { const cs = getComputedStyle(c); if (cs.display === 'none' || cs.opacity === '0') return; const r = c.getBoundingClientRect(); if (r.top < mr.top - 1) out.clip.push(Math.round((mr.top - r.top) / k)); }); });
  s.querySelectorAll('*').forEach(el => { const cs = getComputedStyle(el); if (cs.color !== 'rgb(20, 40, 160)' || cs.opacity === '0' || cs.visibility === 'hidden') return; if (!el.childNodes.length || ![...el.childNodes].some(nd => nd.nodeType === 3 && nd.textContent.trim())) return; if (el.closest('.eye, .foot, .no, .sel, .lit, .on, .bx, .k, .st, .pj, .menu, .brief, .g, .w.new, .tabs')) return; out.blue.push(el.className.toString().slice(0, 30) + ':' + el.textContent.trim().slice(0, 14)); });
  return out; })()`;
for (let p = 1; p <= n; p++) {
  await page.evaluate(`go(${p})`); await page.waitForTimeout(400);
  const steps = await page.evaluate('+document.querySelector(".s.active").dataset.steps || 0');
  for (let k = 0; k <= steps; k++) { if (k) { await page.evaluate('nextStep()'); await page.waitForTimeout(600); } const r = await page.evaluate(probe); if (r.clip.length || r.blue.length) console.log(`p${p} k${k}`, r.clip.length ? 'CLIP ' + r.clip.join(',') : '', r.blue.length ? 'BLUE ' + r.blue.join(' | ') : ''); }
}
await browser.close();
