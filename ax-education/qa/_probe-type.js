/* 위계 · 머리 행 · 서체 배선 검사

   디자인시스템 "구현 검증" 절의 항목을 그대로 옮겼다.
   판정은 이 파일이 내고 사람이 다시 눈으로 본다.
*/
(function () {
  const stage = document.getElementById('stage');
  const k = stage.getBoundingClientRect().width / 1920;
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  const active = slides.findIndex(function (s) { return s.classList.contains('active'); });

  const big = [], mid = [], small = [], hangulInDisplay = [], kickers = [], pagenos = [], closes = [];

  slides.forEach(function (sl, si) {
    slides.forEach(function (s, i) { s.classList.toggle('active', i === si); });
    let n64 = 0;
    sl.querySelectorAll('*').forEach(function (el) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      // 글자가 직접 든 요소만 센다
      const own = [].slice.call(el.childNodes).some(function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (!own) return;
      const fs = Math.round(parseFloat(cs.fontSize) * 100) / 100;
      if (fs >= 64) { n64 += 1; big.push([si + 1, fs, el.textContent.trim().slice(0, 14)]); }
      if (fs > 32.5 && fs < 63.5) mid.push([si + 1, fs, el.textContent.trim().slice(0, 14)]);
      if (fs < 19.5) small.push([si + 1, fs, el.textContent.trim().slice(0, 14)]);
      if (cs.fontFamily.indexOf('Samsung Sharp Sans') === 0 && /[가-힣]/.test(el.textContent)) {
        hangulInDisplay.push([si + 1, el.textContent.trim().slice(0, 20)]);
      }
    });
    const kick = sl.querySelector('.kicker'), pn = sl.querySelector('.pageno');
    if (kick) kickers.push([si + 1, kick.textContent.trim()]);
    if (pn) {
      const r = pn.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      pagenos.push([si + 1, pn.textContent.trim(), Math.round((r.right - sr.left) / k)]);
    }
    const cl = sl.querySelectorAll('.close');
    const tops = [].slice.call(cl).map(function (c) {
      const r = c.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      return Math.round((r.top - sr.top) / k);
    });
    closes.push([si + 1, cl.length, tops.join(','), n64]);
  });
  slides.forEach(function (s, i) { s.classList.toggle('active', i === active); });

  return JSON.stringify({
    over64: big, band33to63: mid, under20: small,
    hangulInDisplayFont: hangulInDisplay,
    kickers: kickers, pageNumbers: pagenos,
    closePerSlide: closes
  }, null, 1);
})();
