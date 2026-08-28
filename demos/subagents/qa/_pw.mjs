/* playwright 를 레포 밖 설치본에서 찾아 온다. 이 레포에는 node_modules 가 없다.
   ax-education/qa/fluid-gate.mjs 의 탐색 방식을 그대로 쓴다. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function versionKey(v) {
  const s = String(v);
  const m = s.split(/[.\-+]/).slice(0, 3).map(Number);
  return (/-/.test(s) ? 0 : 1) * 1e12 + (m[0] || 0) * 1e6 + (m[1] || 0) * 1e3 + (m[2] || 0);
}

export async function playwright() {
  const roots = [];
  const local = process.env.LOCALAPPDATA;
  if (local) {
    const npx = path.join(local, 'npm-cache', '_npx');
    if (fs.existsSync(npx)) {
      for (const d of fs.readdirSync(npx)) roots.push(path.join(npx, d, 'node_modules', 'playwright'));
    }
  }
  const home = process.env.USERPROFILE || process.env.HOME;
  if (home && fs.existsSync(path.join(home, 'projects'))) {
    for (const d of fs.readdirSync(path.join(home, 'projects'))) {
      roots.push(path.join(home, 'projects', d, 'node_modules', 'playwright'));
    }
  }
  const found = [];
  for (const r of roots) {
    const pj = path.join(r, 'package.json');
    if (!fs.existsSync(pj) || !fs.existsSync(path.join(r, 'index.mjs'))) continue;
    try { found.push({ dir: r, v: JSON.parse(fs.readFileSync(pj, 'utf8')).version }); }
    catch (e) { /* 건너뛴다 */ }
  }
  found.sort((a, b) => versionKey(b.v) - versionKey(a.v));
  for (const f of found) {
    try { return await import(pathToFileURL(path.join(f.dir, 'index.mjs')).href); }
    catch (e) { /* 다음 후보 */ }
  }
  throw new Error('playwright 를 못 찾았다');
}

export const PAGES = 6;
