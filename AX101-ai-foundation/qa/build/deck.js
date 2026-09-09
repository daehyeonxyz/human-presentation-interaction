/* ===== 무대 계약 (templates/stage.html 의 구현체를 이 덱에 맞춰 옮겼다) ===== */
var stage = document.getElementById('stage');
var viewport = document.getElementById('viewport');
var PAGE_H = 1080, PAGE_W_MIN = 1920, PAGE_W_MAX = 2560;
function fit() {
  var s = Math.min(innerWidth / PAGE_W_MIN, innerHeight / PAGE_H);
  var w = Math.min(PAGE_W_MAX, Math.max(PAGE_W_MIN, innerWidth / s));
  document.documentElement.style.setProperty('--page-w', w + 'px');
  stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
addEventListener('resize', fit); fit();
window.FILL_STAGE = true;
function $(id) { return document.getElementById(id); }
function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
function on(el, fn) {
  if (!el) return;
  el.dataset.click = '1'; el.tabIndex = 0;
  el.addEventListener('click', function (e) {
    e.stopPropagation();
    var s = el.closest('section');
    if (s && !s.classList.contains('active')) return;
    fn(e);
  });
}
function hov(el, enter, leave) { if (!el) return; el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); }
function mark(list, cls, pred) { list.forEach(function (el, i) { el.classList.toggle(cls, !!pred(el, i)); }); }
function setOn(el, v) { if (el) el.classList.toggle('on', !!v); }
function dots(id, n) { var d = $(id); if (!d) return; $$('i', d).forEach(function (i, k) { i.classList.toggle('on', k < n); }); }
window.still = function () { document.documentElement.classList.add('still'); };
var TIMERS = {};
function later(p, fn, ms) { (TIMERS[p] = TIMERS[p] || []).push(setTimeout(fn, ms)); }
function clearLater(p) { (TIMERS[p] || []).forEach(clearTimeout); TIMERS[p] = []; }
var SEQ_SKIP = ['close', 'underline-row', 'cover', 'stg', 'decl', 'band'];
function seqTargets(slide) {
  var out = [], frame = slide.querySelector('.frame');
  var kids = frame ? [].slice.call(frame.children) : [].slice.call(slide.children);
  kids.forEach(function (el) {
    if (!el || el.nodeType !== 1) return;
    for (var i = 0; i < SEQ_SKIP.length; i++) if (el.classList.contains(SEQ_SKIP[i])) return;
    out.push(el);
  });
  return out;
}
function armSeq(slide) {
  seqTargets(slide).forEach(function (el, i) { el.classList.remove('seq-done'); el.classList.add('seq'); el.style.setProperty('--d', (0.04 + i * 0.07).toFixed(2) + 's'); });
}
document.addEventListener('animationend', function (e) {
  if (e.animationName === 'seqin' && e.target.classList && e.target.classList.contains('seq')) e.target.classList.add('seq-done');
});
var slides = $$('.slide'), cur = 0, PAGE = {}, PENDING = {};
window.PAGE = PAGE;
function release() { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); }
function go(n) {
  var prev = cur, next = Math.max(0, Math.min(slides.length - 1, n));
  if (next === prev) return;
  document.querySelectorAll('.slider.drag').forEach(function (g) { g.dispatchEvent(new Event('pointercancel')); });
  cur = next;
  if (PENDING[next]) { var rp = PAGE[next + 1]; if (rp && rp.reset) rp.reset(); PENDING[next] = false; }
  viewport.dataset.canvas = slides[cur].dataset.canvas || '';
  armSeq(slides[cur]);
  slides.forEach(function (s, i) { s.classList.toggle('active', i === cur); });
  release();
  var p = PAGE[prev + 1];
  clearLater(prev + 1);
  if (p && p.reset) { PENDING[prev] = true; setTimeout(function () { if (cur !== prev && PENDING[prev]) { p.reset(); PENDING[prev] = false; } }, 420); }
}
window.go = go;
slides[0].classList.add('active'); armSeq(slides[0]);
addEventListener('keydown', function (e) {
  if (e.repeat && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'PageDown' && e.key !== 'PageUp') { e.preventDefault(); return; }
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(cur + 1); e.preventDefault(); }
  else if (e.key === ' ') {
    var a = PAGE[cur + 1];
    var done = a && a.spaceDone ? a.spaceDone() : slides[cur].querySelector('.close.on');
    if (done && a && a.reset) a.reset(); else if (a && a.step) a.step();
    release(); e.preventDefault();
  }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(cur - 1); e.preventDefault(); }
  else if (e.key === 'End') { document.querySelectorAll('.slider.drag').forEach(function (g) { g.dispatchEvent(new Event('pointercancel')); }); var b = PAGE[cur + 1]; if (b && b.finish) b.finish(); release(); e.preventDefault(); }
  else if (e.key === 'Enter') { var el = document.activeElement; if (el && el.dataset && el.dataset.click) { el.click(); e.preventDefault(); } }
});
window.SPACE_RESTART = true;
document.addEventListener('click', function () { release(); var p = PAGE[cur + 1]; if (p && p.unpin) p.unpin(); });

