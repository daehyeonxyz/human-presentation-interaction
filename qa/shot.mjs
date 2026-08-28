#!/usr/bin/env node
/* 덱 한 벌의 쪽을 지정한 뷰포트로 캡처한다.

     node qa/shot.mjs <덱 경로> <출력 폴더> [폭x높이] [쪽,쪽,...] [end]

   쪽 목록을 비우면 전 쪽을 찍는다. 마지막 인자에 end 를 주면 End 완료 상태를 찍는다.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function versionKey(v) {
  const s = String(v);
  const m = s.split(/[.\-+]/).slice(0, 3).map(Number);
  return (/-/.test(s) ? 0 : 1) * 1e12 + (m[0] || 0) * 1e6 + (m[1] || 0) * 1e3 + (m[2] || 0);
}
async function playwright() {
  const roots = [];
  const home = process.env.USERPROFILE || process.env.HOME;
  if (home && fs.existsSync(path.join(home, 'projects'))) {
    for (const d of fs.readdirSync(path.join(home, 'projects'))) roots.push(path.join(home, 'projects', d, 'node_modules', 'playwright'));
  }
  const found = [];
  for (const r of roots) {
    const pj = path.join(r, 'package.json');
    if (!fs.existsSync(pj) || !fs.existsSync(path.join(r, 'index.mjs'))) continue;
    try { found.push({ dir: r, v: JSON.parse(fs.readFileSync(pj, 'utf8')).version }); } catch (e) { /* 건너뛴다 */ }
  }
  found.sort((a, b) => versionKey(b.v) - versionKey(a.v));
  for (const f of found) {
    try { return await import(pathToFileURL(path.join(f.dir, 'index.mjs')).href); } catch (e) { /* 다음 후보 */ }
  }
  throw new Error('playwright 를 못 찾았다');
}

const DECK = path.resolve(process.argv[2]);
const OUT = path.resolve(process.argv[3] || path.join(HERE, 'shot'));
const SIZE = (process.argv[4] || '1920x1080').split('x').map(Number);
const PAGES = process.argv[5] && process.argv[5] !== 'all' ? process.argv[5].split(',').map(Number) : null;
const MODE = process.argv[6] || 'rest';
fs.mkdirSync(OUT, { recursive: true });

const pw = await playwright();
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE[0], height: SIZE[1] } });
await page.goto(pathToFileURL(DECK).href, { waitUntil: 'load' });
await page.evaluate('window.still && window.still()');
const count = await page.evaluate('document.querySelectorAll(".slide").length');
const list = PAGES || Array.from({ length: count }, (_, i) => i + 1);
for (const p of list) {
  await page.evaluate(`go(${p - 1})`);
  await page.waitForTimeout(320);
  if (MODE === 'end') { await page.keyboard.press('End'); await page.waitForTimeout(420); }
  const name = `p${String(p).padStart(2, '0')}-${MODE}-${SIZE[0]}x${SIZE[1]}.png`;
  await page.screenshot({ path: path.join(OUT, name) });
  console.log(name);
}
await browser.close();
