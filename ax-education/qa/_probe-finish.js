/* finish() 와 step() 끝 상태 일치 검사 (7차 검토에서 더한 필수 게이트)

   End 는 시간이 없거나 조작이 실패했을 때 발표자가 쓰는 마지막 수단이다.
   그 화면이 조작을 끝까지 한 화면과 다르면 그 쪽은 무대에서 쓸 수 없다.

   재는 방법
   - reset() 뒤에 step() 을 슬라이드 innerHTML 이 더 이상 달라지지 않을 때까지 부른다 (상한 40회).
     그 innerHTML 이 A 다. step() 이 예약(setTimeout)을 쓰는 쪽이 있으므로 step 사이에 쉬어야 한다.
     그래서 이 함수는 async 이고, 한 번 부를 때마다 innerHTML 이 멎을 때까지 기다린다.

   step 이 멎지 않는 쪽이 있다. 끝에 닿으면 처음으로 돌아가는 전진 판과 두 상태를 오가는
   뒤집기 판이다. 그런 쪽은 끝 상태가 DOM 만으로는 하나로 정해지지 않으므로 갈래를 나눠 알린다.
     terminal 'converged'  step 이 멎었다. A 와 B 를 곧바로 견준다
     terminal 'cycled'     앞서 본 화면이 다시 나왔다. A 는 되풀이 직전 화면이고,
                           B 가 step 이 지나온 화면 가운데 하나이면 몇 번째인지 낸다
     terminal 'none'       상한 40 회 안에 멎지도 돌지도 않았다. 견줌이 미덥지 않다
   - reset() 뒤에 finish() 를 한 번 부르고 같은 프레임에서 innerHTML 을 뜬다. 그것이 B 다.
     finish() 쪽은 기다리지 않고 바로 재는 것이 이 검사의 요지다.
     finish() 는 예약 없이 마지막 상태를 그 자리에 세워야 하므로 기다려 줄 이유가 없다.
   - A 와 B 를 견주고, 다르면 처음 갈리는 위치와 그 앞뒤 120자를 함께 낸다.
   - finish() 를 두 번 불러도 같은 화면인지(멱등) 본다.
   - finish() 직후 그 쪽의 예약 목록(TIMERS[pageNo]) 길이를 낸다. 0 이 아니면 실패다.

   예약 목록에 대해 하나 · TIMERS 는 이미 끝난 예약도 지우지 않고 쌓아 둔다.
   그래서 B 를 재기 직전에 clearLater(pageNo) 로 목록을 비우고 finish() 를 부른다.
   그렇게 해야 세는 값이 "finish() 가 스스로 건 예약" 이 된다.

   전제: window.still() 로 등장을 끈 뒤 부른다. 잰 뒤에는 그 쪽을 정지 상태로 되돌려 놓는다. */

