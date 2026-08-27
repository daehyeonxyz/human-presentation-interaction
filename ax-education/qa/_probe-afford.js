/* 정지 상태 클릭 가능성 검사 (7차 검토에서 더한 필수 게이트)
   지금 활성인 쪽 하나를, 정지 상태에서, 마우스를 올리지 않고 잰다.

   재는 방법
   - 그 쪽 안에서 계산된 cursor 가 pointer 인 요소를 모은다.
     cursor 는 상속되므로 pointer 사슬의 가장 바깥 하나만 남긴다.
     남기지 않으면 항목 안의 글자 span 이 전부 따로 잡혀 같은 실패가 여러 번 센다.
   - 각각에 정지 상태 표식이 있는지 본다. 통과는 셋 중 하나다.
       1 · 파란 면      자기나 조상의 배경이 --blue-accent / --blue-mark / --blue-tint
       2 · 우물 위 흰 판 자기 배경이 --surface 이고 조상 가운데 배경이 --sunken 인 것이 있다
       3 · 표식 낱말    border-bottom 2px 이상 --blue-accent 이거나
                        background-image 에 --blue-hl 이 든 밑줄
     조상 사슬은 슬라이드 루트까지만 본다.
   - 역방향도 잰다. 배경(--bg) 인 조상 바로 위에 놓인 --surface 면이 pointer 이면 실패다.
     배경 위에 홀로 뜬 흰 판은 화면이거나 종이이고 누르는 것이 아니다.
   - 잠긴 것(cursor: not-allowed 또는 disabled)이 box-shadow 에 --ring-locked
     (--divider-strong 링)를 가졌는지 본다. 없으면 warn 이다.

   예외
   - 12쪽 범례(.lg)와 12쪽 말풍선(#msgs .bub)은 상태를 남기지 않는 보조 가리키기라 예외다.
     그것을 하지 않아도 쪽이 닫힌다. 예외로 뺀 것은 skip 으로 따로 센다.
   - 우물 트레이 안에서 면을 잃은 고르기 줄은 tray 로 따로 센다. 통과 셋에는 안 들어가지만
     디자인시스템의 우물 트레이 절이 "고르지 않은 판은 면을 잃고 그릇이 이 중 하나를 말한다" 로
     허용하고 있어서 실패로 세지 않는다. 세어서 눈으로 보게 남긴다.

   색은 하드코딩하지 않는다. :root 의 토큰 값을 읽어 rgb 로 정규화해 견준다.

   전제: window.still() 로 등장을 끈 뒤, 그 쪽의 reset() 을 부른 정지 상태에서 부른다. */

