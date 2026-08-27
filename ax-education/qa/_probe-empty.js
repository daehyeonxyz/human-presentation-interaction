/* 빈 곳 검사 · 무대가 얼마나 비었는지를 잰다.
   요소 상자가 아니라 글자와 도형이 실제로 차지한 곳을 잰다.
   호출 전에 window.still() 을 부르고, 조작 상태는 부르는 쪽이 미리 맞춘다.
   still() 은 애니메이션만 멈추고 transition 은 못 멈춘다. 면은 배경색이 정확히 흰색·우물색일 때만
   면으로 세므로, 배경색이 바뀌는 중에 재면 그 면을 통째로 놓친다. 조작 뒤 한 박자 쉬고 부른다.

   검사 다섯
     1 · 무대 아래 공백      내용 아래 끝이 무대 아래 끝에서 얼마나 떨어졌나
     2 · 열 사이 키 차이      나란한 열들의 내용 아래 끝이 얼마나 어긋났나
     3 · 면 안 아래 공백      면 하나의 안쪽 아래가 얼마나 남았나 (완료 상태에서만)
     4-A · 무대 오른쪽 공백   무대 안 그려진 것의 오른쪽 끝이 무대 오른쪽 끝에서 얼마나 떨어졌나
     4-B · 면 안 오른쪽 공백  면 하나의 안쪽 오른쪽이 얼마나 남았나 (완료 상태에서만)

   window.__EMPTY_MODE = 'rest' → 정지 상태. 무대 아래 공백 기준 240 (기본 120) 이고,
                                  면 안 검사(3 · 4-B)는 아예 돌리지 않는다
   window.__EMPTY_ONE  = true   → 지금 활성인 쪽 하나만 잰다 (기본 전 쪽)
   window.__EMPTY_KEEP_BLANK = true → 안이 완전히 빈 면도 채워진 내용으로 센다 (기본은 빼고 센다) */
