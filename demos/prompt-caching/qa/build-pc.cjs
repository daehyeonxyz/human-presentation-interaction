/* 프롬프트 캐싱 덱을 벤토 프레임으로 다시 짓는다.
   덱 1 의 골격 CSS 와 공통 스크립트를 그대로 가져와 쓰고 쪽 CSS 와 본문과 쪽 스크립트만 이 파일이 갖는다.
     node qa/build-pc.cjs   (demos/prompt-caching 에서 실행한다)
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..', '..');

const deck1 = fs.readFileSync(path.join(REPO, 'demos/subagents/deliverables/서브에이전트와-병렬-작업.html'), 'utf8');
const skeleton = deck1.slice(
  deck1.indexOf('/* ===================== 골격 ====================='),
  deck1.indexOf('/* ===================== 1쪽 · 표지 ====================='));
const commonJs = deck1.slice(
  deck1.indexOf('<script>'),
  deck1.indexOf('/* ===== 2쪽은 등급 0 정지다'));

const tokens = fs.readFileSync(path.join(ROOT, 'tokens.css'), 'utf8');
const root = tokens.slice(tokens.indexOf(':root {'));

const pageCss = fs.readFileSync(path.join(__dirname, 'pc-pages.css'), 'utf8');
const body = fs.readFileSync(path.join(__dirname, 'pc-body.html'), 'utf8');
const pageJs = fs.readFileSync(path.join(__dirname, 'pc-pages.js'), 'utf8');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>프롬프트 캐싱과 비용</title>
<style>
/* 서체. 이 덱이 실제로 쓰는 글자만 남긴 Pretendard 가변 서브셋 하나다.
   qa/subset-font.py 가 만들고 qa/inline-assets.mjs 가 base64 로 넣는다.
   가변 축을 굳히지 않는다. 500 과 700 과 800 을 다 쓰므로 한 점으로 굳히면 위계가 무너진다 */
@font-face {
  font-family: "Pretendard Variable";
  font-weight: 45 920;
  font-style: normal;
  font-display: block;
  /* asset: pretendard */
  src: url("../assets/webfonts/PretendardVariable-subset.woff2") format("woff2");
}

/* ============================================================
   값의 단일 원본은 ../tokens.css 다. 아래는 그 파일의 복사본이고
   qa/gates.mjs 의 토큰 일치 검사가 두 곳이 갈라지면 실패를 낸다.
   ============================================================ */
${root}
${skeleton}${pageCss}</style>
</head>
<body>
<div class="viewport" id="viewport" data-canvas="dark"><div class="stage" id="stage">
${body}
</div></div>

${commonJs}${pageJs}`;

fs.writeFileSync(path.join(ROOT, 'deliverables', '프롬프트-캐싱과-비용.html'), html);
console.log('덱 2 를 다시 지었다 · ' + html.length + '자');