window.__probeAfford = function () {
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  let idx = slides.findIndex(function (s) { return s.classList.contains('active'); });
  if (idx < 0) idx = 0;
  const slide = slides[idx];
  if (!slide) return { skip: 'no slide' };
  const no = Number(slide.getAttribute('data-page')) || (idx + 1);

  /* ===== 토큰을 rgb 로 정규화한다 ===== */
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;';
  document.body.appendChild(probe);
  function toRgb(v) {
    const s = String(v == null ? '' : v).trim();
    if (!s) return '';
    probe.style.color = 'rgb(1, 2, 3)';          /* 못 읽는 값이면 이 값이 남아 오탐이 안 난다 */
    probe.style.color = s;
    return getComputedStyle(probe).color;
  }
  const rootCs = getComputedStyle(document.documentElement);
  function tok(name) { return toRgb(rootCs.getPropertyValue(name)); }
  const C = {
    surface: tok('--surface'),
    bg: tok('--bg'),
    sunken: tok('--sunken'),
    accent: tok('--blue-accent'),
    mark: tok('--blue-mark'),
    tint: tok('--blue-tint'),
    hl: tok('--blue-hl'),
    lock: tok('--divider-strong')
  };
  probe.remove();

  function cls(el) {
    let c = '';
    try { c = el.getAttribute('class') || ''; } catch (e) { c = ''; }
    let id = '';
    try { id = el.id ? '#' + el.id : ''; } catch (e) { id = ''; }
    if (!c && !id) { try { c = String(el.tagName || '').toLowerCase(); } catch (e) { c = '?'; } }
    return String(c + id).trim().slice(0, 40);
  }
  function textOf(el) {
    try { return el.textContent.trim().replace(/\s+/g, ' ').slice(0, 22); } catch (e) { return ''; }
  }

  /* ===== 보이는 요소만 모은다 ===== */
  function invisible(el, cs) {
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    if (parseFloat(cs.opacity) === 0) return true;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return true;
    let p = el.parentElement;
    while (p && p !== slide.parentElement) {
      let pcs;
      try { pcs = getComputedStyle(p); } catch (e) { break; }
      if (parseFloat(pcs.opacity) === 0) return true;
      if (pcs.display === 'none' || pcs.visibility === 'hidden') return true;
      p = p.parentElement;
    }
    return false;
  }

  const recs = [];
  const seen = [];
  [].slice.call(slide.querySelectorAll('*')).forEach(function (el) {
    let cs;
    try { cs = getComputedStyle(el); } catch (e) { return; }
    if (invisible(el, cs)) return;
    const rec = { el: el, cs: cs };
    recs.push(rec);
    seen.push(el);
  });
  function recOf(el) {
    const i = seen.indexOf(el);
    return i < 0 ? null : recs[i];
  }

  /* 같은 커서가 걸린 사슬에서 가장 바깥 하나만 남긴다 */
  function outermost(rec, kind) {
    let p = rec.el.parentElement;
    while (p && p !== slide.parentElement) {
      const pr = recOf(p);
      if (pr && pr.cs.cursor === kind) return false;
      if (p === slide) break;
      p = p.parentElement;
    }
    return true;
  }

  /* ===== 면과 표식 판정 ===== */
  function bgOf(cs) {
    const c = cs.backgroundColor;
    if (!c || c === 'transparent') return null;
    if (/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(c)) return null;
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(',');
      const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
      if (!isNaN(a) && a === 0) return null;
    }
    return c;
  }
  function chain(el) {
    const out = [];
    let p = el.parentElement;
    while (p) {
      out.push(p);
      if (p === slide) break;                    /* 슬라이드 루트까지만 본다 */
      p = p.parentElement;
    }
    return out;
  }
  function isBlue(c) { return c === C.accent || c === C.mark || c === C.tint; }

  function blueFace(rec) {
    if (isBlue(bgOf(rec.cs))) return '파란 면';
    const anc = chain(rec.el);
    for (let i = 0; i < anc.length; i++) {
      let pcs;
      try { pcs = getComputedStyle(anc[i]); } catch (e) { continue; }
      if (isBlue(bgOf(pcs))) return '파란 면(조상)';
    }
    return null;
  }
  function trayWhite(rec) {
    if (bgOf(rec.cs) !== C.surface) return null;
    const anc = chain(rec.el);
    for (let i = 0; i < anc.length; i++) {
      let pcs;
      try { pcs = getComputedStyle(anc[i]); } catch (e) { continue; }
      if (bgOf(pcs) === C.sunken) return '우물 위 흰 판';
    }
    return null;
  }
  function markWord(rec) {
    const cs = rec.cs;
    const bw = parseFloat(cs.borderBottomWidth);
    if (!isNaN(bw) && bw >= 2 && cs.borderBottomColor === C.accent) return '밑줄(border)';
    const bi = cs.backgroundImage;
    if (bi && bi !== 'none' && C.hl && bi.indexOf(C.hl) >= 0) return '밑줄(--blue-hl)';
    /* 짚는 낱말은 올라와 있는 동안 띠가 면 전체로 찬다. 같은 표식이라 같이 통과시킨다 */
    if (bgOf(cs) === C.hl) return '짚기 면(--blue-hl)';
    /* 같은 밑줄을 text-decoration 으로 그린 경우도 같은 표식으로 본다.
       via 에 남겨 두므로 무엇으로 통과했는지가 결과에 보인다 */
    const line = cs.textDecorationLine || '';
    if (line.indexOf('underline') >= 0 && cs.textDecorationColor === C.accent) {
      const th = parseFloat(cs.textDecorationThickness);
      if (!isNaN(th) && th >= 2) return '밑줄(text-decoration)';
      if (isNaN(th)) return '밑줄(text-decoration auto)';
    }
    return null;
  }
  /* 가장 가까운 칠해진 조상의 면 */
  function nearestFace(rec) {
    const anc = chain(rec.el);
    for (let i = 0; i < anc.length; i++) {
      let pcs;
      try { pcs = getComputedStyle(anc[i]); } catch (e) { continue; }
      const b = bgOf(pcs);
      if (b) return b;
    }
    return null;
  }
  /* 배경 위에 홀로 놓인 흰 면인가. 가장 가까운 칠해진 조상이 --bg 이면 그렇다 */
  function whiteOnBg(rec) {
    if (bgOf(rec.cs) !== C.surface) return false;
    return nearestFace(rec) === C.bg;
  }
  /* 우물 트레이 안의 면 없는 고르기 줄인가.
     디자인시스템의 우물 트레이 절이 이것을 허용한다. 고르지 않은 판은 면을 잃고
     우물 바탕 위의 글줄로 남으며, 그릇이 "이 중 하나" 를 말하므로 누를 수 있다는 것이 보인다.
     통과 셋에는 안 들어가므로 pass 로 세지 않고 tray 로 따로 세어 눈으로 보게 남긴다 */
  function trayFlat(rec) {
    if (bgOf(rec.cs)) return false;
    return nearestFace(rec) === C.sunken;
  }

  /* ===== 예외 ===== */
  function exempt(el) {
    try { if (el.closest('.lg')) return '12쪽 범례'; } catch (e) { /* 건너뛴다 */ }
    try { if (el.closest('#msgs') && el.closest('.bub')) return '12쪽 말풍선'; } catch (e) { /* 건너뛴다 */ }
    return null;
  }

  /* ===== 본 검사 ===== */
  const pass = [], fail = [], skip = [], reverse = [], tray = [];
  recs.forEach(function (rec) {
    if (rec.cs.cursor !== 'pointer') return;
    if (!outermost(rec, 'pointer')) return;      /* 사슬 안쪽 중복 */
    const ex = exempt(rec.el);
    if (ex) { skip.push({ cls: cls(rec.el), t: textOf(rec.el), why: ex }); return; }

    const via = blueFace(rec) || trayWhite(rec) || markWord(rec);
    const onBg = whiteOnBg(rec);
    if (onBg) reverse.push({ cls: cls(rec.el), t: textOf(rec.el) });

    if (!via && !onBg && trayFlat(rec)) {
      tray.push({ cls: cls(rec.el), t: textOf(rec.el), why: '우물 트레이 안의 면 없는 줄' });
      return;
    }
    if (via && !onBg) { pass.push({ cls: cls(rec.el), via: via }); return; }
    const why = [];
    if (!via) why.push('정지 상태 표식 없음');
    if (onBg) why.push('배경 위에 홀로 뜬 흰 면');
    fail.push({ cls: cls(rec.el), t: textOf(rec.el), why: why.join(' · '), via: via || null });
  });

  /* ===== 잠긴 것 ===== */
  const locked = [], lockWarn = [];
  recs.forEach(function (rec) {
    let dis = false;
    try { dis = rec.el.disabled === true || rec.el.hasAttribute('disabled'); } catch (e) { dis = false; }
    if (rec.cs.cursor !== 'not-allowed' && !dis) return;
    if (rec.cs.cursor === 'not-allowed' && !outermost(rec, 'not-allowed')) return;
    const sh = rec.cs.boxShadow || '';
    const ok = !!(C.lock && sh.indexOf(C.lock) >= 0);
    locked.push({ cls: cls(rec.el), ring: ok });
    if (!ok) lockWarn.push({ cls: cls(rec.el), t: textOf(rec.el), shadow: sh.slice(0, 60) });
  });

  return {
    쪽: no,
    tokens: C,
    pointer: pass.length + fail.length + skip.length + tray.length,
    pass: pass.length,
    fail: fail,
    skip: skip,
    tray: tray,
    reverse: reverse,
    locked: locked,
    lockWarn: lockWarn,
    passDetail: pass,
    ok: fail.length === 0
  };
};
