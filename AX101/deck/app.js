/* AX 101 · 넘김과 단계.
   Space: 이 장의 다음 단계, 단계가 끝나면 다음 장. → / PageDown: 다음 장. ← / PageUp: 앞 장. Home/End: 처음/끝.
   화면 클릭으로는 넘어가지 않는다. 눌러서 고르는 부품(알약 · Effort 줄 · 파일 카드)만 반응한다 */
var stage = document.getElementById('stage'), viewport = document.getElementById('viewport');
function fit() { var s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')'; }
addEventListener('resize', fit); fit();
function $(id) { return document.getElementById(id); }
function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
var slides = $$('.s'), cur = 0, step = 0, HOOK = {}, timers = [];
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
/* 말풍선 본문을 .tx로 감싼다. 점이 먼저, 글이 나중에 켜지도록 */
$$('.k .a[data-step]').forEach(function (a) {
  var frag = [], cur = null;
  [].slice.call(a.childNodes).forEach(function (nd) {
    var isText = nd.nodeType === 3 || (nd.nodeType === 1 && (nd.tagName === 'BR' || nd.tagName === 'B' || nd.tagName === 'SPAN' && !nd.classList.contains('tt') && !nd.classList.contains('badge') && !nd.classList.contains('tx')));
    if (isText) { if (!cur) { cur = document.createElement('span'); cur.className = 'tx'; frag.push(cur); } cur.appendChild(nd); }
    else { cur = null; frag.push(nd); }
  });
  a.innerHTML = ''; frag.forEach(function (n) { a.appendChild(n); });
});
/* 꼬리표 */
slides.forEach(function (s, i) {
  if (s.hasAttribute('data-nofoot')) return;
  var f = document.createElement('div'); f.className = 'foot';
  f.textContent = String(i + 1).padStart(2, '0') + ' / ' + slides.length;
  s.appendChild(f);
});
function apply(s, k) {
  var seen = {};
  $$('[data-step]', s).forEach(function (el) {
    var on = +el.dataset.step <= k, was = el.classList.contains('on');
    if (on && !was) {
      var g = el.closest('[data-stagger]');
      if (g) { var key = g.id + ':' + el.dataset.step; seen[key] = seen[key] || 0; el.style.setProperty('--d', (seen[key]++ * Math.min(+g.dataset.stagger || 40, 60)) + 'ms'); }
    }
    if (!on) el.style.removeProperty('--d');
    el.classList.toggle('on', on);
  });
  $$('[data-out]', s).forEach(function (el) { el.classList.toggle('off', +el.dataset.out <= k); });
  var h = HOOK[s.id]; if (h && h.step) h.step(s.dataset.hook ? Math.min(k, +s.dataset.hook) : k);
}
/* 내용만 바뀌는 물건은 사라졌다 나타나지 않는다. 옛 모습을 그 자리에 겹쳐 두고 새 모습이 올라오는 동안 옛 모습이 내려간다 */
var EASE = 'cubic-bezier(.2,.7,.2,1)';
function swapText(el, fn) {
  var par = el.parentNode; if (!par) { fn(); return; }
  if (el._ghost) { el._ghost.remove(); el._ghost = null; }
  var g = el.cloneNode(true); g.removeAttribute('id'); $$('[id]', g).forEach(function (x) { x.removeAttribute('id'); }); g.classList.add('ghost');
  if (getComputedStyle(par).position === 'static') par.style.position = 'relative';
  g.style.cssText += ';position:absolute;left:' + el.offsetLeft + 'px;top:' + el.offsetTop + 'px;width:' + el.offsetWidth + 'px;height:' + el.offsetHeight + 'px;margin:0;pointer-events:none;';
  par.appendChild(g); el._ghost = g;
  fn();
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: EASE });
  g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: EASE }).onfinish = function () { g.remove(); if (el._ghost === g) el._ghost = null; };
}
/* 신경망 모핑. 노드와 선을 한 벌 만들어 두고 자리와 반지름만 옮긴다. 안 쓰는 노드는 열 가운데로 모여 사라진다 */
function nnMorph(svg, cols, opt) {
  var W = 600, H = 600, P = 6, R = 12, r0 = (opt && opt.r) || 10, gapY = (opt && opt.gapY) || 56;
  if (!svg._pool) {
    var html = '', cc = [], pp = [];
    for (var c = 0; c < P - 1; c++) for (var i = 0; i < R; i++) for (var k = 0; k < R; k++) html += '<path data-c="' + c + '" data-i="' + i + '" data-k="' + k + '"/>';
    for (var c2 = 0; c2 < P; c2++) for (var i2 = 0; i2 < R; i2++) html += '<circle data-c="' + c2 + '" data-i="' + i2 + '"/>';
    svg.innerHTML = html; svg._pool = { c: $$('circle', svg), p: $$('path', svg) };
  }
  var n = cols.length, xs = cols.map(function (_, c) { return n === 1 ? W / 2 : 40 + c * (W - 80) / (n - 1); });
  function pos(c, i) { var on = c < n && i < cols[c]; return { x: c < n ? xs[c] : xs[n - 1], y: on ? H / 2 + (i - (cols[c] - 1) / 2) * gapY : H / 2, on: on }; }
  svg._pool.c.forEach(function (el) { var q = pos(+el.dataset.c, +el.dataset.i); el.style.cx = q.x + 'px'; el.style.cy = q.y + 'px'; el.style.r = (q.on ? r0 : 0) + 'px'; el.style.opacity = q.on ? 1 : 0; });
  svg._pool.p.forEach(function (el) { var a = pos(+el.dataset.c, +el.dataset.i), b = pos(+el.dataset.c + 1, +el.dataset.k); el.style.d = "path('M" + a.x + " " + a.y + " L" + b.x + " " + b.y + "')"; el.style.opacity = a.on && b.on ? 1 : 0; });
}
/* 장을 넘길 때 같은 물건(data-morph)은 옛 자리에서 새 자리로 미끄러진다. 지금은 높이와 세로 위치만 */
function morphAcross(prev, next) {
  var st = document.getElementById('stage').getBoundingClientRect(), kk = st.width / 1920;
  $$('[data-morph]', next).forEach(function (el) {
    var key = el.dataset.morph, from = prev.querySelector('[data-morph="' + key + '"]'); if (!from) return;
    var a = from.getBoundingClientRect(), b = el.getBoundingClientRect();
    var dy = (a.top - b.top) / kk, h0 = a.height / kk, h1 = b.height / kk;
    if (Math.abs(dy) < 1 && Math.abs(h0 - h1) < 1) return;
    el.animate([{ transform: 'translateY(' + dy + 'px)', height: h0 + 'px' }, { transform: 'none', height: h1 + 'px' }], { duration: 520, easing: EASE });
  });
}
function raf2(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }
function show(n) {
  n = Math.max(0, Math.min(slides.length - 1, n));
  var prev = slides[cur];
  clearTimers();
  cur = n; step = 0;
  slides[n].classList.add('still');
  slides.forEach(function (s, i) { s.classList.toggle('active', i === n); });
  viewport.classList.toggle('dark', slides[n].classList.contains('dark')); viewport.classList.toggle('blue', slides[n].classList.contains('blue'));
  var h = HOOK[slides[n].id]; if (h && h.reset) h.reset();
  apply(slides[n], 0);
  if (prev !== slides[n]) {
    slides.forEach(function (s) { if (s !== prev) s.classList.remove('leaving'); });
    prev.classList.add('leaving'); clearTimeout(prev._lv);
    morphAcross(prev, slides[n]);
    prev._lv = setTimeout(function () { prev.classList.remove('leaving'); var ph = HOOK[prev.id]; if (ph && ph.reset) ph.reset(); apply(prev, 0); $$('.ghost', prev).forEach(function (e) { e.remove(); }); }, 320);
  }
  raf2(function () { slides[n].classList.remove('still'); });
  location.hash = String(n + 1);
}
function next() {
  var s = slides[cur], max = +s.dataset.steps || 0;
  if (step < max) { step++; apply(s, step); } else show(cur + 1);
}
addEventListener('keydown', function (e) {
  if (e.key === ' ') { next(); e.preventDefault(); }
  else if (e.key === 'ArrowRight' || e.key === 'PageDown') { show(cur + 1); e.preventDefault(); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(cur - 1); e.preventDefault(); }
  else if (e.key === 'Home') { show(0); } else if (e.key === 'End') { show(slides.length - 1); }
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
});
window.go = function (n) { show(n - 1); }; window.nextStep = next; window.state = function () { return { page: cur + 1, step: step }; };
window.finish = function () { var s = slides[cur], max = +s.dataset.steps || 0; while (step < max) { step++; apply(s, step); } };

