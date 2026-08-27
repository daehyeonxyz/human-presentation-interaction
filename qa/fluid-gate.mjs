#!/usr/bin/env node
/* 해상도 매트릭스 게이트. 레포의 모든 덱에 다섯 해상도 검사를 돌린다.

     node qa/fluid-gate.mjs            레포의 덱 전부
     node qa/fluid-gate.mjs <경로>     지정한 덱 하나

   검사는 다섯 가지다.
   1. 스테이지 폭이 규격(하한 1920, 상한 2560, 세로 1080 기준 배율)대로 계산된다.
   2. 렌더된 스테이지가 뷰포트 안에 맞고 가운데에 있고 배율이 규격과 일치한다.
   3. 전체 쪽의 정지 상태에서 왼쪽 여백 80 과 오른쪽 여백 80 이 유지된다.
   4. 정지 상태와 End 완료 상태 양쪽에서 스테이지 네 변 밖으로 넘치는 요소가 없다.
   5. 2560 폭에서 pointer 요소 전수가 호버 반응을 낸다.

   덱의 공용 API 전제: .slide 쪽 목록, window.go(0 기반), window.still(), End 키 완료 상태.
   캡처는 qa/matrix/<덱 이름>-<폭>-pNN.png 다.
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'matrix');
fs.mkdirSync(OUT, { recursive: true });

function decks() {
  const arg = process.argv[2];
  if (arg) return [path.resolve(arg)];
  const found = [];
  const dirs = [path.join(ROOT, 'ax-education', 'deliverables')];
  const demos = path.join(ROOT, 'demos');
  if (fs.existsSync(demos)) for (const d of fs.readdirSync(demos)) dirs.push(path.join(demos, d, 'deliverables'));
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) found.push(path.join(dir, f));
  }
  return found;
}

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

/* 뷰포트와 기대 스테이지 폭. 4:3, 16:10, 16:9, 21:9, 21:9 고해상도 */
const VIEWPORTS = [
  { w: 1280, h: 960,  expectW: 1920 },
  { w: 1440, h: 900,  expectW: 1920 },
  { w: 1920, h: 1080, expectW: 1920, shots: [4] },
  { w: 2560, h: 1080, expectW: 2560, hover: true, shots: [1, 4, 6] },
  { w: 3440, h: 1440, expectW: 2560, shots: [4] },
];

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) console.log('FAIL ' + name + (detail ? '  ' + detail : ''));
}

const pw = await playwright();
const browser = await pw.chromium.launch();

const DECKS = decks();
check('덱 발견', DECKS.length > 0, `${DECKS.length}개`);

