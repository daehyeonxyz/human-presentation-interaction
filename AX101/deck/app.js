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
  for (var c = 0; c < 3; c++) pts[c].forEach(function (a) { pts[c + 1].forEach(function (b) { html += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#C9CDD6" stroke-width="1"/>'; }); });
  pts.forEach(function (col) { col.forEach(function (p) { html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#fff" stroke="#14171F" stroke-width="2"/>'; }); });
  g.innerHTML = html;
  HOOK.s3 = { step: function (k) { $('s3cards').classList.toggle('nest', k >= 3); } };
})();

/* S6 · 다음 낱말 */
HOOK.s6 = { step: function (k) {
  $$('#s6cands .b i').forEach(function (i) { i.style.width = k >= 1 ? i.dataset.w + '%' : '0'; });
  var bl = $('s6blank'); bl.innerHTML = '&nbsp;';
  if (k >= 1) later(function () { bl.textContent = '나옵니다'; }, 700);
} };

/* S7 · 토큰 조각. 예시 · 실제 조각은 모델마다 다르다 */
(function () {
  var EN = ['Translate', ' this', ' paragraph', ' about', ' Anth', 'ropic', ' into', ' natural', ' Korean', ' and', ' keep', ' the', ' tone', ' of', ' the', ' original', '.'];
  var KO = ['이', ' 영어', ' 글', '을', ' 한국어', '로', ' 자연', '스럽게', ' 번역', '해', ' 주고', ',', ' 원문', '의', ' 어조', '는', ' 그대로', ' 유지', '해', ' 줘', '.'];
  function render(id, arr) { $(id).innerHTML = arr.map(function (p) { var sp = p.charAt(0) === ' '; return (sp ? ' ' : '') + '<span class="tk' + (sp ? ' sp' : '') + '">' + (sp ? p.slice(1) : p) + '</span>'; }).join(''); }
  render('s7en', EN); render('s7ko', KO);
  $('s7cnt').innerHTML = '영어 <b>' + EN.length + '조각</b> · 한국어 <b>' + KO.length + '조각</b> · 예시 · 실제 조각은 모델마다 다르다';
  var tok = $('s7tok'), on = false;
  function set(v) { on = v; tok.classList.toggle('split', on); $('s7btn').textContent = on ? '되돌리기' : '쪼개기'; }
  $('s7btn').addEventListener('click', function (e) { e.stopPropagation(); set(!on); this.blur(); });
  HOOK.s7 = { reset: function () { set(false); }, step: function (k) { set(k >= 1); } };
})();

/* S8 · S9 장부 막대 */
function bars(id) { return { step: function (k) { $$('#' + id + ' .bar i').forEach(function (i) { i.style.width = (+i.dataset.step <= k) ? i.dataset.w + '%' : '0'; }); if (id === 's9') $$('#s9 .prev').forEach(function (b) { b.style.outline = k >= 3 ? '3px solid #3A8FFF' : 'none'; b.style.outlineOffset = '2px'; }); } }; }
HOOK.s8 = bars('s8'); HOOK.s9 = bars('s9');

/* S10 · 라인업. 단계로도, 마우스로도 한 모델에 초점 */
(function () {
  var D = [
    '<b>Haiku</b> · 가장 저렴하고 빠르다. 일상적인 Q&amp;A나 검색은 사실 Haiku로도 충분하지만, 지금은 잘 쓰이지 않고 버전 업데이트도 1년 가까이 정체되어 있다',
    '<b>Sonnet</b> · 기본 모델. 속도와 성능의 균형이 가장 잘 잡혀 있다',
    '<b>Opus</b> · 조금 더 복잡한 문제를 풀기 위한 모델. 비싼 요금제를 쓰는 사람들은 거의 기본 모델처럼 쓴다',
    '<b>Fable</b> · 그 유명한 Mythos에 안전장치를 씌워 일반 사용자에게 연 모델. 현존하는 모델 중 가장 성능이 좋다고 알려져 있다'];
  var m = $('s10m'), cards = $$('#s10m .mc'), cur = -1, hover = -1, done = false;
  function render() { var f = hover >= 0 ? hover : cur; m.classList.toggle('focus', f >= 0); cards.forEach(function (c, i) { c.classList.toggle('lit', i === f); }); $('s10d').innerHTML = (f >= 0 && !(done && hover < 0)) ? D[f] : ''; }
  cards.forEach(function (c, i) { c.addEventListener('mouseenter', function () { if (m.classList.contains('on')) { hover = i; render(); } }); c.addEventListener('mouseleave', function () { hover = -1; render(); }); });
  HOOK.s10 = { reset: function () { cur = -1; hover = -1; done = false; render(); }, step: function (k) { cur = (k >= 2 && k <= 5) ? k - 2 : -1; done = k >= 6; render(); } };
})();

/* S11 · 스포트라이트 */
HOOK.s12 = { step: function (k) {
  var cl = $('s12cl'); cl.classList.toggle('spot', k >= 1);
  $('s12model').classList.toggle('spot-ring', k === 1);
  $('s12effort').classList.toggle('spot-ring', k === 2); $('s12sub').style.opacity = k === 2 || k === 0 ? 1 : .35;
  $('s12think').classList.toggle('spot-ring', k === 3);
} };

/* S12 · 슬라이더 장치 */
(function () {
  var LV = ['Low', 'Medium', 'High', 'Extra high', 'Max'], G = [[10, 45, 10, 40], [25, 60, 25, 55], [50, 75, 50, 70], [75, 90, 75, 88], [100, 100, 100, 100]];
  var sl = $('s13sl'), lv = 2, hard = 0, stops = [], labs = [];
  LV.forEach(function (n, i) { var x = 14 + 522 * i / 4; var s = document.createElement('div'); s.className = 'st'; s.style.left = x + 'px'; sl.appendChild(s); stops.push(s); var l = document.createElement('div'); l.className = 'lb'; l.style.left = x + 'px'; l.textContent = n; sl.appendChild(l); labs.push(l); });
  function render() { $('s12g1').style.width = G[lv][hard ? 1 : 0] + '%'; $('s12g2').style.width = G[lv][hard ? 3 : 2] + '%'; stops.forEach(function (s, i) { s.classList.toggle('sel', i === lv); }); labs.forEach(function (l, i) { l.classList.toggle('sel', i === lv); }); $$('#s13tg button').forEach(function (b) { b.classList.toggle('sel', +b.dataset.v === hard); }); }
  function fromX(cx) { var r = sl.getBoundingClientRect(); var x = (cx - r.left) / (r.width / 550); return Math.max(0, Math.min(4, Math.round((x - 14) / 522 * 4))); }
  var drag = false;
  sl.addEventListener('pointerdown', function (e) { drag = true; sl.setPointerCapture(e.pointerId); lv = fromX(e.clientX); render(); });
  sl.addEventListener('pointermove', function (e) { if (!drag) return; var n = fromX(e.clientX); if (n !== lv) { lv = n; render(); } });
  sl.addEventListener('pointerup', function () { drag = false; }); sl.addEventListener('pointercancel', function () { drag = false; });
  $$('#s13tg button').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); hard = +b.dataset.v; render(); b.blur(); }); });
  HOOK.s13 = { reset: function () { lv = 2; hard = 0; render(); } };
  render();
})();

/* S13 · 모른다 영역 */
HOOK.s14 = { step: function (k) { $$('#s14ax .unk').forEach(function (u) { u.classList.toggle('on', k >= 2); }); } };

/* S15 · 그릇 */
(function () {
  var INFO = { sys: ['시스템 프롬프트를 포함한 설정 파일', '서비스가 미리 넣어 두는 것 · 우리가 확인할 일은 없다'], mem: ['메모리', '<b>설정 &gt; 메모리</b>'], tool: ['도구 정보 (MCP)', '연결된 커넥터가 무엇을 할 수 있는지'], skill: ['스킬 설명', '어떤 스킬이 있는지'], prof: ['전역 지침', '<b>설정 &gt; 일반 : 프로필 지침</b> · 내 모든 대화에 적용'], proj: ['프로젝트 지침', '<b>프로젝트 &gt; 지침</b> · 프로젝트 내부 대화에만 적용'] };
  var ORDER = ['sys', 'mem', 'tool', 'skill', 'prof', 'proj'], TOK = { sys: 4200, mem: 800, tool: 2500, skill: 1200, prof: 300, proj: 600 };
  var items = {}; $$('#s16v .it').forEach(function (it) { items[it.dataset.k] = it; });
  var pin = null, total = 0;
  function insp(k) { var i = INFO[k]; $('s16n').textContent = i[0]; $('s16p').innerHTML = i[1]; }
  function meter() { $('s16m').style.height = (total / 12000 * 100) + '%'; $('s16mv').textContent = total.toLocaleString('ko-KR') + ' 토큰'; }
  Object.keys(items).forEach(function (k) {
    items[k].addEventListener('mouseenter', function () { if (!pin && items[k].classList.contains('on')) insp(k); });
    items[k].addEventListener('mouseleave', function () { if (!pin) { var last = ORDER.filter(function (x) { return items[x].classList.contains('on'); }).pop(); if (last) insp(last); } });
    items[k].addEventListener('click', function (e) { e.stopPropagation(); if (!items[k].classList.contains('on')) return; pin = pin === k ? null : k; Object.keys(items).forEach(function (x) { items[x].classList.toggle('hot', x === pin); }); insp(k); });
  });
  HOOK.s16 = {
    reset: function () { pin = null; total = 0; Object.keys(items).forEach(function (k) { items[k].className = 'it'; items[k].querySelector('.path') && items[k].querySelector('.path').classList.remove('on'); }); $('s16slot').classList.remove('on'); meter(); $('s16n').innerHTML = '&nbsp;'; $('s16p').innerHTML = '&nbsp;'; },
    step: function (k) {
      if (k >= 1) ORDER.forEach(function (x, i) { if (items[x].classList.contains('on')) return; later(function () { items[x].classList.add('on'); total += TOK[x]; meter(); insp(x); }, 550 * i); });
      if (k >= 1) later(function () { $('s16slot').classList.add('on'); }, 550 * ORDER.length);
      items.sys.classList.toggle('faded', k >= 2);
      items.mem.querySelector('.path').classList.toggle('on', k >= 3);
      items.prof.querySelector('.path').classList.toggle('on', k >= 4); items.proj.querySelector('.path').classList.toggle('on', k >= 4);
      if (k === 3) insp('mem'); if (k === 4) insp('prof');
    }
  };
})();

/* S19 · 색 가르기 */
HOOK.s20 = { step: function (k) {
  var order = ['ins', 'mem', 'prj'];
  order.forEach(function (c, i) { $$('#s20p .g.' + c).forEach(function (g) { g.classList.toggle('on', i + 1 <= k); }); $$('.labels .lb.' + c).forEach(function (l) { l.classList.toggle('on', i + 1 <= k); }); });
} };

/* S21 · 표시 */
HOOK.s22 = { step: function (k) { $('s22sw').classList.toggle('spot-ring', k === 2); $('s22x').classList.toggle('spot-ring', k === 2); } };

/* S23 · 지식 · 지침 표시 */
HOOK.s24 = { step: function (k) { $('s24k').classList.toggle('ring', k === 1); $('s24i').classList.toggle('ring', k === 1); $('s24pj').style.opacity = k >= 2 ? .45 : 1; } };

/* S24 · 격자 */
(function () {
  var g = $('s25g'); for (var i = 0; i < 100; i++) { var e = document.createElement('i'); g.appendChild(e); }
  var cells = $$('#s25g i');
  HOOK.s25 = { step: function (k) { cells.forEach(function (c, i) { c.classList.toggle('gone', k >= 1 && i >= 10); c.classList.toggle('mine', k >= 1 && i < 10); }); $('s25n').textContent = k >= 1 ? '10번' : '100번'; $('s25l').textContent = k >= 1 ? '한 번 만들어 나눈다 · 쓸수록 좋아진다' : '각자 처음부터 만든다'; } };
})();

/* S28 · 앞의 것 흐리기 */
HOOK.s29 = { step: function (k) { $('s29a').classList.toggle('is-dim', k >= 2); } };

/* S30 · 개선 루프 */
(function () {
  var a = 0, f = 0, CY = ['A', 'B', 'C', 'E'];
  function render() {
    $('s31dL').innerHTML = docshape(CY[a % 4]); $('s31dR').innerHTML = docshape('D', f ? 3 : undefined);
    $$('#s31mR i').forEach(function (i, k) { i.classList.toggle('on', k <= f); });
    $('s31cL').textContent = a + '번 눌렀다 · 눈금은 그대로'; $('s31cR').textContent = f + '번 고쳤다';
    $('s31again').classList.toggle('done', a >= 3); $('s31fix').classList.toggle('done', f >= 3);
  }
  $('s31again').addEventListener('click', function (e) { e.stopPropagation(); if (a < 3) a++; render(); this.blur(); });
  $('s31fix').addEventListener('click', function (e) { e.stopPropagation(); if (f < 3) f++; render(); this.blur(); });
  HOOK.s31 = { reset: function () { a = 0; f = 0; render(); }, step: function (k) { if (k >= 1 && a < 1) { a = 3; render(); } if (k >= 2 && f < 1) { f = 3; render(); } } };
  render();
})();

/* S31 · 허브 */
(function () {
  var host = $('s32hub'), W = 1100, H = 640, cx = W / 2, cy = H / 2, SV = ['Google Drive', 'Gmail', 'GitHub', 'Slack', 'Microsoft 365'];
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
  HOOK.s32 = { step: function (k) { $$('#s32hub .sv').forEach(function (s) { s.classList.toggle('on', k >= 1); }); $$('#s32hub line').forEach(function (l) { l.classList.toggle('on', k >= 1); l.classList.toggle('two', k >= 2); }); $$('#s32hub .arr').forEach(function (a) { a.classList.toggle('on', k >= 1 && (k >= 2 || !a.classList.contains('two-way'))); }); } };
})();

/* S34 */
HOOK.s35 = { step: function (k) { $('s35b').classList.toggle('is-dim', k >= 1); $('s35c').style.opacity = k >= 2 ? 1 : ''; $('s35c').style.color = k >= 2 ? '#fff' : ''; } };

/* 시작 */
var h = parseInt((location.hash || '#1').slice(1), 10); show(isNaN(h) ? 0 : h - 1);
document.addEventListener('click', function (e) { if (e.target.closest('button, .it, .slider, .toggle')) return; next(); });