/* 신경망 그림. 층마다 노드 수를 받아 선과 점을 그린다 */
function nn(el, cols, opt) {
  opt = opt || {};
  var W = opt.w || 420, H = opt.h || 300, r = opt.r || 9, gapY = opt.gapY || 44;
  var xs = cols.map(function (_, c) { return cols.length === 1 ? W / 2 : 40 + c * (W - 80) / (cols.length - 1); });
  var pts = cols.map(function (n, c) { var arr = []; for (var i = 0; i < n; i++) arr.push([xs[c], H / 2 + (i - (n - 1) / 2) * gapY]); return arr; });
  var html = '';
  for (var c = 0; c < cols.length - 1; c++) pts[c].forEach(function (a) { pts[c + 1].forEach(function (b) { html += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; }); });
  pts.forEach(function (col) { col.forEach(function (p) { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '"/>'; }); });
  el.innerHTML = html;
}

/* 모델과 인터페이스. 사람의 머리와 어깨 실루엣 안에 뇌. 모델이면 뇌가, 인터페이스면 몸이 켜진다 (4 · 5 · 16장) */
/* 불규칙 네트워크 그래프. 크기가 다른 점 몇 개와 성긴 선. s 6개, m 9개, l 13개 */
function netGraph(svg, size) {
  var P = {
    s: { n: [[80,150,16],[190,80,10],[250,190,20],[340,110,12],[360,230,9],[160,250,11]], e: [[0,1],[1,2],[1,3],[2,3],[2,4],[3,4],[2,5],[0,5]] },
    m: { n: [[55,150,15],[150,60,10],[230,125,20],[335,55,11],[365,175,13],[275,225,9],[160,255,12],[80,245,8],[395,265,9]], e: [[0,1],[1,2],[2,3],[2,4],[3,4],[2,5],[4,5],[5,6],[0,6],[6,7],[0,7],[4,8],[5,8],[1,4],[0,2]] },
    l: { n: [[45,140,14],[120,55,9],[200,110,18],[290,45,10],[335,130,12],[395,70,8],[400,200,14],[300,205,10],[230,265,9],[150,225,12],[70,255,8],[350,270,9],[120,155,7]], e: [[0,1],[1,2],[2,3],[3,4],[2,4],[4,5],[3,5],[4,6],[6,7],[4,7],[2,7],[7,8],[8,9],[2,9],[9,10],[0,10],[0,12],[12,2],[12,9],[6,11],[8,11],[7,11],[1,12]] }
  }[size || 'm'];
  var html = '';
  P.e.forEach(function (e) { var a = P.n[e[0]], b = P.n[e[1]]; html += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; });
  P.n.forEach(function (p) { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '"/>'; });
  svg.innerHTML = html;
}
function figure(el, labels) {
  el.innerHTML = '<svg viewBox="0 0 600 900">' +
    '<path class="body" d="M40,900 V760 C40,600 160,510 300,510 C440,510 560,600 560,760 V900 Z"/>' +
    '<circle class="body head" cx="300" cy="250" r="200"/>' +
    '<svg class="nn fnn" x="120" y="120" width="360" height="260" viewBox="0 0 420 300"></svg>' +
    '</svg>' + (labels === false ? '' : '<div class="fl"><span class="t-model">모델</span><span class="t-if">인터페이스</span></div>');
  netGraph(el.querySelector('svg.fnn'), el.classList.contains('brain-l') ? 'l' : el.classList.contains('brain-s') ? 's' : 'm');
}
$$('.fig').forEach(function (el) { figure(el, el.classList.contains('ink') ? false : undefined); });
HOOK.s16 = { step: function (k) { $('s16fig').classList.toggle('lit-model', k < 1); $('s16fig').classList.toggle('lit-if', k >= 1); } };