/* ===== 공용 부품 ===== */
var ICON = { up: '<svg class="ico"><use href="#i-up"/></svg>', file: '<svg class="ico"><use href="#i-file"/></svg>', person: '<svg class="ico"><use href="#i-person"/></svg>' };
function bubble(kind, text, note) {
  var d = document.createElement('div'); d.className = 'bub ' + kind + ' in';
  d.innerHTML = text + (note ? '<span class="bn">' + note + '</span>' : '');
  return d;
}
function typing() { var d = document.createElement('div'); d.className = 'typing in'; d.innerHTML = '<i></i><i></i><i></i>'; return d; }
/* 문서 모양. rows: 't' 제목, 'i' 항목, 'b' 표, 'p' 문단. hl: 강조할 행 번호, alert: 경고 면을 깔 행 번호들 */
function docshape(rows, opt) {
  opt = opt || {};
  var W = 188, y = 0, out = [], gap = 8;
  rows.forEach(function (r, idx) {
    var h = r === 't' ? 12 : r === 'i' ? 8 : r === 'b' ? 30 : 22;
    if (opt.alert && opt.alert.indexOf(idx) >= 0) out.push('<rect class="da" x="-6" y="' + (y - 3) + '" width="' + (W + 12) + '" height="' + (h + 6) + '" rx="4"/>');
    if (opt.hl === idx) out.push('<rect class="dh" x="-6" y="' + (y - 3) + '" width="' + (W + 12) + '" height="' + (h + 6) + '" rx="4"/>');
    if (r === 't') out.push('<rect class="dt" x="0" y="' + y + '" width="' + Math.round(W * 0.55) + '" height="' + h + '" rx="3"/>');
    else if (r === 'i') { out.push('<circle class="dl" cx="4" cy="' + (y + 4) + '" r="3"/>'); out.push('<rect class="dl" x="14" y="' + (y + 1) + '" width="' + Math.round(W * (0.5 + ((idx * 37) % 40) / 100)) + '" height="6" rx="3"/>'); }
    else if (r === 'b') { for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 3; cc++) out.push('<rect class="dl" x="' + (cc * 64) + '" y="' + (y + rr * 10) + '" width="58" height="7" rx="2"/>'); }
    else { for (var k = 0; k < 3; k++) out.push('<rect class="dl" x="0" y="' + (y + k * 7) + '" width="' + (k === 2 ? Math.round(W * 0.6) : W) + '" height="5" rx="2"/>'); }
    y += h + gap;
  });
  return '<svg viewBox="-6 -4 200 140" preserveAspectRatio="xMinYMin meet">' + out.join('') + '</svg>';
}
var SHAPE = {
  A: ['t', 'i', 'i', 'i', 'i', 'i'],
  B: ['i', 'i', 'i', 'b'],
  C: ['t', 'p', 'p'],
  D: ['t', 'i', 'i', 'i', 'i', 'i', 'b'],
  E: ['t', 'i', 'i', 'i', 'i', 'b']
};

/* ===== 2장 ===== */
(function () {
  var decl = $('p2decl'), tiles = $$('.tl', $('p2tiles')), c = $('c2'), btn = $('p2btn'), done = false;
  function run() {
    if (done) return; done = true;
    decl.classList.add('on');
    tiles.forEach(function (t, i) { later(2, function () { t.classList.add('on'); }, 70 * i); });
    later(2, function () { c.classList.add('on'); dots('p2dots', 1); btn.classList.add('done'); }, 300);
  }
  on(btn, run);
  PAGE[2] = {
    step: run,
    finish: function () { done = true; decl.classList.add('on'); tiles.forEach(function (t) { t.classList.add('on'); }); c.classList.add('on'); dots('p2dots', 1); btn.classList.add('done'); },
    reset: function () { done = false; decl.classList.remove('on'); tiles.forEach(function (t) { t.classList.remove('on'); }); c.classList.remove('on'); dots('p2dots', 0); btn.classList.remove('done'); },
    spaceDone: function () { return c.classList.contains('on'); }
  };
})();

/* ===== 5장 ===== */
(function () {
  var KO = ['좋', '은', ' ', '답', '은', ' ', '좋', '은', ' ', '자', '료', '에서', ' ', '나옵', '니다'];
  var EN = ['Good', ' ', 'answers', ' ', 'come', ' ', 'from', ' ', 'good', ' ', 'source', ' ', 'mater', 'ial'];
  /* 대응 묶음: 한국어 조각 색인 -> 영어 조각 색인 */
  var MAP = { 0: [0], 1: [0], 3: [2], 4: [2], 6: [8], 7: [8], 9: [10, 12, 13], 10: [10, 12, 13], 11: [6], 13: [4], 14: [4] };
  var koEl = $('p5ko'), enEl = $('p5en');
  function build(el, arr, tag) { el.innerHTML = arr.map(function (t, i) { return t === ' ' ? '<span class="tk sp"></span>' : '<span class="tk" data-' + tag + '="' + i + '">' + t + '</span>'; }).join(''); }
  build(koEl, KO, 'k'); build(enEl, EN, 'e');
  var koT = $$('.tk[data-k]', koEl), enT = $$('.tk[data-e]', enEl);
  var split = false, pin = -1, hv = -1, btn = $('p5btn'), c = $('c5');
  function render() {
    var k = pin >= 0 ? pin : hv;
    var targets = k >= 0 ? (MAP[k] || []) : [];
    var group = [];
    if (k >= 0) Object.keys(MAP).forEach(function (kk) { if (JSON.stringify(MAP[kk]) === JSON.stringify(MAP[k])) group.push(+kk); });
    mark(koT, 'ringed', function (el) { return pin < 0 && k >= 0 && group.indexOf(+el.dataset.k) >= 0; });
    mark(koT, 'pinned', function (el) { return pin >= 0 && group.indexOf(+el.dataset.k) >= 0; });
    mark(enT, 'ringed', function (el) { return pin < 0 && targets.indexOf(+el.dataset.e) >= 0; });
    mark(enT, 'pinned', function (el) { return pin >= 0 && targets.indexOf(+el.dataset.e) >= 0; });
  }
  function enPeers(e) { var r = []; Object.keys(MAP).forEach(function (kk) { if (MAP[kk].indexOf(e) >= 0) r.push(+kk); }); return r[0]; }
  koT.forEach(function (el) {
    el.classList.add('point');
    hov(el, function () { if (!split) return; hv = +el.dataset.k; render(); }, function () { hv = -1; render(); });
    on(el, function () { if (!split) return; var k = +el.dataset.k; pin = pin === k ? -1 : k; render(); });
  });
  enT.forEach(function (el) {
    el.classList.add('point');
    hov(el, function () { if (!split) return; var k = enPeers(+el.dataset.e); if (k !== undefined) { hv = k; render(); } }, function () { hv = -1; render(); });
    on(el, function () { if (!split) return; var k = enPeers(+el.dataset.e); if (k === undefined) return; pin = pin === k ? -1 : k; render(); });
  });
  function doSplit() {
    split = true; koEl.classList.add('split'); enEl.classList.add('split');
    setOn($('p5count'), 1); setOn($('p5sub'), 1); btn.textContent = '되돌리기'; dots('p5dots', 1); c.classList.add('on');
  }
  function reset() { split = false; pin = -1; hv = -1; koEl.classList.remove('split'); enEl.classList.remove('split'); setOn($('p5count'), 0); setOn($('p5sub'), 0); btn.textContent = '쪼개기'; dots('p5dots', 0); c.classList.remove('on'); render(); }
  on(btn, function () { if (split) reset(); else doSplit(); });
  PAGE[5] = { step: function () { if (!split) doSplit(); }, finish: doSplit, reset: reset, spaceDone: function () { return split; }, unpin: function () { pin = -1; render(); } };
})();

