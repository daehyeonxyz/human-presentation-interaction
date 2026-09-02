/* node deck/build.mjs → AX101.html (자기완결). 서체와 사진을 base64로 싣는다 */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '..');
const r = (p) => fs.readFileSync(p, 'utf8');
const MIME = { woff2: 'font/woff2', jpg: 'image/jpeg', png: 'image/png' };
const data = (rel) => { const abs = path.resolve(HERE, rel); const ext = abs.split('.').pop(); return 'data:' + MIME[ext] + ';base64,' + fs.readFileSync(abs).toString('base64'); };
let css = r(path.join(HERE, 'styles.css')), html = r(path.join(HERE, 'slides.html')), js = r(path.join(HERE, 'app.js'));
const font = path.join(ROOT, 'assets/fonts/PretendardVariable-subset.woff2');
const face = fs.existsSync(font) ? `@font-face{font-family:"Pretendard Variable";src:url("${data('../assets/fonts/PretendardVariable-subset.woff2')}") format("woff2");font-weight:45 920;font-display:block}\n` : '';
html = html.replace(/(src="|url\(')(\.\.\/assets\/[^"')]+)/g, (m, a, p) => a + data(p));
const out = `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AX 101 · Claude Zero to One</title>\n<style>\n${face}${css}\n</style></head>\n<body>\n${html}\n<script>\n${js}\n</script>\n</body></html>\n`;
fs.writeFileSync(path.join(ROOT, 'AX101.html'), out);
const left = [...out.matchAll(/(?:src=|url\()["']?(?!data:)(\.\.\/[^"')]+)/g)].map(m => m[1]);
console.log('wrote AX101.html', Math.round(out.length / 1024) + 'KB', 'unresolved', left.length, left.slice(0, 3));
