#!/usr/bin/env node
/* 7차 b판 렌더 검증.
   node qa/render7b.mjs

   - deliverables/1교시.html 을 file:// 로 1920x1080 headless chromium 에 연다.
   - Pretendard 는 dynamic subset 이라 document.fonts.load() 로 실제 글자를 지정해
     명시적으로 불러야 내려온다. document.fonts.check 는 한글에 오탐이니 쓰지 않는다.
   - window.still() 로 등장을 끈 뒤 열네 쪽의 정지 상태와 완료 상태를 qa/render7b/ 에 남긴다.
   - 5쪽과 7쪽은 팝업이 열린 상태도 남기고, 팝업이 무엇을 덮고 무엇을 덮지 않는지 좌표로 잰다.
   - 각 텍스트 블록의 실제 줄 수를 Range 로 재서 원고의 줄 수(<br> 개수 + 1)와 견준다.
     마지막 줄에 어절이 하나만 남은 곳도 함께 센다.
   - scrollHeight / scrollWidth 와 콘솔 오류를 함께 낸다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', '1교시.html');
const OUT = path.join(HERE, 'render7b');

function versionKey(v) {
  const s = String(v);
  const m = s.split(/[.\-+]/).slice(0, 3).map(Number);
  const pre = /-/.test(s) ? 0 : 1;
  return pre * 1e12 + (m[0] || 0) * 1e6 + (m[1] || 0) * 1e3 + (m[2] || 0);
}
async function playwrightCandidates() {
  const list = [];
  const push = async (dir, label) => {
    const entry = path.join(dir, 'index.mjs');
    if (!fs.existsSync(entry)) return;
    try { list.push({ mod: await import(pathToFileURL(entry).href), from: label }); } catch (e) { /* 건너뛴다 */ }
  };
  if (process.env.PLAYWRIGHT_DIR) await push(process.env.PLAYWRIGHT_DIR, process.env.PLAYWRIGHT_DIR);
  try { list.push({ mod: await import('playwright'), from: 'playwright (resolved)' }); } catch (e) { /* 건너뛴다 */ }
  const roots = [];
  const local = process.env.LOCALAPPDATA;
  if (local) {
    const npx = path.join(local, 'npm-cache', '_npx');
    if (fs.existsSync(npx)) {
      for (const d of fs.readdirSync(npx)) roots.push(path.join(npx, d, 'node_modules', 'playwright'));
    }
  }
  const home = process.env.USERPROFILE || process.env.HOME;
  if (home && fs.existsSync(path.join(home, 'projects'))) {
    for (const d of fs.readdirSync(path.join(home, 'projects'))) {
      roots.push(path.join(home, 'projects', d, 'node_modules', 'playwright'));
    }
  }
  const found = [];
  for (const r of roots) {
    const pj = path.join(r, 'package.json');
    if (!fs.existsSync(pj)) continue;
    try {
      const v = JSON.parse(fs.readFileSync(pj, 'utf8')).version;
      if (fs.existsSync(path.join(r, 'index.mjs'))) found.push({ dir: r, v });
    } catch (e) { /* 건너뛴다 */ }
  }
  found.sort((a, b) => versionKey(b.v) - versionKey(a.v));
  for (const f of found) await push(f.dir, f.dir + ' (v' + f.v + ')');
  if (!list.length) throw new Error('playwright 를 못 찾았다');
  return list;
}