/* ===== 6장 ===== */
(function () {
  var stream = $('p6stream'), fld = $('p6fld'), q = $('p6q'), send = $('p6send'), more = $('p6more'), c = $('c6'), under = $('p6under');
  var QS = ['이 글을 한국어로 번역해 줘 … 100단어', '이 글도 한국어로 번역해 줘 … 100단어', '이것도 번역해 줘 … 100단어', '이것도 번역해 줘 … 100단어'];
  var TABLE = [[0, 0, 0, 0, 0], [100, 0, 0, 100, 100], [100, 0, 100, 600, 600], [300, 200, 0, 120, 720], [300, 200, 100, 620, 1220], [500, 400, 100, 640, 1860], [700, 600, 100, 660, 2520]];
  var st = 0, turn = 0, bubbles = [], pin = null, hv = null, busy = false;
  var fmt = function (n) { return n.toLocaleString('ko-KR'); };
  function obs(i) { var r = TABLE[i]; $('p6in').textContent = fmt(r[0]); $('p6cache').textContent = fmt(r[1]); $('p6out').textContent = fmt(r[2]); $('p6bill').textContent = fmt(r[3]) + '원'; $('p6sum').textContent = fmt(r[4]) + '원'; }
  function insp() {
    var b = pin || hv;
    if (!b) { $('p6insp1').innerHTML = '&nbsp;'; $('p6insp2').innerHTML = '&nbsp;'; $('p6insp3').innerHTML = '&nbsp;'; $('p6inspl').textContent = '고른 말풍선'; return; }
    var n = turn - b.turn + (b.kind === 'me' ? 1 : 0);
    if (n < 1) n = 1;
    $('p6inspl').textContent = (b.turn) + '회차 ' + (b.kind === 'me' ? '질문' : '답');
    $('p6insp1').textContent = '이 말풍선 100토큰';
    $('p6insp2').textContent = '지금까지 ' + n + '번 입력에 다시 들어감';
    $('p6insp3').textContent = '그중 ' + (n - 1) + '번은 캐시 가격';
  }
  function cross() { var b = pin || hv; bubbles.forEach(function (x) { x.el.classList.toggle('ringed', !!b && !pin && x === b); x.el.classList.toggle('pinned', !!pin && x === pin); }); $('p6cacherow').classList.toggle('ringed', !!b); }
  function addBubble(kind, text, t) {
    var el = bubble(kind, text, '100단어'); el.classList.add('point');
    var rec = { el: el, kind: kind, turn: t };
    hov(el, function () { hv = rec; insp(); cross(); }, function () { hv = null; insp(); cross(); });
    on(el, function () { pin = pin === rec ? null : rec; insp(); cross(); });
    stream.appendChild(el); bubbles.push(rec); return rec;
  }
  function ringPrev(ms) { bubbles.forEach(function (x) { if (x.turn < turn) x.el.classList.add('ringed'); }); later(6, function () { cross(); }, ms); }
  function sendTurn(cb) {
    if (busy || turn >= 4) return; busy = true; turn++;
    addBubble('me', QS[turn - 1], turn);
    fld.classList.add('off'); send.classList.add('locked');
    obs(turn === 1 ? 1 : turn === 2 ? 3 : turn === 3 ? 5 : 6); if (turn >= 2) ringPrev(700);
    var ty = typing(); later(6, function () { stream.appendChild(ty); }, 500);
    later(6, function () {
      if (ty.parentNode) ty.parentNode.removeChild(ty);
      addBubble('ai', '번역했습니다 …', turn);
      obs(turn === 1 ? 2 : turn === 2 ? 4 : turn === 3 ? 5 : 6);
      if (turn === 1) { q.textContent = QS[1]; fld.classList.remove('off'); send.classList.remove('locked'); }
      if (turn === 2) { under.classList.add('on'); c.classList.add('on'); more.style.opacity = 1; more.style.pointerEvents = 'auto'; q.textContent = QS[2]; }
      if (turn === 3) { q.textContent = QS[3]; }
      if (turn === 4) { more.textContent = '처음으로'; }
      busy = false; if (cb) cb();
    }, 1300);
  }
  on(send, function () { if (send.classList.contains('locked')) return; if (turn < 2) sendTurn(); });
  on(more, function () { if (turn >= 4) reset(); else if (turn >= 2) sendTurn(); });
  on($('p6cacherow'), function () {});
  hov($('p6cacherow'), function () { bubbles.forEach(function (x) { if (x.turn < turn) x.el.classList.add('ringed'); }); }, function () { cross(); });
  function finish() {
    clearLater(6); stream.innerHTML = ''; bubbles = []; turn = 0; busy = false;
    for (var t = 1; t <= 4; t++) { turn = t; addBubble('me', QS[t - 1], t); addBubble('ai', '번역했습니다 …', t); }
    bubbles.forEach(function (x) { x.el.classList.remove('in'); });
    obs(6); q.textContent = QS[3]; fld.classList.add('off'); send.classList.add('locked'); under.classList.add('on'); c.classList.add('on'); more.style.opacity = 1; more.style.pointerEvents = 'auto'; more.textContent = '처음으로'; pin = null; hv = null; insp(); cross();
  }
  function reset() {
    clearLater(6); stream.innerHTML = ''; bubbles = []; turn = 0; busy = false; pin = null; hv = null;
    obs(0); q.textContent = QS[0]; fld.classList.remove('off'); send.classList.remove('locked'); under.classList.remove('on'); c.classList.remove('on'); more.style.opacity = 0; more.style.pointerEvents = 'none'; more.textContent = '한 번 더'; insp(); cross();
  }
  PAGE[6] = { step: function () { if (turn < 2) sendTurn(); else if (turn < 4) sendTurn(); }, finish: finish, reset: reset, spaceDone: function () { return turn >= 4; }, unpin: function () { pin = null; insp(); cross(); } };
})();

