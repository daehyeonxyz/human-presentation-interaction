
/* ===== 끌기 핸들 공통.
   포인터 캡처를 잡고 놓는 것까지 한 곳에서 다룬다. 캡처가 남으면 숨은 핸들이 이후 이동을 계속 받는다.
   핸들이 초점을 가진 동안에만 좌우 키를 가로채고 초점을 잃으면 즉시 넘김으로 돌려준다 ===== */
function bindGrip(grip, box, get, apply) {
  var dragging = false;
  function at(e) {
    var r = box.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  }
  var pid = null;
  grip.addEventListener('pointerdown', function (e) {
    dragging = true;
    grip.classList.add('drag');
    box.classList.add('drag');
    grip.focus();
    pid = e.pointerId;
    grip.setPointerCapture(pid);
    e.preventDefault();
  });
  grip.addEventListener('pointermove', function (e) { if (dragging) apply(at(e)); });
  function stop() {
    dragging = false; grip.classList.remove('drag'); box.classList.remove('drag');
    if (pid !== null) { try { grip.releasePointerCapture(pid); } catch (err) { /* 이미 풀림 */ } pid = null; }
  }
  grip.addEventListener('pointerup', stop);
  grip.addEventListener('pointercancel', stop);
  grip.addEventListener('lostpointercapture', stop);
  /* 핸들을 누른 것은 빈 곳을 누른 것이 아니다. 초점을 지켜야 좌우 키가 값을 옮긴다 */
  grip.addEventListener('click', function (e) { e.stopPropagation(); });
  grip.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    apply(get() + (e.key === 'ArrowRight' ? 5 : -5));
    e.stopPropagation();
    e.preventDefault();
  });
}

/* ===== 2쪽은 등급 0 정지다. 조작이 없고 세 항목이 처음부터 다 펼쳐져 있다 ===== */

/* ===== 3쪽 · 캐시는 요청의 앞부분을 저장한다 (drag-compare)
   정지 위치는 62% 다. 가운데에 두면 어느 쪽이 기준인지 배치로 안 갈리고,
   핸들이 두 층의 줄 한가운데를 덮어 그 줄을 겨냥할 수 없다 ===== */
var P3REST = 62, P3STOP = [62, 0, 100];
var p3in = $('p3in'), p3seam = $('p3seam');
var p3rows = $$('#p3in .p3row');
var p3v = P3REST, p3stop = 0, p3pin = -1, p3hov = -1, p3left = false, p3right = false;
function p3set(v, count) {
  p3v = Math.max(0, Math.min(100, v));
  p3in.style.setProperty('--split', p3v + '%');
  p3seam.setAttribute('aria-valuenow', Math.round(p3v));
  if (count !== false) {
    if (p3v <= 2) p3left = true;
    if (p3v >= 98) p3right = true;
  }
  $('p3close').classList.toggle('on', p3left && p3right);
}
function p3cross() {
  var s = p3pin >= 0 ? p3pin : p3hov;
  var cls = p3pin >= 0 ? 'cur' : 'lit';
  mark(p3rows, 'lit', function (el) { return cls === 'lit' && +el.dataset.i === s; });
  mark(p3rows, 'cur', function (el) { return cls === 'cur' && +el.dataset.i === s; });
}
p3rows.forEach(function (el) {
  hov(el, function () { if (p3pin >= 0) return; p3hov = +el.dataset.i; p3cross(); },
    function () { p3hov = -1; p3cross(); });
  on(el, function () {
    var i = +el.dataset.i;
    p3pin = p3pin === i ? -1 : i;
    p3cross();
  });
});
bindGrip(p3seam, p3in, function () { return p3v; }, function (v) { p3set(v); });
PAGE[3] = {
  step: function () { p3stop = (p3stop + 1) % P3STOP.length; p3set(P3STOP[p3stop]); },
  finish: function () {
    p3left = true; p3right = true; p3stop = 0; p3pin = -1; p3hov = -1;
    p3set(P3REST); p3cross();
  },
  reset: function () {
    p3left = false; p3right = false; p3stop = 0; p3pin = -1; p3hov = -1;
    p3set(P3REST, false); p3cross();
  },
  unpin: function () { p3pin = -1; p3cross(); }
};
p3set(P3REST, false);

