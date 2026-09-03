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
/* 꼬리표 */
slides.forEach(function (s, i) {
  if (s.hasAttribute('data-nofoot')) return;
  var f = document.createElement('div'); f.className = 'foot';
  f.textContent = String(i + 1).padStart(2, '0') + ' / ' + slides.length;
  s.appendChild(f);
});
function apply(s, k) {
  $$('[data-step]', s).forEach(function (el) { el.classList.toggle('on', +el.dataset.step <= k); });
  $$('[data-out]', s).forEach(function (el) { el.classList.toggle('off', +el.dataset.out <= k); });
  var h = HOOK[s.id]; if (h && h.step) h.step(k);
}
function show(n) {
  n = Math.max(0, Math.min(slides.length - 1, n));
  var prev = slides[cur];
  clearTimers();
  cur = n; step = 0;
  slides.forEach(function (s, i) { s.classList.toggle('active', i === n); });
  viewport.classList.toggle('dark', slides[n].classList.contains('dark')); viewport.classList.toggle('blue', slides[n].classList.contains('blue'));
  var h = HOOK[slides[n].id]; if (h && h.reset) h.reset();
  apply(slides[n], 0);
  if (prev !== slides[n]) { var ph = HOOK[prev.id]; setTimeout(function () { if (ph && ph.reset) ph.reset(); apply(prev, 0); }, 400); }
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

/* 입력 · 모델 · 출력. 모델 원을 입력(왼쪽 반원)과 출력(오른쪽 반원)이 감싼다 */
function orb(el) {
  var c = 380, R = 352, r = 226, rc = 168;
  function half(sweepOuter, sweepInner) {
    return 'M' + c + ',' + (c - R) + ' A' + R + ',' + R + ' 0 0 ' + sweepOuter + ' ' + c + ',' + (c + R) + ' L' + c + ',' + (c + r) + ' A' + r + ',' + r + ' 0 0 ' + sweepInner + ' ' + c + ',' + (c - r) + ' Z';
  }
  el.innerHTML = '<svg viewBox="0 0 760 760">' +
    '<path class="seg in" d="' + half(0, 1) + '"/><path class="seg out" d="' + half(1, 0) + '"/>' +
    '<circle class="core" cx="' + c + '" cy="' + c + '" r="' + rc + '"/>' +
    '<text class="t-seg t-in" x="' + (c - (R + r) / 2) + '" y="' + c + '">입력</text>' +
    '<text class="t-seg t-out" x="' + (c + (R + r) / 2) + '" y="' + c + '">출력</text>' +
    '<text class="t-core" x="' + c + '" y="' + c + '">모델</text></svg>';
}
['s4orb', 's5orb', 's16orb', 's30orb'].forEach(function (id) { orb($(id)); });
HOOK.s16 = { step: function (k) { $('s16orb').classList.toggle('lit-model', k < 1); $('s16orb').classList.toggle('lit-in', k >= 1); } };
HOOK.s30 = { step: function (k) { $('s30orb').classList.toggle('lit-in', k < 1); $('s30orb').classList.toggle('lit-out', k >= 1); } };

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

/* S6 · 프롬프트에 답하는 출력을 한 낱말씩 고른다. Space 한 번에 후보 게이지가 한 번 오르고 고른 낱말이 문장에 붙는다 */
(function () {
  var GIVEN = ['벤처캐피탈은'];
  var STEPS = [
    [['초기', 41], ['유망한', 33], ['성장', 18], ['기술', 8]],
    [['스타트업에', 63], ['기업에', 21], ['단계의', 11], ['회사에', 5]],
    [['투자하고', 58], ['투자해', 24], ['자금을', 12], ['돈을', 6]],
    [['성장을', 46], ['경영을', 27], ['상장까지', 15], ['회수를', 12]],
    [['도와', 52], ['지원해', 31], ['함께', 12], ['이끌어', 5]],
    [['수익을', 49], ['지분', 28], ['기업', 14], ['투자금을', 9]],
    [['얻는', 57], ['내는', 22], ['회수하는', 14], ['남기는', 7]],
    [['회사입니다', 66], ['투자사입니다', 19], ['곳입니다', 11], ['기관입니다', 4]]
  ];
  var sent = $('s6sent'), list = $('s6list');
  function drawSent(n) {
    var words = GIVEN.concat(STEPS.slice(0, n).map(function (s) { return s[0][0]; }));
    sent.innerHTML = words.map(function (w, i) { return '<span class="w' + (i >= GIVEN.length ? ' new' : '') + (i === words.length - 1 && n > 0 ? ' last' : '') + '">' + w + '</span>'; }).join('');
  }
  function drawCands(i) {
    list.innerHTML = STEPS[i].map(function (c, j) { return '<div class="cand' + (j === 0 ? ' top' : '') + '"><span>' + c[0] + '</span><div class="b"><i style="--w:' + c[1] + '%"></i></div><span class="p">' + c[1] + '%</span></div>'; }).join('');
    later(function () { list.classList.add('up'); }, 30);
  }
  HOOK.s6 = {
    reset: function () { clearTimers(); list.classList.remove('up'); drawSent(0); drawCands(0); },
    step: function (k) {
      clearTimers(); list.classList.remove('up');
      var n = Math.min(k, STEPS.length);
      drawSent(n); drawCands(Math.min(n, STEPS.length - 1));
    }
  };
})();

/* S7 · 토큰 상자. 상자 하나가 토큰 하나. 어절 하나 안팎이며 짧은 어절은 묶인다 */
(function () {
  var T = ['이 영어', '글을', '한국어로', '자연스럽게', '번역하고', '원문의', '어조는', '그대로', '유지해 줘.', '전문 용어는', '원어를', '괄호 안에', '함께 적고,', '분량은', '원문과', '비슷하게', '맞춰 줘.', '번역이 끝나면', '핵심 내용을', '세 줄로', '요약해 줘.'];
  $('s7ko').innerHTML = T.map(function (t) { return '<span class="tk">' + t + '</span>'; }).join(' ');
  HOOK.s7 = { step: function (k) { $('s7tok').classList.toggle('split', k >= 1); } };
})();

/* S8 · S9 · 장부 막대는 줄이 나타날 때 자란다 (CSS). 9장 3단계에 앞의 문답과 줄이 '이전 입력' 색이 된다 */
HOOK.s9 = { step: function (k) { $('s9k').classList.toggle('prev', k >= 3); $('s9bill').classList.toggle('prev', k >= 3); } };

/* S10 · 라인업. 등급이 오를수록 노드가 많아진다 */
(function () {
  var M = [
    { n: 'Haiku <b>4.5</b>', t: '가장 빠른 모델', d: ['가장 저렴하고 빠른 모델이며 일상적인 Q&A나 검색은 Haiku로도 충분', '지금은 잘 쓰이지 않고 버전 업데이트도 1년 가까이 정체'], c: [3, 4, 3], g: 96, r: 14 },
    { n: 'Sonnet <b>5</b>', t: '속도와 지능의 균형', d: ['기본 모델', '속도와 성능의 균형이 가장 잘 잡힌 모델'], c: [4, 6, 6, 4], g: 72, r: 12 },
    { n: 'Opus <b>5</b>', t: '복잡한 작업과 업무용', d: ['조금 더 복잡한 문제를 해결하기 위한 모델', '비싼 요금제를 쓰는 사람들은 거의 기본 모델처럼 사용'], c: [5, 8, 9, 8, 5], g: 56, r: 10 },
    { n: 'Fable <b>5</b>', t: '가장 높은 등급', d: ['Mythos 모델을 일반 사용자가 쓸 수 있도록 안전장치를 씌운 모델', '현존하는 모든 AI 모델 중 가장 성능이 좋다고 알려짐'], c: [6, 10, 12, 12, 10, 6], g: 44, r: 8 }
  ];
  var sel = -1, box = $('s10nn');
  function render() {
    $$('#s10pick button').forEach(function (b, i) { b.classList.toggle('sel', i === sel); });
    var m = sel >= 0 ? M[sel] : null;
    if (m) { nn(box, m.c, { w: 600, h: 600, gapY: m.g, r: m.r }); box.classList.remove('fade'); void box.offsetWidth; box.classList.add('fade'); } else box.innerHTML = '';
    $('s10pd').innerHTML = m ? '<div class="pn">' + m.n + '</div><div class="pt">' + m.t + '</div><ul class="bullets">' + m.d.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '';
  }
  $$('#s10pick button').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); sel = +b.dataset.i; render(); b.blur(); }); });
  HOOK.s10 = { reset: function () { sel = -1; render(); }, step: function (k) { sel = k >= 1 ? Math.min(3, k - 1) : -1; render(); } };
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
  var LV = ['Low', 'Medium', 'High', 'Extra high', 'Max'], G = [[8, 45], [20, 60], [45, 75], [70, 90], [100, 100]];
  var lv = 2;
  function render() {
    $$('#s13lv .l').forEach(function (l) { l.classList.toggle('sel', +l.dataset.i === lv); });
    $('s13en').textContent = LV[lv];
    $('s13g1').style.height = G[lv][0] + '%'; $('s13g2').style.height = G[lv][1] + '%';
  }
  $$('#s13lv .l').forEach(function (l) { l.addEventListener('click', function (e) { e.stopPropagation(); lv = +l.dataset.i; render(); }); });
  HOOK.s13 = { reset: function () { lv = 2; render(); }, step: function (k) { lv = k === 1 ? 4 : k === 2 ? 0 : 2; render(); } };
  render();
})();