/* ===== 8장 ===== */
(function () {
  var LV = ['Low', 'Medium', 'High', 'Extra high', 'Max'];
  var DESC = ['사고 최소화  속도가 가장 중요할 때', '적당한 사고  단순한 쿼리는 건너뜀', '거의 항상 사고  복잡한 작업에 깊은 추론', '확장된 탐색과 함께 항상 깊이 사고', '사고 깊이에 제약 없이 항상 사고'];
  var G = [[10, 45, 10, 40], [25, 60, 25, 55], [50, 75, 50, 70], [75, 90, 75, 88], [100, 100, 100, 100]];
  var sl = $('p8slider'), lv = 2, hard = 0, c = $('c8');
  var stops = [], labs = [];
  LV.forEach(function (n, i) {
    var x = 16 + (688 * i / 4);
    var s = document.createElement('div'); s.className = 'stop'; s.style.left = x + 'px'; s.dataset.i = i; sl.appendChild(s); stops.push(s);
    var l = document.createElement('div'); l.className = 'lab'; l.textContent = n; l.style.left = x + 'px'; sl.appendChild(l); labs.push(l);
  });
  labs.forEach(function (l) { l.style.marginLeft = (-l.offsetWidth / 2) + 'px'; });
  function render() {
    $('p8lv').textContent = LV[lv]; $('p8desc').innerHTML = DESC[lv];
    $('p8g1').style.width = G[lv][hard ? 1 : 0] + '%'; $('p8g2').style.width = G[lv][hard ? 3 : 2] + '%';
    mark(stops, 'sel', function (el) { return +el.dataset.i === lv; }); mark(labs, 'sel', function (el, i) { return i === lv; });
    $$('.cell', $('p8tog')).forEach(function (el) { el.classList.toggle('sel', +el.dataset.v === hard); });
    if (lv === 0 && hard === 1) c.classList.add('on');
  }
  stops.forEach(function (s) { on(s, function () { lv = +s.dataset.i; render(); }); });
  $$('.cell', $('p8tog')).forEach(function (el) { on(el, function () { hard = +el.dataset.v; render(); }); });
  function fromX(clientX) { var r = sl.getBoundingClientRect(); var sc = r.width / 720; var x = (clientX - r.left) / sc; var i = Math.round((x - 16) / 688 * 4); return Math.max(0, Math.min(4, i)); }
  sl.addEventListener('pointerdown', function (e) { sl.classList.add('drag'); try { sl.setPointerCapture(e.pointerId); } catch (x) {} lv = fromX(e.clientX); render(); });
  sl.addEventListener('pointermove', function (e) { if (!sl.classList.contains('drag')) return; var n = fromX(e.clientX); if (n !== lv) { lv = n; render(); } });
  function endDrag() { sl.classList.remove('drag'); release(); }
  sl.addEventListener('pointerup', endDrag); sl.addEventListener('pointercancel', endDrag);
  render();
  PAGE[8] = {
    step: function () { if (lv > 0) { lv--; render(); } else if (!hard) { hard = 1; render(); } },
    finish: function () { lv = 0; hard = 1; render(); },
    reset: function () { lv = 2; hard = 0; c.classList.remove('on'); render(); },
    spaceDone: function () { return c.classList.contains('on'); }
  };
})();

/* ===== 9장 ===== */
(function () {
  var J = [[1, 1, 1, 1], [0, 1, 1, 1], [0, 0, 1, 0], [0, 0, 0, 0]];
  var cards = $$('.card', $('p9tray')), judges = $$('.judge', $('p9models')), items = $$('.wellitem', $('p9well')), c = $('c9'), sel = -1;
  function render() {
    mark(cards, 'sel', function (el) { return +el.dataset.q === sel; });
    judges.forEach(function (j, m) {
      if (sel < 0) { j.classList.remove('on'); return; }
      var ok = J[sel][m];
      j.className = 'judge on ' + (ok ? 'ok' : 'bad'); j.innerHTML = '<svg class="ico"><use href="#' + (ok ? 'i-check' : 'i-cross') + '"/></svg>' + (ok ? '안다' : '모른다');
    });
    var last = sel === 3;
    items.forEach(function (it) { it.classList.toggle('on', last); }); setOn($('p9wellnote'), last);
    if (last) c.classList.add('on');
  }
  cards.forEach(function (el) { on(el, function () { sel = +el.dataset.q; render(); }); });
  PAGE[9] = { step: function () { sel = Math.min(3, sel + 1); render(); }, finish: function () { sel = 3; render(); }, reset: function () { sel = -1; c.classList.remove('on'); render(); }, spaceDone: function () { return sel === 3; } };
})();

