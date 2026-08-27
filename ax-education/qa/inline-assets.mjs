#!/usr/bin/env node
/* 자산을 base64 로 배포본 HTML 안에 넣는다.

     node qa/inline-assets.mjs            # deliverables/*.html 전부
     node qa/inline-assets.mjs 1교시.html # 하나만

   스킬 계약이 "빌드 없이 file:// 로 열리는 자기완결 파일" 이라 형제 폴더 참조를 남기지 않는다.
   HTML 하나만 옮겨도 서체와 로고와 표지 사진이 그대로 나와야 한다.

   `/* asset: 이름 * /` 주석 바로 다음의 첫 url(...) 이 바꿔 넣는 대상이다.
   base64 는 따옴표를 담지 않으므로 이미 인라인된 파일에도 같은 규칙이 걸린다.
   그래서 되풀이해 돌려도 결과가 같고, 서브셋을 다시 만든 뒤 그대로 다시 돌리면 된다.

   서체 서브셋은 qa/subset-font.py 가 먼저 만든다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DELIV = path.join(ROOT, 'deliverables');

const ASSETS = {
  'pretendard': ['assets/webfonts/PretendardVariable-subset.woff2', 'font/woff2'],
  'sharp-regular': ['assets/webfonts/SamsungSharpSans-Regular-subset.woff2', 'font/woff2'],
  'sharp-medium': ['assets/webfonts/SamsungSharpSans-Medium-subset.woff2', 'font/woff2'],
  'sharp-bold': ['assets/webfonts/SamsungSharpSans-Bold-subset.woff2', 'font/woff2'],
  'wordmark-white': ['assets/lettermark/White/Samsung_Orig_Wordmark_WHITE_RGB.png', 'image/png'],
  'wordmark-blue': ['assets/lettermark/Blue/Samsung_Orig_Wordmark_BLUE_RGB.png', 'image/png'],
  'wordmark-black': ['assets/lettermark/Black/Samsung_Orig_Wordmark_BLACK_RGB.png', 'image/png'],
  'cover-bg': ['assets/cover-bg.jpg', 'image/jpeg']
};

const dataUri = (rel, mime) =>
  'data:' + mime + ';base64,' + fs.readFileSync(path.join(ROOT, rel)).toString('base64');

function inline(file) {
  const abs = path.join(DELIV, file);
  let html = fs.readFileSync(abs, 'utf8');
  const before = html.length;
  const done = [];

  for (const [name, [rel, mime]] of Object.entries(ASSETS)) {
    if (!fs.existsSync(path.join(ROOT, rel))) { console.log('  없음  ' + rel); continue; }
    const re = new RegExp('(/\\* asset: ' + name + ' \\*/[\\s\\S]{0,600}?url\\()"[^"]*"(\\))');
    if (!re.test(html)) { console.log('  표시 못 찾음  ' + name); continue; }
    html = html.replace(re, (m, a, b) => a + '"' + dataUri(rel, mime) + '"' + b);
    done.push(name);
  }

  fs.writeFileSync(abs, html);
  const left = [...html.matchAll(/url\(\s*["']?(?!data:)([^"')]+)["']?\s*\)/g)].map(m => m[1]);
  const remote = [...html.matchAll(/@import|https?:\/\/[^\s"')]+/g)].map(m => m[0]);

  console.log(file);
  console.log('  넣은 자산 ' + done.length + '개 · ' +
    (before / 1024).toFixed(0) + ' KB -> ' + (html.length / 1024).toFixed(0) + ' KB');
  console.log('  남은 외부 url() ' + left.length + '건' + (left.length ? ' · ' + left.join(', ') : ''));
  console.log('  남은 원격 참조 ' + remote.length + '건' + (remote.length ? ' · ' + remote.join(', ') : ''));
  return left.length === 0 && remote.length === 0;
}

const args = process.argv.slice(2);
const files = args.length ? args : fs.readdirSync(DELIV).filter(f => f.endsWith('.html'));
let ok = true;
for (const f of files) ok = inline(f) && ok;
console.log(ok ? '\n자기완결 통과' : '\n자기완결 실패');
process.exit(ok ? 0 : 1);