window.__probeFinish = async function (pageNo, opt) {
  const O = opt || {};
  const POLL = O.poll || 80;            /* 폴링 간격 */
  const STABLE = O.stable || 3;         /* 몇 번 연속 같아야 멎은 것으로 보나 */
  const SETTLE_MAX = O.settleMax || 3000;
  const BUDGET = O.budget || 40000;     /* step 되풀이 전체 시간 상한 */
  const MAX_STEP = 40;

  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const slide = document.querySelector('.slide[data-page="' + pageNo + '"]') || slides[pageNo - 1];
  if (!slide) return { 쪽: pageNo, skip: '그 쪽이 없다' };

  const table = (typeof PAGE !== 'undefined') ? PAGE : (window.PAGE || {});
  const P = table[pageNo];
  if (!P) return { 쪽: pageNo, skip: '그 쪽에 PAGE 가 없다' };
  const T = (typeof TIMERS !== 'undefined') ? TIMERS : (window.TIMERS || null);

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function timers() { return (T && T[pageNo]) ? T[pageNo].length : 0; }
  function clearPage() {
    try { if (typeof clearLater === 'function') clearLater(pageNo); } catch (e) { /* 건너뛴다 */ }
  }
  function reset() { try { if (P.reset) P.reset(); } catch (e) { /* 건너뛴다 */ } }

  /* innerHTML 이 멎을 때까지 기다린다 */
  async function settle() {
    let last = slide.innerHTML, same = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < SETTLE_MAX) {
      await sleep(POLL);
      const now = slide.innerHTML;
      if (now === last) {
        same += 1;
        if (same >= STABLE) return true;
      } else { same = 0; last = now; }
    }
    return false;                        /* 상한 안에 안 멎었다 */
  }

  function firstDiff(a, b) {
    if (a === b) return null;
    let i = 0;
    const n = Math.min(a.length, b.length);
    while (i < n && a.charCodeAt(i) === b.charCodeAt(i)) i += 1;
    const s = Math.max(0, i - 120);
    return {
      at: i,
      lenA: a.length,
      lenB: b.length,
      a: a.slice(s, i + 120),
      b: b.slice(s, i + 120)
    };
  }

  /* ===== A · step() 을 끝까지 ===== */
  clearPage();
  reset();
  await settle();

  let steps = 0, converged = false, cycled = false, budgetHit = false, restless = false;
  const seen = [slide.innerHTML];
  let A = seen[0];
  const t0 = performance.now();
  if (typeof P.step === 'function') {
    while (steps < MAX_STEP) {
      const before = slide.innerHTML;
      try { P.step(); } catch (e) { break; }
      steps += 1;
      if (!(await settle())) restless = true;
      const now = slide.innerHTML;
      if (now === before) { converged = true; A = now; break; }
      /* 되풀이 조작은 끝에 닿으면 처음으로 돌아간다 (전진 판의 "다시" 가 그렇다).
         그런 쪽은 step 이 멎지 않으므로, 앞서 본 화면이 다시 나오면 한 바퀴 돈 것으로 보고
         그 직전 화면을 끝 상태로 잡는다. 이렇게 하지 않으면 A 가 도중 상태로 잡힌다 */
      if (seen.indexOf(now) >= 0) { cycled = true; A = before; break; }
      seen.push(now);
      A = now;
      if (performance.now() - t0 > BUDGET) { budgetHit = true; break; }
    }
  }

  /* ===== B · finish() 한 번, 같은 프레임에서 ===== */
  clearPage();
  reset();
  await settle();
  clearPage();                            /* 여기부터 쌓이는 예약만 센다 */

  let B = A, B2 = A, timersAfter = 0, finishOk = true;
  if (typeof P.finish === 'function') {
    try { P.finish(); } catch (e) { finishOk = false; }
    B = slide.innerHTML;
    timersAfter = timers();
    try { P.finish(); } catch (e) { finishOk = false; }
    B2 = slide.innerHTML;
  } else {
    finishOk = false;
  }

  /* 잰 뒤에는 그 쪽을 정지 상태로 되돌린다 */
  clearPage();
  reset();
  await sleep(160);
  clearPage();

  const same = (A === B);
  const idem = (B2 === B);
  const terminal = converged ? 'converged' : (cycled ? 'cycled' : 'none');
  /* B 가 step 이 지나온 화면 가운데 하나인가. 0 번은 reset 직후라 도달한 것으로 세지 않는다 */
  const reachable = seen.indexOf(B);
  const reachOk = (terminal === 'cycled') && reachable >= 1;
  return {
    쪽: pageNo,
    steps: steps,
    terminal: terminal,
    converged: converged,
    cycled: cycled,
    restless: restless,                   /* step 뒤에 화면이 상한 안에 안 멎었다 */
    budgetHit: budgetHit,
    hasFinish: typeof P.finish === 'function',
    finishOk: finishOk,
    same: same,
    reachable: reachable,                 /* B 가 몇 번째 화면인가. -1 이면 지나온 적 없다 */
    seenCount: seen.length,
    idempotent: idem,
    timers: timersAfter,
    diff: firstDiff(A, B),
    diffIdem: idem ? null : firstDiff(B, B2),
    ok: finishOk && idem && timersAfter === 0 && (same || reachOk)
  };
};
