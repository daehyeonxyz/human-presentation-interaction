#!/usr/bin/env node
/* 가변 폭 스테이지 게이트. 네 해상도에서 네 가지를 검사한다.

     node qa/fluid-gate.mjs

   1. 스테이지 폭이 규격(하한 1920, 상한 2560, 세로 1080 기준 배율)대로 계산된다.
   2. 렌더된 스테이지가 뷰포트 안에 맞고 가운데에 있고 배율이 규격과 일치한다.
   3. 전체 14쪽에서 왼쪽 여백 80 과 오른쪽 여백 80 이 유지된다.
   4. 전체 14쪽에서 스테이지 네 변 밖으로 넘치는 요소가 없다.

   go() 는 0 기반 색인이라 쪽 번호 N 은 go(N-1) 로 연다. 활성 쪽의 class 는 active 다.
   남기는 것은 qa/v5/fluid-<폭>-pNN.png 캡처와 표준 출력의 판정표다.
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', '1교시.html');
const OUT = path.join(HERE, 'v5');

function versionKey(v) {
  const s = String(v);
  const m = s.split(/[.\-+]/).slice(0, 3).map(Number);
  return (/-/.test(s) ? 0 : 1) * 1e12 + (m[0] || 0) * 1e6 + (m[1] || 0) * 1e3 + (m[2] || 0);
}
async function playwright() {
  const roots = [];
  const local = process.env.LOCALAPPDATA;
  if (local) {
    const npx = path.join(local, 'npm-cache', '_npx');
    if (fs.existsSync(npx)) for (const d of fs.readdirSync(npx)) roots.push(path.join(npx, d, 'node_modules', 'playwright'));
  }
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
    try { return await import(pathToFileURL(path.join(f.dir, 'index.mjs')).href); }
    catch (e) { /* 다음 후보 */ }
  }
  throw new Error('playwright 를 못 찾았다');
}

/* 뷰포트, 기대 스테이지 폭, 캡처할 쪽 번호(1 기반) */
const VIEWPORTS = [
  { w: 1280, h: 960,  expectW: 1920, shots: [4] },
  { w: 1920, h: 1080, expectW: 1920, shots: [4, 13] },
  { w: 2560, h: 1080, expectW: 2560, shots: [1, 4, 6, 12, 13, 14] },
  { w: 3440, h: 1440, expectW: 2560, shots: [4, 13] },
];
const PAGES = Array.from({ length: 14 }, (_, i) => i + 1);
/* 표지(1쪽)는 네 변 여백 60 의 전면 액자라 여백 80 검사에서 뺀다. 넘침 검사는 전 쪽에 건다 */
const MARGIN_SKIP = new Set([1]);

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
}

const pw = await playwright();
const browser = await pw.chromium.launch();
const url = pathToFileURL(DECK).href;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate('window.still && window.still()');

  /* 1. 스테이지 폭과 2. 렌더 배율·맞춤·가운데 정렬 */
  const fitm = await page.evaluate(`(() => {
    const stage = document.getElementById('stage');
    const sr = stage.getBoundingClientRect();
    return { offW: stage.offsetWidth, w: sr.width, h: sr.height, left: sr.left, top: sr.top,
             vw: innerWidth, vh: innerHeight };
  })()`);
  check(`${vp.w}x${vp.h} 스테이지 폭 ${vp.expectW}`, Math.abs(fitm.offW - vp.expectW) <= 2, `실측 ${fitm.offW}`);
  const sExpect = fitm.offW > 1920 || fitm.vw / fitm.vh >= 1920 / 1080 ? fitm.vh / 1080 : fitm.vw / 1920;
  check(`${vp.w}x${vp.h} 렌더 배율`, Math.abs(fitm.h / 1080 - sExpect) <= 0.01, `실측 ${(fitm.h / 1080).toFixed(3)} / 기대 ${sExpect.toFixed(3)}`);
  check(`${vp.w}x${vp.h} 뷰포트 맞춤`, fitm.w <= fitm.vw + 1 && fitm.h <= fitm.vh + 1, `렌더 ${Math.round(fitm.w)}x${Math.round(fitm.h)} / 뷰포트 ${fitm.vw}x${fitm.vh}`);
  check(`${vp.w}x${vp.h} 가운데 정렬`, Math.abs(fitm.left - (fitm.vw - fitm.w) / 2) <= 1 && Math.abs(fitm.top - (fitm.vh - fitm.h) / 2) <= 1);

  /* 3. 여백과 4. 네 변 넘침. 전체 쪽을 돈다 */
  for (const p of PAGES) {
    await page.evaluate(`go(${p - 1})`);
    await page.waitForTimeout(350);
    const m = await page.evaluate(`(() => {
      const stage = document.getElementById('stage');
      const sr = stage.getBoundingClientRect();
      const s = sr.width / stage.offsetWidth;
      const sec = document.querySelector('section.active');
      const kicker = sec ? sec.querySelector('[class*="kick"]') : null;
      const pageno = sec ? sec.querySelector('[class*="pgno"], [class*="pageno"], [class*="pg"]') : null;
      let bad = '';
      for (const el of (sec ? sec.querySelectorAll('*') : [])) {
        const st = getComputedStyle(el);
        if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') continue;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        const L = (r.left - sr.left) / s, T = (r.top - sr.top) / s;
        const R = (r.right - sr.left) / s, B = (r.bottom - sr.top) / s;
        if (L < -2 || T < -2 || R > stage.offsetWidth + 2 || B > 1082) {
          bad = (el.className || el.tagName) + ' L' + Math.round(L) + ' T' + Math.round(T) + ' R' + Math.round(R) + ' B' + Math.round(B);
          break;
        }
      }
      return {
        stageW: stage.offsetWidth, active: !!sec,
        kickerLeft: kicker ? (kicker.getBoundingClientRect().left - sr.left) / s : null,
        pagenoRight: pageno ? (pageno.getBoundingClientRect().right - sr.left) / s : null,
        bad,
      };
    })()`);
    check(`${vp.w}x${vp.h} p${p} 활성 쪽 확인`, m.active);
    if (!MARGIN_SKIP.has(p) && m.kickerLeft !== null)
      check(`${vp.w}x${vp.h} p${p} 왼쪽 여백 80`, Math.abs(m.kickerLeft - 80) <= 1, `실측 ${m.kickerLeft.toFixed(1)}`);
    if (!MARGIN_SKIP.has(p) && m.pagenoRight !== null)
      check(`${vp.w}x${vp.h} p${p} 오른쪽 여백 80`, Math.abs(m.stageW - 80 - m.pagenoRight) <= 1, `쪽 번호 오른쪽 끝 ${m.pagenoRight.toFixed(1)} / 기대 ${m.stageW - 80}`);
    check(`${vp.w}x${vp.h} p${p} 네 변 넘침 없음`, !m.bad, m.bad);
  }

  for (const p of vp.shots) {
    await page.evaluate(`go(${p - 1})`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `fluid-${vp.w}-p${String(p).padStart(2, '0')}.png`) });
  }
  await page.close();
}

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length}건 중 실패 ${fails.length}건`);
process.exit(fails.length ? 1 : 0);
