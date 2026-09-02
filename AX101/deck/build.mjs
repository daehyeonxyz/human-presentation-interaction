/* node deck/build.mjs → AX101.html (자기완결). 서체 서브셋을 본문 글자로 다시 만들고, 서체와 사진을 base64로 싣는다 */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { spawnSync } from 'node:child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..');
const r = (p) => fs.readFileSync(p, 'utf8');
const MIME = { woff2: 'font/woff2', jpg: 'image/jpeg', png: 'image/png' };
const data = (rel) => { const abs = path.resolve(HERE, rel); const ext = abs.split('.').pop(); return 'data:' + MIME[ext] + ';base64,' + fs.readFileSync(abs).toString('base64'); };
let css = r(path.join(HERE, 'styles.css')), html = r(path.join(HERE, 'slides.html')), js = r(path.join(HERE, 'app.js'));

/* 서체 서브셋: 세 파일에 나오는 글자 전부 + 숫자·기호 여유분 */
const FULL = [process.env.PRETENDARD, path.join(ROOT, 'assets/fonts/PretendardVariable.woff2'), '/tmp/claude-0/-home-user-human-presentation-interaction/28cb46d8-dce6-5669-b12c-79a57ee17600/scratchpad/font/web/variable/woff2/PretendardVariable.woff2'].filter(p => p && fs.existsSync(p))[0];
const SUB = path.join(ROOT, 'assets/fonts/PretendardVariable-subset.woff2');
const GLY = path.join(ROOT, 'assets/fonts/glyphs.txt');
const chars = new Set((html + css + js + ' 0123456789%원토큰단어개번째·→←↓↑×✓▾▸?!.,:;()[]{}"\'“”‘’…-+=/#').replace(/\s+/g, ''));
const text = [...chars].join('');
if (FULL) {
  fs.writeFileSync(GLY, text);
  const res = spawnSync('python3', ['-c', `
from fontTools import subset
opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
f = subset.load_font(${JSON.stringify(FULL)}, opts)
s = subset.Subsetter(opts); s.populate(text=open(${JSON.stringify(GLY)}, encoding='utf-8').read()); s.subset(f)
subset.save_font(f, ${JSON.stringify(SUB)}, opts); print('glyphs', f['maxp'].numGlyphs)`], { encoding: 'utf8' });
  console.log('font subset:', (res.stdout || '').trim(), (res.stderr || '').trim().split('\n').slice(-1)[0] || '');
} else console.log('font subset skipped: full font not found');

const face = fs.existsSync(SUB) ? `@font-face{font-family:"Pretendard Variable";src:url("${data('../assets/fonts/PretendardVariable-subset.woff2')}") format("woff2");font-weight:45 920;font-display:block}\n` : '';
html = html.replace(/(src="|url\(')(\.\.\/assets\/[^"')]+)/g, (m, a, p) => a + data(p));
const out = `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AX 101 · Claude Zero to One</title>\n<style>\n${face}${css}\n</style></head>\n<body>\n${html}\n<script>\n${js}\n</script>\n</body></html>\n`;
fs.writeFileSync(path.join(ROOT, 'AX101.html'), out);
const left = [...out.matchAll(/(?:src=|url\()["']?(?!data:)(\.\.\/[^"')]+)/g)].map(m => m[1]);
console.log('wrote AX101.html', Math.round(out.length / 1024) + 'KB', 'unresolved', left.length, left.slice(0, 3));