/* ===== 10장 ===== */
(function () {
  var INFO = {
    sys: ['시스템 프롬프트와 설정', '서비스가 미리 넣어 둔 지시문', '어디서 정하나  우리가 볼 일 없음', ''],
    mem: ['메모리', 'Claude가 대화에서 뽑아 쌓은 것', '어디서 정하나  설정 > 메모리', '13장에서 다시'],
    tool: ['도구 정보', '연결된 서비스가 무엇을 할 수 있는지', '어디서 정하나  커넥터 설정', '21장에서 다시'],
    skill: ['스킬 설명', '어떤 스킬이 있는지의 목록', '어디서 정하나  설정 > 기능 > 스킬', '18장에서 다시'],
    prof: ['프로필 지침', '내 모든 대화에 들어가는 내 지시문', '어디서 정하나  설정 > 일반', '13장에서 다시'],
    proj: ['프로젝트 지침', '그 프로젝트 대화에만 들어가는 지시문', '어디서 정하나  프로젝트 > 지침', '13장에서 다시'],
    kn: ['프로젝트 지식에서 검색된 부분', '올려 둔 자료 중 이 질문과 관련된 부분', '어디서 정하나  프로젝트 > 지식', '14장 · 15장에서 다시'],
    pr: ['내가 친 프롬프트', '그 메시지 한 번에만 들어가는 것', '어디서 정하나  채팅창', '11장에서 다시'],
    ans: ['답', '다음 요청의 입력으로 다시 들어감', '', '6장에서 이미 봄']
  };
  var TOK = { sys: 4200, mem: 800, tool: 2500, skill: 1200, prof: 300, proj: 600, pr: 40, kn: 6000, ans: 900 };
  var ORDER = ['sys', 'mem', 'tool', 'skill', 'prof', 'proj'];
  var SCALE = 40000; /* 바 전체 = 4만 토큰 */
  var evs = $$('.ev', $('p10events')), kn = $('p10kn'), segs = $$('i', $('p10bar')), legs = $$('.lg', $('p10legend')), btn = $('p10btn'), fld = $('p10fld'), send = $('p10send'), stream = $('p10stream'), c = $('c10');
  var st = 0, shown = {}, total = 0, pin = null, hv = null, prBub = null, ansBub = null;
  var GROUP = { sys: ['sys'], mem: ['mem'], tool: ['tool', 'skill'], skill: ['tool', 'skill'], prof: ['prof', 'proj'], proj: ['prof', 'proj'], kn: ['kn'], pr: ['pr'], ans: ['ans'] };
  var LEGK = { sys: 'sys', mem: 'mem', tool: 'tool', skill: 'tool', prof: 'prof', proj: 'prof', kn: 'kn', pr: 'pr', ans: 'ans' };
  function meter() { $('p10meter').innerHTML = '<span class="acc">' + total.toLocaleString('ko-KR') + '</span> <small class="t-note">/ 100만</small>'; }
  function show(k) { if (shown[k]) return; shown[k] = 1; total += TOK[k]; segs.forEach(function (s) { if (s.dataset.k === k) s.style.width = (TOK[k] / SCALE * 100) + '%'; }); meter(); }
  function insp() {
    var k = pin || hv || 'sys'; var i = INFO[k];
    $('p10i1').textContent = i[0]; $('p10i2').textContent = i[1]; $('p10i3').innerHTML = i[2] || '&nbsp;'; $('p10i4').innerHTML = i[3] || '&nbsp;';
  }
  function cross() {
    var k = pin || hv; var g = k ? GROUP[k] : [];
    var all = evs.concat([kn]); if (prBub) all.push(prBub); if (ansBub) all.push(ansBub);
    all.forEach(function (el) { var kk = el.dataset.k; el.classList.toggle('ringed', !!k && !pin && (kk === k)); el.classList.toggle('pinned', !!pin && kk === pin); });
    segs.forEach(function (s) { s.classList.toggle('ringed', !!k && g.indexOf(s.dataset.k) >= 0); });
    legs.forEach(function (l) { l.classList.toggle('ringed', !!k && !pin && l.dataset.k === LEGK[k]); l.classList.toggle('pinned', !!pin && l.dataset.k === LEGK[pin]); });
  }
  function wire(el) {
    var k = el.dataset.k;
    hov(el, function () { hv = k; insp(); cross(); }, function () { hv = null; insp(); cross(); });
    on(el, function () { pin = pin === k ? null : k; insp(); cross(); });
  }
  evs.forEach(wire); wire(kn);
  legs.forEach(function (l) { var k = l.dataset.k; hov(l, function () { hv = k; insp(); cross(); }, function () { hv = null; insp(); cross(); }); on(l, function () { pin = pin === k ? null : k; insp(); cross(); }); });
  segs.forEach(function (s) { var k = s.dataset.k; s.style.cursor = 'pointer'; hov(s, function () { hv = k; insp(); cross(); }, function () { hv = null; insp(); cross(); }); on(s, function () { pin = pin === k ? null : k; insp(); cross(); }); });
  function step1() {
    if (st !== 0) return; st = 1; btn.classList.add('done'); btn.textContent = '대화 시작';
    ORDER.forEach(function (k, i) { later(10, function () { evs[i].classList.add('on'); show(k); }, 600 * i); });
    later(10, function () { $('p10div').classList.add('on'); fld.classList.remove('off'); send.classList.remove('locked'); btn.textContent = '전송'; btn.classList.remove('done'); }, 600 * ORDER.length);
  }
  function step2() {
    if (st !== 1) return; st = 2;
    prBub = bubble('me', '미리내로보틱스 검토 항목을 정리해 줘'); prBub.dataset.k = 'pr'; prBub.classList.add('point'); wire(prBub);
    stream.insertBefore(prBub, kn); fld.classList.add('off'); send.classList.add('locked'); show('pr'); btn.textContent = '다음';
  }
  function step3() { if (st !== 2) return; st = 3; kn.classList.add('on'); show('kn'); }
  function step4() {
    if (st !== 3) return; st = 4;
    ansBub = bubble('ai', '검토 항목 일곱 가지를 정리했습니다 …'); ansBub.dataset.k = 'ans'; ansBub.classList.add('point'); wire(ansBub);
    stream.appendChild(ansBub); show('ans'); c.classList.add('on'); btn.textContent = '처음으로';
  }
  function step() { if (st === 0) step1(); else if (st === 1) step2(); else if (st === 2) step3(); else if (st === 3) step4(); else reset(); }
  on(btn, function () { if (btn.classList.contains('done')) return; step(); });
  on(send, function () { if (send.classList.contains('locked')) return; step2(); });
  function finish() {
    clearLater(10); if (st === 0) { evs.forEach(function (e) { e.classList.add('on'); }); ORDER.forEach(show); $('p10div').classList.add('on'); st = 1; }
    if (st === 1) step2(); if (st === 2) step3(); if (st === 3) step4();
    [prBub, ansBub].forEach(function (b) { if (b) b.classList.remove('in'); });
  }
  function reset() {
    clearLater(10); st = 0; shown = {}; total = 0; pin = null; hv = null;
    evs.forEach(function (e) { e.classList.remove('on'); }); kn.classList.remove('on'); $('p10div').classList.remove('on');
    if (prBub && prBub.parentNode) prBub.parentNode.removeChild(prBub); if (ansBub && ansBub.parentNode) ansBub.parentNode.removeChild(ansBub); prBub = null; ansBub = null;
    segs.forEach(function (s) { s.style.width = '0'; }); meter(); fld.classList.add('off'); send.classList.add('locked'); btn.textContent = '대화 시작'; btn.classList.remove('done'); c.classList.remove('on'); insp(); cross();
  }
  insp(); meter();
  PAGE[10] = { step: step, finish: finish, reset: reset, spaceDone: function () { return st >= 4; }, unpin: function () { pin = null; insp(); cross(); } };
})();

/* ===== 11장 ===== */
(function () {
  var sides = $$('.p11side'), c = $('c11'), done = [false, false];
  function open(i) {
    if (done[i]) return; done[i] = true; sides[i].classList.add('spent');
    $$('.lit-later', sides[i]).forEach(function (el, k) { later(11, function () { el.classList.add('on'); }, 120 * k); });
    if (done[0] && done[1]) later(11, function () { c.classList.add('on'); }, 500);
  }
  sides.forEach(function (s, i) { on(s, function () { open(i); }); });
  PAGE[11] = {
    step: function () { if (!done[0]) open(0); else if (!done[1]) open(1); },
    finish: function () { clearLater(11); done = [true, true]; sides.forEach(function (s) { s.classList.add('spent'); $$('.lit-later', s).forEach(function (el) { el.classList.add('on'); }); }); c.classList.add('on'); },
    reset: function () { clearLater(11); done = [false, false]; sides.forEach(function (s) { s.classList.remove('spent'); $$('.lit-later', s).forEach(function (el) { el.classList.remove('on'); }); }); c.classList.remove('on'); },
    spaceDone: function () { return c.classList.contains('on'); }
  };
})();

