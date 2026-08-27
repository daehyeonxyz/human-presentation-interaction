#!/usr/bin/env node
/* v5 렌더 검증. 인터랙션 고도화와 자기완결 전환을 눈과 수치로 함께 확인한다.

     node qa/render-v5.mjs

   자기완결 검증은 형제 폴더가 없는 임시 폴더에 HTML 하나만 복사해 놓고 연다.
   여기서 서체 폭이 맞으면 발표장에 네트워크가 없어도 같은 화면이 나온다.

   남기는 것은 qa/v5/ 아래 세 가지다.
     v5-pNN-rest.png   정지 상태 열네 쪽
     v5-pNN-done.png   완료 상태 열네 쪽 (End 폴백)
     v5-pNN-<이름>.png  등급 2~3 쪽의 조작 전후와 상세 층
*/

import fs from 'node:fs';
import os from 'node:os';
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
    try { return { mod: await import(pathToFileURL(path.join(f.dir, 'index.mjs')).href), from: f.dir + ' (v' + f.v + ')' }; }
    catch (e) { /* 다음 후보 */ }
  }
  throw new Error('playwright 를 못 찾았다');
}

/* 서체 폭 삼각측량. 100px 기준 실측값이고 ±0.5 안에 들어와야 로드된 것이다 */
const FONTW = [
  ['Pretendard "가" 100px', 86.44, `(() => { const s=document.createElement('span');
     s.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:400 100px "Pretendard Variable"';
     s.textContent='가'; document.body.appendChild(s);
     const w=s.getBoundingClientRect().width; s.remove(); return w; })()`],
  ['SamsungSharpSans "H" 700', 63.61, `(() => { const s=document.createElement('span');
     s.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:700 100px "Samsung Sharp Sans"';
     s.textContent='H'; document.body.appendChild(s);
     const w=s.getBoundingClientRect().width; s.remove(); return w; })()`],
  ['Pretendard "H" 700', 71.94, `(() => { const s=document.createElement('span');
     s.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:700 100px "Pretendard Variable"';
     s.textContent='H'; document.body.appendChild(s);
     const w=s.getBoundingClientRect().width; s.remove(); return w; })()`],
  ['serif "H" 700 (대조군)', 78.52, `(() => { const s=document.createElement('span');
     s.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:700 100px serif';
     s.textContent='H'; document.body.appendChild(s);
     const w=s.getBoundingClientRect().width; s.remove(); return w; })()`]
];

const pad = (n) => String(n).padStart(2, '0');