/* 줄 검사 · 브라우저 안에서 도는 코드 */
const LINE_PROBE = `
window.__lines = function () {
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const slide = slides.find(function (s) { return s.classList.contains('active'); });
  if (!slide) return { blocks: 0, wrap: [], orphan: [] };

  function lastLine(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const chars = [];
    let n;
    while ((n = walker.nextNode())) {
      const t = n.nodeValue;
      for (let i = 0; i < t.length; i++) {
        const r = document.createRange();
        r.setStart(n, i); r.setEnd(n, i + 1);
        const b = r.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        chars.push({ ch: t[i], top: Math.round(b.top * 2) / 2, left: b.left, right: b.right });
      }
    }
    if (!chars.length) return null;
    const tops = [].concat.apply([], [Array.from(new Set(chars.map(function (c) { return c.top; })))])
      .sort(function (a, b) { return a - b; });
    const line = chars.filter(function (c) { return c.top === tops[tops.length - 1]; });
    return {
      lines: tops.length,
      text: line.map(function (c) { return c.ch; }).join('').trim(),
      width: line[line.length - 1].right - line[0].left
    };
  }

  const wrap = [], orphan = [];
  let count = 0;
  [].slice.call(slide.querySelectorAll('*')).forEach(function (el) {
    let cs;
    try { cs = getComputedStyle(el); } catch (e) { return; }
    if (cs.display === 'inline' || cs.display === 'none' || cs.visibility === 'hidden') return;
    if (parseFloat(cs.opacity) === 0) return;
    const kids = [].slice.call(el.children);
    if (kids.some(function (k) {
      let kc;
      try { kc = getComputedStyle(k); } catch (e) { return true; }
      return kc.display !== 'inline';
    })) return;
    const txt = el.textContent.replace(/\\s+/g, ' ').trim();
    if (!txt) return;
    if (!/\\s/.test(txt)) return;                 /* 공백 없는 덩이는 애초에 나눌 수 없다 */
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    let p = el.parentElement, hidden = false;
    while (p && p !== document.body) {
      let pc;
      try { pc = getComputedStyle(p); } catch (e) { break; }
      if (pc.display === 'none' || pc.visibility === 'hidden' || parseFloat(pc.opacity) === 0) { hidden = true; break; }
      p = p.parentElement;
    }
    if (hidden) return;

    count += 1;
    const want = el.querySelectorAll('br').length + 1;
    const got = lastLine(el);
    if (!got) return;
    const label = (el.getAttribute('class') || el.tagName.toLowerCase()) + (el.id ? '#' + el.id : '');
    if (got.lines !== want) {
      wrap.push({ el: label, want: want, got: got.lines, t: txt.slice(0, 46) });
    }
    const words = got.text.split(/\\s+/).filter(Boolean);
    if (got.lines > 1 && words.length === 1) {
      orphan.push({ el: label, last: got.text, t: txt.slice(0, 46) });
    }
  });
  return { blocks: count, wrap: wrap, orphan: orphan };
};

/* 스테이지 1920x1080 좌표로 잰다 */
window.__box = function (sel) {
  const stage = document.getElementById('stage');
  const sr = stage.getBoundingClientRect();
  const s = (sr.width / 1920) || 1;
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const slide = slides.find(function (x) { return x.classList.contains('active'); });
  const el = slide ? slide.querySelector(sel) : null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    left: Math.round((r.left - sr.left) / s),
    top: Math.round((r.top - sr.top) / s),
    right: Math.round((r.right - sr.left) / s),
    bottom: Math.round((r.bottom - sr.top) / s),
    w: Math.round(r.width / s),
    h: Math.round(r.height / s)
  };
};
window.__click = function (sel) {
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const slide = slides.find(function (x) { return x.classList.contains('active'); });
  const el = slide ? slide.querySelector(sel) : null;
  if (!el) return false;
  el.click();
  return true;
};
`;

function w(s) {
  let n = 0;
  for (const ch of String(s)) n += /[ᄀ-ᇿ　-〿가-힯＀-￯]/.test(ch) ? 2 : 1;
  return n;
}
function pad(s, n, right) {
  const gap = Math.max(0, n - w(s));
  return right ? ' '.repeat(gap) + s : s + ' '.repeat(gap);
}
function table(head, rows, align) {
  const cols = head.map((h, i) => Math.max(w(h), ...rows.map(r => w(r[i] == null ? '' : r[i]))));
  const line = (r) => r.map((c, i) => pad(c == null ? '' : String(c), cols[i], align[i] === 'r')).join('  ');
  const out = [line(head), cols.map(c => '-'.repeat(c)).join('  ')];
  rows.forEach(r => out.push(line(r)));
  return out.join('\n');
}