/* ===== 12장 ===== */
(function () {
  var MAPL = { ins: [2, 3], mem: [1], kn: [4], sk: [7, 8] };
  var TINT = { ins: 't-ins', mem: 't-mem', kn: 't-kn', sk: 't-sk' };
  var NAME = { ins: '프로필 지침', mem: '메모리', kn: '프로젝트', sk: '스킬' };
  var lines = $$('.pline', $('p12lines')), layers = $$('.layer', $('p12layers')), c = $('c12'), done = {};
  function pick(k) {
    if (done[k]) return; done[k] = 1;
    var L = layers.filter(function (l) { return l.dataset.k === k; })[0];
    L.classList.add('spent'); L.classList.add('woke'); L.querySelector('.lm').classList.add('on');
    lines.forEach(function (ln) { var n = +ln.dataset.l; if (MAPL[k].indexOf(n) >= 0) { ln.classList.add('gone'); ln.classList.add(TINT[k]); var t = ln.querySelector('.tag'); t.textContent = NAME[k] + '로'; t.classList.add('on'); } });
    if (Object.keys(done).length === 4) {
      lines.forEach(function (ln) { var n = +ln.dataset.l; if (n === 5 || n === 6) { var t = ln.querySelector('.tag'); t.textContent = '오늘 할 일'; t.classList.add('on'); } });
      c.classList.add('on');
    }
  }
  layers.forEach(function (L) { on(L, function () { pick(L.dataset.k); }); });
  var ORDER = ['ins', 'mem', 'kn', 'sk'];
  PAGE[12] = {
    step: function () { for (var i = 0; i < 4; i++) if (!done[ORDER[i]]) { pick(ORDER[i]); return; } },
    finish: function () { ORDER.forEach(pick); },
    reset: function () { done = {}; layers.forEach(function (L) { L.classList.remove('spent'); L.classList.remove('woke'); L.querySelector('.lm').classList.remove('on'); }); lines.forEach(function (ln) { ln.className = 'pline'; var t = ln.querySelector('.tag'); t.textContent = ''; t.classList.remove('on'); }); c.classList.remove('on'); },
    spaceDone: function () { return c.classList.contains('on'); }
  };
})();

/* ===== 13장 ===== */
(function () {
  var area = $('p13area'), wl = $$('.line', area), rows = $$('.srow', $('p13mem')), bw = $('p13write'), bt = $('p13talk'), c = $('c13'), wrote = false, n = 0;
  function check() { if (wrote && n >= 3) c.classList.add('on'); }
  function write() { if (wrote) return; wrote = true; wl.forEach(function (l, i) { later(13, function () { l.classList.add('on'); }, 200 * i); }); later(13, function () { area.classList.add('done'); }, 500); bw.classList.add('done'); dots('p13dotsL', 1); check(); }
  function talk() { if (n >= 3) return; rows[n].classList.add('on'); n++; dots('p13dotsR', n); if (n >= 3) bt.classList.add('done'); check(); }
  on(bw, function () { if (!bw.classList.contains('done')) write(); }); on(bt, function () { if (!bt.classList.contains('done')) talk(); });
  PAGE[13] = {
    step: function () { if (!wrote) write(); else talk(); },
    finish: function () { clearLater(13); wrote = true; wl.forEach(function (l) { l.classList.add('on'); }); area.classList.add('done'); bw.classList.add('done'); dots('p13dotsL', 1); while (n < 3) talk(); },
    reset: function () { clearLater(13); wrote = false; n = 0; wl.forEach(function (l) { l.classList.remove('on'); }); area.classList.remove('done'); rows.forEach(function (r) { r.classList.remove('on'); }); bw.classList.remove('done'); bt.classList.remove('done'); dots('p13dotsL', 0); dots('p13dotsR', 0); c.classList.remove('on'); },
    spaceDone: function () { return c.classList.contains('on'); }
  };
})();

/* ===== 14장 ===== */
(function () {
  var st = 0, btn = $('p14btn'), c = $('c14'), LAB = ['전송', '첨부하고 전송', '판정', '판정'];
  function apply() {
    setOn($('p14a1'), st >= 1); $('p14chip').classList.toggle('hide', st < 2); setOn($('p14a2'), st >= 2);
    setOn($('p14j1'), st >= 3); setOn($('p14j2'), st >= 3); setOn($('p14wide'), st >= 3); c.classList.toggle('on', st >= 3);
    dots('p14dots', st); btn.textContent = LAB[Math.min(st, 2)]; btn.classList.toggle('done', st >= 3);
  }
  function step() { if (st >= 3) return; st++; apply(); if (st === 2) { $('p14a2').classList.add('ringed'); $('p14chip').classList.add('ringed'); later(14, function () { $('p14a2').classList.remove('ringed'); $('p14chip').classList.remove('ringed'); }, 600); } }
  on(btn, function () { if (!btn.classList.contains('done')) step(); });
  apply();
  PAGE[14] = { step: step, finish: function () { clearLater(14); st = 3; apply(); }, reset: function () { clearLater(14); st = 0; apply(); }, spaceDone: function () { return st >= 3; } };
})();

/* ===== 15장 ===== */
(function () {
  var v = 0, flipped = false, c = $('c15'), cells = $$('.cell', $('p15tog')), projs = $$('.proj', $('p15projs')), docsEl = $$('.doc.form', $('p15projs'));
  function render() {
    cells.forEach(function (el) { el.classList.toggle('sel', +el.dataset.v === v); });
    projs.forEach(function (p) { p.classList.toggle('flip', v === 1); });
    docsEl.forEach(function (d) { d.classList.toggle('gone', v === 1); }); $$('.doc[data-i]', $('p15projs')).forEach(function (d) { d.classList.toggle('kept', v === 1 && +d.dataset.i === 2); });
    $('p15n1').textContent = v ? '1벌' : '3벌'; $('p15n2').textContent = v ? '1군데' : '3군데';
    if (v === 1) flipped = true; if (flipped) c.classList.add('on');
  }
  cells.forEach(function (el) { on(el, function () { v = +el.dataset.v; render(); }); });
  PAGE[15] = { step: function () { v = v ? 0 : 1; render(); }, finish: function () { v = 1; render(); }, reset: function () { v = 0; flipped = false; c.classList.remove('on'); render(); }, spaceDone: function () { return flipped; } };
})();

