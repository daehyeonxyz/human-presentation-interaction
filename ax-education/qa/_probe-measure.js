(function () {
  function w(text, font) {
    const s = document.createElement('span');
    s.textContent = text;
    s.style.cssText = 'position:absolute;left:-9999px;white-space:pre;font:' + font;
    document.body.appendChild(s);
    const r = s.getBoundingClientRect().width;
    s.remove();
    return Math.round(r * 100) / 100;
  }
  // 한글이 --font-display 에 섞였는지 전수 확인
  const hangul = [];
  document.querySelectorAll('.stage *').forEach(function (el) {
    const ff = getComputedStyle(el).fontFamily;
    if (ff.indexOf('Samsung Sharp Sans') !== 0) return;
    let t = '';
    el.childNodes.forEach(function (n) { if (n.nodeType === 3) t += n.nodeValue; });
    if (/[가-힣]/.test(t)) hangul.push(t.trim().slice(0, 30));
  });
  // 크기 규칙
  const sizes = {};
  const big = [], mid = [], small = [], weights = [];
  document.querySelectorAll('.slide').forEach(function (sl, si) {
    let n64 = 0;
    sl.querySelectorAll('*').forEach(function (el) {
      if (!el.textContent.trim()) return;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const fw = parseInt(cs.fontWeight, 10);
      const leaf = ![].slice.call(el.children).some(function (c) { return c.textContent.trim(); });
      if (!leaf) return;
      sizes[fs] = (sizes[fs] || 0) + 1;
      if (fs >= 64) n64++;
      if (fs > 33 && fs < 63) mid.push([si + 1, fs, el.textContent.trim().slice(0, 20)]);
      if (fs < 20) small.push([si + 1, fs, el.textContent.trim().slice(0, 20)]);
      if (fw < 500 && cs.fontFamily.indexOf('Cascadia') === -1) weights.push([si + 1, fw, el.textContent.trim().slice(0, 20)]);
      if (fw === 600) weights.push([si + 1, 600, el.textContent.trim().slice(0, 20)]);
      if (fw >= 800 && fs < 32) weights.push([si + 1, 'heavy@' + fs, el.textContent.trim().slice(0, 20)]);
    });
    big.push(n64);
  });
  return JSON.stringify({
    fontsDone: window.__fontsDone === true,
    ko_pretendard: w('가', '500 100px "Pretendard Variable", serif'),
    ko_fallback: w('가', '500 100px serif'),
    en_sharp: w('H', '700 100px "Samsung Sharp Sans", serif'),
    en_pretendard: w('H', '700 100px "Pretendard Variable", serif'),
    en_serif: w('H', '700 100px serif'),
    scrollW: document.documentElement.scrollWidth,
    scrollH: document.documentElement.scrollHeight,
    stageScrollW: document.getElementById('stage').scrollWidth,
    stageScrollH: document.getElementById('stage').scrollHeight,
    hangulInDisplay: hangul,
    sizeHistogram: sizes,
    countOver64PerSlide: big,
    midBand33to63: mid,
    under20: small,
    weightViolations: weights
  }, null, 1);
})();
