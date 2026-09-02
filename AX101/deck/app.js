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
  viewport.classList.toggle('dark', slides[n].classList.contains('dark'));
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

/* 문서 모양 */
var SHAPES = { A: ['t', 'i', 'i', 'i', 'i', 'i'], B: ['i', 'i', 'i', 'b'], C: ['t', 'p', 'p'], D: ['t', 'i', 'i', 'i', 'i', 'i', 'b'], E: ['t', 'i', 'i', 'i', 'i', 'b'], T: ['t', 'i', 'i', 'i', 'b', 'i', 'i'] };
function docshape(kind, hl) {
  var rows = SHAPES[kind], W = 168, y = 0, out = [];
  rows.forEach(function (r, idx) {
    var h = r === 't' ? 11 : r === 'i' ? 7 : r === 'b' ? 26 : 20;
    if (hl === idx) out.push('<rect class="hl" x="-4" y="' + (y - 3) + '" width="' + (W + 8) + '" height="' + (h + 6) + '" rx="3"/>');
    if (r === 't') out.push('<rect class="t" x="0" y="' + y + '" width="' + Math.round(W * .55) + '" height="' + h + '" rx="3"/>');
    else if (r === 'i') { out.push('<circle class="l" cx="3" cy="' + (y + 3.5) + '" r="2.5"/><rect class="l" x="12" y="' + (y + 1) + '" width="' + Math.round(W * (.5 + ((idx * 37) % 40) / 100)) + '" height="5" rx="2"/>'); }
    else if (r === 'b') { for (var a = 0; a < 3; a++) for (var c = 0; c < 3; c++) out.push('<rect class="l" x="' + (c * 57) + '" y="' + (y + a * 9) + '" width="52" height="6" rx="2"/>'); }
    else { for (var k = 0; k < 3; k++) out.push('<rect class="l" x="0" y="' + (y + k * 6.5) + '" width="' + (k === 2 ? Math.round(W * .6) : W) + '" height="4.5" rx="2"/>'); }
    y += h + 7;
  });
  return '<svg viewBox="-4 -4 176 128" preserveAspectRatio="xMinYMin meet">' + out.join('') + '</svg>';
}
$$('.doc[data-shape]').forEach(function (d) { d.innerHTML = docshape(d.dataset.shape); });

/* S2 */
HOOK.s2 = { step: function (k) { $('s2q').classList.toggle('is-dim', k >= 2); } };