/* S2 */
HOOK.s2 = { step: function (k) { $('s2q').classList.toggle('is-dim', k >= 2); } };

/* S3 · 인터페이스가 모델을 품고, 모델 카드와 채팅의 주황 점을 선으로 잇는다 */
(function () {
  nn($('s3nn'), [4, 6, 6, 3]);
  var cards = $('s3cards'), link = $('s3link');
  function pos(el) { var x = 0, y = 0; while (el && el !== cards) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x: x, y: y }; }
  function draw() {
    var m = cards.querySelector('.card.model'), a = $('s3a');
    var x1 = m.offsetLeft + m.offsetWidth, y1 = m.offsetTop + m.offsetHeight / 2;
    var p = pos(a), x2 = p.x + 14, y2 = p.y + 17;
    link.setAttribute('viewBox', '0 0 ' + cards.offsetWidth + ' ' + cards.offsetHeight);
    link.innerHTML = '<circle cx="' + x1 + '" cy="' + y1 + '" r="10"/><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
  }
  cards.querySelector('.card.model').addEventListener('transitionend', function (e) { if (e.propertyName === 'left' && cards.classList.contains('nest')) draw(); });
  HOOK.s3 = { step: function (k) { cards.classList.toggle('nest', k >= 3); if (k < 3) link.innerHTML = ''; } };
})();