/* S14 · 모르는 구간 */
HOOK.s14 = { step: function (k) { $$('#s14ax .unk').forEach(function (u) { u.classList.toggle('on', k >= 1); }); } };

/* S17 · 컨텍스트 윈도우. 대본 순서대로 채운다 */
(function () {
  var IT = [
    { n: '시스템 프롬프트를 포함한 설정 파일', w: '확인할 일 없음', t: 4200, c: 'var(--n6)' },
    { n: '메모리', w: '설정 > 메모리', t: 680, c: 'var(--n5)' },
    { n: '도구 정보(MCP)', w: '설정 > 커넥터', t: 1200, c: 'var(--n4)' },
    { n: '스킬 설명', w: '설정 > 스킬', t: 450, c: 'var(--n3)' },
    { n: '프로필 지침', w: '설정 > 일반', t: 320, c: 'var(--n2)' },
    { n: '프로젝트 지침', w: '프로젝트 > 지침', t: 1800, c: 'var(--n1)' },
    { n: '프롬프트', w: '채팅창에 보낼 때마다 직접 쓰는 입력', t: 45, c: 'var(--n7)' }
  ];
  var CE = { n: '컨텍스트 엔지니어링', w: '컨텍스트 윈도우에 필요한 정보, 도구, 메모리, 외부 데이터 등을 체계적으로 넣고 최적화하는 기술', c: 'var(--ink)' };
  var MAX = 12000, bar = $('s17bar'), lg = $('s17lg'), insp = $('s17i'), n = 0, hover = -1, ce = false;
  bar.innerHTML = IT.map(function (it, i) { return '<i data-i="' + i + '" style="background:' + it.c + '"></i>'; }).join('');
  lg.innerHTML = IT.map(function (it, i) { return '<span data-i="' + i + '"><i style="background:' + it.c + '"></i>' + it.n + '</span>'; }).join('');
  function showInsp(i) {
    var it = i === 'ce' ? CE : i >= 0 ? IT[i] : null;
    insp.querySelector('.n i').style.background = it ? it.c : 'transparent';
    insp.querySelector('.n span').textContent = it ? it.n : '';
    insp.querySelector('.w').textContent = it ? it.w : '';
  }
  function render() {
    $$('#s17bar i').forEach(function (s, i) { var on = i < n; s.style.width = on ? (IT[i].t / MAX * 100) + '%' : '0'; s.classList.toggle('on', on); s.classList.toggle('hot', i === hover); });
    $$('#s17lg span').forEach(function (s, i) { s.classList.toggle('on', i < n); });
    bar.classList.toggle('focus', hover >= 0);
    $('s17ph').textContent = n >= 7 ? 'A사 회사소개 자료 기준으로 시범 도입 고객 수를 정리해 줘' : 'Claude에게 메시지 보내기';
    $('s17ph').style.color = n >= 7 ? 'var(--k-ink)' : '';
    showInsp(hover >= 0 ? hover : ce ? 'ce' : n - 1);
  }
  function bind(sel) { $$(sel).forEach(function (el) { el.addEventListener('mouseenter', function () { var i = +el.dataset.i; if (i < n) { hover = i; render(); } }); el.addEventListener('mouseleave', function () { hover = -1; render(); }); }); }
  bind('#s17bar i'); bind('#s17lg span');
  HOOK.s17 = { reset: function () { n = 1; hover = -1; ce = false; render(); }, step: function (k) { n = Math.min(7, k + 1); ce = k >= 7; hover = -1; render(); } };
})();

