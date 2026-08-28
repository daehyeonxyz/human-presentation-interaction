#!/usr/bin/env node
/* 상용 레퍼런스 화면을 덱과 같은 배율(1920x1080)로 캡처한다.

     node qa/refshot.mjs

   나란히 비교의 근거 자료다. 결과는 qa/reference/ 다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'reference');
fs.mkdirSync(OUT, { recursive: true });

function versionKey(v) {
  const s = String(v);
  const m = s.split(/[.\-+]/).slice(0, 3).map(Number);
  return (/-/.test(s) ? 0 : 1) * 1e12 + (m[0] || 0) * 1e6 + (m[1] || 0) * 1e3 + (m[2] || 0);
}
async function playwright() {
  const roots = [];
  const home = process.env.USERPROFILE || process.env.HOME;
  for (const d of fs.readdirSync(path.join(home, 'projects'))) roots.push(path.join(home, 'projects', d, 'node_modules', 'playwright'));
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

const TARGETS = [
  { name: 'stripe-payments', url: 'https://stripe.com/payments', scroll: [0, 900, 1800, 2700] },
  { name: 'linear-home', url: 'https://linear.app/', scroll: [0, 900, 1800, 2700] },
  { name: 'linear-features', url: 'https://linear.app/features', scroll: [0, 900, 1800] },
  { name: 'claude-docs-context', url: 'https://docs.claude.com/en/docs/claude-code/overview', scroll: [0, 900, 1800] }
];

const pw = await playwright();
const browser = await pw.chromium.launch();
for (const t of TARGETS) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    for (const y of t.scroll) {
      await page.evaluate('scrollTo(0, ' + y + ')');
      await page.waitForTimeout(1400);
      await page.screenshot({ path: path.join(OUT, `${t.name}-${y}.png`) });
      console.log(`${t.name}-${y}.png`);
    }
  } catch (e) {
    console.log('실패 ' + t.name + ' · ' + e.message.split('\n')[0]);
  }
  await page.close();
}
await browser.close();
