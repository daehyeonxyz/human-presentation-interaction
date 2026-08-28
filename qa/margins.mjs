#!/usr/bin/env node
/* 쪽마다 네 변 여백을 실측해 표로 찍는다.

     node qa/margins.mjs <덱 경로> [폭x높이]

   재는 것은 활성 쪽의 보이는 자손 전수다. 위·아래·왼쪽·오른쪽 각각
   설계 좌표 기준의 최소 여백이고, data-frame 프레임 상자도 함께 찍는다.
   여백 80 침범만 통과 기준이고 아래 끝 값은 참고 자료다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

const DECK = path.resolve(process.argv[2]);
const SIZE = (process.argv[3] || '1920x1080').split('x').map(Number);

const PROBE = `(() => {
  const stage = document.getElementById('stage');
  const sr = stage.getBoundingClientRect();
  const s = sr.width / stage.offsetWidth;
  const W = stage.offsetWidth, H = stage.offsetHeight;
  const sec = document.querySelector('.slide.active');
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9, worst = '';
  for (const el of sec.querySelectorAll('*')) {
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') continue;
    let hid = false;
    for (let a = el.parentElement; a && a !== stage.parentElement; a = a.parentElement) {
      const ac = getComputedStyle(a);
      if (ac.opacity === '0' || ac.visibility === 'hidden' || ac.display === 'none') { hid = true; break; }
    }
    if (hid) continue;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    let node = el.parentElement, l = r.left, t = r.top, rt = r.right, b = r.bottom;
    while (node && node !== stage.parentElement) {
      const c = getComputedStyle(node);
      const cr = node.getBoundingClientRect();
      const cl = cr.left + node.clientLeft * s, ct = cr.top + node.clientTop * s;
      if (c.overflowX !== 'visible') { l = Math.max(l, cl); rt = Math.min(rt, cl + node.clientWidth * s); }
      if (c.overflowY !== 'visible') { t = Math.max(t, ct); b = Math.min(b, ct + node.clientHeight * s); }
      node = node.parentElement;
    }
    if (rt <= l || b <= t) continue;
    const x1 = (l - sr.left) / s, y1 = (t - sr.top) / s, x2 = (rt - sr.left) / s, y2 = (b - sr.top) / s;
    if (x1 < L) { L = x1; }
    if (y1 < T) { T = y1; }
    if (x2 > R) { R = x2; }
    if (y2 > B) { B = y2; worst = (el.className || el.tagName).toString().slice(0, 28); }
  }
  const fr = sec.querySelector('[data-frame]');
  const f = fr ? fr.getBoundingClientRect() : null;
  const box = f ? [ (f.left - sr.left) / s, (f.top - sr.top) / s, (f.right - sr.left) / s, (f.bottom - sr.top) / s ] : null;
  return { W: W, H: H,
    left: Math.round(L), top: Math.round(T), right: Math.round(W - R), bottom: Math.round(H - B),
    maxB: Math.round(B), worst: worst,
    frame: box ? box.map(Math.round) : null };
})()`;

const pw = await playwright();
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE[0], height: SIZE[1] } });
await page.goto(pathToFileURL(DECK).href, { waitUntil: 'load' });
await page.evaluate('window.still && window.still()');
const n = await page.evaluate('document.querySelectorAll(".slide").length');
console.log(`${path.basename(DECK)}  ${SIZE[0]}x${SIZE[1]}`);
console.log('| 쪽 | 상태 | 위 | 아래 | 왼쪽 | 오른쪽 | 프레임 상자 | 아래 끝 |');
console.log('|---|---|---|---|---|---|---|---|');
for (let p = 1; p <= n; p++) {
  for (const state of ['정지', '완료']) {
    await page.evaluate(`go(${p - 1})`);
    await page.waitForTimeout(300);
    if (state === '완료') { await page.keyboard.press('End'); await page.waitForTimeout(420); }
    const m = await page.evaluate(PROBE);
    const fr = m.frame ? `${m.frame[0]},${m.frame[1]} → ${m.frame[2]},${m.frame[3]}` : '없음';
    console.log(`| ${p} | ${state} | ${m.top} | ${m.bottom} | ${m.left} | ${m.right} | ${fr} | ${m.maxB} |`);
  }
}
await browser.close();