/* S18 · 가이드 표를 회색으로 눌러 버린다 */
HOOK.s18 = { step: function (k) { $('s18g').classList.toggle('dim', k >= 1); } };

/* S22 · 문단에서 나타나는 순서대로 번호를 붙인다 */
HOOK.s22 = { step: function (k) {
  for (var i = 1; i <= 5; i++) { $$('#s22p .g.c' + i).forEach(function (g) { g.classList.toggle('on', i <= k); }); $$('#s22 .labels .lb.c' + i).forEach(function (l) { l.classList.toggle('on', i <= k); }); }
} };

/* S23 · S24 · 설정 화면에서 짚기 */
HOOK.s23 = { step: function (k) { $('s23st').classList.toggle('focus', k >= 1); } };
HOOK.s24 = { step: function (k) { $('s24st').classList.add('focus'); $('s24row').classList.toggle('hot', k === 0); $('s24sw').classList.toggle('hot', k === 1); $('s24sw2').classList.toggle('hot', k === 1); $('s24new').classList.toggle('hot', k === 2); } };

/* S26 · 지침 → 프로젝트 지식 순서로 짚기 */
HOOK.s26 = { step: function (k) { $('s26pj').classList.toggle('focus', k >= 1 && k <= 2); $('s26i').classList.toggle('hot', k === 1); $('s26k').classList.toggle('hot', k === 2); } };