/* S6 · 한 Space 한 박자. 후보 넷이 60ms 계단으로 서고 막대가 자란 뒤, 뽑힌 행이 짙어지고, 300ms 뒤 낱말이 말풍선에 내려앉는다 */
(function () {
  var GIVEN = ['삼성벤처투자는'];
  var STEPS = [
    { c: [['삼성그룹의', 38], ['삼성의', 35], ['국내', 16], ['글로벌', 11]], pick: 1 },
    { c: [['미래', 52], ['신사업', 24], ['핵심', 14], ['차세대', 10]], pick: 0 },
    { c: [['먹거리를', 33], ['사업을', 29], ['성장동력을', 26], ['기술을', 12]], pick: 2 },
    { c: [['발굴하고,', 57], ['찾아내고,', 23], ['키우고,', 13], ['확보하고,', 7]], pick: 0 },
    { c: [['기술', 46], ['혁신적인', 28], ['유망', 16], ['신기술', 10]], pick: 0 }
  ];
  var REST = ['혁신을', '기반으로', '새로운', '가치를', '창출하기', '위한', '기업형', '벤처캐피탈입니다.'];
  var ans = $('s6a'), list = $('s6list');
  function words(n, full) { var w = GIVEN.concat(STEPS.slice(0, n).map(function (st) { return st.c[st.pick][0]; })); return full ? w.concat(REST) : w; }
  function drawSent(n, full, land) {
    var w = words(n, full), base = words(land ? n - (full ? 0 : 1) : n, false).length;
    if (full && land) base = words(n, false).length;
    ans.innerHTML = w.map(function (x, i) { var isNew = i >= base; return '<span class="w' + (isNew ? ' new' : ' on') + '" style="--d:' + ((i - base) * 60) + 'ms">' + x + '</span>'; }).join(' ');
    if (land) raf2(function () { $$('#s6a .w.new').forEach(function (e) { e.classList.add('on'); }); });
  }
  function header() { return '<div class="ch">다음 토큰 후보와 확률</div>'; }
  function drawCands(i) {
    list.classList.remove('up');
    if (i < 0) { list.innerHTML = header(); return; }
    var st = STEPS[i];
    list.innerHTML = header() + st.c.map(function (c, j) { return '<div class="cand" style="--d:' + (j * 40) + 'ms"><span>' + c[0] + '</span><div class="b"><i style="--w:' + c[1] + '%"></i></div><span class="p">' + c[1] + '%</span></div>'; }).join('');
    raf2(function () { list.classList.add('up'); });
    later(function () { var r = $$('#s6list .cand')[st.pick]; if (r) r.classList.add('pick'); }, 260);
  }
  HOOK.s6 = {
    reset: function () { clearTimers(); drawSent(0, false, false); drawCands(-1); },
    step: function (k) {
      clearTimers();
      if (k >= 6) { swapText(list, function () { drawCands(-1); }); drawSent(5, true, true); return; }
      swapText(list, function () { drawCands(k - 1); });
      later(function () { drawSent(k, false, true); }, 380);
    }
  };
})();

/* S7 · 같은 채팅. 어절 하나가 토큰 하나. Space 1 상자, Space 2 토큰 수 꼬리표 */
(function () {
  function chips(el) { var raw = el.textContent.trim(); var t = raw.indexOf('|') >= 0 ? raw.split('|') : raw.split(/\s+/); el.innerHTML = t.map(function (w, i) { return '<span class="tk" style="--i:' + (i + (el.dataset.off | 0)) + '">' + w + '</span>'; }).join(' '); return t.length; }
  var nu = chips($('s7u')); $('s7a').dataset.off = nu; var na = chips($('s7a'));
  $('s7u').insertAdjacentHTML('beforeend', '<span class="tt in" data-step="2">' + nu + '토큰</span>');
  $('s7a').insertAdjacentHTML('beforeend', '<span class="tt out" data-step="2">' + na + '토큰</span>');
  HOOK.s7 = { step: function (k) { $('s7k').classList.toggle('split', k >= 1); } };
})();

/* S8 · S9 · 장부 막대는 줄이 나타날 때 자란다 (CSS). 9장 3단계에 앞의 문답과 줄이 '이전 입력' 색이 된다 */
function countUp(el, to, ms) { var t0 = performance.now(); function f(t) { var p = Math.min(1, (t - t0) / ms); p = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * p) + '원'; if (p < 1) requestAnimationFrame(f); } requestAnimationFrame(f); }
HOOK.s8 = { step: function (k) { if (k === 5) countUp($('s8sum'), 600, 400); if (k === 6) countUp($('s8sum'), 625, 400); if (k < 5) $('s8sum').textContent = '600원'; } };
HOOK.s9 = { step: function (k) { $('s9k').classList.toggle('prev', k >= 4); $('s9bill').classList.toggle('prev', k >= 4); } };

