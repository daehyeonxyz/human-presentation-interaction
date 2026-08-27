#!/usr/bin/env node
/* 자기완결 검사. 형제 폴더가 없는 곳에 HTML 하나만 두고 연다.

     node qa/selfcontained-gate.mjs

   같은 폴더 옆에 assets/ 가 있으면 인라인이 실패해도 상대 경로가 살아서 화면이 멀쩡히 뜬다.
   그래서 임시 폴더에 파일 하나만 복사해 놓고 재야 한다.

   서체가 성한지는 폭 삼각측량으로 확인한다. 문서 서체와 폴백 서체로 같은 글자를 재서
   폭이 다르면 서브셋이 걸린 것이고 같으면 폴백으로 내려간 것이다.
   document.fonts.check() 는 한글에 거짓 음성을 내므로 쓰지 않는다. */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playwright, DECK_FILE } from './_pw.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', DECK_FILE);

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
}

/* 파일에 남은 외부 참조를 먼저 센다 */
const html = fs.readFileSync(DECK, 'utf8');
const left = [...html.matchAll(/url\(\s*["']?(?!data:)([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
const remote = [...html.matchAll(/@import|https?:\/\/[^\s"')]+/g)].map((m) => m[0]);
check('외부 url() 0건', left.length === 0, left.join(', '));
check('원격 참조 0건', remote.length === 0, remote.join(', '));

/* 형제 폴더가 없는 임시 폴더에 파일 하나만 놓는다 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-'));
const solo = path.join(tmp, 'solo.html');
fs.copyFileSync(DECK, solo);

const pw = await playwright();
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const blocked = [];
/* file:// 이동 자체가 막히지 않도록 http 와 https 를 따로 건다 */
await page.route('http://**', (r) => { blocked.push(r.url()); r.abort(); });
await page.route('https://**', (r) => { blocked.push(r.url()); r.abort(); });
await page.goto(pathToFileURL(solo).href, { waitUntil: 'load' });
await page.evaluate('document.fonts.ready');

const m = await page.evaluate(`(() => {
  const cv = document.createElement('canvas').getContext('2d');
  const at = (font, s) => { cv.font = font; return cv.measureText(s).width; };
  return {
    ko_deck: at('700 100px "Pretendard Variable"', '가'),
    ko_fallback: at('700 100px sans-serif', '가'),
    la_deck: at('700 100px "Pretendard Variable"', 'H'),
    la_fallback: at('700 100px sans-serif', 'H'),
    family: getComputedStyle(document.querySelector('.ptitle') ||
      document.body).fontFamily
  };
})()`);

check('한글이 문서 서체로 그려진다',
  Math.abs(m.ko_deck - m.ko_fallback) > 0.5,
  `Pretendard "가" ${m.ko_deck.toFixed(2)} / 폴백 ${m.ko_fallback.toFixed(2)}`);
check('라틴이 문서 서체로 그려진다',
  Math.abs(m.la_deck - m.la_fallback) > 0.5,
  `Pretendard "H" ${m.la_deck.toFixed(2)} / 폴백 ${m.la_fallback.toFixed(2)}`);
check('막힌 원격 요청 0건', blocked.length === 0, blocked.join(', '));

await page.close();
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length}건 중 실패 ${bad.length}건  ·  파일 ${(html.length / 1024).toFixed(0)} KB`);
process.exit(bad.length ? 1 : 0);
