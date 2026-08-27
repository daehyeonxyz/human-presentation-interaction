/* 호버 검사 · 누를 수 있는 것과 없는 것이 호버로 갈리는가.
   지금 활성인 쪽 하나만 잰다. 조작 상태는 부르는 쪽이 미리 맞춘다.
   mouseover 이벤트로는 CSS :hover 가 안 걸리므로 스타일시트의 :hover 규칙을 직접 읽어 판정한다 */
(function () {
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  let idx = slides.findIndex(function (s) { return s.classList.contains('active'); });
  if (idx < 0) idx = 0;
  const slide = slides[idx];
  const no = idx + 1;

  function cls(el) {
    let c = '';
    try { c = el.getAttribute('class') || ''; } catch (e) { c = ''; }
    if (!c) {
      try { c = el.id ? '#' + el.id : String(el.tagName || '').toLowerCase(); } catch (e) { c = '?'; }
    }
    let id = '';
    try { id = el.id ? '#' + el.id : ''; } catch (e) { id = ''; }
    return String(c + id).slice(0, 40);
  }

  function textOf(el) {
    try { return el.textContent.trim().replace(/\s+/g, ' ').slice(0, 22); } catch (e) { return ''; }
  }

  /* ':hover' 가 걸린 요소 쪽 선택자를 뽑는다.
     '.a:hover .b' → '.a'      (눌리는 것은 .a)
     '.item.locked:hover' → '.item.locked'
     '.a:hover .b:hover' → '.a .b' (가장 안쪽이 실제로 마우스가 닿는 곳) */
  function hostOf(sel) {
    const last = sel.lastIndexOf(':hover');
    if (last < 0) return null;
    let head = sel.slice(0, last);
    head = head.split(':hover').join('');
    head = head.replace(/[\s>+~]+$/, '');
    head = head.replace(/^[\s>+~]+/, '');
    if (!head) return null;
    return head;
  }

  /* 문서의 모든 :hover 규칙을 모은다 */
  const rules = [];
  function walk(list) {
    for (let i = 0; i < list.length; i++) {
      const rule = list[i];
      try {
        if (rule.cssRules && rule.cssRules.length) {
          if (rule.conditionText) {
            let okm = true;
            try { okm = matchMedia(rule.conditionText).matches; } catch (e) { okm = true; }
            if (!okm) continue;
          }
          walk([].slice.call(rule.cssRules));
          continue;
        }
        if (!rule.selectorText) continue;
        if (rule.selectorText.indexOf(':hover') < 0) continue;
        const props = [];
        try {
          for (let p = 0; p < rule.style.length; p++) props.push(rule.style[p]);
        } catch (e) { /* 건너뛴다 */ }
        rule.selectorText.split(',').forEach(function (part) {
          const sel = part.trim();
          if (!sel || sel.indexOf(':hover') < 0) return;
          const host = hostOf(sel);
          if (!host) return;
          rules.push({ sel: sel, host: host, props: props });
        });
      } catch (e) { continue; }
    }
  }
  try {
    [].slice.call(document.styleSheets).forEach(function (sh) {
      let list = null;
      try { list = sh.cssRules || sh.rules; } catch (e) { return; }
      if (!list) return;
      try { walk([].slice.call(list)); } catch (e) { /* 건너뛴다 */ }
    });
  } catch (e) { /* 건너뛴다 */ }

  /* 이 쪽의 보이는 요소를 훑는다 */
  const items = [];
  [].slice.call(slide.querySelectorAll('*')).forEach(function (el) {
    try {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      const hit = [];
      for (let i = 0; i < rules.length; i++) {
        let m = false;
        try { m = el.matches(rules[i].host); } catch (e) { m = false; }
        if (m) hit.push(rules[i]);
      }
      items.push({ el: el, cursor: cs.cursor, hit: hit, resp: hit.length > 0 });
    } catch (e) { return; }
  });

  /* 조상 조회용 */
  function ancestorCovered(rec) {
    let p = rec.el.parentElement;
    while (p && p !== slide) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].el === p) {
          if (items[i].cursor === 'pointer' && items[i].resp) return true;
          break;
        }
      }
      p = p.parentElement;
    }
    return false;
  }

  const failA = [], failB = [], warn = [];
  let ok = 0;
  const used = [];

  items.forEach(function (rec) {
    if (rec.resp) {
      rec.hit.forEach(function (h) { if (used.indexOf(h) < 0) used.push(h); });
    }
    if (rec.cursor === 'pointer') {
      if (rec.resp) { ok++; return; }
      if (ancestorCovered(rec)) return;          /* 중첩 중복 */
      failB.push({ cls: cls(rec.el), t: textOf(rec.el) });
      return;
    }
    if (rec.cursor === 'not-allowed') {
      if (rec.resp) warn.push({ cls: cls(rec.el), t: textOf(rec.el) });
      return;
    }
    if (rec.resp) failA.push({ cls: cls(rec.el), cursor: rec.cursor, t: textOf(rec.el) });
  });

  const rulesOut = [];
  used.forEach(function (h) {
    for (let i = 0; i < rulesOut.length; i++) if (rulesOut[i].sel === h.sel) return;
    rulesOut.push({ sel: h.sel, props: h.props });
  });

  return JSON.stringify({
    쪽: no,
    failA: failA,
    failB: failB,
    warn: warn,
    ok: ok,
    rules: rulesOut
  }, null, 1);
})();