/* S3 · 신경망 그림과 포함 */
(function () {
  var g = $('nn'), cols = [4, 6, 6, 3], xs = [40, 150, 260, 380], html = '';
  var pts = cols.map(function (n, c) { var arr = []; for (var i = 0; i < n; i++) arr.push([xs[c], 150 + (i - (n - 1) / 2) * 44]); return arr; });
  for (var c = 0; c < 3; c++) pts[c].forEach(function (a) { pts[c + 1].forEach(function (b) { html += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#C9C4B8" stroke-width="1"/>'; }); });
  pts.forEach(function (col) { col.forEach(function (p) { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#fff" stroke="#161616" stroke-width="2"/>'; }); });
  g.innerHTML = html;
  HOOK.s3 = { step: function (k) { $('s3cards').classList.toggle('nest', k >= 3); } };
})();

/* S6 · 다음 낱말과 조각 */
HOOK.s6 = {
  step: function (k) {
    var sent = $('s6sent');
    $$('#s6cands .b i').forEach(function (i) { i.style.width = k >= 1 ? i.dataset.w + '%' : '0'; });
    if (k >= 2) {
      var pieces = ['좋', '은', '답', '은', '좋', '은', '자', '료', '에서', '나옵', '니다'];
      sent.innerHTML = pieces.map(function (p) { return '<span class="w piece">' + p + '</span>'; }).join('');
      sent.classList.add('split'); $('s6cands').style.display = 'none';
    } else {
      sent.classList.remove('split'); $('s6cands').style.display = '';
      sent.innerHTML = '<span class="w">좋은</span><span class="w">답은</span><span class="w">좋은</span><span class="w">자료에서</span><span class="w blank" id="s6blank">&nbsp;</span>';
      if (k >= 1) later(function () { var b = $('s6blank'); if (b) b.textContent = '나옵니다'; }, 700);
    }
  }
};

/* S7 · S8 장부 막대 */
function bars(id) { return { step: function (k) { $$('#' + id + ' .bar i').forEach(function (i) { i.style.width = (+i.dataset.step <= k) ? i.dataset.w + '%' : '0'; }); if (id === 's8') $$('#s8 .prev').forEach(function (b) { b.style.outline = k >= 3 ? '3px solid #3A8FFF' : 'none'; b.style.outlineOffset = '2px'; }); } }; }
HOOK.s7 = bars('s7'); HOOK.s8 = bars('s8');

/* S9 · 줄 켜기와 뇌 */
HOOK.s9 = { step: function (k) {
  $$('#s9t tr.row').forEach(function (r, i) { r.classList.toggle('lit', i + 1 === k || (k >= 5 && i === 3)); });
  $$('#s9b .brain').forEach(function (b, i) { b.classList.toggle('on', i + 1 <= k); });
} };

/* S11 · 스포트라이트 */
HOOK.s11 = { step: function (k) {
  var cl = $('s11cl'); cl.classList.toggle('spot', k >= 1);
  $('s11model').classList.toggle('spot-ring', k === 1);
  $('s11effort').classList.toggle('spot-ring', k === 2); $('s11sub').style.opacity = k === 2 || k === 0 ? 1 : .35;
  $('s11think').classList.toggle('spot-ring', k === 3);
} };

/* S12 · 슬라이더 장치 */
(function () {
  var LV = ['Low', 'Medium', 'High', 'Extra high', 'Max'], G = [[10, 45, 10, 40], [25, 60, 25, 55], [50, 75, 50, 70], [75, 90, 75, 88], [100, 100, 100, 100]];
  var sl = $('s12sl'), lv = 2, hard = 0, stops = [], labs = [];
  LV.forEach(function (n, i) { var x = 14 + 522 * i / 4; var s = document.createElement('div'); s.className = 'st'; s.style.left = x + 'px'; sl.appendChild(s); stops.push(s); var l = document.createElement('div'); l.className = 'lb'; l.style.left = x + 'px'; l.textContent = n; sl.appendChild(l); labs.push(l); });
  function render() { $('s12g1').style.width = G[lv][hard ? 1 : 0] + '%'; $('s12g2').style.width = G[lv][hard ? 3 : 2] + '%'; stops.forEach(function (s, i) { s.classList.toggle('sel', i === lv); }); labs.forEach(function (l, i) { l.classList.toggle('sel', i === lv); }); $$('#s12tg button').forEach(function (b) { b.classList.toggle('sel', +b.dataset.v === hard); }); }
  function fromX(cx) { var r = sl.getBoundingClientRect(); var x = (cx - r.left) / (r.width / 550); return Math.max(0, Math.min(4, Math.round((x - 14) / 522 * 4))); }
  var drag = false;
  sl.addEventListener('pointerdown', function (e) { drag = true; sl.setPointerCapture(e.pointerId); lv = fromX(e.clientX); render(); });
  sl.addEventListener('pointermove', function (e) { if (!drag) return; var n = fromX(e.clientX); if (n !== lv) { lv = n; render(); } });
  sl.addEventListener('pointerup', function () { drag = false; }); sl.addEventListener('pointercancel', function () { drag = false; });
  $$('#s12tg button').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); hard = +b.dataset.v; render(); b.blur(); }); });
  HOOK.s12 = { reset: function () { lv = 2; hard = 0; render(); } };
  render();
})();

/* S13 · 모른다 영역 */
HOOK.s13 = { step: function (k) { $$('#s13ax .unk').forEach(function (u) { u.classList.toggle('on', k >= 2); }); } };

/* S15 · 그릇 */
(function () {
  var INFO = { sys: ['시스템 프롬프트를 포함한 설정 파일', '서비스가 미리 넣어 두는 것 · 우리가 확인할 일은 없다'], mem: ['메모리', '<b>설정 &gt; 메모리</b>'], tool: ['도구 정보 (MCP)', '연결된 커넥터가 무엇을 할 수 있는지'], skill: ['스킬 설명', '어떤 스킬이 있는지'], prof: ['전역 지침', '<b>설정 &gt; 일반 : 프로필 지침</b> · 내 모든 대화에 적용'], proj: ['프로젝트 지침', '<b>프로젝트 &gt; 지침</b> · 프로젝트 내부 대화에만 적용'] };
  var ORDER = ['sys', 'mem', 'tool', 'skill', 'prof', 'proj'], TOK = { sys: 4200, mem: 800, tool: 2500, skill: 1200, prof: 300, proj: 600 };
  var items = {}; $$('#s15v .it').forEach(function (it) { items[it.dataset.k] = it; });
  var pin = null, total = 0;
  function insp(k) { var i = INFO[k]; $('s15n').textContent = i[0]; $('s15p').innerHTML = i[1]; }
  function meter() { $('s15m').style.height = (total / 12000 * 100) + '%'; $('s15mv').textContent = total.toLocaleString('ko-KR') + ' 토큰'; }
  Object.keys(items).forEach(function (k) {
    items[k].addEventListener('mouseenter', function () { if (!pin && items[k].classList.contains('on')) insp(k); });
    items[k].addEventListener('mouseleave', function () { if (!pin) { var last = ORDER.filter(function (x) { return items[x].classList.contains('on'); }).pop(); if (last) insp(last); } });
    items[k].addEventListener('click', function (e) { e.stopPropagation(); if (!items[k].classList.contains('on')) return; pin = pin === k ? null : k; Object.keys(items).forEach(function (x) { items[x].classList.toggle('hot', x === pin); }); insp(k); });
  });
  HOOK.s15 = {
    reset: function () { pin = null; total = 0; Object.keys(items).forEach(function (k) { items[k].className = 'it'; items[k].querySelector('.path') && items[k].querySelector('.path').classList.remove('on'); }); $('s15slot').classList.remove('on'); meter(); $('s15n').innerHTML = '&nbsp;'; $('s15p').innerHTML = '&nbsp;'; },
    step: function (k) {
      if (k >= 1) ORDER.forEach(function (x, i) { if (items[x].classList.contains('on')) return; later(function () { items[x].classList.add('on'); total += TOK[x]; meter(); insp(x); }, 550 * i); });
      if (k >= 1) later(function () { $('s15slot').classList.add('on'); }, 550 * ORDER.length);
      items.sys.classList.toggle('faded', k >= 2);
      items.mem.querySelector('.path').classList.toggle('on', k >= 3);
      items.prof.querySelector('.path').classList.toggle('on', k >= 4); items.proj.querySelector('.path').classList.toggle('on', k >= 4);
      if (k === 3) insp('mem'); if (k === 4) insp('prof');
    }
  };
})();

/* S19 · 색 가르기 */
HOOK.s19 = { step: function (k) {
  var order = ['ins', 'mem', 'prj'];
  order.forEach(function (c, i) { $$('#s19p .g.' + c).forEach(function (g) { g.classList.toggle('on', i + 1 <= k); }); $$('.labels .lb.' + c).forEach(function (l) { l.classList.toggle('on', i + 1 <= k); }); });
} };

/* S21 · 표시 */
HOOK.s21 = { step: function (k) { $('s21sw').classList.toggle('spot-ring', k === 2); $('s21x').classList.toggle('spot-ring', k === 2); } };

/* S23 · 지식 · 지침 표시 */
HOOK.s23 = { step: function (k) { $('s23k').classList.toggle('ring', k === 1); $('s23i').classList.toggle('ring', k === 1); $('s23pj').style.opacity = k >= 2 ? .45 : 1; } };

/* S24 · 격자 */
(function () {
  var g = $('s24g'); for (var i = 0; i < 100; i++) { var e = document.createElement('i'); g.appendChild(e); }
  var cells = $$('#s24g i');
  HOOK.s24 = { step: function (k) { cells.forEach(function (c, i) { c.classList.toggle('gone', k >= 1 && i >= 10); c.classList.toggle('mine', k >= 1 && i < 10); }); $('s24n').textContent = k >= 1 ? '10번' : '100번'; $('s24l').textContent = k >= 1 ? '한 번 만들어 나눈다 · 쓸수록 좋아진다' : '각자 처음부터 만든다'; } };
})();

/* S28 · 앞의 것 흐리기 */
HOOK.s28 = { step: function (k) { $('s28a').classList.toggle('is-dim', k >= 2); } };

/* S30 · 개선 루프 */
(function () {
  var a = 0, f = 0, CY = ['A', 'B', 'C', 'E'];
  function render() {
    $('s30dL').innerHTML = docshape(CY[a % 4]); $('s30dR').innerHTML = docshape('D', f ? 3 : undefined);
    $$('#s30mR i').forEach(function (i, k) { i.classList.toggle('on', k <= f); });
    $('s30cL').textContent = a + '번 눌렀다 · 눈금은 그대로'; $('s30cR').textContent = f + '번 고쳤다';
    $('s30again').classList.toggle('done', a >= 3); $('s30fix').classList.toggle('done', f >= 3);
  }
  $('s30again').addEventListener('click', function (e) { e.stopPropagation(); if (a < 3) a++; render(); this.blur(); });
  $('s30fix').addEventListener('click', function (e) { e.stopPropagation(); if (f < 3) f++; render(); this.blur(); });
  HOOK.s30 = { reset: function () { a = 0; f = 0; render(); }, step: function (k) { if (k >= 1 && a < 1) { a = 3; render(); } if (k >= 2 && f < 1) { f = 3; render(); } } };
  render();
})();

/* S31 · 허브 */
(function () {
  var host = $('s31hub'), W = 1100, H = 640, cx = W / 2, cy = H / 2, SV = ['Google Drive', 'Gmail', 'GitHub', 'Slack', 'Microsoft 365'];
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '">', nodes = '';
  SV.forEach(function (n, i) { var ang = -Math.PI / 2 + i * 2 * Math.PI / 5; var x = cx + 400 * Math.cos(ang), y = cy + 250 * Math.sin(ang);
    svg += '<line class="ln" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>';
    var mx = cx + (x - cx) * .62, my = cy + (y - cy) * .62, ux = (x - cx), uy = (y - cy), L = Math.hypot(ux, uy); ux /= L; uy /= L;
    var px = -uy, py = ux;
    function tri(ox, oy, dir) { var tip = [ox + ux * 14 * dir, oy + uy * 14 * dir], b1 = [ox - ux * 8 * dir + px * 9, oy - uy * 8 * dir + py * 9], b2 = [ox - ux * 8 * dir - px * 9, oy - uy * 8 * dir - py * 9]; return '<polygon class="arr" points="' + tip.join(',') + ' ' + b1.join(',') + ' ' + b2.join(',') + '"/>'; }
    svg += tri(mx, my, -1) + tri(mx - ux * 40, my - uy * 40, 1).replace('class="arr"', 'class="arr two-way"');
    nodes += '<div class="sv" style="left:' + x + 'px;top:' + y + 'px">' + n + '</div>'; });
  svg += '</svg>';
  host.innerHTML = svg + nodes + '<div class="c">Claude</div>';
  HOOK.s31 = { step: function (k) { $$('#s31hub .sv').forEach(function (s) { s.classList.toggle('on', k >= 1); }); $$('#s31hub line').forEach(function (l) { l.classList.toggle('on', k >= 1); l.classList.toggle('two', k >= 2); }); $$('#s31hub .arr').forEach(function (a) { a.classList.toggle('on', k >= 1 && (k >= 2 || !a.classList.contains('two-way'))); }); } };
})();

/* S34 */
HOOK.s34 = { step: function (k) { $('s34b').classList.toggle('is-dim', k >= 1); $('s34c').style.opacity = k >= 2 ? 1 : ''; $('s34c').style.color = k >= 2 ? '#fff' : ''; } };

/* 시작 */
var h = parseInt((location.hash || '#1').slice(1), 10); show(isNaN(h) ? 0 : h - 1);
document.addEventListener('click', function (e) { if (e.target.closest('button, .it, .slider, .toggle')) return; next(); });
