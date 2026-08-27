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
import { playwright, PAGES, DECK_FILE } from './_pw.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', DECK_FILE);
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
async function park(page) {
  await page.mouse.move(10, 1000);
  await page.waitForTimeout(260);
}
/* 끌기는 실제 포인터로 한다. 값만 바꿔 찍으면 pointer 경로가 검사되지 않는다 */
async function drag(page, sel, dx) {
  const box = await page.locator(sel).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2, { steps: 16 });
  await page.mouse.up();
  await page.waitForTimeout(300);
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

/* 3. 2560x1080 대표 쪽. 표지와 미검증 판 셋 가운데 둘을 고른다 */
console.log('2560x1080 대표 쪽');
{
  const page = await open(2560, 1080);
  for (const p of [1, 3, 4, 5]) {
    await goto(page, p);
    await shot(page, `wide-p${pad(p)}.png`);
  }
  await page.close();
}

/* 4. 등급 2~3 쪽의 조작 전후 */
console.log('등급 2~3 조작 전후');
{
  const page = await open(1920, 1080);

  /* 2쪽 pick-list · 항목 열기 */
  await goto(page, 2);
  await shot(page, 'act-p02-a-rest.png');
  await page.click('#p2tray .p2row:nth-child(3)');
  await park(page);
  await shot(page, 'act-p02-b-open.png');

  /* 3쪽 drag-compare · 경계 끌기와 구간 짚기 */
  await goto(page, 3);
  await shot(page, 'act-p03-a-rest.png');
  await drag(page, '#p3seam', -1400);
  await park(page);
  await shot(page, 'act-p03-b-left.png');
  await drag(page, '#p3seam', 2200);
  await park(page);
  await shot(page, 'act-p03-c-right.png');
  await page.evaluate('PAGE[3].step(); PAGE[3].step(); PAGE[3].step();');
  await page.waitForTimeout(400);
  await page.hover('.p3layer:nth-child(1) .p3row[data-i="1"]', { position: { x: 200, y: 40 } });
  await page.waitForTimeout(300);
  await shot(page, 'act-p03-d-hover.png');
  await page.click('.p3layer:nth-child(1) .p3row[data-i="1"]', { position: { x: 200, y: 40 } });
  await park(page);
  await shot(page, 'act-p03-e-pin.png');
  /* 고정 중에도 마우스를 올린 줄 자체에는 호버 링이 걸린다 */
  await page.hover('.p3layer:nth-child(1) .p3row[data-i="3"]', { position: { x: 200, y: 40 } });
  await page.waitForTimeout(300);
  await shot(page, 'act-p03-f-pin-holds.png');

  /* 4쪽 input-sandbox · 전송 두 번과 이력 짚기.
     정지 상태가 요청 1 을 보낸 뒤이므로 두 번 더 누르면 세 요청이 다 찬다 */
  await goto(page, 4);
  await shot(page, 'act-p04-a-rest.png');
  await page.click('#p4send');
  await park(page);
  await shot(page, 'act-p04-b-sent2.png');
  await page.click('#p4send');
  await park(page);
  await shot(page, 'act-p04-c-sent3.png');
  await page.hover('#p4log .p4it[data-k="2"]');
  await page.waitForTimeout(400);
  await shot(page, 'act-p04-d-hover.png');
  await page.click('#p4log .p4it[data-k="2"]');
  await park(page);
  await shot(page, 'act-p04-e-pin.png');
  /* 범례 행을 짚으면 그 구간에 교차 표시가 걸린다 */
  await page.click('body', { position: { x: 20, y: 1060 } });
  await page.waitForTimeout(200);
  await page.hover('.p4lg[data-k="b"]');
  await page.waitForTimeout(300);
  await shot(page, 'act-p04-f-legend-hover.png');

  /* 5쪽 drag-threshold · 슬라이더 끌기와 게이지 짚기 */
  await goto(page, 5);
  await shot(page, 'act-p05-a-rest.png');
  await drag(page, '#p5grip', 640);
  await park(page);
  await shot(page, 'act-p05-b-mid.png');
  await drag(page, '#p5grip', 640);
  await park(page);
  await shot(page, 'act-p05-c-full.png');
  await page.hover('#p5rail');
  await page.waitForTimeout(300);
  await shot(page, 'act-p05-d-hover.png');
  await page.click('#p5rail');
  await park(page);
  await shot(page, 'act-p05-e-pin.png');

  await page.close();
}

await browser.close();
console.log('\n캡처 위치  ' + OUT);
