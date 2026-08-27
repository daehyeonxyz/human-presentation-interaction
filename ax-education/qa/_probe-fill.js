/* 세로 활용 검사 (6차 검토에서 더한 게이트)
   무대가 824까지 있는데도 안을 다 안 쓰는 화면을 잡는다.

   재는 방법
   - 무대(.area) 안에서 실제로 그려진 것만 모은다. 글자가 있는 잎 요소, 배경색이 깔린 요소,
     테두리나 링이 걸린 요소다. 자리만 잡아 둔 빈 칸은 세지 않는다.
   - 모은 것을 가로 구간(열)으로 묶는다. DOM 부모가 아니라 x 구간이 겹치는지로 묶어야
     절대 위치로 놓인 글이 열 아래를 채우는 화면을 바로 센다.
   - 열마다 위 끝과 아래 끝을 내고, 면이 든 열이면 824 까지 40, 글만 있는 열이면 120 을 상한으로 본다.

   전제: window.still() 로 등장을 끈 뒤, document.fonts.ready 뒤에 부른다. */

window.__probeFill = function () {
  const stage = document.getElementById('stage');
  const sb = stage.getBoundingClientRect();
  const sc = sb.width / 1920;                    /* 뷰포트 맞춤 배율을 되돌린다 */
  const X = (v) => (v - sb.left) / sc;
  const Y = (v) => (v - sb.top) / sc;

  const slide = document.querySelector('.slide.active');
  if (!slide) return { skip: 'no active slide' };
  const area = slide.querySelector('.area');
  if (!area) return { skip: 'no area' };

  const top = area.classList.contains('nosub') ? 240 : 284;
  const BOTTOM = 824;

  const transparent = (c) => !c || c === 'transparent' || /rgba\(0,\s*0,\s*0,\s*0\)/.test(c);

  /* 그려진 잎을 모은다 */
  const rects = [];
  const walk = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;

    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) { [].forEach.call(el.children, walk); return; }

    /* 면인가: 배경색이 깔렸거나 링이 걸렸다 */
    const painted = !transparent(cs.backgroundColor) || /gradient/.test(cs.backgroundImage);
    /* 글자인가: 자기 자식 텍스트 노드에 공백 아닌 글자가 있다 */
    let ownText = false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.nodeValue.trim()) { ownText = true; break; }
    }
    if (painted || ownText) {
      rects.push({
        x0: X(r.left), x1: X(r.right), y0: Y(r.top), y1: Y(r.bottom),
        surface: painted,
        tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
      });
    }
    [].forEach.call(el.children, walk);
  };
  [].forEach.call(area.children, walk);

  const inside = rects.filter((r) => r.y1 > top - 4 && r.y0 < BOTTOM + 200);
  if (!inside.length) return { skip: 'nothing painted' };

  /* x 구간이 겹치거나 32 미만으로 붙은 것끼리 한 열로 묶는다 */
  const cols = [];
  inside.slice().sort((a, b) => a.x0 - b.x0).forEach((r) => {
    const hit = cols.find((c) => r.x0 < c.x1 + 32 && r.x1 > c.x0 - 32);
    if (hit) {
      hit.x0 = Math.min(hit.x0, r.x0); hit.x1 = Math.max(hit.x1, r.x1);
      hit.y0 = Math.min(hit.y0, r.y0);
      /* 상한을 가르는 것은 열이 면을 담았는지가 아니라 열의 아래 끝을 만든 것이 면인지다.
         면 아래에 글 덩이가 붙는 열은 글의 줄 수가 아래 끝을 정하므로 글 기준으로 잰다 */
      if (r.y1 > hit.y1) { hit.y1 = r.y1; hit.surface = r.surface; }
      hit.n++;
    } else {
      cols.push({ x0: r.x0, x1: r.x1, y0: r.y0, y1: r.y1, surface: r.surface, n: 1 });
    }
  });

  /* 겹친 열을 한 번 더 합친다 (정렬 순서 때문에 갈린 경우) */
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < cols.length && !merged; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const a = cols[i], b = cols[j];
        if (a.x0 < b.x1 + 32 && a.x1 > b.x0 - 32) {
          a.x0 = Math.min(a.x0, b.x0); a.x1 = Math.max(a.x1, b.x1);
          a.y0 = Math.min(a.y0, b.y0);
          if (b.y1 > a.y1) { a.y1 = b.y1; a.surface = b.surface; }
          a.n += b.n;
          cols.splice(j, 1); merged = true; break;
        }
      }
    }
  }

  const round = (v) => Math.round(v * 10) / 10;
  const areaTopActual = Math.min(...inside.map((r) => r.y0));
  const fails = [];
  /* 24 를 봐주는 근거: 항목 행 안에서 글자가 세로 가운데에 서면 글자 상자가 행 상자보다
     아래에서 시작한다. 32 글자를 84 행에 세로 중앙으로 넣으면 그 차이가 19 다.
     그보다 큰 차이는 행 자체가 아래에서 시작한다는 뜻이다 */
  if (areaTopActual > top + 24) {
    fails.push(`무대 위 끝이 ${round(areaTopActual)} 이라 상단 ${top} 에서 ${round(areaTopActual - top)} 내려와 있다`);
  }

  const out = cols
    .sort((a, b) => a.x0 - b.x0)
    .map((c) => {
      const limit = c.surface ? 40 : 120;
      const gap = BOTTOM - c.y1;
      const ok = gap <= limit;
      if (!ok) {
        fails.push(`x ${Math.round(c.x0)}~${Math.round(c.x1)} 열의 아래 끝이 ${round(c.y1)} 이라 824 까지 ${round(gap)} 남는다 (상한 ${limit}, ${c.surface ? '면' : '글'} 열)`);
      }
      return {
        x: `${Math.round(c.x0)}~${Math.round(c.x1)}`,
        top: round(c.y0), bottom: round(c.y1),
        gap: round(gap), limit, kind: c.surface ? '면' : '글', ok,
      };
    });

  return {
    stageTop: top, stageTopActual: round(areaTopActual),
    columns: out, fails,
    pass: fails.length === 0,
  };
};