/* S10 · 라인업. 등급이 오를수록 노드가 많아진다 */
(function () {
  var M = [
    { n: 'Haiku <b>4.5</b>', t: '가장 빠른 모델', d: ['가장 저렴하고 빠른 모델이며 일상적인 Q&A나 검색은 Haiku로도 충분', '지금은 잘 쓰이지 않고 버전 업데이트도 1년 가까이 정체'], c: [3, 4, 3], g: 96, r: 14 },
    { n: 'Sonnet <b>5</b>', t: '속도와 지능의 균형', d: ['기본 모델', '속도와 성능의 균형이 가장 잘 잡힌 모델'], c: [4, 6, 6, 4], g: 72, r: 12 },
    { n: 'Opus <b>5</b>', t: '복잡한 작업과 업무용', d: ['조금 더 복잡한 문제를 해결하기 위한 모델', '비싼 요금제를 쓰는 사람들은 거의 기본 모델처럼 사용'], c: [5, 8, 9, 8, 5], g: 56, r: 10 },
    { n: 'Fable <b>5</b>', t: '가장 높은 등급', d: ['Mythos 모델을 일반 사용자가 쓸 수 있도록 안전장치를 씌운 모델', '현존하는 모든 AI 모델 중 가장 성능이 좋다고 알려짐'], c: [6, 10, 12, 12, 10, 6], g: 44, r: 8 }
  ];
  var sel = 1, box = $('s10nn');
  nn($('s10nn0'), M[1].c, { w: 600, h: 600, gapY: M[1].g, r: M[1].r });
  nn($('s10ann'), M[2].c, { w: 600, h: 600, gapY: M[2].g, r: M[2].r });
  nnMorph(box, M[1].c, { gapY: M[1].g, r: M[1].r });
  var lastSel = -2;
  function render() {
    $$('#s10pick button').forEach(function (b, i) { b.classList.toggle('sel', i === sel); });
    var m = M[sel];
    nnMorph(box, m.c, { gapY: m.g, r: m.r });
    if (sel === lastSel) return; lastSel = sel;
    swapText($('s10pd'), function () { $('s10pd').innerHTML = '<div class="pn">' + m.n + '</div><div class="pt">' + m.t + '</div><ul class="bullets">' + m.d.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; });
  }
  $$('#s10pick button').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); sel = +b.dataset.i; render(); b.blur(); }); });
  HOOK.s10b = { reset: function () { sel = 1; lastSel = -2; render(); }, step: function (k) { sel = k >= 1 ? Math.min(3, k - 1) : 1; render(); } };
})();

/* S12 · 메뉴 항목 짚기. 1단계 모델 줄, 2단계 Effort 줄 */
HOOK.s12 = { step: function (k) {
  $('s12n').classList.toggle('focus', k >= 1);
  $$('#s12n .it').forEach(function (n, i) { n.classList.toggle('lit', i + 1 === k); });
  $('s12k').classList.toggle('focus', k >= 1);
  $('s12model').classList.toggle('hot', k === 1);
  $$('#s12menu .mi.md').forEach(function (m) { m.classList.toggle('hot', k === 1); });
  $('s12effort').classList.toggle('hot', k === 2); $$('#s12sub .mi').forEach(function (m) { m.classList.toggle('hot', k === 2); });
} };

/* S13 · Effort 고르기. 세로 게이지 */
(function () {
  var LV = ['Low', 'Medium', 'High', 'xhigh', 'Max'], G = [[8, 45], [20, 60], [45, 75], [70, 90], [100, 100]];
  var lv = 2;
  function render() {
    $$('#s13lv .l').forEach(function (l) { l.classList.toggle('sel', +l.dataset.i === lv); });
    if ($('s13en').textContent !== LV[lv]) swapText($('s13en'), function () { $('s13en').textContent = LV[lv]; });
    $('s13g1').style.setProperty('--h', G[lv][0] + '%'); $('s13g2').style.setProperty('--h', G[lv][1] + '%');
  }
  $$('#s13lv .l').forEach(function (l) { l.addEventListener('click', function (e) { e.stopPropagation(); lv = +l.dataset.i; render(); }); });
  HOOK.s13 = { reset: function () { lv = 2; render(); }, step: function (k) { lv = k === 1 ? 4 : k === 2 ? 0 : 2; render(); } };
  render();
})();

/* S14 · 모르는 구간 */
HOOK.s14 = { step: function (k) {
  $$('#s14ax .unk').forEach(function (u, i) { u.style.transitionDelay = k >= 1 ? (i * 40) + 'ms' : '0ms'; u.classList.toggle('on', k >= 1); });
  var up = k >= 2, tr = $('s14ft'), sp = $$('span', tr), nm = $('s14fn');
  var V = up ? ['87.5%', '87.5%', '87.5%', '97%', '97%'] : ['62.5%', '62.5%', '62.5%', '87.5%', '87.5%'], T = up ? ['26.06', '26.09'] : ['26.01', '26.06'];
  sp.forEach(function (e, i) { e.style.setProperty('--x', V[i]); }); sp[4].style.transform = up ? 'translateX(-85%)' : '';
  if ((nm.textContent === 'Fable 5.1') !== up) { swapText(nm, function () { nm.textContent = up ? 'Fable 5.1' : 'Fable 5'; }); swapText(sp[2], function () { sp[2].textContent = T[0]; }); swapText(sp[4], function () { sp[4].textContent = T[1]; }); }
} };