for (const DECK of DECKS) {
  /* 다른 프로젝트에 같은 파일명이 있어도 캡처가 덮이지 않게 프로젝트 이름을 앞에 붙인다 */
  const deckName = path.basename(path.dirname(path.dirname(DECK))) + '-' + path.basename(DECK, '.html');
  const url = pathToFileURL(DECK).href;
  console.log('\n=== ' + deckName + ' ===');

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate('window.still && window.still()');
    const pageCount = await page.evaluate('document.querySelectorAll(".slide").length');
    const tag = `${deckName} ${vp.w}x${vp.h}`;
    check(`${tag} 쪽 수 감지`, pageCount > 0, `${pageCount}쪽`);
    const api = await page.evaluate('[typeof window.go, typeof window.still]');
    check(`${tag} 공용 API (go·still)`, api[0] === 'function' && api[1] === 'function', api.join('·'));

    const fitm = await page.evaluate(`(() => {
      const stage = document.getElementById('stage');
      const sr = stage.getBoundingClientRect();
      return { offW: stage.offsetWidth, w: sr.width, h: sr.height, left: sr.left, top: sr.top,
               vw: innerWidth, vh: innerHeight };
    })()`);
    check(`${tag} 스테이지 폭 ${vp.expectW}`, Math.abs(fitm.offW - vp.expectW) <= 2, `실측 ${fitm.offW}`);
    const sExpect = fitm.vw / fitm.vh >= 1920 / 1080 ? fitm.vh / 1080 : fitm.vw / 1920;
    check(`${tag} 렌더 배율`, Math.abs(fitm.h / 1080 - sExpect) <= 0.01, `실측 ${(fitm.h / 1080).toFixed(3)} / 기대 ${sExpect.toFixed(3)}`);
    check(`${tag} 배율 균일`, Math.abs(fitm.w / fitm.offW - fitm.h / 1080) <= 0.01, `가로 ${(fitm.w / fitm.offW).toFixed(3)} / 세로 ${(fitm.h / 1080).toFixed(3)}`);
    check(`${tag} 뷰포트 맞춤`, fitm.w <= fitm.vw + 1 && fitm.h <= fitm.vh + 1);
    check(`${tag} 가운데 정렬`, Math.abs(fitm.left - (fitm.vw - fitm.w) / 2) <= 1 && Math.abs(fitm.top - (fitm.vh - fitm.h) / 2) <= 1);

    const probe = `(() => {
      const stage = document.getElementById('stage');
      const sr = stage.getBoundingClientRect();
      const s = sr.width / stage.offsetWidth;
      const all = [].slice.call(document.querySelectorAll('.slide'));
      const sec = document.querySelector('.slide.active');
      const activeIdx = all.indexOf(sec);
      const kicker = sec ? sec.querySelector('[class*="kick"]') : null;
      const pageno = sec ? sec.querySelector('[class*="pageno"], [class*="pgno"]') : null;
      let bad = '';
      const scanSet = [];
      if (sec) { scanSet.push(sec); scanSet.push.apply(scanSet, sec.querySelectorAll('*')); }
      /* 슬라이드 밖의 스테이지 전역 요소(팝업, 덮개)도 넘침 검사에 넣는다 */
      for (const child of stage.children) {
        if (!child.classList.contains('slide')) { scanSet.push(child); scanSet.push.apply(scanSet, child.querySelectorAll('*')); }
      }
      for (const el of scanSet) {
        const st = getComputedStyle(el);
        if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') continue;
        let r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        /* overflow 를 자르는 조상이 있으면 실제로 보이는 교집합만 잰다.
           채팅 창처럼 창 안에서 스크롤되는 내용은 창 밖 부분이 렌더되지 않는다 */
        let node = el.parentElement;
        let L2 = r.left, T2 = r.top, R2 = r.right, B2 = r.bottom;
        while (node && node !== stage.parentElement) {
          const c = getComputedStyle(node);
          const cr = node.getBoundingClientRect();
          /* 클리핑 경계는 border box 가 아니라 client box 다. 축별로 따로 자른다 */
          const cl = cr.left + node.clientLeft * s, ct = cr.top + node.clientTop * s;
          if (c.overflowX !== 'visible') { L2 = Math.max(L2, cl); R2 = Math.min(R2, cl + node.clientWidth * s); }
          if (c.overflowY !== 'visible') { T2 = Math.max(T2, ct); B2 = Math.min(B2, ct + node.clientHeight * s); }
          node = node.parentElement;
        }
        if (R2 <= L2 || B2 <= T2) continue;
        const L = (L2 - sr.left) / s, T = (T2 - sr.top) / s;
        const R = (R2 - sr.left) / s, B = (B2 - sr.top) / s;
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
    })()`;

    let marginChecked = 0;
    for (let p = 1; p <= pageCount; p++) {
      await page.evaluate(`go(${p - 1})`);
      await page.waitForTimeout(350);
      const m = await page.evaluate(probe);
      if (p > 1 && (m.kickerLeft !== null || m.pagenoRight !== null)) marginChecked++;
      check(`${tag} p${p} 활성 쪽 확인`, m.active && m.activeIdx === p - 1, m.active ? `활성 색인 ${m.activeIdx}` : '활성 쪽 없음');
      if (p > 1 && m.kickerLeft !== null)
        check(`${tag} p${p} 왼쪽 여백 80`, Math.abs(m.kickerLeft - 80) <= 1, `실측 ${m.kickerLeft.toFixed(1)}`);
      if (p > 1 && m.pagenoRight !== null)
        check(`${tag} p${p} 오른쪽 여백 80`, Math.abs(m.stageW - 80 - m.pagenoRight) <= 1, `쪽 번호 오른쪽 끝 ${m.pagenoRight.toFixed(1)} / 기대 ${m.stageW - 80}`);
      check(`${tag} p${p} 정지 넘침 없음`, !m.bad, m.bad);
      /* 완료 상태에서도 넘치지 않아야 한다. overflow-containment 는 정지 상태만 재고 통과시키지 않는다 */
      await page.keyboard.press('End');
      await page.waitForTimeout(350);
      const me = await page.evaluate(probe);
      check(`${tag} p${p} End 넘침 없음`, !me.bad, me.bad);
    }
    /* 여백 검사가 한 쪽도 안 걸렸으면 통과가 아니라 검사 무효다 */
    check(`${tag} 여백 검사 대상`, pageCount <= 1 || marginChecked > 0, `${marginChecked}쪽`);

    /* stage-reset 계약. End 로 완료시킨 쪽을 떠났다 돌아오면 처음 상태여야 한다 */
    if (pageCount >= 3) {
      const sig = `(() => { const sec = document.querySelector('.slide.active');
        return [].map.call(sec.querySelectorAll('*'), (e) => e.className).join(';'); })()`;
      await page.evaluate('go(1)');
      await page.waitForTimeout(500);
      const restSig = await page.evaluate(sig);
      await page.keyboard.press('End');
      await page.waitForTimeout(350);
      await page.evaluate('go(2)');
      await page.waitForTimeout(600);
      await page.evaluate('go(1)');
      await page.waitForTimeout(600);
      const backSig = await page.evaluate(sig);
      check(`${tag} stage-reset 계약 (p2)`, restSig === backSig, restSig === backSig ? '' : 'End 잔상이 남았다');
    }

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
      for (let p = 1; p <= pageCount; p++) {
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
      check(`${tag} 호버 전수 (pointer ${clickCount}개)`, clickCount > 0 && hoverDead.length === 0,
        clickCount === 0 ? '검사 대상 0개' : hoverDead.slice(0, 6).join(' / '));
    }

    for (const p of vp.shots || []) {
      if (p > pageCount) continue;
      await page.evaluate(`go(${p - 1})`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, `${deckName}-${vp.w}-p${String(p).padStart(2, '0')}.png`) });
    }
    await page.close();
  }
}

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length}건 중 실패 ${fails.length}건`);
process.exit(fails.length ? 1 : 0);
