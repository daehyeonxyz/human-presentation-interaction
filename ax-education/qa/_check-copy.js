/* 원고 대조 검사
   슬라이드원고.md 가 정한 화면 인쇄 글자가 실제 HTML 에 그대로 들어 있는지 본다.
   구현자가 문장을 발명하거나, 원고가 고쳐졌는데 화면이 안 따라간 곳을 잡는다.

   쓰는 법: node qa/_check-copy.js [deck.html]
   기본 대상은 deliverables/1교시.html 이다. */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECK = process.argv[2] || path.join(ROOT, 'deliverables', '1교시.html');
const SCRIPT = path.join(ROOT, '슬라이드원고.md');

/* 원고를 쪽 단위로 자른다 */
const md = fs.readFileSync(SCRIPT, 'utf8');
const pages = [];
md.split(/\n(?=## \d+쪽 · )/).forEach((blk) => {
  const m = blk.match(/^## (\d+)쪽 · (.+)/);
  if (!m) return;
  const lines = [];
  blk.split('\n').forEach((ln) => {
    if (!/^- /.test(ln)) return;            /* 인쇄 글자는 불릿으로만 적힌다 */
    let t = ln.replace(/^- /, '').trim();
    if (/^메모:/.test(t)) return;
    t = t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/_(.+?)_/g, '$1').replace(/`/g, '');
    if (!t) return;
    lines.push(t);
  });
  pages.push({ n: Number(m[1]), title: m[2], lines });
});

/* HTML 을 쪽 단위로 자르고 인쇄 글자만 남긴다 */
const html = fs.readFileSync(DECK, 'utf8');
const secs = html.split(/(?=<section class="slide)/).filter((s) => /^<section class="slide/.test(s));
const text = (s) => s
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<svg[\s\S]*?<\/svg>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]+>/g, '')            /* 태그를 경계 표시로 바꾼다 */
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

const norm = (s) => s.replace(/\s+/g, '').replace(//g, '');

let bad = 0;
pages.forEach((p) => {
  const sec = secs[p.n - 1];
  if (!sec) { console.log(`\n[${p.n}쪽] HTML 에 그 쪽이 없다`); bad++; return; }
  const body = norm(text(sec));
  const miss = p.lines.filter((l) => !body.includes(norm(l)));
  if (miss.length) {
    bad += miss.length;
    console.log(`\n[${p.n}쪽 ${p.title}] 원고에 있는데 화면에 없는 줄 ${miss.length}`);
    miss.forEach((l) => console.log('  · ' + l));
  }
});

console.log(`\n원고 ${pages.length}쪽 / HTML ${secs.length}쪽 / 어긋난 줄 ${bad}`);
process.exit(bad ? 1 : 0);