async function main() {
  const { mod, from } = await playwright();
  console.log('playwright: ' + from);

  /* 형제 폴더가 없는 곳에 HTML 하나만 복사한다. 자기완결이 아니면 여기서 서체가 무너진다 */
  const iso = fs.mkdtempSync(path.join(os.tmpdir(), 'ax-iso-'));
  fs.copyFileSync(DECK, path.join(iso, '1교시.html'));
  console.log('고립 복사: ' + iso + '  (' + (fs.statSync(DECK).size / 1024).toFixed(0) + ' KB)');

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await mod.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  /* 발표장에 네트워크가 없는 상황을 그대로 만든다 */
  const blocked = [];
  const cut = (route) => { blocked.push(route.request().url()); return route.abort(); };
  await page.route('http://**', cut);
  await page.route('https://**', cut);

  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(pathToFileURL(path.join(iso, '1교시.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  console.log('\n=== 자기완결 · 오프라인 서체 (원격 요청 ' + blocked.length + '건 차단) ===');
  let fontOk = true;
  for (const [label, want, expr] of FONTW) {
    const got = await page.evaluate(expr);
    const ok = Math.abs(got - want) <= 0.5;
    if (!ok) fontOk = false;
    console.log('  ' + label.padEnd(26) + String(want).padStart(6) + String(Math.round(got * 100) / 100).padStart(8) + '  ' + (ok ? 'ok' : 'FAIL'));
  }

  const shot = (name) => page.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  const key = async (k, wait) => { await page.keyboard.press(k); await page.waitForTimeout(wait || 420); };

  /* 등장 애니메이션 중간 상태에서 자로 재지 않는다 */
  await page.evaluate(() => window.still());

  /* 넘김은 방향키만 쓴다. 발표자가 실제로 쓰는 경로와 같다 */
  const rows = [];
  for (let n = 1; n <= 14; n++) {
    if (n > 1) await key('ArrowRight');
    await page.waitForTimeout(360);
    await shot('v5-p' + pad(n) + '-rest.png');
    const m = await page.evaluate(() => ({
      h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth
    }));
    rows.push([n, m.h, m.w]);
  }
  console.log('\n=== 정지 상태 열네 쪽 ===');
  console.log('쪽  scrollH  scrollW');
  for (const [n, h, w] of rows) console.log(String(n).padStart(2) + String(h).padStart(9) + String(w).padStart(9));

  /* 되돌아가며 완료 상태를 찍는다. 쪽을 떠나면 처음 상태로 돌아가므로 이 순서가 맞다 */
  const done = [];
  for (let n = 14; n >= 1; n--) {
    await key('End', 520);
    await shot('v5-p' + pad(n) + '-done.png');
    done.push([n, await page.evaluate(() => ({
      h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth,
      close: !!document.querySelector('.slide.active .close.on, .slide.active .fore.on, .slide.active .decl span.on')
    }))]);
    if (n > 1) await key('ArrowLeft');
  }
  console.log('\n=== 완료 상태 (End 폴백) ===');
  console.log('쪽  scrollH  scrollW  맺음');
  for (const [n, d] of done.reverse()) {
    console.log(String(n).padStart(2) + String(d.h).padStart(9) + String(d.w).padStart(9) + '  ' + (d.close ? '켜짐' : '없음'));
  }

  /* ===== 등급 2~3 쪽의 조작 관찰 ===== */
  const at = async (n) => {
    await page.reload({ waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.still());
    for (let i = 1; i < n; i++) await key('ArrowRight', 120);
    await page.waitForTimeout(360);
  };
  const obs = [];

  /* 4쪽 · 구간 막대. 바뀐 구간에만 링이 걸렸다 사라진다 */
  await at(4);
  await shot('v5-p04-act-off.png');
  await page.click('#aibtn');
  await page.waitForTimeout(140);
  obs.push(['4쪽 바뀐 구간 링', await page.evaluate(() => document.querySelector('#grows .track.key').classList.contains('lit'))]);
  await shot('v5-p04-act-on.png');
  await page.waitForTimeout(600);
  obs.push(['4쪽 링 거둠', await page.evaluate(() => !document.querySelector('#grows .track.key').classList.contains('lit'))]);

  /* 5쪽 · 다음 단어. 네 번 눌러 문장이 완성된다 */
  await at(5);
  for (let i = 0; i < 4; i++) { await page.click('#wbtn'); await page.waitForTimeout(560); }
  await shot('v5-p05-act.png');
  obs.push(['5쪽 네 칸 완성', await page.evaluate(() => document.querySelectorAll('#wdots i.on').length === 4)]);

  /* 6쪽 · 교차 강조. 어느 답을 눌러도 대조한 자료 줄이 함께 켜진다 */
  await at(6);
  await page.click('#ansL');
  await page.waitForTimeout(320);
  await shot('v5-p06-act-left.png');
  obs.push(['6쪽 맞는 답도 자료 줄 켬', await page.evaluate(() => document.getElementById('srcline3').classList.contains('lit'))]);
  obs.push(['6쪽 링이 왼쪽에', await page.evaluate(() => document.getElementById('ansL').classList.contains('tie'))]);
  await page.click('#ansR');
  await page.waitForTimeout(320);
  await shot('v5-p06-act-right.png');
  obs.push(['6쪽 링이 오른쪽으로 옮김', await page.evaluate(() =>
    document.getElementById('ansR').classList.contains('tie') && !document.getElementById('ansL').classList.contains('tie'))]);

  /* 7쪽 · 다섯 질문. 다섯째에서 머리글이 새 대화로 바뀐다 */
  await at(7);
  for (let i = 0; i < 5; i++) { await key(' ', 2600); }
  await shot('v5-p07-act.png');
  obs.push(['7쪽 다섯 줄 다 보냄', await page.evaluate(() => document.querySelectorAll('#klist .sendrow.sent').length === 5)]);

  /* 9쪽 · 실습 단계 */
  await at(9);
  await page.click('#steps .step:nth-child(2)');
  await page.waitForTimeout(320);
  await shot('v5-p09-act.png');

  /* 10쪽 · 펼침. 접힌 높이와 펼친 높이의 차이가 이 쪽의 주장이다 */
  await at(10);
  const foldH = await page.evaluate(() => Math.round(document.getElementById('readbox').getBoundingClientRect().height));
  await page.click('#readbox');
  await page.waitForTimeout(420);
  await shot('v5-p10-act.png');
  const openH = await page.evaluate(() => Math.round(document.getElementById('readbox').getBoundingClientRect().height));
  obs.push(['10쪽 펼침 높이 ' + foldH + ' -> ' + openH, openH > foldH + 200]);
  await page.click('#blockitem');
  await page.waitForTimeout(220);
  obs.push(['10쪽 문서함 소진 표시', await page.evaluate(() => document.getElementById('blockitem').classList.contains('spent'))]);

  /* 11쪽 · 쪼갬 */
  await at(11);
  await page.click('#tokbtn'); await page.waitForTimeout(220);
  await page.click('#tokbtn2'); await page.waitForTimeout(320);
  await shot('v5-p11-act.png');

  /* 12쪽 · 시뮬레이션 콘솔. 상태와 시퀀스와 상세 세 층을 모두 관찰한다 */
  await at(12);
  await page.click('#runbtn');
  await page.waitForTimeout(900);
  await shot('v5-p12-act-run.png');
  /* 클래스가 아니라 실제로 칠해진 색을 잰다. 클래스만 보면 뒤에 온 규칙이 색을 덮어도 통과한다 */
  const dotColors = () => page.evaluate(() =>
    [].map.call(document.querySelectorAll('#sdots i'), (d) => getComputedStyle(d).backgroundColor));
  obs.push(['12쪽 단계 점 0/5', (await dotColors()).filter((c) => c === 'rgb(3, 97, 228)').length === 0]);
  for (let i = 0; i < 3; i++) { await page.click('#sendbtn'); await page.waitForTimeout(2600); }
  await shot('v5-p12-act-send3.png');
  const dc = await dotColors();
  obs.push(['12쪽 단계 점 3/5 (강조색 실측)', dc.filter((c) => c === 'rgb(3, 97, 228)').length === 3]);
  obs.push(['12쪽 꺼진 점이 우물 면에서 보임', dc.filter((c) => c === 'rgb(174, 185, 203)').length === 2]);
  /* 상세 층 · 호버 미리보기 */
  await page.hover('#legend .lg[data-k="file"]');
  await page.waitForTimeout(320);
  await shot('v5-p12-detail-hover.png');
  obs.push(['12쪽 호버 미리보기', await page.evaluate(() =>
    document.getElementById('ctxstack').classList.contains('detail') &&
    document.querySelectorAll('#msgs .bub.lit').length > 0)]);
  /* 상세 층 · 클릭 고정. 마우스를 치워도 교차 강조와 설명이 함께 남아야 한다.
     발표자가 마우스를 놓고 말하는 동안 화면이 그 상태로 서 있는 것이 이 조작의 값어치다 */
  await page.click('#legend .lg[data-k="file"]');
  await page.waitForTimeout(220);
  await page.mouse.move(300, 1000);
  await page.waitForTimeout(320);
  await shot('v5-p12-detail-pin.png');
  obs.push(['12쪽 클릭 고정 · 교차 강조 남음', await page.evaluate(() =>
    document.querySelectorAll('#msgs .bub.lit').length > 0 &&
    document.querySelectorAll('#legend .lg.lit').length === 1)]);
  obs.push(['12쪽 클릭 고정 · 설명 남음', await page.evaluate(() =>
    document.getElementById('ctxstack').classList.contains('detail') &&
    document.querySelector('#details div[data-d="file"]').classList.contains('on'))]);
  /* 판 안으로 들어오면 범례가 돌아온다. 빈 아래쪽에 마우스를 두고 확인한다 */
  const stackBox = await page.evaluate(() => {
    const r = document.getElementById('ctxstack').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.bottom - 4 };
  });
  await page.mouse.move(stackBox.x, stackBox.y);
  await page.waitForTimeout(260);
  obs.push(['12쪽 판 안에서 범례 복귀', await page.evaluate(() =>
    !document.getElementById('ctxstack').classList.contains('detail') &&
    document.querySelectorAll('#legend .lg.lit').length === 1)]);
  /* 고정한 것과 다른 줄에 올리면 그리로 미리보기가 옮겨 간다 */
  await page.hover('#legend .lg[data-k="ai"]');
  await page.waitForTimeout(260);
  obs.push(['12쪽 고정 중 다른 줄 미리보기', await page.evaluate(() =>
    document.querySelector('#details div[data-d="ai"]').classList.contains('on') &&
    document.querySelectorAll('#legend .lg.lit[data-k="ai"]').length === 1)]);
  await page.mouse.move(300, 1000);
  await page.waitForTimeout(260);
  obs.push(['12쪽 마우스를 떼면 고정으로 복귀', await page.evaluate(() =>
    document.querySelector('#details div[data-d="file"]').classList.contains('on'))]);
  /* 같은 것을 다시 누르면 풀린다 */
  await page.click('#legend .lg[data-k="file"]');
  await page.mouse.move(300, 1000);
  await page.waitForTimeout(320);
  obs.push(['12쪽 다시 눌러 풀림', await page.evaluate(() =>
    document.querySelectorAll('#msgs .bub.lit').length === 0 &&
    !document.getElementById('ctxstack').classList.contains('detail'))]);
  /* 말풍선 쪽에서도 같은 문법이 걸린다 */
  await page.click('#msgs .bub[data-k="ai"]:not(.hidden)');
  await page.mouse.move(300, 1000);
  await page.waitForTimeout(320);
  await shot('v5-p12-detail-pin-bubble.png');
  obs.push(['12쪽 말풍선 클릭 고정', await page.evaluate(() =>
    document.querySelectorAll('#legend .lg.lit[data-k="ai"]').length === 1)]);
  /* 고정한 채로 방향키가 즉시 듣는다 */
  await key('ArrowRight');
  obs.push(['12쪽 고정 중 키보드 복구', await page.evaluate(() =>
    document.querySelector('.slide.active').dataset.page === '13')]);

  /* 13쪽 · 주석. 호버는 미리보기이고 클릭은 확인 결과 고정이다 */
  await at(13);
  await page.hover('#fnbub .fn[data-f="2"]');
  await page.waitForTimeout(260);
  await shot('v5-p13-detail-hover.png');
  obs.push(['13쪽 호버 미리보기', await page.evaluate(() =>
    document.querySelectorAll('#fnotes .fnrow.peek').length === 1 &&
    document.querySelectorAll('#fnotes .fnrow.on').length === 0)]);
  await page.click('#fnbub .fn[data-f="2"]');
  await page.waitForTimeout(320);
  await shot('v5-p13-act.png');
  obs.push(['13쪽 클릭 확인 결과', await page.evaluate(() =>
    document.querySelectorAll('#fnotes .fnrow.on').length === 1)]);

  /* 14쪽 · 누적 */
  await at(14);
  for (let i = 0; i < 8; i++) await key(' ', 200);
  await shot('v5-p14-act.png');

  console.log('\n=== 등급 2~3 조작 관찰 ===');
  let obsOk = true;
  for (const [label, ok] of obs) { if (!ok) obsOk = false; console.log('  ' + (ok ? 'ok  ' : 'FAIL') + '  ' + label); }

  /* ===== 어포던스 · 커서가 약속한 것이 실제로 있는가 ===== */
  /* 누르는 것 전부에 호버 반응이 있는가.
     디자인시스템 호버 절이 "호버에 반응하는 것은 누를 수 있는 것뿐이고 예외가 없다.
     반응이 약한 것이 문제가 아니라 반응 없는 것과 구별되지 않는 것이 문제다" 를 규정한다.
     반응 없는 항목을 세는 검사는 종전 게이트에 없어서 여기서 새로 잰다.
     cursor 는 상속되므로 누르는 것 자신만 세고 상속받은 자식은 뺀다 */
  const mark = () => page.evaluate(() => {
    const list = [];
    /* 앞 쪽에 남은 표시를 먼저 지운다. 남겨 두면 선택자가 앞 쪽 요소를 먼저 잡는다 */
    document.querySelectorAll('[data-hx]').forEach((el) => { delete el.dataset.hx; });
    document.querySelectorAll('.slide.active *').forEach((el) => {
      if (getComputedStyle(el).cursor !== 'pointer') return;
      const p = el.parentElement;
      if (p && getComputedStyle(p).cursor === 'pointer') return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      /* 정지 상태에서 보이지도 눌리지도 않는 것은 세지 않는다.
         닫힌 팝업의 닫기 버튼과 실행 전 범례가 여기 해당한다.
         이 둘은 열린 뒤에 조작 관찰로 따로 확인한다 */
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
  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.still());
  for (let n = 1; n <= 14; n++) {
    if (n > 1) await key('ArrowRight', 220);
    const names = await mark();
    clickCount += names.length;
    for (let i = 0; i < names.length; i++) {
      const before = await snap(i);
      await page.hover('[data-hx="' + i + '"]', { force: true }).catch(() => {});
      await page.waitForTimeout(170);
      const after = await snap(i);
      await page.mouse.move(960, 1070);
      await page.waitForTimeout(60);
      if (before === after) hoverDead.push(n + '쪽 · ' + names[i]);
    }
  }
  console.log('\n=== 호버 어포던스 ===');
  console.log('  누르는 것 ' + clickCount + '개 · 호버 반응 없는 것 ' + hoverDead.length + '건');
  hoverDead.slice(0, 12).forEach((s) => console.log('    ' + s));
  const afford = { pointerNoWhite: hoverDead };

  console.log('\n콘솔 오류 ' + errors.length + '건');
  errors.slice(0, 5).forEach((e) => console.log('  ' + e));
  console.log('원격 요청 차단 ' + blocked.length + '건 (0 이어야 자기완결이다)');
  /* 나란히 놓고 보는 판. 한 쪽씩 열어 보면 덱 전체의 결이 안 잡힌다.
     열네 쪽을 같은 배율로 늘어놓아야 어느 쪽이 성긴지 눈에 든다 */
  const sheet = async (names, out) => {
    const cell = 620, h = Math.round(cell * 1080 / 1920);
    const cols = 3, rows = Math.ceil(names.length / cols);
    const imgs = names.map((n) => '<img src="' + pathToFileURL(path.join(OUT, n)).href + '">').join('');
    await page.setViewportSize({ width: cols * cell + (cols + 1) * 8, height: rows * h + (rows + 1) * 8 });
    await page.setContent('<style>body{margin:0;background:#1e1e1e;display:grid;gap:8px;padding:8px;' +
      'grid-template-columns:repeat(' + cols + ',' + cell + 'px)}img{width:' + cell + 'px;height:' + h + 'px;display:block}</style>' + imgs);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, out) });
  };
  const restNames = [], doneNames = [];
  for (let n = 1; n <= 14; n++) { restNames.push('v5-p' + pad(n) + '-rest.png'); doneNames.push('v5-p' + pad(n) + '-done.png'); }
  await sheet(restNames.slice(0, 7), 'v5-sheet-rest-a.png');
  await sheet(restNames.slice(7), 'v5-sheet-rest-b.png');
  await sheet(doneNames.slice(0, 7), 'v5-sheet-done-a.png');
  await sheet(doneNames.slice(7), 'v5-sheet-done-b.png');

  console.log('\n스크린샷: ' + OUT);

  await browser.close();
  fs.rmSync(iso, { recursive: true, force: true });

  const pass = fontOk && obsOk && errors.length === 0 && blocked.length === 0 && afford.pointerNoWhite.length === 0;
  console.log(pass ? '\nv5 게이트 통과' : '\nv5 게이트 실패');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
