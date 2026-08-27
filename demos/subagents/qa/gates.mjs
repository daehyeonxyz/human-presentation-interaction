#!/usr/bin/env node
/* 이 덱의 게이트. 여섯 가지를 재고 하나라도 실패하면 종료 코드가 1 이다.

     node qa/gates.mjs

   1. 토큰 일치      tokens.css 의 선언이 HTML 의 :root 에 같은 값으로 들어 있다
   2. 가변 폭 스테이지 폭이 1920~2560 규격대로 계산되고 뷰포트에 맞고 가운데에 선다
   3. 여백과 넘침    전 쪽에서 왼쪽 여백 80 과 오른쪽 여백 80 이 유지되고
                    스테이지 네 변 밖으로 넘치는 요소가 없다. 정지 상태와 End 상태를 다 잰다
   4. 호버 반응      커서가 pointer 인 요소 전수에 마우스를 올려 계산된 스타일이 바뀌는지 본다
   5. 콘솔 오류      쪽을 다 돌고 조작을 다 해도 오류가 0 건이다
   6. 원격 요청      file:// 밖으로 나가는 요청이 0 건이다

   go() 는 0 기반 색인이라 쪽 번호 N 은 go(N-1) 로 연다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playwright, PAGES } from './_pw.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', '서브에이전트와-병렬-작업.html');
const TOKENS = path.join(ROOT, 'tokens.css');

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
}

/* ===== 1. 토큰 일치 ===== */
function decls(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const root = body.match(/:root\s*\{([\s\S]*?)\n\}/);
  const map = new Map();
  if (!root) return map;
  for (const m of root[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    map.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  }
  return map;
}
{
  const a = decls(fs.readFileSync(TOKENS, 'utf8'));
  const b = decls(fs.readFileSync(DECK, 'utf8'));
  const missing = [...a.keys()].filter((k) => !b.has(k));
  const differ = [...a.keys()].filter((k) => b.has(k) && b.get(k) !== a.get(k));
  check('토큰 일치 · tokens.css 선언 수', a.size > 60, `${a.size}개`);
  check('토큰 일치 · HTML 에 빠진 선언', missing.length === 0, missing.join(', '));
  check('토큰 일치 · 값이 다른 선언', differ.length === 0,
    differ.map((k) => `${k} (${a.get(k)} / ${b.get(k)})`).join(', '));
  check('토큰 일치 · HTML 에만 있는 선언', b.size === a.size,
    `tokens.css ${a.size} / HTML ${b.size}`);
}

/* ===== 브라우저 ===== */
const url = pathToFileURL(DECK).href;
const pw = await playwright();
const browser = await pw.chromium.launch();

const consoleErrors = [];
const remoteRequests = [];

async function open(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('request', (r) => { if (!r.url().startsWith('file:')) remoteRequests.push(r.url()); });
  await page.route('http://**', (r) => r.abort());
  await page.route('https://**', (r) => r.abort());
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate('document.fonts.ready');
  await page.evaluate('window.still()');
  return page;
}

/* ===== 2. 가변 폭 스테이지 ===== */
const VIEWPORTS = [
  { w: 1280, h: 960, expectW: 1920 },
  { w: 1920, h: 1080, expectW: 1920 },
  { w: 2560, h: 1080, expectW: 2560 },
  { w: 3440, h: 1440, expectW: 2560 }
];
for (const vp of VIEWPORTS) {
  const page = await open(vp.w, vp.h);
  const m = await page.evaluate(`(() => {
    const s = document.getElementById('stage'), r = s.getBoundingClientRect();
    return { offW: s.offsetWidth, w: r.width, h: r.height, left: r.left, top: r.top,
             vw: innerWidth, vh: innerHeight };
  })()`);
  check(`${vp.w}x${vp.h} 스테이지 폭 ${vp.expectW}`, Math.abs(m.offW - vp.expectW) <= 2, `실측 ${m.offW}`);
  const sExpect = m.offW > 1920 || m.vw / m.vh >= 1920 / 1080 ? m.vh / 1080 : m.vw / 1920;
  check(`${vp.w}x${vp.h} 렌더 배율`, Math.abs(m.h / 1080 - sExpect) <= 0.01,
    `실측 ${(m.h / 1080).toFixed(3)} / 기대 ${sExpect.toFixed(3)}`);
  check(`${vp.w}x${vp.h} 뷰포트 맞춤`, m.w <= m.vw + 1 && m.h <= m.vh + 1,
    `렌더 ${Math.round(m.w)}x${Math.round(m.h)} / 뷰포트 ${m.vw}x${m.vh}`);
  check(`${vp.w}x${vp.h} 가운데 정렬`,
    Math.abs(m.left - (m.vw - m.w) / 2) <= 1 && Math.abs(m.top - (m.vh - m.h) / 2) <= 1);
  await page.close();
}

/* ===== 3. 여백과 넘침. 정지 상태와 End 상태를 다 잰다 ===== */
const MEASURE = `(() => {
  const stage = document.getElementById('stage');
  const sr = stage.getBoundingClientRect();
  const sc = sr.width / stage.offsetWidth;
  const sec = document.querySelector('.slide.active');
  const kicker = sec ? sec.querySelector('.kicker') : null;
  const pageno = sec ? sec.querySelector('.pageno') : null;
  let bad = '';
  for (const el of (sec ? sec.querySelectorAll('*') : [])) {
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    const L = (r.left - sr.left) / sc, T = (r.top - sr.top) / sc;
    const R = (r.right - sr.left) / sc, B = (r.bottom - sr.top) / sc;
    if (L < -2 || T < -2 || R > stage.offsetWidth + 2 || B > 1082) {
      bad = (el.className || el.tagName) + ' L' + Math.round(L) + ' T' + Math.round(T) +
            ' R' + Math.round(R) + ' B' + Math.round(B);
      break;
    }
  }
  return {
    stageW: stage.offsetWidth,
    scrollH: document.documentElement.scrollHeight,
    kickerLeft: kicker ? (kicker.getBoundingClientRect().left - sr.left) / sc : null,
    pagenoRight: pageno ? (pageno.getBoundingClientRect().right - sr.left) / sc : null,
    bad
  };
})()`;

for (const vp of [{ w: 1920, h: 1080 }, { w: 2560, h: 1080 }]) {
  const page = await open(vp.w, vp.h);
  for (const state of ['rest', 'done']) {
    for (let p = 1; p <= PAGES; p++) {
      await page.evaluate(`go(${p - 1})`);
      await page.waitForTimeout(120);
      if (state === 'done') {
        await page.evaluate(`(function(){ var a = PAGE[${p}]; if (a && a.finish) a.finish(); })()`);
        await page.waitForTimeout(560);
      }
      const m = await page.evaluate(MEASURE);
      const tag = `${vp.w} p${String(p).padStart(2, '0')} ${state}`;
      if (p !== 1) {
        check(`${tag} 왼쪽 여백 80`, m.kickerLeft !== null && Math.abs(m.kickerLeft - 80) <= 1,
          m.kickerLeft === null ? 'kicker 없음' : `실측 ${m.kickerLeft.toFixed(1)}`);
        check(`${tag} 오른쪽 여백 80`,
          m.pagenoRight !== null && Math.abs(m.stageW - 80 - m.pagenoRight) <= 1,
          m.pagenoRight === null ? '쪽 번호 없음' : `실측 ${(m.stageW - m.pagenoRight).toFixed(1)}`);
      }
      check(`${tag} 네 변 넘침 없음`, !m.bad, m.bad);
      check(`${tag} 세로 1080 이내`, m.scrollH <= 1080, `scrollHeight ${m.scrollH}`);
    }
  }
  await page.close();
}

/* ===== 4. 호버 반응 =====
   커서가 pointer 인 요소를 모은다. 안에 든 글자 span 은 커서를 물려받을 뿐이므로
   실제 클릭 핸들러가 붙은 것(data-click)이거나 부모가 pointer 가 아닌 것만 셈에 넣는다.
   보이지도 눌리지도 않는 것은 뺀다. 표시는 쪽마다 새로 붙이기 전에 전부 지운다 */
const MARK = `(() => {
  document.querySelectorAll('[data-hx]').forEach(e => e.removeAttribute('data-hx'));
  const sec = document.querySelector('.slide.active');
  const out = [];
  let n = 0;
  for (const el of sec.querySelectorAll('*')) {
    if (getComputedStyle(el).cursor !== 'pointer') continue;
    const parentPointer = el.parentElement &&
      getComputedStyle(el.parentElement).cursor === 'pointer';
    if (parentPointer && !el.dataset.click) continue;
    let hidden = false;
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const st = getComputedStyle(a);
      if (st.opacity === '0' || st.visibility === 'hidden' || st.display === 'none' ||
          st.pointerEvents === 'none') { hidden = true; break; }
    }
    if (hidden) continue;
    el.setAttribute('data-hx', String(n));
    out.push({ i: n, tag: el.tagName.toLowerCase() + '.' + (el.className || '').split(' ').join('.') });
    n++;
  }
  return out;
})()`;
const SIG = (i) => `(() => {
  const el = document.querySelector('[data-hx="${i}"]');
  const s = getComputedStyle(el);
  const c = el.firstElementChild ? getComputedStyle(el.firstElementChild) : null;
  return [s.boxShadow, s.backgroundColor, s.color, s.filter, s.opacity,
          c ? c.color + '|' + c.opacity : ''].join('~');
})()`;

{
  const page = await open(1920, 1080);
  let total = 0, fails = 0;
  const failed = [];
  for (const state of ['rest', 'done']) {
    for (let p = 1; p <= PAGES; p++) {
      await page.evaluate(`go(${p - 1})`);
      await page.waitForTimeout(120);
      if (state === 'done') {
        await page.evaluate(`(function(){ var a = PAGE[${p}]; if (a && a.finish) a.finish(); })()`);
        await page.waitForTimeout(560);
      }
      const list = await page.evaluate(MARK);
      for (const it of list) {
        const sel = `[data-hx="${it.i}"]`;
        const before = await page.evaluate(SIG(it.i));
        await page.hover(sel);
        await page.waitForTimeout(200);
        const after = await page.evaluate(SIG(it.i));
        await page.mouse.move(5, 1070);
        await page.waitForTimeout(80);
        total++;
        if (before === after) { fails++; failed.push(`p${p} ${state} ${it.tag}`); }
      }
    }
  }
  check(`호버 반응 · pointer 요소 ${total}개 전수`, fails === 0,
    fails ? `실패 ${fails}건 · ${failed.join(' / ')}` : '실패 0건');
  check('호버 반응 · 검사 대상이 비어 있지 않다', total >= 30, `${total}개`);
  await page.close();
}

/* ===== 5·6. 콘솔 오류와 원격 요청. 전 쪽을 돌고 조작까지 한 뒤에 센다 ===== */
{
  const page = await open(1920, 1080);
  for (let p = 1; p <= PAGES; p++) {
    await page.evaluate(`go(${p - 1})`);
    await page.waitForTimeout(120);
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.press('End');
    await page.waitForTimeout(200);
  }
  await page.evaluate('go(3)');
  await page.click('#p4btn');
  await page.waitForTimeout(3200);
  await page.close();
}
check('콘솔 오류 0건', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' / '));
check('원격 요청 0건', remoteRequests.length === 0, remoteRequests.slice(0, 3).join(' / '));

await browser.close();
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length}건 중 실패 ${bad.length}건`);
if (bad.length) bad.forEach((r) => console.log('  FAIL ' + r.name + (r.detail ? '  ' + r.detail : '')));
process.exit(bad.length ? 1 : 0);
