#!/usr/bin/env node
/* 덱을 조립하고 자산을 base64 로 인라인한다.
     node qa/build.mjs
   입력: qa/build/deck.css · qa/build/body.html · qa/build/deck.js · tokens.css
   출력: deliverables/AX101.html (자기완결 단일 HTML)
   tokens.css 의 url("../assets/...") 과 body 의 src="../assets/..." 를 전부 data: 로 바꾼다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const B = path.join(HERE, 'build');
const read = (p) => fs.readFileSync(p, 'utf8');
const MIME = { woff2: 'font/woff2', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml' };
function data(rel) {
  const abs = path.resolve(path.join(ROOT, 'deliverables'), rel);
  const ext = abs.split('.').pop().toLowerCase();
  return 'data:' + MIME[ext] + ';base64,' + fs.readFileSync(abs).toString('base64');
}
let tokens = read(path.join(ROOT, 'tokens.css'));
let css = read(path.join(B, 'deck.css'));
let body = read(path.join(B, 'body.html'));
let js = read(path.join(B, 'deck.js'));
const inlineUrls = (s) => s.replace(/url\(\s*["']?(\.\.\/assets\/[^"')]+)["']?\s*\)/g, (m, p) => 'url("' + data(p) + '")');
tokens = inlineUrls(tokens); css = inlineUrls(css);
body = body.replace(/src="(\.\.\/assets\/[^"]+)"/g, (m, p) => 'src="' + data(p) + '"');
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AX 101 · Claude Zero to One</title>
<style>
${tokens}
${css}
</style>
</head>
<body>
${body}
<script>
${js}
</script>
</body>
</html>
`;
fs.mkdirSync(path.join(ROOT, 'deliverables'), { recursive: true });
const out = path.join(ROOT, 'deliverables', 'AX101.html');
fs.writeFileSync(out, html);
const left = [...html.matchAll(/url\(\s*["']?(?!data:)([^"')]+)["']?\s*\)/g)].map(m => m[1]);
const remote = [...html.matchAll(/https?:\/\/[^\s"')<]+/g)].map(m => m[0]);
console.log('wrote', out, (html.length / 1024).toFixed(0) + ' KB', '남은 외부 url', left.length, '원격 참조', remote.length);
if (left.length || remote.length) { console.log(left, remote); process.exit(1); }