async function main() {
  if (!fs.existsSync(DECK)) throw new Error('덱이 없다: ' + DECK);
  fs.mkdirSync(OUT, { recursive: true });

  const cands = await playwrightCandidates();
  let browser = null, from = '';
  const errs = [];
  for (const c of cands) {
    try { browser = await c.mod.chromium.launch({ headless: true }); from = c.from; break; }
    catch (e) { errs.push(c.from + ' → ' + String(e.message).split('\n')[0]); }
  }
  if (!browser) throw new Error('chromium 을 못 띄웠다:\n  ' + errs.join('\n  '));
  console.log('playwright: ' + from);

  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(180000);
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)));
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push('console: ' + m.text()); });

  await page.goto(pathToFileURL(DECK).href, { waitUntil: 'load' });

  const font = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    const ko = (stage ? stage.textContent : '').replace(/\s+/g, '') + '가나다라마바사아자차카타파하';
    const en = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·:/%().,';
    const jobs = [];
    [400, 500, 700, 800].forEach((weight) => {
      jobs.push(document.fonts.load(weight + ' 100px "Pretendard Variable"', ko + en));
      jobs.push(document.fonts.load(weight + ' 100px Pretendard', ko + en));
    });
    [400, 500, 700].forEach((weight) => {
      jobs.push(document.fonts.load(weight + ' 100px "Samsung Sharp Sans"', en));
    });
    await Promise.all(jobs.map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const cv = document.createElement('canvas').getContext('2d');
    const m = (f, t) => { cv.font = f; return Math.round(cv.measureText(t).width * 100) / 100; };
    return {
      ko: m('100px "Pretendard Variable"', '가'),
      sharp: m('700 100px "Samsung Sharp Sans"', 'H'),
      pre: m('700 100px "Pretendard Variable"', 'H'),
      serif: m('700 100px serif', 'H')
    };
  });
  const FONT_SPEC = [
    ['Pretendard "가" 100px', 86.44, font.ko],
    ['SamsungSharpSans "H" 700', 63.61, font.sharp],
    ['Pretendard "H" 700', 71.94, font.pre],
    ['serif "H" 700', 78.52, font.serif]
  ];
  console.log('\n=== 서체 로드 (폭 삼각측량 · ±0.5) ===');
  console.log(table(['재는 것', '기대', '잰 값', ''],
    FONT_SPEC.map(([l, want, got]) => [l, String(want), String(got), Math.abs(got - want) <= 0.5 ? 'ok' : 'FAIL']),
    ['l', 'r', 'r', 'l']));

  await page.evaluate(() => { window.still(); });
  await page.addScriptTag({ content: LINE_PROBE });

  const rows = [], lineFail = [];
  for (let n = 1; n <= 14; n++) {
    await page.evaluate((p) => { go(p - 1); }, n);
    await page.waitForTimeout(700);
    await page.evaluate((p) => {
      const t = (typeof PAGE !== 'undefined') ? PAGE : (window.PAGE || {});
      if (t[p] && t[p].reset) t[p].reset();
    }, n);
    await page.waitForTimeout(360);

    const tag = 'p' + String(n).padStart(2, '0');
    await page.screenshot({ path: path.join(OUT, tag + '-rest.png') });
    const restLines = await page.evaluate(() => window.__lines());
    const box = await page.evaluate(() => ({
      h: document.documentElement.scrollHeight,
      w: document.documentElement.scrollWidth
    }));

    await page.evaluate((p) => {
      const t = (typeof PAGE !== 'undefined') ? PAGE : (window.PAGE || {});
      if (t[p] && t[p].finish) t[p].finish();
    }, n);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, tag + '-done.png') });
    const doneLines = await page.evaluate(() => window.__lines());

    const wrapN = restLines.wrap.length + doneLines.wrap.length;
    const orphanN = restLines.orphan.length + doneLines.orphan.length;
    rows.push([String(n), String(restLines.blocks), String(wrapN), String(orphanN), String(box.h), String(box.w)]);
    if (wrapN || orphanN) {
      lineFail.push({ n, rest: restLines, done: doneLines });
    }
    process.stderr.write('  ' + n + '쪽 렌더\n');
  }

  console.log('\n=== 쪽마다 (자동 줄바꿈 · 고아 줄 · 넘침) ===');
  console.log(table(['쪽', '블록', '자동줄바꿈', '고아줄', 'scrollH', 'scrollW'], rows,
    ['r', 'r', 'r', 'r', 'r', 'r']));

  if (lineFail.length) {
    console.log('\n=== 줄이 어긋난 곳 ===');
    for (const f of lineFail) {
      console.log('\n[' + f.n + '쪽]');
      ['rest', 'done'].forEach((k) => {
        f[k].wrap.forEach((x) => console.log('  ' + k + ' 자동 줄바꿈 · ' + x.el + ' 원고 ' + x.want + '줄 → 화면 ' + x.got + '줄 | ' + x.t));
        f[k].orphan.forEach((x) => console.log('  ' + k + ' 고아 줄 · ' + x.el + ' 마지막 줄 "' + x.last + '" | ' + x.t));
      });
    }
  } else {
    console.log('\n자동 줄바꿈 0건, 고아 줄 0건.');
  }

  /* ===== 팝업 · 5쪽과 7쪽 ===== */
  console.log('\n=== 팝업 ===');
  const popRows = [];
  const POPS = [
    { n: 5, word: '.popword', pop: '#pop-llm', guard: '.dev', guardName: '오른쪽 장치' },
    { n: 7, word: '.popword', pop: '#pop-cut', guard: '.traysend', guardName: '왼쪽 트레이' }
  ];
  for (const P of POPS) {
    await page.evaluate((p) => { go(p - 1); }, P.n);
    await page.waitForTimeout(700);
    await page.evaluate((p) => {
      const t = (typeof PAGE !== 'undefined') ? PAGE : (window.PAGE || {});
      if (t[p] && t[p].reset) t[p].reset();
    }, P.n);
    await page.waitForTimeout(320);
    await page.evaluate((s) => window.__click(s), P.word);
    await page.waitForTimeout(420);
    await page.screenshot({ path: path.join(OUT, 'p' + String(P.n).padStart(2, '0') + '-pop.png') });

    const pop = await page.evaluate((s) => window.__box(s), P.pop);
    const word = await page.evaluate((s) => window.__box(s), P.word);
    const guard = await page.evaluate((s) => window.__box(s), P.guard);
    const chat = await page.evaluate(() => window.__box('.talk'));
    const hit = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    popRows.push([
      String(P.n),
      pop ? pop.left + '..' + pop.right + ' x ' + pop.top + '..' + pop.bottom : '없음',
      pop ? String(pop.w) + 'x' + String(pop.h) : '-',
      hit(pop, word) ? '덮음(FAIL)' : '안 덮음',
      P.guardName + (hit(pop, guard) ? ' 덮음(FAIL)' : ' 안 덮음'),
      chat ? (hit(pop, chat) ? '대화창 겹침' : '대화창 안 겹침') : '-'
    ]);

    /* 닫는 방법 셋을 실제로 확인한다 */
    const closeWays = await page.evaluate(async () => {
      const out = {};
      const openIt = () => { const w2 = document.querySelector('.slide.active .popword'); if (w2) w2.click(); };
      const isOpen = () => !!document.querySelector('.slide.active .pop.on');
      openIt(); out.opened = isOpen();
      document.querySelector('.slide.active .popclose').click(); out.byClose = !isOpen();
      openIt();
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      out.byOutside = !isOpen();
      return out;
    });
    const esc = await (async () => {
      await page.evaluate(() => { const w2 = document.querySelector('.slide.active .popword'); if (w2) w2.click(); });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      return await page.evaluate(() => !document.querySelector('.slide.active .pop.on'));
    })();
    const arrow = await (async () => {
      const before = await page.evaluate(() => [].slice.call(document.querySelectorAll('.slide')).findIndex((s) => s.classList.contains('active')));
      await page.evaluate(() => { const w2 = document.querySelector('.slide.active .popword'); if (w2) w2.click(); });
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => [].slice.call(document.querySelectorAll('.slide')).findIndex((s) => s.classList.contains('active')));
      const closed = await page.evaluate(() => !document.querySelector('.pop.on'));
      return (after === before + 1) && closed;
    })();
    console.log('  ' + P.n + '쪽 닫기 · 글자 버튼 ' + (closeWays.byClose ? 'ok' : 'FAIL') +
      ' · 바깥 누르기 ' + (closeWays.byOutside ? 'ok' : 'FAIL') +
      ' · Esc ' + (esc ? 'ok' : 'FAIL') +
      ' · 방향키(닫으며 넘김) ' + (arrow ? 'ok' : 'FAIL'));
  }
  console.log('');
  console.log(table(['쪽', '팝업 상자 (스테이지 좌표)', '크기', '낱말', '조작부', '창'], popRows,
    ['r', 'l', 'l', 'l', 'l', 'l']));

  if (pageErrors.length) {
    console.log('\n=== 페이지 오류 ===');
    [...new Set(pageErrors)].slice(0, 20).forEach((e) => console.log('  · ' + e));
  } else {
    console.log('\n콘솔 오류 0건.');
  }

  console.log('\n스크린샷: ' + OUT);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
