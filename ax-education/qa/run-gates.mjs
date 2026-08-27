#!/usr/bin/env node
/* 정지 상태 클릭 가능성 게이트와 finish/step 끝 상태 일치 게이트를 실제로 돌리는 러너.
   node qa/run-gates.mjs [쪽번호...]

   - deliverables/1교시.html 을 file:// 로 1920x1080 headless chromium 에 연다.
   - Pretendard 는 dynamic subset 이라 document.fonts.load() 로 실제 글자를 지정해
     명시적으로 불러야 내려온다. document.fonts.check 는 한글에 오탐을 내므로 쓰지 않는다.
     로드는 폭 삼각측량으로 확인한다.
   - window.still() 로 등장을 끈 뒤 2쪽부터 14쪽까지 돌면서 두 프로브를 넣어 돌리고
     정지 상태 스크린샷을 qa/gates/pNN-rest.png 로 남긴다.
   - 결과는 표준출력에 표로 찍는다. JSON 파일은 쓰지 않는다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECK = path.join(ROOT, 'deliverables', '1교시.html');
const OUT = path.join(HERE, 'gates');

/* ===== playwright 찾기 =====
   이 폴더에는 node_modules 가 없다. 설치된 곳을 훑어 가장 높은 판을 쓴다.
   PLAYWRIGHT_DIR 로 직접 지정할 수 있다 */
function versionKey(v) {
  const s = String(v);
  const m = s.split(/[.\-+]/).slice(0, 3).map(Number);
  /* 정식판을 먼저 쓴다. alpha 판은 브라우저가 안 깔려 있는 경우가 있다 */
  const pre = /-/.test(s) ? 0 : 1;
  return pre * 1e12 + (m[0] || 0) * 1e6 + (m[1] || 0) * 1e3 + (m[2] || 0);
}
/* 쓸 수 있는 playwright 를 좋은 순서로 늘어놓는다. 브라우저가 안 깔린 설치가 있어서
   부르는 쪽이 실제 launch 로 확인하고 다음 후보로 넘어간다 */
async function playwrightCandidates() {
  const list = [];
  const push = async (dir, label) => {
    const entry = path.join(dir, 'index.mjs');
    if (!fs.existsSync(entry)) return;
    try { list.push({ mod: await import(pathToFileURL(entry).href), from: label }); } catch (e) { /* 건너뛴다 */ }
  };
  if (process.env.PLAYWRIGHT_DIR) await push(process.env.PLAYWRIGHT_DIR, process.env.PLAYWRIGHT_DIR);
  try { list.push({ mod: await import('playwright'), from: 'playwright (resolved)' }); } catch (e) { /* 건너뛴다 */ }

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
    if (!fs.existsSync(pj)) continue;
    try {
      const v = JSON.parse(fs.readFileSync(pj, 'utf8')).version;
      if (fs.existsSync(path.join(r, 'index.mjs'))) found.push({ dir: r, v });
    } catch (e) { /* 건너뛴다 */ }
  }
  found.sort((a, b) => versionKey(b.v) - versionKey(a.v));
  for (const f of found) await push(f.dir, f.dir + ' (v' + f.v + ')');
  if (!list.length) throw new Error('playwright 를 못 찾았다');
  return list;
}

/* ===== 표 ===== */
function w(s) {                                   /* 한글은 두 칸으로 센다 */
  let n = 0;
  for (const ch of String(s)) n += /[ᄀ-ᇿ　-〿가-힯＀-￯]/.test(ch) ? 2 : 1;
  return n;
}
function pad(s, n, right) {
  const gap = Math.max(0, n - w(s));
  return right ? ' '.repeat(gap) + s : s + ' '.repeat(gap);
}
function table(head, rows, align) {
  const cols = head.map((h, i) => Math.max(w(h), ...rows.map(r => w(r[i] == null ? '' : r[i]))));
  const line = (r) => r.map((c, i) => pad(c == null ? '' : String(c), cols[i], align[i] === 'r')).join('  ');
  const out = [line(head), cols.map(c => '-'.repeat(c)).join('  ')];
  rows.forEach(r => out.push(line(r)));
  return out.join('\n');
}

/* finish 검사의 판정 한 줄.
   step 이 멎는 쪽만 곧바로 견주고, 한 바퀴 도는 쪽은 몇 번째 화면인지로 적는다 */
function verdict(f) {
  if (f.same) return f.idempotent ? '같다' : '같다(멱등X)';
  if (f.terminal === 'cycled') {
    if (f.reachable >= 1) return '경로 ' + f.reachable + '/' + (f.seenCount - 1) + '(한 바퀴)';
    return '다르다(한 바퀴)';
  }
  if (f.terminal === 'none') return '다르다(끝없음)';
  return '다르다';
}