/* ===== 16장 ===== */
(function () {
  var g = $('p16grid'); var cellsG = [];
  for (var i = 0; i < 100; i++) { var e = document.createElement('i'); e.innerHTML = ICON.file; g.appendChild(e); cellsG.push(e); }
  var v = 0, flipped = false, c = $('c16'), cells = $$('.cell', $('p16tog'));
  function render() {
    cells.forEach(function (el) { el.classList.toggle('sel', +el.dataset.v === v); });
    cellsG.forEach(function (e, i) { e.classList.toggle('gone', v === 1 && i >= 10); });
    $('p16n').textContent = v ? '10번' : '100번'; setOn($('p16after'), v === 1);
    if (v === 1) flipped = true; if (flipped) c.classList.add('on');
  }
  cells.forEach(function (el) { on(el, function () { v = +el.dataset.v; render(); }); });
  PAGE[16] = { step: function () { v = v ? 0 : 1; render(); }, finish: function () { v = 1; render(); }, reset: function () { v = 0; flipped = false; c.classList.remove('on'); render(); }, spaceDone: function () { return flipped; } };
})();

/* ===== 17장 ===== */
(function () {
  var rows = $$('.trow', $('p17rows')), segs = $$('i', $('p17bar')), legs = $$('.lg', $('p17legend')), c = $('c17'), pin = null, hv = null, seen = {};
  function cross() {
    var k = pin || hv;
    rows.forEach(function (r) { r.classList.toggle('ringed', !!k && !pin && r.dataset.k === k); r.classList.toggle('pinned', !!pin && r.dataset.k === pin); });
    segs.forEach(function (s) { s.classList.toggle('ringed', !!k && s.dataset.k === k); });
    legs.forEach(function (l) { l.classList.toggle('ringed', !!k && !pin && l.dataset.k === k); l.classList.toggle('pinned', !!pin && l.dataset.k === pin); });
    if (Object.keys(seen).length >= 4) c.classList.add('on');
  }
  function wire(el) { var k = el.dataset.k; hov(el, function () { hv = k; cross(); }, function () { hv = null; cross(); }); on(el, function () { pin = pin === k ? null : k; if (pin) seen[pin] = 1; cross(); }); }
  rows.forEach(wire); legs.forEach(wire);
  segs.forEach(function (s) { if (['pr', 'ins', 'mem', 'kn'].indexOf(s.dataset.k) >= 0) { s.style.cursor = 'pointer'; wire(s); } });
  var ORDER = ['pr', 'ins', 'mem', 'kn'];
  PAGE[17] = {
    step: function () { for (var i = 0; i < 4; i++) if (!seen[ORDER[i]]) { pin = ORDER[i]; seen[pin] = 1; cross(); return; } },
    finish: function () { ORDER.forEach(function (k) { seen[k] = 1; }); pin = 'kn'; cross(); },
    reset: function () { pin = null; hv = null; seen = {}; c.classList.remove('on'); cross(); },
    spaceDone: function () { return c.classList.contains('on'); }, unpin: function () { pin = null; cross(); }
  };
})();

/* ===== 18장 ===== */
(function () {
  var st = 0, btn = $('p18btn'), c = $('c18'), ds = [$('p18d1'), $('p18d2'), $('p18d3')];
  var STEPS = [
    null,
    { shapes: [[SHAPE.A, { alert: [0, 1, 2, 3, 4, 5] }], [SHAPE.B, { alert: [0, 1, 2, 3] }], [SHAPE.C, { alert: [0, 1, 2] }]], lab: '프롬프트만', jud: '제목도 순서도 분량도 매번 다름', meter: '2천', pct: 5 },
    { shapes: [[SHAPE.A, {}], [SHAPE.A, {}], [SHAPE.E, { alert: [5] }]], lab: '예시를 붙이면', jud: '나아지지만 컨텍스트를 많이 먹고  어떤 예시를 붙였느냐에 따라 또 달라짐', meter: '4만', pct: 100 },
    { shapes: [[SHAPE.D, {}], [SHAPE.D, {}], [SHAPE.D, {}]], lab: '스킬을 켜면', jud: '일관성과 재현성', meter: '6천', pct: 15 }
  ];
  var LAB = ['보내기', '예시 붙여 보내기', '스킬 켜고 보내기', '스킬 켜고 보내기'];
  function apply() {
    var s = STEPS[st];
    ds.forEach(function (d, i) { d.style.opacity = st ? 1 : 0; if (s) d.innerHTML = docshape(s.shapes[i][0], s.shapes[i][1]); });
    $('p18lab').innerHTML = s ? s.lab : '&nbsp;'; $('p18jud').innerHTML = s ? s.jud : '&nbsp;';
    $('p18meter').textContent = s ? s.meter : '2천'; $('p18gf').style.width = (s ? s.pct : 5) + '%';
    $('p18chip').classList.toggle('hide', st !== 2); setOn($('p18skillpill'), st === 3);
    dots('p18dots', st); btn.textContent = LAB[Math.min(st, 3)]; btn.classList.toggle('done', st >= 3); c.classList.toggle('on', st >= 3);
  }
  function step() { if (st >= 3) return; st++; apply(); if (st === 3) { $('p18folder').classList.add('ringed'); later(18, function () { $('p18folder').classList.remove('ringed'); }, 700); } }
  on(btn, function () { if (!btn.classList.contains('done')) step(); });
  apply();
  PAGE[18] = { step: step, finish: function () { clearLater(18); st = 3; apply(); }, reset: function () { clearLater(18); st = 0; apply(); }, spaceDone: function () { return st >= 3; } };
})();

/* ===== 19장 ===== */
(function () {
  var a = 0, f = 0, c = $('c19'), CY = [SHAPE.A, SHAPE.B, SHAPE.C, SHAPE.E];
  function render() {
    $('p19dL').innerHTML = docshape(CY[a % 4], {}); $('p19dR').innerHTML = docshape(SHAPE.D, f ? { hl: 3 } : {});
    $$('i', $('p19mR')).forEach(function (i, k) { i.classList.toggle('on', k <= f); });
    dots('p19dotsL', a); dots('p19dotsR', f);
    $('p19again').classList.toggle('done', a >= 3); $('p19fix').classList.toggle('done', f >= 3);
    var done = a >= 3 && f >= 3; setOn($('p19under'), done); c.classList.toggle('on', done);
  }
  on($('p19again'), function () { if (a < 3) { a++; render(); } }); on($('p19fix'), function () { if (f < 3) { f++; render(); } });
  render();
  PAGE[19] = { step: function () { if (a < 3) a++; else if (f < 3) f++; render(); }, finish: function () { a = 3; f = 3; render(); }, reset: function () { a = 0; f = 0; render(); }, spaceDone: function () { return a >= 3 && f >= 3; } };
})();