/* ===== 4쪽 · 같은 접두사로 보내야 적중한다 (input-sandbox)
   전송 원을 누르면 입력 칸의 요청이 이력으로 올라가고 관찰 창의 막대가 갈린다.
   정지 상태는 요청 1 을 이미 보낸 상태다. 아무것도 안 보낸 화면은 창 둘이 다 비어
   무엇을 보는 쪽인지 형태로 안 갈린다 ===== */
var P4 = [
  { n: '요청 1', t: '어제 회의록을 요약해 줘', hit: 0,
    note: ['첫 요청. 저장된 것이 없어 전부 새로 계산', '이 요청의 앞부분이 캐시에 저장된다'] },
  { n: '요청 2', t: '요약에서 결정 사항만 뽑아 줘', hit: 80,
    note: ['앞부분이 같아 적중. 새 질문만 계산', '입력 대부분이 캐시 단가로 내려간다'] },
  { n: '요청 3', t: '결정 사항을 표로 만들어 줘', hit: 0,
    mark: '(시스템 프롬프트를 바꾼 뒤)',
    note: ['앞부분이 바뀌어 적중 실패. 전부 새로 계산', '바뀐 접두사가 새로 저장된다'] }
];
var p4segs = $$('.p4seg');
var p4lgs = $$('.p4lg');
var p4its = [];
var P4REST = 1;
var p4t = P4REST, p4pin = 0, p4hov = 0, p4spin = null, p4shov = null;
function p4view() { return p4pin || p4hov || p4t; }
function p4obs() {
  var i = p4view();
  var r = i ? P4[i - 1] : null;
  var a = r ? r.hit : 0, b = r ? 100 - r.hit : 0;
  p4segs[0].style.width = a + '%';
  p4segs[1].style.width = b + '%';
  $('p4va').textContent = r ? a + '%' : '';
  $('p4vb').textContent = r ? b + '%' : '';
  var note = $('p4note');
  note.textContent = '';
  if (r) {
    note.appendChild(document.createTextNode(r.note[0]));
    note.appendChild(document.createElement('br'));
    var sub = document.createElement('span');
    sub.className = 'p4note2';
    sub.textContent = r.note[1];
    note.appendChild(sub);
  }
}
function p4cross() {
  var k = p4pin || p4hov;
  var cls = p4pin ? 'cur' : 'lit';
  mark(p4its, 'lit', function (el) { return cls === 'lit' && +el.dataset.k === k; });
  mark(p4its, 'cur', function (el) { return cls === 'cur' && +el.dataset.k === k; });
  var s = p4spin || p4shov;
  var scls = p4spin ? 'cur' : 'lit';
  mark(p4segs, 'lit', function (el) { return scls === 'lit' && el.dataset.k === s; });
  mark(p4segs, 'cur', function (el) { return scls === 'cur' && el.dataset.k === s; });
  mark(p4lgs, 'lit', function (el) { return scls === 'lit' && el.dataset.k === s; });
  mark(p4lgs, 'cur', function (el) { return scls === 'cur' && el.dataset.k === s; });
  p4obs();
}
function p4row(r, k) {
  var el = document.createElement('div');
  el.className = 'hit p4it';
  el.dataset.k = String(k);
  var no = document.createElement('span');
  no.className = 'p4no';
  no.textContent = r.n;
  var tx = document.createElement('span');
  tx.className = 'p4tx';
  tx.textContent = r.t;
  el.appendChild(no);
  el.appendChild(tx);
  hov(el, function () { if (p4pin) return; p4hov = k; p4cross(); },
    function () { p4hov = 0; p4cross(); });
  on(el, function () { p4pin = p4pin === k ? 0 : k; p4cross(); });
  return el;
}
function p4build() {
  var box = $('p4log');
  box.textContent = '';
  p4its = [];
  for (var i = 0; i < P4.length; i++) {
    if (P4[i].mark && p4t >= i) {
      var m = document.createElement('p');
      m.className = 'p4mark';
      m.textContent = P4[i].mark;
      box.appendChild(m);
    }
    if (i < p4t) {
      var it = p4row(P4[i], i + 1);
      p4its.push(it);
      box.appendChild(it);
    }
  }
  var f = $('p4field');
  f.textContent = '';
  var s = P4[p4t % P4.length];
  var no = document.createElement('span');
  no.className = 'p4no';
  no.textContent = s.n;
  var tx = document.createElement('span');
  tx.className = 'p4tx';
  tx.textContent = s.t;
  f.appendChild(no);
  f.appendChild(tx);
}
function p4render() {
  p4build();
  $('p4close').classList.toggle('on', p4t >= P4.length);
  p4cross();
}
function p4fire() {
  if (p4t >= P4.length) p4t = 0;
  p4t += 1;
  p4pin = 0; p4hov = 0; p4spin = null; p4shov = null;
  p4render();
}
p4lgs.forEach(function (el) {
  hov(el, function () { if (p4spin) return; p4shov = el.dataset.k; p4cross(); },
    function () { p4shov = null; p4cross(); });
  on(el, function () {
    p4spin = p4spin === el.dataset.k ? null : el.dataset.k;
    p4cross();
  });
});
on($('p4send'), p4fire);
PAGE[4] = {
  step: p4fire,
  finish: function () {
    p4t = P4.length; p4pin = 0; p4hov = 0; p4spin = null; p4shov = null; p4render();
  },
  reset: function () {
    p4t = P4REST; p4pin = 0; p4hov = 0; p4spin = null; p4shov = null; p4render();
  },
  unpin: function () { p4pin = 0; p4spin = null; p4cross(); }
};
p4render();