/* S34 · 스킬 시연. 진행 표시와 브리프 열기 */
(function () {
  var rows = $$('#s34st div');
  HOOK.s34 = {
    reset: function () { rows.forEach(function (r) { r.classList.remove('ok'); }); },
    step: function (k) { if (k >= 1) rows.forEach(function (r, i) { later(function () { r.classList.add('ok'); }, 350 * i); }); else rows.forEach(function (r) { r.classList.remove('ok'); }); }
  };
  $('s34card').addEventListener('click', function (e) { e.stopPropagation(); if (state().step < 3) window.finish(); });
})();

/* S35 · 보고서 생성. 왼쪽은 만들 때마다 판이 달라지고 오른쪽은 양식이 같고 줄 길이만 조금 흔들린다 */
(function () {
  var L = $('s35dL'), Rr = $('s35dR');
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pct(v) { return 'width:' + Math.round(v) + '%'; }
  function line(w) { return '<div class="l" style="' + pct(w) + '"></div>'; }
  function table() { var s = '<div class="tb">'; for (var i = 0; i < 6; i++) s += '<i></i>'; return s + '</div>'; }
  function left() {
    var h = '<div class="t" style="' + pct(rnd(30, 80)) + (Math.random() < .4 ? ';align-self:center' : '') + '"></div>';
    var secs = 2 + Math.floor(Math.random() * 2), img = false;
    for (var s = 0; s < secs; s++) {
      var kind = Math.random();
      if (Math.random() < .7) h += '<div class="h" style="' + pct(rnd(18, 45)) + '"></div>';
      if (kind < .25 && !img) { img = true; h += '<div class="img" style="' + pct(rnd(40, 100)) + '"></div>'; }
      else if (kind < .45) h += table();
      else { var n = 1 + Math.floor(Math.random() * 2); for (var i = 0; i < n; i++) h += line(rnd(35, 100)); }
    }
    L.innerHTML = h;
  }
  function right() {
    var h = '<div class="t" style="' + pct(52) + '"></div>';
    for (var s = 0; s < 3; s++) { h += '<div class="h" style="' + pct(28) + '"></div>'; for (var i = 0; i < 3; i++) h += line([96, 88, 62][i] + rnd(-6, 6)); }
    h += '<div class="h" style="' + pct(28) + '"></div>' + table();
    Rr.innerHTML = h;
  }
  function gen() { left(); right(); }
  $('s35gen').addEventListener('click', function (e) { e.stopPropagation(); gen(); this.blur(); });
  HOOK.s35 = { reset: gen };
  gen();
})();

/* S36 · 허브. 여섯 서비스가 Claude 둘레에 선으로 이어진다 */
(function () {
  var host = $('s36hub'), W = 1000, H = 600, cx = W / 2, cy = H / 2, SV = ['Google Drive', 'Gmail', 'PowerPoint', 'File System', 'Excel', 'Word'];
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '">', nodes = '';
  SV.forEach(function (n, i) { var ang = -Math.PI / 2 + i * Math.PI / 3; var x = cx + 370 * Math.cos(ang), y = cy + 230 * Math.sin(ang);
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>';
    nodes += '<div class="sv on" style="left:' + x + 'px;top:' + y + 'px">' + n + '</div>'; });
  svg += '</svg>';
  host.innerHTML = svg + nodes + '<div class="c">Claude</div>';
})();

/* 시작 */
var h0 = parseInt((location.hash || '#1').slice(1), 10); show(isNaN(h0) ? 0 : h0 - 1);