/* S17 · 컨텍스트 윈도우. 대본 순서대로 채운다 */
(function () {
  var IT = [
    { n: '시스템 프롬프트를 포함한 설정 파일', w: 'Claude의 기본 동작을 정해 둔 파일. 우리가 볼 일은 없음', t: 2400, c: 'var(--g1)' },
    { n: '메모리', w: 'Claude가 대화에서 스스로 뽑아 쌓아 두는 입력', t: 600, c: 'var(--c2)' },
    { n: '도구 정보(MCP)', w: '모델이 쓸 수 있는 도구의 목록과 사용법', t: 1200, c: 'var(--g2)' },
    { n: '스킬 설명', w: '어떤 스킬이 있고 언제 쓰는지에 대한 요약', t: 400, c: 'var(--g3)' },
    { n: 'Claude 지침', w: '내 모든 대화에 자동으로 들어가는 지침', t: 150, c: 'var(--c1)' },
    { n: '프로젝트 지침', w: '프로젝트 안의 대화에만 들어가는 지침', t: 600, c: 'var(--c3)' },
    { n: '프롬프트', w: '채팅창에 보낼 때마다 직접 쓰는 입력', t: 40, c: 'var(--c5)' },
    { n: '첨부 파일', w: '첨부한 파일의 내용이 그대로 들어감', t: 2600, c: 'var(--c4)' }
  ];
  window.CW_LAYERS = IT;
  var CE = { n: '컨텍스트 엔지니어링', w: '컨텍스트 윈도우에 필요한 정보와 도구와 메모리와 외부 데이터를 체계적으로 넣고 최적화하는 기술', c: 'var(--ink)' };
  var MAX = 24000, bar = $('s17bar'), lg = $('s17lg'), insp = $('s17i'), n = 0, hover = -1, ce = false;
  bar.innerHTML = IT.map(function (it, i) { return '<i data-i="' + i + '" style="background:' + it.c + '"></i>'; }).join('');
  lg.innerHTML = IT.map(function (it, i) { return '<span data-i="' + i + '"><i style="background:' + it.c + '"></i>' + it.n + '</span>'; }).join('');
  var lastInsp = null;
  function showInsp(i) {
    var it = i === 'ce' ? CE : i >= 0 ? IT[i] : null;
    if (it === lastInsp) return; lastInsp = it;
    swapText(insp, function () {
      insp.querySelector('.n i').style.background = it ? it.c : 'transparent';
      insp.querySelector('.n span').textContent = it ? it.n : '';
      insp.querySelector('.w').textContent = it ? it.w : '';
    });
  }
  function render() {
    $$('#s17bar i').forEach(function (s, i) { var on = i < n; s.style.width = on ? (IT[i].t / MAX * 100) + '%' : '0'; s.classList.toggle('on', on); s.classList.toggle('hot', i === hover); });
    $$('#s17lg span').forEach(function (s, i) { s.classList.toggle('on', i < n); });
    bar.classList.toggle('focus', hover >= 0); $('s17cw').classList.toggle('dimlg', hover >= 0); $$('#s17lg span').forEach(function (sp, i) { sp.classList.toggle('hot', i === hover); });
    showInsp(hover >= 0 ? hover : ce ? 'ce' : n - 1);
  }
  function bind(sel) { $$(sel).forEach(function (el) { el.addEventListener('mouseenter', function () { var i = +el.dataset.i; if (i < n) { hover = i; render(); } }); el.addEventListener('mouseleave', function () { hover = -1; render(); }); }); }
  bind('#s17bar i'); bind('#s17lg span');
  HOOK.s17 = { reset: function () { n = 1; hover = -1; ce = false; render(); }, step: function (k) { n = k >= 8 ? 8 : Math.min(7, k + 1); ce = k === 9; hover = k === 7 ? 6 : k === 8 ? 7 : -1; render(); } };
})();

/* S18 · 가이드 표를 회색으로 눌러 버린다 */
HOOK.s20 = { step: function (k) { var ph = $('s20ph'); var typed = k < 1; if ((ph.textContent === '앤트로픽에 대해 조사해줘') !== typed) swapText(ph, function () { ph.textContent = typed ? '앤트로픽에 대해 조사해줘' : 'Claude에게 메시지 보내기'; ph.style.color = typed ? 'var(--k-ink)' : ''; }); } };
HOOK.s18 = { step: function (k) { $('s18g').classList.toggle('dim', k >= 1); } };

/* S22 · 문단에서 나타나는 순서대로 번호를 붙인다 */
HOOK.s22 = { step: function (k) {
  $('s22k').classList.toggle('only5', k >= 5);
  for (var i = 1; i <= 5; i++) {
    var gs = $$('#s22p .g.c' + i);
    gs.forEach(function (g, j) { g.style.transitionDelay = (i === k ? j * 40 : 0) + 'ms'; g.classList.toggle('on', i <= k); });
    $$('#s22 .labels .lb.c' + i).forEach(function (l) { l.style.transitionDelay = (i === k ? gs.length * 40 + 60 : 0) + 'ms'; l.classList.toggle('on', i <= k); });
  }
} };

