#!/usr/bin/env node
/* 렌더 관찰 캡처. 완료 판정의 근거를 그림으로 남긴다.

     node qa/render.mjs

   남기는 것은 qa/shots/ 아래 네 갈래다.
   1. 1920x1080 전 쪽 정지 상태          rest-pNN.png
   2. 1920x1080 전 쪽 End 완료 상태      done-pNN.png
   3. 2560x1080 대표 쪽 세 장             wide-pNN.png
   4. 등급 2~3 쪽의 조작 전후             act-pNN-<이름>.png

   go() 는 0 기반 색인이라 쪽 번호 N 은 go(N-1) 로 연다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playwright, PAGES } from './_pw.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', '서브에이전트와-병렬-작업.html');
const OUT = path.join(HERE, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const pad = (n) => String(n).padStart(2, '0');
const url = pathToFileURL(DECK).href;
const pw = await playwright();
const browser = await pw.chromium.launch();

async function open(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate('document.fonts.ready');
  await page.evaluate('window.still()');
  return page;
}
async function goto(page, n) {
  await page.evaluate(`go(${n - 1})`);
  await page.waitForTimeout(260);
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name) });
  console.log('  ' + name);
}

/* 1 과 2. 1920x1080 전 쪽 정지 상태와 End 완료 상태 */
console.log('1920x1080 정지 상태와 End 상태');
{
  const page = await open(1920, 1080);
  for (let p = 1; p <= PAGES; p++) {
    await goto(page, p);
    await shot(page, `rest-p${pad(p)}.png`);
    await page.evaluate(`(function(){ var a = PAGE[${p}]; if (a && a.finish) a.finish(); })()`);
    await page.waitForTimeout(560);
    await shot(page, `done-p${pad(p)}.png`);
  }
  await page.close();
}

/* 3. 2560x1080 대표 쪽. 표지와 가장 무거운 판과 미검증 판을 고른다 */
console.log('2560x1080 대표 쪽');
{
  const page = await open(2560, 1080);
  for (const p of [1, 4, 6]) {
    await goto(page, p);
    await shot(page, `wide-p${pad(p)}.png`);
  }
  await page.close();
}

/* 4. 등급 2~3 쪽의 조작 전후 */
console.log('등급 2~3 조작 전후');
{
  const page = await open(1920, 1080);

  /* 3쪽 advance-machine · 단계 진행과 조각 짚기 */
  await goto(page, 3);
  await shot(page, 'act-p03-a-rest.png');
  for (let i = 0; i < 2; i++) { await page.click('#p3btn'); await page.waitForTimeout(520); }
  await shot(page, 'act-p03-b-step2.png');
  await page.hover('.p3seg[data-g="0"][data-s="1"]');
  await page.waitForTimeout(300);
  await shot(page, 'act-p03-c-hover.png');
  await page.click('.p3seg[data-g="0"][data-s="1"]');
  await page.waitForTimeout(300);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(300);
  await shot(page, 'act-p03-d-pin.png');

  /* 4쪽 simulate-console · 재생과 인스펙터 고정 */
  await goto(page, 4);
  await shot(page, 'act-p04-a-rest.png');
  await page.click('#p4btn');
  await page.waitForTimeout(900);
  await shot(page, 'act-p04-b-playing.png');
  await page.waitForTimeout(2600);
  await shot(page, 'act-p04-c-done.png');
  await page.hover('.p4it[data-k="c"]');
  await page.waitForTimeout(300);
  await shot(page, 'act-p04-d-hover.png');
  await page.click('.p4it[data-k="c"]');
  await page.waitForTimeout(300);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(300);
  await shot(page, 'act-p04-e-pin.png');

  /* 5쪽 pick-contrast · 한쪽만 연 상태와 양쪽을 연 상태와 막대 짚기 */
  await goto(page, 5);
  await shot(page, 'act-p05-a-rest.png');
  await page.click('.p5b[data-b="0"]');
  await page.waitForTimeout(560);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(200);
  await shot(page, 'act-p05-b-left.png');
  await page.click('.p5b[data-b="1"]');
  await page.waitForTimeout(560);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(300);
  await shot(page, 'act-p05-c-both.png');
  await page.hover('.p5b[data-b="0"] .p5bar[data-k="c"]');
  await page.waitForTimeout(300);
  await shot(page, 'act-p05-d-hover.png');

  /* 6쪽 point-map · 호버 미리보기와 클릭 고정 */
  await goto(page, 6);
  await shot(page, 'act-p06-a-rest.png');
  await page.hover('#p6a .p6it[data-k="2"]');
  await page.waitForTimeout(300);
  await shot(page, 'act-p06-b-hover.png');
  await page.click('#p6a .p6it[data-k="2"]');
  await page.waitForTimeout(300);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(300);
  await shot(page, 'act-p06-c-pin.png');
  await page.hover('#p6b .p6it[data-k="4"]');
  await page.waitForTimeout(300);
  await shot(page, 'act-p06-d-pin-holds.png');
  await page.click('#p6b .p6it[data-k="4"]');
  await page.waitForTimeout(300);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(300);
  await shot(page, 'act-p06-e-moved.png');

  /* 2쪽 pick-list · 항목 열기 */
  await goto(page, 2);
  await shot(page, 'act-p02-a-rest.png');
  await page.click('#p2tray .p2row:nth-child(2)');
  await page.waitForTimeout(300);
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(300);
  await shot(page, 'act-p02-b-open.png');

  await page.close();
}

await browser.close();
console.log('\n캡처 위치  ' + OUT);