/* ===== 5쪽 · 적중률이 비용을 정한다 (drag-threshold)
   비용은 원고가 준 기준 두 점을 잇는 값이다. 적중 0% 면 100 이고 적중 100% 면 10 이다.
   맺음은 원고가 든 적중률 60% 에 닿았을 때 켜진다 ===== */
var P5STOP = [0, 60, 100];
var p5ctl = $('p5ctl'), p5grip = $('p5grip'), p5rail = $('p5rail');
var p5v = 0, p5stop = 0, p5pin = false, p5hov = false;
function p5cost(v) { return Math.round(100 - 0.9 * v); }
function p5set(v) {
  p5v = Math.max(0, Math.min(100, Math.round(v)));
  p5ctl.style.setProperty('--v', p5v + '%');
  $('p5tf').style.width = p5v + '%';
  $('p5rate').textContent = p5v + '%';
  var c = p5cost(p5v);
  $('p5cost').textContent = c;
  var fill = $('p5fill');
  fill.style.width = c + '%';
  fill.dataset.s = c >= 60 ? '1' : (c >= 25 ? '2' : '3');
  $('p5cap2').textContent = '100 − 90 × ' + (p5v / 100).toFixed(2) + ' = ' + c;
  p5grip.setAttribute('aria-valuenow', p5v);
  $('p5close').classList.toggle('on', p5v >= 60);
  /* 드래그로 바꾼 값에도 Space 순환 색인을 맞춘다. 낡은 색인이면 Space 가 값을 뒤로 옮긴다 */
  p5stop = p5v >= 100 ? 2 : p5v >= 60 ? 1 : 0;
}
function p5paint() {
  var open = p5pin || p5hov;
  p5rail.classList.toggle('cur', p5pin);
  $('p5cap1').classList.toggle('off', open);
  $('p5cap2').classList.toggle('on', open);
}
hov(p5rail, function () { p5hov = true; p5paint(); }, function () { p5hov = false; p5paint(); });
on(p5rail, function () { p5pin = !p5pin; p5paint(); });
bindGrip(p5grip, p5ctl, function () { return p5v; }, function (v) { p5set(v); });
PAGE[5] = {
  spaceDone: function () { return p5v >= 100; },
  step: function () { p5stop = (p5stop + 1) % P5STOP.length; p5set(P5STOP[p5stop]); },
  finish: function () { p5stop = 2; p5pin = false; p5hov = false; p5set(100); p5paint(); },
  reset: function () { p5stop = 0; p5pin = false; p5hov = false; p5set(0); p5paint(); },
  unpin: function () { p5pin = false; p5paint(); }
};
p5set(0);

/* ===== 6쪽 · 정리 (accumulate-recap)
   되짚기 항목이 하나씩 켜지고 다 켜지면 다음 물음이 붙는다 ===== */
var p6its = $$('#p6grid .p6it');
var p6i = 0;
function p6render() {
  p6its.forEach(function (el, k) { el.classList.toggle('on', k < p6i); });
  $('p6next').classList.toggle('on', p6i >= p6its.length);
}
PAGE[6] = {
  step: function () { p6i = p6i >= p6its.length ? 0 : p6i + 1; p6render(); },
  finish: function () { p6i = p6its.length; p6render(); },
  reset: function () { p6i = 0; p6render(); }
};
p6render();
</script>
</body>
</html>
