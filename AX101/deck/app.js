/* AX 101 · 넘김과 단계. → 또는 Space: 다음 단계, 단계가 끝나면 다음 장. ←: 앞 장. Home/End: 처음/끝 */
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
  f.innerHTML = '<span class="sec">' + (s.dataset.sec || '') + '</span><span>' + String(i + 1).padStart(2, '0') + ' / ' + slides.length + '</span>';
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
function prev() { show(cur - 1); }
addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { next(); e.preventDefault(); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { prev(); e.preventDefault(); }
  else if (e.key === 'Home') { show(0); } else if (e.key === 'End') { show(slides.length - 1); }
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
});
window.go = function (n) { show(n - 1); }; window.nextStep = next; window.state = function () { return { page: cur + 1, step: step }; };
window.finish = function () { var s = slides[cur], max = +s.dataset.steps || 0; while (step < max) { step++; apply(s, step); } };

/* S2 */
HOOK.s2 = { step: function (k) { $('s2q').classList.toggle('is-dim', k >= 2); } };

/* S3 · 신경망 그림과 포함 */
(function () {
  var g = $('nn'), cols = [4, 6, 6, 3], xs = [40, 150, 260, 380], html = '';
  var pts = cols.map(function (n, c) { var arr = []; for (var i = 0; i < n; i++) arr.push([xs[c], 150 + (i - (n - 1) / 2) * 44]); return arr; });
  for (var c = 0; c < 3; c++) pts[c].forEach(function (a) { pts[c + 1].forEach(function (b) { html += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#C9CDD6" stroke-width="1"/>'; }); });
  pts.forEach(function (col) { col.forEach(function (p) { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#fff" stroke="#14171F" stroke-width="2"/>'; }); });
  g.innerHTML = html;
  HOOK.s3 = { step: function (k) { $('s3cards').classList.toggle('nest', k >= 3); } };
})();

/* S6 · 다음 낱말을 잇달아 고른다 (자기회귀) */
(function () {
  var GIVEN = ['이 영어 글을', '한국어로'];
  var STEPS = [
    [['번역해', 62], ['옮겨', 21], ['바꿔', 9], ['정리해', 5]],
    [['줘', 71], ['주세요', 18], ['봐', 7], ['라', 4]]
  ];
  var sent = $('s6sent'), list = $('s6list'), cands = $('s6cands'), words = GIVEN.slice();
  function drawSent(pending) {
    sent.innerHTML = words.map(function (w, i) { return '<span class="w' + (i >= GIVEN.length ? ' new' : '') + '">' + w + '</span>'; }).join('') + (pending ? '<span class="cur"></span>' : '');
  }
  function drawCands(i) {
    if (i < 0 || i >= STEPS.length) { list.innerHTML = ''; return; }
    list.innerHTML = STEPS[i].map(function (c, j) { return '<div class="cand' + (j === 0 ? ' top' : '') + '"><span>' + c[0] + '</span><div class="b"><i data-w="' + c[1] + '"></i></div><span class="p">' + c[1] + '%</span></div>'; }).join('');
    later(function () { $$('#s6list .b i').forEach(function (b) { b.style.width = b.dataset.w + '%'; }); }, 30);
  }
  HOOK.s6 = {
    reset: function () { words = GIVEN.slice(); cands.classList.remove('gone'); drawSent(true); drawCands(0); },
    step: function (k) {
      clearTimers();
      var n = Math.min(k, STEPS.length);
      words = GIVEN.concat(STEPS.slice(0, Math.max(0, n - 1)).map(function (s) { return s[0][0]; }));
      cands.classList.remove('gone');
      if (n === 0) { drawSent(true); drawCands(0); return; }
      drawSent(true); drawCands(n - 1);
      later(function () { cands.classList.add('gone'); words.push(STEPS[n - 1][0][0]); drawSent(n < STEPS.length); }, 900);
      later(function () { if (n < STEPS.length) { cands.classList.remove('gone'); drawCands(n); } }, 1500);
    }
  };
})();

/* S7 · 토큰 조각. 예시이며 실제 조각은 모델마다 다르다 */
(function () {
  var KO = ['이', ' 영어', ' 글', '을', ' 한국어', '로', ' 자연', '스럽게', ' 번역', '하고', ' 원문', '의', ' 어조', '는', ' 그대로', ' 유지', '해', ' 줘', '.'];
  function render(id, arr) { $(id).innerHTML = arr.map(function (p, i) { return '<span class="tk c' + (i % 2) + '">' + p + '</span>'; }).join(''); }
  render('s7ko', KO);
  HOOK.s7 = { step: function (k) { $('s7tok').classList.toggle('split', k >= 1); } };
})();

/* S9 · 이전 대화 강조 */
HOOK.s9 = { step: function (k) { ['s9p1', 's9p2'].forEach(function (id) { $(id).style.opacity = k >= 3 ? 1 : .6; }); } };

/* S10 · 라인업. 파라미터 점과 모델 고르기 */
(function () {
  var M = [
    { n: 'Haiku <b>4.5</b>', t: '가장 빠른 모델', d: ['가장 저렴하고 빠른 모델이며 일상적인 Q&A나 검색은 Haiku로도 충분', '지금은 잘 쓰이지 않고 버전 업데이트도 1년 가까이 정체'], p: 40 },
    { n: 'Sonnet <b>5</b>', t: '속도와 지능의 균형', d: ['기본 모델', '속도와 성능의 균형이 가장 잘 잡힌 모델'], p: 120 },
    { n: 'Opus <b>5</b>', t: '복잡한 작업과 업무용', d: ['조금 더 복잡한 문제를 해결하기 위한 모델', '비싼 요금제를 쓰는 사람들은 거의 기본 모델처럼 사용'], p: 240 },
    { n: 'Fable <b>5</b>', t: '가장 높은 등급', d: ['Mythos 모델을 일반 사용자가 쓸 수 있도록 안전장치를 씌운 모델', '현존하는 모든 AI 모델 중 가장 성능이 좋다고 알려짐'], p: 400 }
  ];
  var g = $('s10g'); for (var i = 0; i < 400; i++) { var e = document.createElement('i'); g.appendChild(e); }
  var dots = $$('#s10g i'), sel = -1;
  function render() {
    $$('#s10pick button').forEach(function (b, i) { b.classList.toggle('sel', i === sel); });
    var m = sel >= 0 ? M[sel] : null;
    dots.forEach(function (d, i) { d.classList.toggle('on', m ? i < m.p : false); });
    $('s10pd').innerHTML = m ? '<div class="pn">' + m.n + '</div><div class="pt">' + m.t + '</div><ul class="bullets">' + m.d.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '';
  }
  $$('#s10pick button').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); sel = +b.dataset.i; render(); b.blur(); }); });
  HOOK.s10 = { reset: function () { sel = -1; render(); }, step: function (k) { sel = k >= 1 ? Math.min(3, k - 1) : -1; render(); } };
})();

/* S12 · 메뉴 항목 짚기 */
HOOK.s12 = { step: function (k) {
  $('s12n').classList.toggle('focus', k >= 1);
  $$('#s12n .it').forEach(function (n, i) { n.classList.toggle('lit', i + 1 === k); });
  $('s12k').classList.toggle('focus', k >= 1);
  $('s12model').classList.toggle('hot', k === 1);
  $('s12effort').classList.toggle('hot', k === 2); $$('#s12sub .mi').forEach(function (m) { m.classList.toggle('hot', k === 2); });
  $('s12think').classList.toggle('hot', k === 3);
} };

/* S13 · Effort 고르기 */
(function () {
  var LV = ['Low', 'Medium', 'High', 'Extra high', 'Max'], G = [[8, 45], [20, 60], [45, 75], [70, 90], [100, 100]];
  var lv = 2;
  function render() {
    $$('#s13lv .l').forEach(function (l) { l.classList.toggle('sel', +l.dataset.i === lv); });
    $('s13en').textContent = LV[lv];
    $('s13g1').style.width = G[lv][0] + '%'; $('s13g2').style.width = G[lv][1] + '%';
  }
  $$('#s13lv .l').forEach(function (l) { l.addEventListener('click', function (e) { e.stopPropagation(); lv = +l.dataset.i; render(); }); });
  HOOK.s13 = { reset: function () { lv = 2; render(); }, step: function (k) { lv = k === 1 ? 4 : k === 2 ? 0 : 2; render(); } };
  render();
})();

/* S14 · 모른다 영역 */
HOOK.s14 = { step: function (k) { $$('#s14ax .unk').forEach(function (u) { u.classList.toggle('on', k >= 2); }); } };

/* S17 · 컨텍스트 윈도우. 대본 순서대로 채운다 */
(function () {
  var IT = [
    { n: '시스템 프롬프트를 포함한 설정 파일', w: '확인할 일 없음', d: '기본 지시와 도구 사용 규칙이며 우리가 볼 일은 없다', t: 4200, c: 'var(--n6)' },
    { n: '메모리', w: '설정 > 메모리', d: 'Claude가 이전 대화에서 스스로 정리해 둔 것', t: 680, c: 'var(--n5)' },
    { n: '도구 정보(MCP)', w: '설정 > 커넥터', d: '연결된 커넥터가 할 수 있는 일의 목록', t: 1200, c: 'var(--n4)' },
    { n: '스킬 설명', w: '설정 > 스킬', d: '어떤 스킬이 있고 언제 쓰는지의 설명이며 본문은 쓸 때만 들어온다', t: 450, c: 'var(--n3)' },
    { n: '프로필 지침', w: '설정 > 일반', d: '내 모든 대화에 적용', t: 320, c: 'var(--n2)' },
    { n: '프로젝트 지침', w: '프로젝트 > 지침', d: '그 프로젝트 안의 대화에만 적용', t: 1800, c: 'var(--n1)' },
    { n: '프롬프트', w: '채팅창에 보낼 때마다 직접 쓰는 입력', d: '매번 직접 쓰는 것이며 앞의 것들 뒤에 붙는다', t: 45, c: 'var(--n7)' }
  ];
  var MAX = 12000, bar = $('s17bar'), lg = $('s17lg'), insp = $('s17i'), n = 0, hover = -1;
  bar.innerHTML = IT.map(function (it, i) { return '<i data-i="' + i + '" style="background:' + it.c + '"></i>'; }).join('');
  lg.innerHTML = IT.map(function (it, i) { return '<span data-i="' + i + '"><i style="background:' + it.c + '"></i>' + it.n + '</span>'; }).join('');
  function showInsp(i) {
    var it = i >= 0 ? IT[i] : null;
    insp.querySelector('.n i').style.background = it ? it.c : 'transparent';
    insp.querySelector('.n span').textContent = it ? it.n : '';
    insp.querySelector('.w').textContent = it ? it.w : '';
  }
  function render() {
    $$('#s17bar i').forEach(function (s, i) { var on = i < n; s.style.width = on ? (IT[i].t / MAX * 100) + '%' : '0'; s.classList.toggle('hot', i === hover); });
    $$('#s17lg span').forEach(function (s, i) { s.classList.toggle('on', i < n); });
    bar.classList.toggle('focus', hover >= 0);
    $('s17ph').textContent = n >= 7 ? 'A사 회사소개 자료 기준으로 시범 도입 고객 수를 정리해 줘' : 'Claude에게 메시지 보내기';
    $('s17ph').style.color = n >= 7 ? 'var(--k-ink)' : '';
    showInsp(hover >= 0 ? hover : n - 1);
  }
  function bind(sel) { $$(sel).forEach(function (el) { el.addEventListener('mouseenter', function () { var i = +el.dataset.i; if (i < n) { hover = i; render(); } }); el.addEventListener('mouseleave', function () { hover = -1; render(); }); }); }
  bind('#s17bar i'); bind('#s17lg span');
  HOOK.s17 = { reset: function () { n = 1; hover = -1; render(); }, step: function (k) { n = Math.min(7, k + 1); hover = -1; render(); } };
})();

/* S18 · 가이드 지우기 */
HOOK.s18 = { step: function (k) { $('s18g').classList.toggle('x', k >= 1); } };

/* S22 · 문단에서 나타나는 순서대로 번호를 붙인다 */
HOOK.s22 = { step: function (k) {
  var order = ['mem', 'prof', 'proj'];
  order.forEach(function (c, i) { $$('#s22p .g.' + c).forEach(function (g) { g.classList.toggle('on', i + 1 <= k); }); $$('#s22 .labels .lb.' + c).forEach(function (l) { l.classList.toggle('on', i + 1 <= k); }); });
} };

/* S23 · S24 · 설정 화면에서 짚기 */
HOOK.s23 = { step: function (k) { $('s23st').classList.toggle('focus', k >= 1); } };
HOOK.s24 = { step: function (k) { $('s24st').classList.add('focus'); $('s24row').classList.toggle('hot', k <= 1); $('s24sw').classList.toggle('hot', k === 2); $('s24sw2').classList.toggle('hot', k === 2); $('s24new').classList.toggle('hot', k === 3); } };

/* S26 · 지식과 지침 짚기 */
HOOK.s26 = { step: function (k) { $('s26pj').classList.toggle('focus', k === 1); $('s26k').classList.toggle('hot', k === 1); $('s26i').classList.toggle('hot', k === 1); } };

/* S27 · 격자 */
(function () {
  var g = $('s27g'); for (var i = 0; i < 100; i++) { var e = document.createElement('i'); g.appendChild(e); }
  var cells = $$('#s27g i');
  HOOK.s27 = { step: function (k) { cells.forEach(function (c, i) { c.classList.toggle('gone', k >= 1 && i >= 10); c.classList.toggle('mine', k >= 1 && i < 10); }); $('s27n').textContent = k >= 1 ? '한 번' : '열 번'; $('s27l').textContent = k >= 1 ? '한 번만 잘 만들어 두고 공유해서 쓰기' : '각자 처음부터 만들면 같은 일을 열 번 반복'; } };
})();

/* S33 · 진행 표시와 브리프 열기 */
(function () {
  var rows = $$('#s33st div');
  HOOK.s33 = {
    reset: function () { rows.forEach(function (r) { r.classList.remove('ok'); }); },
    step: function (k) { if (k >= 1) rows.forEach(function (r, i) { later(function () { r.classList.add('ok'); }, 350 * i); }); else rows.forEach(function (r) { r.classList.remove('ok'); }); }
  };
  $('s33card').addEventListener('click', function (e) { e.stopPropagation(); if (state().step < 3) window.finish(); });
})();

/* S34 · 개선 루프. 왼쪽은 운에 따라 오르내리고 오른쪽은 고친 만큼 쌓인다 */
(function () {
  var a = 0, f = 0, LUCK = [1, 3, 0, 2, 1, 4, 0, 2];
  function render() {
    var L = a === 0 ? 0 : LUCK[(a - 1) % LUCK.length];
    $$('#s34mL i').forEach(function (i, k) { i.classList.toggle('on', k <= L); });
    $$('#s34mR i').forEach(function (i, k) { i.classList.toggle('on', k <= Math.min(f, 4)); });
  }
  $('s34again').addEventListener('click', function (e) { e.stopPropagation(); a++; render(); this.blur(); });
  $('s34fix').addEventListener('click', function (e) { e.stopPropagation(); if (f < 4) f++; render(); this.blur(); });
  HOOK.s34 = { reset: function () { a = 0; f = 0; render(); }, step: function (k) { if (k >= 1 && a < 1) { a = 2; render(); } if (k >= 2 && f < 1) { f = 3; render(); } } };
  render();
})();

/* S35 · 허브. 선마다 화살촉 하나씩이며 둘째 단계에 반대 방향 하나가 더 붙는다 */
(function () {
  var host = $('s35hub'), W = 1000, H = 600, cx = W / 2, cy = H / 2, SV = ['Google Drive', 'Gmail', 'GitHub', 'Slack', 'Microsoft 365'];
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '">', nodes = '';
  SV.forEach(function (n, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / 5; var x = cx + 370 * Math.cos(ang), y = cy + 240 * Math.sin(ang);
    svg += '<line class="ln" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>';
    var ux = (x - cx), uy = (y - cy), L = Math.hypot(ux, uy); ux /= L; uy /= L;
    var px = -uy, py = ux;
    function tri(ox, oy, dir, cls) { var tip = [ox + ux * 14 * dir, oy + uy * 14 * dir], b1 = [ox - ux * 8 * dir + px * 9, oy - uy * 8 * dir + py * 9], b2 = [ox - ux * 8 * dir - px * 9, oy - uy * 8 * dir - py * 9]; return '<polygon class="' + cls + '" points="' + tip.join(',') + ' ' + b1.join(',') + ' ' + b2.join(',') + '"/>'; }
    svg += tri(cx + ux * 122, cy + uy * 122, -1, 'arr in') + tri(x - ux * 150, y - uy * 150, 1, 'arr out');
    nodes += '<div class="sv" style="left:' + x + 'px;top:' + y + 'px">' + n + '</div>'; });
  svg += '</svg>';
  host.innerHTML = svg + nodes + '<div class="c">Claude</div>';
  HOOK.s35 = { step: function (k) { $$('#s35hub .sv').forEach(function (s) { s.classList.add('on'); }); $$('#s35hub line').forEach(function (l) { l.classList.add('on'); l.classList.toggle('two', k >= 2); }); $$('#s35hub .arr').forEach(function (a) { a.classList.toggle('on', a.classList.contains('in') ? k >= 1 : k >= 2); }); } };
})();

/* 시작 */
var h0 = parseInt((location.hash || '#1').slice(1), 10); show(isNaN(h0) ? 0 : h0 - 1);
document.addEventListener('click', function (e) { if (e.target.closest('button, .lv .l, .pills, .file, #s17bar, #s17lg')) return; next(); });