/* S23 · S24 · 설정 화면에서 짚기 */
HOOK.s23 = { step: function (k) { $('s23st').classList.toggle('focus', k >= 1 && k < 3); } };
HOOK.s24 = { step: function (k) {
  $('s24st').classList.toggle('focus', k >= 1); $('s24row').classList.toggle('hot', k === 0); $('s24sw').classList.toggle('hot', k === 1); $('s24sw2').classList.toggle('hot', k === 1); $('s24new').classList.toggle('hot', k === 2);
  $$('#s24sw .tg, #s24sw2 .tg').forEach(function (t) { t.classList.toggle('off', k < 1); });
  var kin = $('s24kin'), typed = k >= 2; if ((kin.textContent !== '변경하거나 제거할 내용을 Claude에게 알려주세요') !== typed) swapText(kin, function () { kin.textContent = typed ? 'A사 딜은 9월 투자심의 안건이야, 기억해 줘' : '변경하거나 제거할 내용을 Claude에게 알려주세요'; kin.classList.toggle('typed', typed); });
  $('s24kin').parentNode.classList.toggle('hot', k >= 2);
} };

/* S26 · 지침 → 프로젝트 지식 순서로 짚기 */
HOOK.s26 = { step: function (k) {
  $('s26pj').classList.toggle('focus', k >= 1 && k <= 2); $('s26i').classList.toggle('hot', k === 1); $('s26k').classList.toggle('hot', k === 2);
  var pin = $('s26pin'), typed = k >= 3; if ((pin.textContent !== '이 프로젝트에서 새 채팅') !== typed) swapText(pin, function () { pin.textContent = typed ? 'A사 시장 규모 확인해 줘' : '이 프로젝트에서 새 채팅'; pin.classList.toggle('typed', typed); });
} };

/* S34 · 스킬 시연. 진행 표시와 브리프 열기 */
(function () {
  var rows = $$('#s34st div');
  HOOK.s34 = {
    reset: function () { rows.forEach(function (r) { r.classList.remove('ok'); }); },
    step: function (k) { if (k >= 1) rows.forEach(function (r, i) { later(function () { r.classList.add('ok'); }, 180 * i); }); else rows.forEach(function (r) { r.classList.remove('ok'); }); }
  };
  $('s34card').addEventListener('click', function (e) { e.stopPropagation(); if (state().step < 3) window.finish(); });
})();

/* S35 · 보고서 생성. 오른쪽은 36장 브리프의 블록(제목·수치 여섯·벤토 열한 칸)이 매번 같은 자리에, 왼쪽은 같은 재료가 다른 판으로 */
(function () {
  var L = $('s35dL'), Rr = $('s35dR');
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pct(v) { return 'width:' + Math.round(v) + '%'; }
  function line(w) { return '<div class="l" style="' + pct(w) + '"></div>'; }
  function table(n) { var t = '<div class="tb">'; for (var i = 0; i < n; i++) t += '<i></i>'; return t + '</div>'; }
  function bento(cols, n, ov) { var t = '<div class="bento" style="grid-template-columns:repeat(' + cols + ',1fr)">'; for (var i = 0; i < n; i++) t += '<i' + (ov && i === 0 ? ' class="ov"' : '') + '></i>'; return t + '</div>'; }
  function delay(html) { var i = 0; return html.replace(/<div class="(t|h|l|tb|bento)"/g, function (m) { return m.replace('"', '" data-i="' + (i++) + '"'); }); }
  function left() {
    var al = Math.random() < .35 ? ';align-self:center' : Math.random() < .5 ? ';align-self:flex-end' : '';
    var h = '<div class="t" style="' + pct(rnd(24, 90)) + al + '"></div>';
    var parts = [];
    if (Math.random() < .6) parts.push(table(2 + Math.floor(Math.random() * 4)));
    var secs = 1 + Math.floor(Math.random() * 2);
    for (var s = 0; s < secs; s++) { var p = '<div class="h" style="' + pct(rnd(12, 60)) + '"></div>'; var n = Math.floor(Math.random() * 3); for (var i = 0; i < n; i++) p += line(rnd(20, 100)); parts.push(p); }
    if (Math.random() < .7) parts.push(bento(1 + Math.floor(Math.random() * 3), 2 + Math.floor(Math.random() * 5), false));
    if (Math.random() < .4) parts.push('<div class="img" style="' + pct(rnd(30, 100)) + '"></div>');
    parts.sort(function () { return Math.random() - .5; });
    return h + parts.join('');
  }
  function right() {
    var h = '<div class="t" style="' + pct(52) + '"></div>' + table(6);
    h += '<div class="h" style="' + pct(28) + '"></div>' + line(96) + line(88);
    h += bento(3, 11, true);
    return h;
  }
  function paint(el, html) { swapText(el, function () { el.innerHTML = html; el.classList.add('up'); }); }
  function gen() { paint(L, left()); paint(Rr, right()); }
  $('s35gen').addEventListener('click', function (e) { e.stopPropagation(); gen(); this.blur(); });
  HOOK.s35 = { reset: gen, step: function (k) { if (k >= 4) gen(); } };
})();

