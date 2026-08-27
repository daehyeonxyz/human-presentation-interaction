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
  { w: 2560, h: 1080, expectW: 2560, shots: [1, 4, 6, 12, 13, 14], hover: true },
  { w: 3440, h: 1440, expectW: 2560, shots: [4, 13] },
];
/* 쪽 수는 하드코딩하지 않고 열린 덱의 .slide 개수에서 얻는다 */
let PAGES = [];
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
  const pageCount = await page.evaluate('document.querySelectorAll(".slide").length');
  PAGES = Array.from({ length: pageCount }, (_, i) => i + 1);
  check(`${vp.w}x${vp.h} 쪽 수 감지`, pageCount > 0, `${pageCount}쪽`);

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
      const all = [].slice.call(document.querySelectorAll('.slide'));
      const sec = document.querySelector('.slide.active');
      const activeIdx = all.indexOf(sec);
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
        stageW: stage.offsetWidth, active: !!sec, activeIdx,
        kickerLeft: kicker ? (kicker.getBoundingClientRect().left - sr.left) / s : null,
        pagenoRight: pageno ? (pageno.getBoundingClientRect().right - sr.left) / s : null,
        bad,
      };
    })()`);
    check(`${vp.w}x${vp.h} p${p} 활성 쪽 확인`, m.active && m.activeIdx === p - 1, m.active ? `활성 색인 ${m.activeIdx}` : '활성 쪽 없음');
    if (!MARGIN_SKIP.has(p) && m.kickerLeft !== null)
      check(`${vp.w}x${vp.h} p${p} 왼쪽 여백 80`, Math.abs(m.kickerLeft - 80) <= 1, `실측 ${m.kickerLeft.toFixed(1)}`);
    if (!MARGIN_SKIP.has(p) && m.pagenoRight !== null)
      check(`${vp.w}x${vp.h} p${p} 오른쪽 여백 80`, Math.abs(m.stageW - 80 - m.pagenoRight) <= 1, `쪽 번호 오른쪽 끝 ${m.pagenoRight.toFixed(1)} / 기대 ${m.stageW - 80}`);
    check(`${vp.w}x${vp.h} p${p} 네 변 넘침 없음`, !m.bad, m.bad);
  }

  /* 호버 전수 검사. 렌더 폭이 넓어져도 pointer 요소 전부가 호버 반응을 내는지 잰다.
     render-v5.mjs 의 검사와 같은 방식이고 이쪽은 가변 폭 상태에서 돈다 */
  if (vp.hover) {
    const mark = () => page.evaluate(() => {
      const list = [];
      document.querySelectorAll('[data-hx]').forEach((el) => { delete el.dataset.hx; });
      document.querySelectorAll('.slide.active *').forEach((el) => {
        if (getComputedStyle(el).cursor !== 'pointer') return;
        const p = el.parentElement;
        if (p && getComputedStyle(p).cursor === 'pointer') return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;
        let node = el, dead = false;
        while (node && node !== document.body) {
          const c = getComputedStyle(node);
          if (c.pointerEvents === 'none' || parseFloat(c.opacity) === 0 || c.visibility === 'hidden') { dead = true; break; }
          node = node.parentElement;
        }
        if (dead) return;
        el.dataset.hx = String(list.length);
        list.push((el.className || el.tagName).toString().slice(0, 40));
      });
      return list;
    });
    const snap = (i) => page.evaluate((k) => {
      const el = document.querySelector('[data-hx="' + k + '"]');
      const cs = getComputedStyle(el);
      const txt = el.querySelector('*') || el;
      return [cs.boxShadow, cs.backgroundColor, cs.color, cs.borderBottomColor,
        getComputedStyle(txt).color, getComputedStyle(txt).backgroundColor].join('|');
    }, i);
    const hoverDead = [];
    let clickCount = 0;
    for (const p of PAGES) {
      await page.evaluate(`go(${p - 1})`);
      await page.waitForTimeout(300);
      const names = await mark();
      clickCount += names.length;
      for (let i = 0; i < names.length; i++) {
        const before = await snap(i);
        await page.hover('[data-hx="' + i + '"]', { force: true }).catch(() => {});
        await page.waitForTimeout(170);
        const after = await snap(i);
        await page.mouse.move(10, vp.h - 10);
        await page.waitForTimeout(60);
        if (before === after) hoverDead.push(p + '쪽 · ' + names[i]);
      }
    }
    /* 대상 0개는 통과가 아니라 검사 무효다. 덱에 pointer 요소가 하나도 안 잡히면 실패로 센다 */
    check(`${vp.w}x${vp.h} 호버 전수 (pointer ${clickCount}개)`, clickCount > 0 && hoverDead.length === 0,
      clickCount === 0 ? '검사 대상 0개' : hoverDead.slice(0, 6).join(' / '));
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
