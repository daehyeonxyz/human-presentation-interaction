(function () {
  // Pretendard 는 dynamic subset 이라 실제 글자를 지정해 명시적으로 불러야 내려온다
  const ko = document.getElementById('stage').textContent.replace(/\s+/g, '') + '가나다라마바사아자차카타파하';
  const en = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·:/%().,';
  const jobs = [];
  [400, 500, 700, 800].forEach(function (w) {
    jobs.push(document.fonts.load(w + ' 100px "Pretendard Variable"', ko + en));
    jobs.push(document.fonts.load(w + ' 100px Pretendard', ko + en));
  });
  [400, 500, 700].forEach(function (w) {
    jobs.push(document.fonts.load(w + ' 100px "Samsung Sharp Sans"', en));
  });
  window.__fontsDone = false;
  Promise.all(jobs.map(function (p) { return p.catch(function () { return null; }); }))
    .then(function () { return document.fonts.ready; })
    .then(function () { window.__fontsDone = true; });
  return 'loading ' + jobs.length + ' faces';
})();