(function () {
  const MODE = (window.__EMPTY_MODE === 'rest') ? 'rest' : 'done';

  /* ===== 판정 기준 · 여기 한 곳에 모은다 ===== */
  const BASE_B = 824;      /* 무대 아래 끝. 무대가 여기서 끝나고 아래는 맺음 판이 쓴다 */
  const BASE_R = 1840;     /* 무대 오른쪽 끝. 격자의 오른쪽 끝선이다 */
  const BELOW_DONE = 120;  /* 무대 아래 공백 (완료). 간격 스케일 최대 80 에 한 단 40 */
  const BELOW_REST = 240;  /* 무대 아래 공백 (정지). 조작으로 차오를 몫을 얹어 완료의 두 배 */
  const COL_DIFF = 160;    /* 열 사이 키 차이. 덩이 하나의 최소 키 175 보다 한 단 아래 */
  const SURFACE_B = 80;    /* 면 안 아래 공백. 면 안은 padding 이 여백을 맡는다 */
  const STAGE_R = 410;     /* 무대 오른쪽 공백. 격자의 열 하나 */
  const SURF_R = 410;      /* 면 안 오른쪽 공백. 같은 근거 */
  const SURF_MIN_W = 410;  /* 면 최소 폭. 열 하나가 못 들어가는 면의 오른쪽 여백은 구멍이 아니다 */
  const SURF_MIN_H = 120;  /* 면 최소 높이. 남은 곳이 "열 하나가 더 들어갈 만큼" 이려면
                              폭만이 아니라 높이도 있어야 한다. 그 칸에 글 덩이 하나가 들어가려면
                              머리 43 + 층 사이 12 + 몸 두 줄 72 = 127 이 필요하다.
                              그래서 높이 120 미만인 면의 오른쪽 여백은 구멍이 아니라 그 줄의 여백이다 */

  const LIM = {
    mode: MODE,
    below: (MODE === 'rest') ? BELOW_REST : BELOW_DONE,
    colDiff: COL_DIFF,
    surface: SURFACE_B,
    right: STAGE_R,
    surfaceRight: SURF_R,
    surfaceMinW: SURF_MIN_W,
    surfaceMinH: SURF_MIN_H,
    /* 정정 2 · 정지 상태에서는 면 안 검사를 돌리지 않는다.
       이 시스템은 조작 뒤에 나타날 칸을 정지 상태에서 미리 잡아 둔다.
       나타날 때 레이아웃이 밀리지 않게 하려는 규칙이다.
       그러므로 정지 상태에서 면 안이 비어 있는 것은 규칙대로 동작한다는 증거이지 구멍이 아니다 */
    surfaceChecks: (MODE !== 'rest')
  };

  const ONE = !!window.__EMPTY_ONE;
  const KEEP_BLANK = !!window.__EMPTY_KEEP_BLANK;
  const WHITE = 'rgb(255, 255, 255)';
  const SUNKEN = 'rgb(215, 221, 232)';

  const stage = document.getElementById('stage');
  const sr = stage.getBoundingClientRect();
  const k = sr.width / 1920;
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const active = slides.findIndex(function (s) { return s.classList.contains('active'); });

  function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function rd(v) { return Math.round(v * 10) / 10; }

  function cls(el) {
    let c = '';
    try { c = el.getAttribute('class') || ''; } catch (e) { c = ''; }
    if (!c) {
      try { c = el.id ? '#' + el.id : String(el.tagName || '').toLowerCase(); } catch (e) { c = '?'; }
    }
    return String(c).slice(0, 34);
  }

  function textOf(el) {
    try { return el.textContent.trim().replace(/\s+/g, ' ').slice(0, 22); } catch (e) { return ''; }
  }

  /* 직계 텍스트 노드가 있는가 */
  function hasText(el) {
    const kids = el.childNodes;
    for (let i = 0; i < kids.length; i++) {
      if (kids[i].nodeType === 3 && kids[i].nodeValue && kids[i].nodeValue.trim()) return true;
    }
    return false;
  }

  /* 칠해진 배경이 있는가 (알파 0 은 없는 것으로 본다) */
  function hasBg(cs) {
    const bc = cs.backgroundColor || '';
    if (bc && bc !== 'transparent') {
      const m = bc.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(',');
        const a = (p.length > 3) ? parseFloat(p[3]) : 1;
        if (!isNaN(a) && a > 0) return true;
      } else {
        return true;
      }
    }
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    return false;
  }

  /* 그려진 것인가 · 글자를 가졌거나 배경색·배경이미지·테두리·그림자를 가졌는가 */
  function isInked(el, cs) {
    let tag = '';
    try { tag = String(el.tagName || '').toUpperCase(); } catch (e) { tag = ''; }
    if (tag === 'IMG' || tag === 'SVG' || tag === 'CANVAS') return true;
    if (hasText(el)) return true;
    if (hasBg(cs)) return true;
    if (cs.boxShadow && cs.boxShadow !== 'none') return true;
    const bw = num(cs.borderTopWidth) + num(cs.borderRightWidth) +
      num(cs.borderBottomWidth) + num(cs.borderLeftWidth);
    if (bw !== 0) return true;
    return false;
  }

  /* 한 쪽 안의 보이는 요소를 1920x1080 좌표로 모은다 */
  function scan(slide) {
    const recs = [];
    const els = [].slice.call(slide.querySelectorAll('*'));
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      let cs;
      try { cs = getComputedStyle(el); } catch (e) { continue; }
      try {
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;

        /* 자기 또는 조상의 opacity 가 0 이면 뺀다 */
        let p = el, zero = false;
        while (p && p !== slide.parentElement) {
          let pcs;
          try { pcs = getComputedStyle(p); } catch (e2) { break; }
          if (num(pcs.opacity) === 0) { zero = true; break; }
          p = p.parentElement;
        }
        if (zero) continue;

        /* overflow:hidden 조상 밖으로 잘리는 것은 뺀다 */
        let q = el.parentElement, clipped = false;
        while (q && q !== slide) {
          let qcs;
          try { qcs = getComputedStyle(q); } catch (e3) { break; }
          if (qcs.overflow !== 'visible') {
            const qr = q.getBoundingClientRect();
            if (r.top < qr.top - 0.5 || r.bottom > qr.bottom + 0.5 ||
              r.left < qr.left - 0.5 || r.right > qr.right + 0.5) clipped = true;
          }
          q = q.parentElement;
        }
        if (clipped) continue;

        const x = (r.left - sr.left) / k, y = (r.top - sr.top) / k;
        const R = x + r.width / k, B = y + r.height / k;
        recs.push({
          el: el, cs: cs, x: x, y: y, r: R, b: B,
          ink: isInked(el, cs), txt: hasText(el)
        });
      } catch (e4) { continue; }
    }
    return recs;
  }

  /* 뿌리 자신이 직접 안고 있는 글자의 끝. 자식 요소가 없는 글상자를 빈 것으로 세지 않으려고 잰다.
     side 'b' 는 아래 끝, side 'r' 은 오른쪽 끝 */
  function ownTextEdge(el, side) {
    let m = null;
    const kids = el.childNodes;
    for (let i = 0; i < kids.length; i++) {
      const n = kids[i];
      if (n.nodeType !== 3 || !n.nodeValue || !n.nodeValue.trim()) continue;
      try {
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const rects = rg.getClientRects();
        for (let j = 0; j < rects.length; j++) {
          if (rects[j].width < 1 && rects[j].height < 1) continue;
          const v = (side === 'r')
            ? (rects[j].right - sr.left) / k
            : (rects[j].bottom - sr.top) / k;
          if (m === null || v > m) m = v;
        }
      } catch (e) { continue; }
    }
    return m;
  }
  function ownTextB(el) { return ownTextEdge(el, 'b'); }
  function ownTextR(el) { return ownTextEdge(el, 'r'); }

  /* 정정 4 · root 안(자기 상자는 빼고, 자기 글자는 넣고)의 실제 내용 끝.
     dead 는 안이 완전히 빈 면이다. 자리만 잡아 둔 빈 칸을 채워진 것으로 세지 않는다.
     3쪽이 실제로 성긴데 그 안의 빈 답 자리 말풍선이 카드 아래를 채운 것으로 세어지면
     검사가 통과해 버린다. 아직 아무것도 없는 칸은 채워진 것이 아니다.
     window.__EMPTY_KEEP_BLANK = true 로 이 규칙을 끌 수 있다 */
  function contentEdge(root, recs, dead, side) {
    let m = ownTextEdge(root, side);
    for (let i = 0; i < recs.length; i++) {
      const rc = recs[i];
      if (!rc.ink) continue;
      if (rc.el === root) continue;
      if (dead && dead.indexOf(rc.el) >= 0) continue;
      try { if (!root.contains(rc.el)) continue; } catch (e) { continue; }
      const v = (side === 'r') ? rc.r : rc.b;
      if (m === null || v > m) m = v;
    }
    return m;
  }
  function contentB(root, recs, dead) { return contentEdge(root, recs, dead, 'b'); }
  function contentR(root, recs, dead) { return contentEdge(root, recs, dead, 'r'); }

  /* 정정 3 · 열 하나의 내용 아래 끝을 가로 구간으로 잰다.
     DOM 조상 관계를 보지 않고, 그 요소의 가로 중심이 열의 가로 구간 안에 들어오면 그 열의 내용으로 센다.
     오른쪽 아래를 실제로 채우는 문단이 position:absolute 로 무대의 직계 자식이면
     DOM 상으로는 어느 열에도 안 속하는데 화면에서는 그 열을 채우고 있다.

     빼는 것 둘.
     하나 · 열 상자 자신과 그 조상. 자기 상자의 아래 끝을 내용으로 세면 빈 칸도 꽉 찬 것이 된다.
     둘 · 그 행이 시작하기 전에 끝났거나 그 행이 끝난 뒤에 시작하는 것.
       가로 구간만 보고 세로를 안 보면 한 줄짜리 글상자의 좁은 구간이
       화면 아래쪽 다른 행의 글까지 자기 내용으로 끌어온다.
       실측으로 2쪽 .num 이 여섯째 줄 문장을(904) 자기 내용으로 셌다.
       행의 세로 구간은 그 행에 속한 열 상자들의 위 끝과 아래 끝으로 잡는다 */
  function bandB(col, recs, dead, area, gTop, gBot) {
    let m = ownTextB(col.el);
    for (let i = 0; i < recs.length; i++) {
      const rc = recs[i];
      if (!rc.ink) continue;
      if (dead && dead.indexOf(rc.el) >= 0) continue;
      if (rc.el === area) continue;
      try { if (!area.contains(rc.el)) continue; } catch (e) { continue; }
      try { if (rc.el.contains(col.el)) continue; } catch (e) { continue; }
      const cx = (rc.x + rc.r) / 2;
      if (cx < col.x - 0.5 || cx > col.r + 0.5) continue;
      if (rc.b < gTop - 0.5) continue;   /* 행이 시작하기 전에 끝난 것 */
      if (rc.y > gBot + 0.5) continue;   /* 행이 끝난 뒤에 시작한 것 */
      if (m === null || rc.b > m) m = rc.b;
    }
    return m;
  }

  /* 흰 면·우물 면인가 */
  function isSurface(rc) {
    const bc = rc.cs.backgroundColor;
    return bc === WHITE || bc === SUNKEN;
  }

  /* 면 안 오른쪽 공백에서 뺄 면인가.
     폭이 열 하나보다 좁거나, 높이가 글 덩이 하나보다 낮거나,
     가운데 정렬이거나, 말풍선이면 뺀다.
     가운데 정렬한 면은 좌우가 같이 비는 것이 그 정렬의 결과이지 구멍이 아니다.
     말풍선은 글 길이만큼만 차지하는 것이 그 모양의 규칙이다 */
  function skipRightSurface(rc) {
    if (rc.r - rc.x < SURF_MIN_W) return '폭';
    if (rc.b - rc.y < SURF_MIN_H) return '높이';
    if (rc.cs.justifyContent === 'center' || rc.cs.alignItems === 'center') return '가운데정렬';
    try { if (rc.el.matches('.bub')) return '말풍선'; } catch (e) { /* 건너뛴다 */ }
    return null;
  }

  /* 안이 완전히 빈 면을 걸러 낸다. 빈 면 안에 빈 면만 있는 경우까지 훑는다 */
  function blankSurfaces(recs) {
    const dead = [];
    for (let pass = 0; pass < 5; pass++) {
      let added = 0;
      for (let i = 0; i < recs.length; i++) {
        const rc = recs[i];
        if (dead.indexOf(rc.el) >= 0) continue;
        if (!isSurface(rc)) continue;
        if (rc.b - rc.y < 40) continue;
        if (contentB(rc.el, recs, dead) === null) { dead.push(rc.el); added++; }
      }
      if (!added) break;
    }
    return dead;
  }

  /* 가로로 나란한 묶음(행)으로 가른다. 세로 구간이 절반 넘게 겹치고 가로로 안 겹치면 같은 행 */
  function rowGroups(kids) {
    const groups = [];
    for (let i = 0; i < kids.length; i++) {
      const a = kids[i];
      let placed = false;
      for (let g = 0; g < groups.length; g++) {
        let ok = true;
        for (let j = 0; j < groups[g].length; j++) {
          const b = groups[g][j];
          const vov = Math.min(a.b, b.b) - Math.max(a.y, b.y);
          const minH = Math.min(a.b - a.y, b.b - b.y);
          const hov = Math.min(a.r, b.r) - Math.max(a.x, b.x);
          if (!(minH > 0 && vov > minH * 0.5 && hov <= 0.5)) { ok = false; break; }
        }
        if (ok) { groups[g].push(a); placed = true; break; }
      }
      if (!placed) groups.push([a]);
    }
    return groups.filter(function (g) { return g.length >= 2; });
  }

  const fail = [], all = [], empty = [];

  function measure(slide, no) {
    const recs = scan(slide);
    const area = slide.querySelector('.area');
    const row = { 쪽: no, below: null, colDiff: null, rightGap: null, surfaces: [], surfacesR: [] };
    const blank = blankSurfaces(recs);
    const dead = KEEP_BLANK ? [] : blank;

    blank.forEach(function (el) {
      for (let i = 0; i < recs.length; i++) {
        if (recs[i].el !== el) continue;
        empty.push({
          쪽: no, cls: cls(el),
          w: Math.round(recs[i].r - recs[i].x), h: Math.round(recs[i].b - recs[i].y)
        });
        return;
      }
    });

    /* 1 · 무대 아래 공백 (무대 상자 자체는 뺀다) */
    if (area) {
      const mb = contentB(area, recs, dead);
      if (mb !== null) {
        row.below = rd(BASE_B - mb);
        if (row.below > LIM.below) {
          fail.push({
            쪽: no, 검사: '무대 아래 공백', 값: row.below, 기준: LIM.below,
            상세: '내용 아래 끝 ' + rd(mb) + ' · 기준선 ' + BASE_B
          });
        }
      }
    }

    /* 2 · 열 사이 키 차이. 열 묶음은 DOM 형제에서 찾고, 내용은 가로 구간으로 센다 */
    if (area) {
      const inArea = recs.filter(function (rc) {
        try { return rc.el !== area && area.contains(rc.el); } catch (e) { return false; }
      });
      const parents = [], buckets = [];
      inArea.forEach(function (rc) {
        const p = rc.el.parentElement;
        let idx = parents.indexOf(p);
        if (idx < 0) { parents.push(p); buckets.push([]); idx = parents.length - 1; }
        buckets[idx].push(rc);
      });
      let best = null, bestCols = null;
      buckets.forEach(function (kids) {
        if (kids.length < 2) return;
        rowGroups(kids).forEach(function (g) {
          const cols = [];
          let gTop = 1e9, gBot = -1e9;
          g.forEach(function (rc) {
            if (rc.y < gTop) gTop = rc.y;
            if (rc.b > gBot) gBot = rc.b;
          });
          g.forEach(function (rc) {
            if (dead.indexOf(rc.el) >= 0) return;
            const cb = bandB(rc, recs, dead, area, gTop, gBot);
            if (cb !== null) cols.push({ cls: cls(rc.el), b: rd(cb) });
          });
          if (cols.length < 2) return;
          let mx = -1e9, mn = 1e9;
          cols.forEach(function (c) { if (c.b > mx) mx = c.b; if (c.b < mn) mn = c.b; });
          const d = mx - mn;
          if (best === null || d > best) { best = d; bestCols = cols; }
        });
      });
      if (best !== null) {
        row.colDiff = rd(best);
        if (row.colDiff > LIM.colDiff) {
          fail.push({
            쪽: no, 검사: '열 사이 키 차이', 값: row.colDiff, 기준: LIM.colDiff,
            상세: bestCols.map(function (c) { return c.cls + '→' + c.b; }).join(' | ')
          });
        }
      }
    }

    /* 3 · 면 안 아래 공백. 안이 완전히 빈 면은 여기서 빼고 empty_surfaces 로 따로 보고한다.
       정지 상태에서는 돌리지 않는다 */
    if (LIM.surfaceChecks) {
      recs.forEach(function (rc) {
        if (!isSurface(rc)) return;
        const h = rc.b - rc.y;
        if (h < 40) return;                       /* 게이지·구분 조각은 뺀다 */
        if (blank.indexOf(rc.el) >= 0) return;    /* 빈 면은 위에서 이미 보고했다 */
        const cb = contentB(rc.el, recs, dead);
        if (cb === null) return;
        const inner = rc.b - num(rc.cs.paddingBottom);
        const gap = rd(inner - cb);
        row.surfaces.push({ cls: cls(rc.el), gap: gap });
        if (gap > LIM.surface) {
          fail.push({
            쪽: no, 검사: '면 안 아래 공백', 값: gap, 기준: LIM.surface,
            상세: cls(rc.el) + ' · 면 안쪽 아래 ' + rd(inner) + ' · 내용 아래 ' + rd(cb) +
              ' · "' + textOf(rc.el) + '"'
          });
        }
      });
    }

    /* 4-A · 무대 오른쪽 공백. 무대 안 그려진 것 전부의 오른쪽 끝을 본다.
       잡으려는 것은 열 하나가 통째로 비어 있는 화면이다.
       글자를 가진 요소만 보면 width:max-content 문단이 칸보다 좁은 정상 배치를 구멍으로 오인한다 */
    if (area) {
      let mr = null, who = null;
      recs.forEach(function (rc) {
        if (!rc.ink) return;
        try { if (rc.el === area || !area.contains(rc.el)) return; } catch (e) { return; }
        if (mr === null || rc.r > mr) { mr = rc.r; who = rc.el; }
      });
      if (mr !== null) {
        row.rightGap = rd(BASE_R - mr);
        if (row.rightGap > LIM.right) {
          fail.push({
            쪽: no, 검사: '무대 오른쪽 공백', 값: row.rightGap, 기준: LIM.right,
            상세: '가장 오른쪽 그려진 것 ' + rd(mr) + ' · ' + cls(who) + ' · "' + textOf(who) + '"'
          });
        }
      }
    }

    /* 4-B · 면 안 오른쪽 공백. 면 하나 안에서 열 하나가 통째로 비었는지 본다.
       정지 상태에서는 돌리지 않는다 */
    if (LIM.surfaceChecks) {
      recs.forEach(function (rc) {
        if (!isSurface(rc)) return;
        if (blank.indexOf(rc.el) >= 0) return;    /* 빈 면은 empty_surfaces 로 따로 보고한다 */
        if (skipRightSurface(rc)) return;
        const cr = contentR(rc.el, recs, dead);
        if (cr === null) return;
        const inner = rc.r - num(rc.cs.paddingRight);
        const gap = rd(inner - cr);
        row.surfacesR.push({ cls: cls(rc.el), gap: gap });
        if (gap > LIM.surfaceRight) {
          fail.push({
            쪽: no, 검사: '면 안 오른쪽 공백', 값: gap, 기준: LIM.surfaceRight,
            상세: cls(rc.el) + ' · 면 안쪽 오른쪽 ' + rd(inner) + ' · 내용 오른쪽 ' + rd(cr) +
              ' · 폭 ' + Math.round(rc.r - rc.x) + ' · 높이 ' + Math.round(rc.b - rc.y) +
              ' · "' + textOf(rc.el) + '"'
          });
        }
      });
    }

    all.push(row);
  }

  if (ONE) {
    if (active >= 0) measure(slides[active], active + 1);
  } else {
    slides.forEach(function (sl, si) {
      slides.forEach(function (s, i) { s.classList.toggle('active', i === si); });
      measure(sl, si + 1);
    });
    slides.forEach(function (s, i) { s.classList.toggle('active', i === active); });
  }

  return JSON.stringify({ limits: LIM, fail: fail, all: all, empty_surfaces: empty }, null, 1);
})();
