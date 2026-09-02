/* 최종 단계 스크린샷을 한 판에 모은다. node deck/sheet.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..'); const OUT = path.join(ROOT, 'shots');
const pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
const files = fs.readdirSync(OUT).filter(f => /^p\d\d-\d+\.png$/.test(f));
const last = {}; files.forEach(f => { const [, p, k] = f.match(/^p(\d\d)-(\d+)\.png$/); if (!last[p] || +k > last[p].k) last[p] = { k: +k, f }; });
const list = Object.keys(last).sort().map(p => last[p].f);
const browser = await pw.chromium.launch(); const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (let s = 0; s < list.length; s += 12) {
  const chunk = list.slice(s, s + 12);
  const html = `<body style="margin:0;background:#333;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px">${chunk.map(f => `<div style="position:relative"><img src="${pathToFileURL(path.join(OUT, f)).href}" style="width:100%;display:block"><span style="position:absolute;left:6px;top:6px;background:#000;color:#fff;font:bold 22px sans-serif;padding:2px 8px">${f}</span></div>`).join('')}</body>`;
  const hp = path.join(OUT, `sheet-${s / 12 + 1}.html`); fs.writeFileSync(hp, html); await page.goto(pathToFileURL(hp).href); await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, `sheet-${s / 12 + 1}.png`), fullPage: true });
}
console.log('sheets', Math.ceil(list.length / 12)); await browser.close();
