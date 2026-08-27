/* 줄바꿈 검사

   원칙: 화면의 줄바꿈은 전부 사람이 정한다. 브라우저가 폭에 맞춰 꺾는 자리를 두지 않는다.
   그러므로 검사는 "한 어절만 남았나"를 보는 것이 아니라
   "자동으로 꺾인 자리가 있는가"를 본다. 하나라도 있으면 실패다.

   함께 재는 것: 사람이 정한 줄들의 길이가 서로 얼마나 고른가.
   폭을 다 채우지 않아도 되지만 줄 길이가 들쭉날쭉하면 읽기 흐름이 끊긴다.

   실행: browse 로 슬라이드를 연 뒤 이 파일 내용을 $B js 로 넣는다.
   판정: auto 배열이 비어 있어야 통과다. uneven 은 눈으로 확인할 목록이다.
*/
(function () {
  const auto = [];    // 자동으로 꺾인 자리. 하나라도 있으면 실패
  const uneven = [];  // 줄 길이가 고르지 않은 자리. 눈으로 확인
  const slides = document.querySelectorAll('.slide');

  slides.forEach((slide, si) => {
    slide.querySelectorAll('p, li, div, span, h1, h2, h3, td, th, button, .bub').forEach((el) => {
      const txt = el.textContent.replace(/\s+/g, ' ').trim();
      if (!txt || txt.length < 3) return;
      // 자식이 스스로 블록을 이루면 부모는 건너뛴다
      if ([...el.children].some(c => getComputedStyle(c).display !== 'inline')) return;

      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;

      // 실제로 그려진 줄 수를 잰다
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter(x => x.width > 0.5 && x.height > 0.5);
      if (!rects.length) return;

      // 같은 y 를 한 줄로 묶는다
      const rows = [];
      rects.forEach(x => {
        const row = rows.find(g => Math.abs(g.top - x.top) < 4);
        if (row) { row.left = Math.min(row.left, x.left); row.right = Math.max(row.right, x.right); }
        else rows.push({ top: x.top, left: x.left, right: x.right });
      });
      const drawn = rows.length;

      // 사람이 정한 줄 수 = <br> 개수 + 1
      const declared = el.querySelectorAll('br').length + 1;

      if (drawn > declared) {
        auto.push({
          쪽: si + 1,
          미리보기: txt.slice(0, 44),
          정한줄: declared,
          그려진줄: drawn,
          블록폭: Math.round(r.width)
        });
        return;
      }

      // 줄 길이 고르기 확인
      if (drawn >= 2) {
        const ws = rows.map(g => g.right - g.left);
        const max = Math.max(...ws), min = Math.min(...ws);
        if (max > 0 && (max - min) / max > 0.45) {
          uneven.push({
            쪽: si + 1,
            미리보기: txt.slice(0, 44),
            줄폭: ws.map(w => Math.round(w)),
            편차: Math.round((max - min) / max * 100) + '%'
          });
        }
      }
    });
  });

  return JSON.stringify({ auto: auto, uneven: uneven }, null, 1);
})();