/* ===== 20장 ===== */
(function () {
  var host = $('p20share'), c = $('c20'), given = false, fixed = false;
  var KIND = [SHAPE.A, SHAPE.B, SHAPE.C, SHAPE.A, SHAPE.E, SHAPE.B];
  var W = 1096, H = 452, cx = W / 2, cy = H / 2, R = 200;
  var html = '<svg class="lines" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">';
  var nodes = [];
  for (var i = 0; i < 6; i++) { var ang = -Math.PI / 2 + i * Math.PI / 3; var x = cx + R * Math.cos(ang) * 1.9, y = cy + R * Math.sin(ang); nodes.push([x, y]); html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>'; }
  html += '</svg>';
  html += '<div class="skill"><div class="sn">투자검토보고서 스킬</div><div class="si">지시문</div><div class="si" id="p20tpl">템플릿</div><div class="si">참고 자료</div></div>';
  nodes.forEach(function (n, i) { html += '<div class="node" style="left:' + (n[0] / W * 100) + '%;top:' + (n[1] / H * 100) + '%"><div class="docshape ds" id="p20n' + i + '"></div>' + ICON.person + '</div>'; });
  host.innerHTML = html;
  var lines = $$('line', host);
  function render() {
    for (var i = 0; i < 6; i++) $('p20n' + i).innerHTML = docshape(given ? SHAPE.D : KIND[i], fixed ? { hl: 3 } : {});
    $('p20tpl').classList.toggle('hl', fixed);
    ['p20af1', 'p20af2', 'p20af3', 'p20af4'].forEach(function (id) { setOn($(id), given); });
    $('p20give').classList.toggle('done', given); $('p20fix').classList.toggle('done', fixed);
    dots('p20dots', (given ? 1 : 0) + (fixed ? 1 : 0)); c.classList.toggle('on', given && fixed);
  }
  function give() { if (given) return; given = true; lines.forEach(function (l, i) { later(20, function () { l.classList.add('on'); }, 70 * i); }); render(); }
  function fix() { if (!given || fixed) return; fixed = true; render(); }
  on($('p20give'), give); on($('p20fix'), fix);
  render();
  PAGE[20] = { step: function () { if (!given) give(); else fix(); }, finish: function () { clearLater(20); given = true; fixed = true; lines.forEach(function (l) { l.classList.add('on'); }); render(); }, reset: function () { clearLater(20); given = false; fixed = false; lines.forEach(function (l) { l.classList.remove('on'); }); render(); }, spaceDone: function () { return given && fixed; } };
})();

/* ===== 21장 ===== */
(function () {
  var stream = $('p21stream'), fld = $('p21fld'), q = $('p21q'), send = $('p21send'), c = $('c21'), turn = 0, busy = false;
  var QS = ['지난주 미팅 노트 요약해 줘', '요약을 그 폴더에 문서로 만들어 줘'];
  var AS = ['연결된 문서 세 건을 읽었습니다 …', '요약본을 만들었습니다'];
  function sendTurn() {
    if (busy || turn >= 2) return; busy = true; turn++;
    stream.appendChild(bubble('me', QS[turn - 1])); fld.classList.add('off'); send.classList.add('locked');
    if (turn === 1) { setOn($('p21read'), 1); $$('.doc', $('p21docs')).slice(0, 3).forEach(function (d) { d.classList.add('ringed'); }); }
    var ty = typing(); later(21, function () { stream.appendChild(ty); }, 400);
    later(21, function () {
      if (ty.parentNode) ty.parentNode.removeChild(ty); stream.appendChild(bubble('ai', AS[turn - 1]));
      if (turn === 1) { $$('.doc', $('p21docs')).forEach(function (d) { d.classList.remove('ringed'); }); setOn($('p21s1'), 1); setOn($('p21s2'), 1); q.textContent = QS[1]; fld.classList.remove('off'); send.classList.remove('locked'); }
      if (turn === 2) { setOn($('p21write'), 1); $('p21new').classList.remove('hide'); ['p21s3', 'p21s4', 'p21s5'].forEach(function (id) { setOn($(id), 1); }); setOn($('p21under'), 1); c.classList.add('on'); }
      busy = false;
    }, 1200);
  }
  on(send, function () { if (!send.classList.contains('locked')) sendTurn(); });
  function finish() {
    clearLater(21); stream.innerHTML = ''; turn = 2; busy = false;
    for (var t = 0; t < 2; t++) { var b1 = bubble('me', QS[t]), b2 = bubble('ai', AS[t]); b1.classList.remove('in'); b2.classList.remove('in'); stream.appendChild(b1); stream.appendChild(b2); }
    setOn($('p21read'), 1); setOn($('p21write'), 1); $('p21new').classList.remove('hide'); ['p21s1', 'p21s2', 'p21s3', 'p21s4', 'p21s5'].forEach(function (id) { setOn($(id), 1); }); setOn($('p21under'), 1); c.classList.add('on');
    q.textContent = QS[1]; fld.classList.add('off'); send.classList.add('locked');
  }
  function reset() {
    clearLater(21); stream.innerHTML = ''; turn = 0; busy = false; setOn($('p21read'), 0); setOn($('p21write'), 0); $('p21new').classList.add('hide');
    ['p21s1', 'p21s2', 'p21s3', 'p21s4', 'p21s5'].forEach(function (id) { setOn($(id), 0); }); setOn($('p21under'), 0); c.classList.remove('on'); q.textContent = QS[0]; fld.classList.remove('off'); send.classList.remove('locked');
    $$('.doc', $('p21docs')).forEach(function (d) { d.classList.remove('ringed'); });
  }
  PAGE[21] = { step: sendTurn, finish: finish, reset: reset, spaceDone: function () { return turn >= 2 && !busy; } };
})();

/* ===== 23장 ===== */
(function () {
  var items = $$('.ri', $('p23recap')), n = 0;
  var ORDER = [0, 2, 4, 6, 1, 3, 5]; /* 열 순서로 읽는다: 왼쪽 열 넷, 오른쪽 열 셋 */
  function render() { items.forEach(function (it, i) { it.classList.toggle('on', ORDER.indexOf(i) < n); }); var done = n >= 7; setOn($('p23decl'), done); setOn($('p23band'), done); }
  render();
  PAGE[23] = { step: function () { if (n < 7) { n++; render(); } }, finish: function () { n = 7; render(); }, reset: function () { n = 0; render(); }, spaceDone: function () { return n >= 7; } };
})();

/* 모든 쪽을 처음 상태로 한 번 맞춘다. 정지 상태와 되돌린 상태의 서명이 같아야 한다 */
Object.keys(PAGE).forEach(function (k) { if (PAGE[k].reset) PAGE[k].reset(); });
