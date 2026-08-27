(function () {
  const stage = document.getElementById('stage');
  const sr = stage.getBoundingClientRect();
  const k = sr.width / 1920;
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const active = slides.findIndex(function (s) { return s.classList.contains('active'); });
  const out = [], edges = [];
  slides.forEach(function (sl, si) {
    slides.forEach(function (s, i) { s.classList.toggle('active', i === si); });
    let minL = 9999, minT = 9999, maxR = -9999, maxB = -9999;
    sl.querySelectorAll('*').forEach(function (el) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      // overflow:hidden 조상에 잘리는 요소는 화면 밖으로 나가지 않는다
      let p = el.parentElement, clipped = false;
      while (p && p !== sl) {
        const pcs = getComputedStyle(p);
        if (pcs.overflow !== 'visible') {
          const pr = p.getBoundingClientRect();
          if (r.top < pr.top - 0.5 || r.bottom > pr.bottom + 0.5 || r.left < pr.left - 0.5 || r.right > pr.right + 0.5) clipped = true;
        }
        p = p.parentElement;
      }
      if (clipped) return;
      const x = (r.left - sr.left) / k, y = (r.top - sr.top) / k;
      const R = x + r.width / k, B = y + r.height / k;
      if (R > 1920.5 || x < -0.5 || B > 1080.5 || y < -0.5) {
        out.push({ 쪽: si + 1, cls: String(el.className).slice(0, 34), x: Math.round(x), y: Math.round(y), r: Math.round(R), b: Math.round(B), t: el.textContent.trim().slice(0, 22) });
      }
      const hasText = [].slice.call(el.childNodes).some(function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (hasText) {
        minL = Math.min(minL, x); minT = Math.min(minT, y);
        maxR = Math.max(maxR, R); maxB = Math.max(maxB, B);
      }
    });
    edges.push({ 쪽: si + 1, L: Math.round(minL), T: Math.round(minT), R: Math.round(maxR), B: Math.round(maxB) });
  });
  slides.forEach(function (s, i) { s.classList.toggle('active', i === active); });
  return JSON.stringify({ overflow: out, edges: edges }, null, 1);
})();