/* S36 · 커넥터. 마지막 Space에 관리자 승인 행만 남긴다 */
HOOK.s33 = { step: function (k) { var f = $('s33f'); $$('#s33f .fi').forEach(function (r, i) { r.style.setProperty('--d', (i * 40) + 'ms'); }); f.classList.toggle('open', k >= 2); } };
HOOK.s31 = { step: function (k) {
  var T = { s31p1: 'B사 투자 검토 보고서를 만들어 줘. 표지에는 회사명과 날짜를 넣고, 1장은 개요를 다섯 줄로, 2장은 …', s31p2: '이 예시들처럼 B사 투자 검토 보고서를 만들어 줘' };
  Object.keys(T).forEach(function (id) { var ph = $(id), typed = k >= 2; if ((ph.textContent !== 'Claude에게 메시지 보내기') !== typed) swapText(ph, function () { ph.textContent = typed ? T[id] : 'Claude에게 메시지 보내기'; ph.style.color = typed ? 'var(--k-ink)' : ''; }); });
} };
HOOK.s36 = { step: function (k) { $('s36st').classList.toggle('focus', k >= 3); } };

/* 시작 */
var h0 = parseInt((location.hash || '#1').slice(1), 10); show(isNaN(h0) ? 0 : h0 - 1);

/* S29 · 레이어 정리. 18장의 막대를 네 줄로. 메시지마다 앞의 것이 전부 다시 들어가고 프롬프트와 답이 붙는다 */
(function () {
  var L = window.CW_LAYERS, MAX = 16000;
  var auto = [0, 1, 2, 3, 4, 5].map(function (i) { return L[i]; }).concat([{ n: '프로젝트 지식', t: 1500, c: 'var(--c4)' }]);
  var P = { n: '프롬프트', t: 60, c: 'var(--c5)' }, A = { n: '답변', t: 400, c: 'var(--g4)', hatch: true };
  function seg(it) { return '<i class="on' + (it.hatch ? ' hatch' : '') + '" style="background:' + it.c + ';--w:' + (it.t / MAX * 100) + '%"></i>'; }
  $$('#s29lb .bar').forEach(function (b) {
    var m = +b.dataset.msg, list = auto.slice();
    for (var i = 1; i <= m; i++) { list.push(P); if (i < m) list.push(A); }
    b.innerHTML = list.map(seg).join('');
  });
  var lg = auto.concat([P, A]);
  $('s29lg').innerHTML = lg.map(function (it) { return '<span><i' + (it.hatch ? ' class="hatch"' : '') + ' style="background:' + it.c + '"></i>' + it.n + '</span>'; }).join('');
})();

/* S39 · 인터페이스 정리. 19장의 막대에 프로젝트 지식 칸을 더한 아홉 칸. Space 1 모델 메뉴(막대 밖), 2~5 색 칸과 같은 색 테두리의 조각이 짝으로, 6 검정 칸과 프롬프트 */
(function () {
  var L = window.CW_LAYERS, MAX = 24000;
  var list = [L[0], L[1], L[2], L[3], L[4], L[5], { n: '프로젝트 지식', t: 1500, c: 'var(--c4)' }, L[6], L[7]];
  $('s39bar').innerHTML = list.map(function (it) { return '<i class="on" style="background:' + it.c + ';--w:' + (it.t / MAX * 100) + '%"></i>'; }).join('');
  $('s39lg').innerHTML = list.map(function (it) { return '<span class="on"><i style="background:' + it.c + '"></i>' + it.n + '</span>'; }).join('');
  var HOT = { 2: 1, 3: 4, 4: 5, 5: 6, 6: 7 }, RING = { s39m: 2, s39g: 3, s39pi: 4, s39pk: 5 };
  HOOK.s39 = { step: function (k) {
    var hot = k in HOT ? HOT[k] : -1;
    $('s39bar').classList.toggle('focus', k >= 1); $('s39cw').classList.toggle('dimlg', k >= 1);
    $$('#s39bar i').forEach(function (s, i) { s.classList.toggle('hot', i === hot); });
    $$('#s39lg span').forEach(function (s, i) { s.classList.toggle('hot', i === hot); });
    $('s39k').classList.toggle('focus', k === 1); $('s39model').classList.toggle('hot', k === 1);
    $$('#s39menu .mi, #s39sub .mi').forEach(function (m) { m.classList.toggle('hot', k === 1); });
    $('s39pan').classList.toggle('focus', k >= 1);
    Object.keys(RING).forEach(function (id) { $(id).classList.toggle('hot', RING[id] === k); });
    var ph = $('s39ph'), typed = k >= 6;
    if ((ph.textContent !== 'Claude에게 메시지 보내기') !== typed) swapText(ph, function () { ph.textContent = typed ? 'A사 시장 규모 확인해 줘' : 'Claude에게 메시지 보내기'; ph.style.color = typed ? 'var(--k-ink)' : ''; });
  } };
})();

HOOK.s27 = { step: function (k) { $('s27r').classList.toggle('lit', k >= 1); } };