const FONT_SPEC = [
  { key: 'ko', label: 'Pretendard "가" 100px', want: 86.44 },
  { key: 'sharp', label: 'SamsungSharpSans "H" 700', want: 63.61 },
  { key: 'pre', label: 'Pretendard "H" 700', want: 71.94 },
  { key: 'serif', label: 'serif "H" 700', want: 78.52 }
];

async function main() {
  if (!fs.existsSync(DECK)) throw new Error('덱이 없다: ' + DECK);
  fs.mkdirSync(OUT, { recursive: true });

  const cands = await playwrightCandidates();
  let browser = null, from = '';
  const launchErr = [];
  for (const c of cands) {
    try {
      browser = await c.mod.chromium.launch({ headless: true });
      from = c.from;
      break;
    } catch (e) { launchErr.push(c.from + ' → ' + String(e.message).split('\n')[0]); }
  }
  if (!browser) throw new Error('chromium 을 못 띄웠다:\n  ' + launchErr.join('\n  '));
  console.log('playwright: ' + from);

  const argPages = process.argv.slice(2).map(Number).filter(n => n >= 2 && n <= 14);
  const pages = argPages.length ? argPages : Array.from({ length: 13 }, (_, i) => i + 2);

  const affordSrc = fs.readFileSync(path.join(HERE, '_probe-afford.js'), 'utf8');
  const finishSrc = fs.readFileSync(path.join(HERE, '_probe-finish.js'), 'utf8');

  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(180000);
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)));
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push('console: ' + m.text()); });

  await page.goto(pathToFileURL(DECK).href, { waitUntil: 'load' });

  /* ===== 서체를 명시적으로 불러 폭 삼각측량으로 확인한다 ===== */
  const font = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    const ko = (stage ? stage.textContent : '').replace(/\s+/g, '') + '가나다라마바사아자차카타파하';
    const en = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·:/%().,';
    const jobs = [];
    [400, 500, 700, 800].forEach((weight) => {
      jobs.push(document.fonts.load(weight + ' 100px "Pretendard Variable"', ko + en));
      jobs.push(document.fonts.load(weight + ' 100px Pretendard', ko + en));
    });
    [400, 500, 700].forEach((weight) => {
      jobs.push(document.fonts.load(weight + ' 100px "Samsung Sharp Sans"', en));
    });
    await Promise.all(jobs.map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const cv = document.createElement('canvas').getContext('2d');
    const m = (f, t) => { cv.font = f; return Math.round(cv.measureText(t).width * 100) / 100; };
    return {
      faces: jobs.length,
      ko: m('100px "Pretendard Variable"', '가'),
      sharp: m('700 100px "Samsung Sharp Sans"', 'H'),
      pre: m('700 100px "Pretendard Variable"', 'H'),
      serif: m('700 100px serif', 'H')
    };
  });

  const fontRows = FONT_SPEC.map((f) => {
    const got = font[f.key];
    const ok = Math.abs(got - f.want) <= 0.5;
    return [f.label, String(f.want), String(got), ok ? 'ok' : 'FAIL'];
  });
  const fontOk = fontRows.every((r) => r[3] === 'ok');
  console.log('\n=== 서체 로드 (폭 삼각측량, 100px 기준 · ±0.5) ===');
  console.log(table(['재는 것', '기대', '잰 값', ''], fontRows, ['l', 'r', 'r', 'l']));
  if (!fontOk) console.log('! 서체가 기대값과 다르다. 아래 측정은 그 상태에서 잰 것이다.');

  await page.evaluate(() => { window.still(); });
  await page.addScriptTag({ content: affordSrc });
  await page.addScriptTag({ content: finishSrc });

  const rows = [];
  const detail = [];
  for (const n of pages) {
    await page.evaluate((p) => { go(p - 1); }, n);
    await page.waitForTimeout(700);               /* 떠난 쪽의 reset(420) 이 끝난 뒤 */
    await page.evaluate((p) => {
      const t = (typeof PAGE !== 'undefined') ? PAGE : (window.PAGE || {});
      if (t[p] && t[p].reset) t[p].reset();
    }, n);
    await page.waitForTimeout(320);               /* 면 색 전환이 끝난 뒤에 잰다 */

    const afford = await page.evaluate(() => window.__probeAfford());
    await page.screenshot({ path: path.join(OUT, 'p' + String(n).padStart(2, '0') + '-rest.png') });

    const finish = await page.evaluate((p) => window.__probeFinish(p), n);
    const box = await page.evaluate(() => ({
      h: document.documentElement.scrollHeight,
      w: document.documentElement.scrollWidth
    }));

    const finishMark = finish.skip ? finish.skip : verdict(finish);
    rows.push([
      String(n),
      String(afford.pass == null ? '-' : afford.pass),
      String(afford.fail ? afford.fail.length : '-'),
      String(afford.skip ? afford.skip.length : '-'),
      finishMark,
      finish.skip ? '-' : String(finish.timers),
      String(box.h),
      String(box.w)
    ]);
    detail.push({ n, afford, finish, box });
    process.stderr.write('  ' + n + '쪽 잼\n');
  }

  console.log('\n=== 쪽마다 ===');
  console.log(table(
    ['쪽', 'afford pass', 'fail', 'skip', 'finish 일치', '남은 예약', 'scrollH', 'scrollW'],
    rows,
    ['r', 'r', 'r', 'r', 'l', 'r', 'r', 'r']
  ));

  /* ===== 실패한 것만 다시 ===== */
  console.log('\n=== 실패한 것만 ===');
  let any = false;
  for (const d of detail) {
    const a = d.afford, f = d.finish;
    const lines = [];
    if (a.fail && a.fail.length) {
      lines.push('  정지 상태 클릭 가능성 ' + a.fail.length + '건');
      a.fail.forEach((x) => lines.push('    · ' + x.cls + ' | ' + x.why + ' | "' + x.t + '"'));
    }
    if (a.pointer === 0) {
      lines.push('  이 쪽에 cursor: pointer 인 요소가 하나도 없다 (warn · 표지 말고는 조작이 있어야 한다)');
    }
    if (a.tray && a.tray.length) {
      lines.push('  우물 트레이 안의 면 없는 고르기 줄 ' + a.tray.length + '건 (warn · 통과 셋 밖이지만 트레이 절이 허용한다)');
      a.tray.forEach((x) => lines.push('    · ' + x.cls + ' | "' + x.t + '"'));
    }
    if (a.lockWarn && a.lockWarn.length) {
      lines.push('  잠긴 것에 --ring-locked 없음 ' + a.lockWarn.length + '건 (warn)');
      a.lockWarn.forEach((x) => lines.push('    · ' + x.cls + ' | box-shadow: ' + (x.shadow || 'none')));
    }
    if (f.skip) {
      lines.push('  finish 검사 건너뜀 · ' + f.skip);
    } else {
      const how = f.terminal === 'converged' ? 'step ' + f.steps + '회에 멎었다'
        : (f.terminal === 'cycled' ? 'step ' + f.steps + '회에 한 바퀴 돌았다'
          : 'step ' + f.steps + '회에도 멎지도 돌지도 않았다');
      if (!f.same && f.terminal === 'cycled' && f.reachable >= 1) {
        lines.push('  finish() 가 step 경로의 ' + f.reachable + '/' + (f.seenCount - 1) +
          '번째 화면이다 (warn · ' + how + '. 끝 상태가 하나로 정해지지 않으므로 눈으로 가른다)');
      } else if (!f.same) {
        lines.push('  finish() 가 step() 끝 상태와 다르다 (' + how + ')');
        if (f.terminal === 'none') {
          lines.push('    step 이 끝나지 않는 쪽이라 A 는 40회째 화면이다. 견줌 자체가 미덥지 않다');
        }
        if (f.diff) {
          lines.push('    처음 갈리는 곳 ' + f.diff.at + ' (A ' + f.diff.lenA + '자 · B ' + f.diff.lenB + '자)');
          lines.push('    A: ' + JSON.stringify(f.diff.a));
          lines.push('    B: ' + JSON.stringify(f.diff.b));
        }
      }
      if (!f.idempotent) {
        lines.push('  finish() 를 두 번 부르면 화면이 달라진다 (멱등 아님)');
        if (f.diffIdem) {
          lines.push('    처음 갈리는 곳 ' + f.diffIdem.at +
            ' (한 번 ' + f.diffIdem.lenA + '자 · 두 번 ' + f.diffIdem.lenB + '자)');
          lines.push('    한 번: ' + JSON.stringify(f.diffIdem.a));
          lines.push('    두 번: ' + JSON.stringify(f.diffIdem.b));
        }
      }
      if (f.timers) lines.push('  finish() 직후 남은 예약 ' + f.timers + '개');
      if (f.restless) lines.push('  step() 뒤 화면이 상한 안에 멎지 않았다 (warn)');
      if (f.budgetHit) lines.push('  step 되풀이가 시간 상한에 걸렸다 (warn)');
    }
    if (lines.length) {
      any = true;
      console.log('\n[' + d.n + '쪽]');
      lines.forEach((l) => console.log(l));
    }
  }
  if (!any) console.log('  없다.');

  if (pageErrors.length) {
    console.log('\n=== 페이지 오류 ===');
    [...new Set(pageErrors)].slice(0, 20).forEach((e) => console.log('  · ' + e));
  }

  console.log('\n스크린샷: ' + OUT);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
