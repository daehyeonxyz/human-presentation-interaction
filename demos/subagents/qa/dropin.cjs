/* 증보된 원고를 덱 1호에 앉힌다. 한 번만 도는 스크립트이고 되풀이하면 실패한다.
     node qa/dropin.cjs   (demos/subagents 에서 실행한다)
*/
const fs = require('fs');
const path = require('path');
const F = path.resolve(__dirname, '..', 'deliverables', '서브에이전트와-병렬-작업.html');
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('못 찾음: ' + a.slice(0, 80)); s = s.replace(a, () => b);   /* 치환문의 $ 가 이스케이프로 먹히지 않게 함수로 넘긴다 */ };

/* ===== 3쪽 CSS ===== */
rep(`.p3dev { grid-column: 1 / 10; grid-row: 3; justify-content: space-between; }
.p3note { grid-column: 10 / -1; grid-row: 3; align-items: center; text-align: left;
  padding-left: var(--sp-16); }
.p3foot { display: flex; flex-direction: column; gap: var(--sp-20); }`,
`.p3dev { grid-column: 1 / 10; grid-row: 3; justify-content: space-between; }
.p3foot { display: flex; flex-direction: column; gap: var(--sp-20); }
/* 게이지 아래 한 줄. 이름이 무엇을 세는지 말하고 이 줄이 왜 그렇게 되는지 말한다 */
.p3cap { margin-top: var(--sp-12); font-size: var(--fs-note); font-weight: var(--fw-medium);
  line-height: var(--lh-note); color: var(--ink-support); }
/* 곁 열. 단계 라벨 넷과 짝이라 서로를 가리킨다 */
.p3note { grid-column: 10 / -1; grid-row: 3; display: flex; flex-direction: column;
  gap: var(--sp-12); min-height: 0; }
.p3nh { font-size: var(--fs-note); font-weight: var(--fw-bold); color: var(--ink-support);
  letter-spacing: var(--ls-none); padding: 0 var(--sp-20) var(--sp-8); }
.p3ni { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column;
  justify-content: center; gap: var(--sp-8); padding: 0 var(--sp-20);
  border-radius: var(--radius-md); }
.p3ni:hover, .p3ni.lit, .p3ni.cur { background: var(--surface-hover); }
.p3nn { font-size: var(--fs-note); font-weight: var(--fw-bold); color: var(--accent);
  letter-spacing: var(--ls-none); }
.p3nt { font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: var(--ink); }`);

/* ===== 3쪽 본문 ===== */
rep(`    <p class="footnote p3note ln">중간 결과는 서브에이전트 창에 쌓이고<br>메인 창에는 마지막 보고 한 건만 돌아온다</p>
`, `    <div class="p3note" id="p3note">
      <p class="p3nh">단계마다 서브에이전트 창에 남는 것</p>
      <div class="hit p3ni" data-s="0"><span class="p3nn">검색</span><span class="p3nt ln">검색 결과 목록과<br>훑어본 파일 경로</span></div>
      <div class="hit p3ni" data-s="1"><span class="p3nn">파일 읽기</span><span class="p3nt ln">파일 본문 전체와<br>인용 후보</span></div>
      <div class="hit p3ni" data-s="2"><span class="p3nn">교차 확인</span><span class="p3nt ln">서로 어긋난 대목의<br>대조 기록</span></div>
      <div class="hit p3ni" data-s="3"><span class="p3nn">결론</span><span class="p3nt ln">보고 한 건만<br>메인 창으로 돌아간다</span></div>
    </div>
`);
rep(`          <span class="p3seg" data-g="0" data-s="3"><b class="p3v">+8%</b></span>
        </div>
      </div>`,
`          <span class="p3seg" data-g="0" data-s="3"><b class="p3v">+8%</b></span>
        </div>
        <p class="p3cap">중간 결과가 전부 대화에 쌓인다</p>
      </div>`);
rep(`          <span class="p3seg" data-g="1" data-s="3"><b class="p3v">+10%</b></span>
        </div>
      </div>`,
`          <span class="p3seg" data-g="1" data-s="3"><b class="p3v">+10%</b></span>
        </div>
        <p class="p3cap">마지막 보고 한 건만 받는다</p>
      </div>`);

/* ===== 3쪽 스크립트. 곁 열 항목을 교차 강조에 넣는다 ===== */
rep(`var p3segs = $$('.p3seg');
var p3lbs = $$('.p3lb');`,
`var p3segs = $$('.p3seg');
var p3lbs = $$('.p3lb');
var p3nis = $$('#p3note .p3ni');`);
rep(`  mark(p3lbs, 'lit', function (el) { return cls === 'lit' && +el.dataset.s === s; });
  mark(p3lbs, 'cur', function (el) { return cls === 'cur' && +el.dataset.s === s; });
}`,
`  mark(p3lbs, 'lit', function (el) { return cls === 'lit' && +el.dataset.s === s; });
  mark(p3lbs, 'cur', function (el) { return cls === 'cur' && +el.dataset.s === s; });
  mark(p3nis, 'lit', function (el) { return cls === 'lit' && +el.dataset.s === s; });
  mark(p3nis, 'cur', function (el) { return cls === 'cur' && +el.dataset.s === s; });
}
/* 곁 열은 단계에 도달하기 전에도 짚을 수 있다. 무엇이 어느 단계에 남는지는 진행과 무관한 사실이다 */
p3nis.forEach(function (el) {
  hov(el, function () { p3hov = +el.dataset.s; p3cross(); }, function () { p3hov = -1; p3cross(); });
  on(el, function () { var k = +el.dataset.s; p3pin = p3pin === k ? -1 : k; p3cross(); });
});`);

/* ===== 4쪽 CSS ===== */
rep(`.p4n { font-size: var(--fs-body); font-weight: var(--fw-bold); letter-spacing: var(--ls-body);
  transition: color var(--dur-fast) var(--ease-out); }`,
`.p4n { font-size: var(--fs-body); font-weight: var(--fw-bold); letter-spacing: var(--ls-body);
  transition: color var(--dur-fast) var(--ease-out); }
.p4sub { margin-top: var(--sp-8); font-size: var(--fs-note); font-weight: var(--fw-medium);
  line-height: var(--lh-note); color: var(--ink-support); }`);
rep(`.p4grid { margin-top: var(--sp-16); display: flex; gap: var(--sp-32); }`,
`.p4work { margin-top: var(--gap-layer); font-size: var(--fs-body); font-weight: var(--fw-medium);
  line-height: var(--lh-body); letter-spacing: var(--ls-body); color: var(--ink); }
.p4grid { margin-top: var(--sp-20); display: flex; gap: var(--sp-32); }`);

/* ===== 4쪽 본문 ===== */
[['조사 A', '결제 모듈의 의존성 목록'],
 ['조사 B', '지난 릴리스의 회귀 이력'],
 ['조사 C', '테스트가 비어 있는 구역']].forEach(function (r) {
  rep(`<div class="p4th"><span class="p4n">${r[0]}</span><span class="pill p4s">대기</span></div>
        <div class="p4bar">`,
`<div class="p4th"><span class="p4n">${r[0]}</span><span class="pill p4s">대기</span></div>
        <p class="p4sub">${r[1]}</p>
        <div class="p4bar">`);
});
rep(`        <div class="p4ih"><span class="p4in" id="p4in">조사 A</span><span class="pill" id="p4ip">대기</span></div>
        <div class="p4grid">`,
`        <div class="p4ih"><span class="p4in" id="p4in">조사 A</span><span class="pill" id="p4ip">대기</span></div>
        <p class="p4work" id="p4work">의존성을 훑어 충돌 후보 2건 정리</p>
        <div class="p4grid">`);

/* ===== 4쪽 스크립트 ===== */
rep(`var P4 = [
  { k: 'a', n: '조사 A', min: 2, tok: '18k' },
  { k: 'b', n: '조사 B', min: 3, tok: '26k' },
  { k: 'c', n: '조사 C', min: 4, tok: '31k' }
];`,
`var P4 = [
  { k: 'a', n: '조사 A', min: 2, tok: '18k', work: '의존성을 훑어 충돌 후보 2건 정리' },
  { k: 'b', n: '조사 B', min: 3, tok: '26k', work: '릴리스 노트 9건에서 회귀 3건 정리' },
  { k: 'c', n: '조사 C', min: 4, tok: '31k', work: '커버리지 보고서에서 빈 구역 5곳 정리' }
];`);
rep(`  $('p4in').textContent = P4[i].n;`,
`  $('p4in').textContent = P4[i].n;
  $('p4work').textContent = P4[i].work;`);

/* ===== 5쪽 ===== */
rep(`.p5rule { font-size: var(--fs-claim); font-weight: var(--fw-bold); line-height: var(--lh-claim);
  letter-spacing: var(--ls-claim); color: var(--ink-support);
  transition: color var(--dur-fast) var(--ease-out); }`,
`#p5rules .p5it { flex-direction: column; justify-content: center; align-items: flex-start;
  gap: var(--sp-8); }
.p5rule { font-size: var(--fs-claim); font-weight: var(--fw-bold); line-height: var(--lh-claim);
  letter-spacing: var(--ls-claim); color: var(--ink);
  transition: color var(--dur-fast) var(--ease-out); }
.p5why { font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: var(--ink-support); }`);
[['0', '단독으로 성립하는 배경', '없으면 에이전트가 레포를 찾는 데 첫 시간을 쓴다'],
 ['1', '목표는 하나', '둘이면 둘 다 절반씩만 진행된 보고가 온다'],
 ['2', '범위의 경계', '없으면 원인 조사가 수정 커밋까지 번진다'],
 ['3', '보고 형식 지정', '없으면 보고를 받은 뒤 다시 되묻게 된다']].forEach(function (r) {
  rep(`<div class="hit p5it" data-i="${r[0]}"><span class="p5rule">${r[1]}</span></div>`,
      `<div class="hit p5it" data-i="${r[0]}"><span class="p5rule">${r[1]}</span><span class="p5why ln">${r[2]}</span></div>`);
});

/* ===== 6쪽 ===== */
rep(`.p6it { flex: 1 1 0; min-height: 0; display: flex; align-items: center; padding: 0 var(--sp-40);
  border-radius: var(--radius-md); background: var(--sunken);
  font-size: var(--fs-claim); font-weight: var(--fw-bold); line-height: var(--lh-claim);
  letter-spacing: var(--ls-claim); color: var(--ink-muted);
  transition: color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out); }
.p6it.on { color: var(--ink); background: var(--surface); }`,
`.p6it { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; justify-content: center;
  gap: var(--sp-8); padding: 0 var(--sp-40);
  border-radius: var(--radius-md); background: var(--sunken); color: var(--ink-muted);
  transition: color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out); }
.p6it.on { color: var(--ink); background: var(--surface); }
.p6n { font-size: var(--fs-claim); font-weight: var(--fw-bold); line-height: var(--lh-claim);
  letter-spacing: var(--ls-claim); color: inherit; }
.p6t { font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: inherit; opacity: 0.72; }`);
[['컨텍스트 보호', '중간 결과는 서브에이전트 창에 남는다'],
 ['병렬 탐색', '독립인 조사만 나란히 보낸다'],
 ['관점 분리', '구현과 검증의 컨텍스트를 가른다'],
 ['80% 와 10%', '같은 결론을 받은 두 메인 창의 사용량 <span class="ex">(예시)</span>'],
 ['9분과 4분', '순차 합계와 병렬의 가장 긴 한 건 <span class="ex">(예시)</span>'],
 ['위임 프롬프트 네 구획', '배경과 목표와 경계와 보고 형식']].forEach(function (r) {
  rep(`<span class="p6it">${r[0]}</span>`,
      `<span class="p6it"><span class="p6n">${r[0]}</span><span class="p6t ln">${r[1]}</span></span>`);
});

fs.writeFileSync(F, s);
console.log('덱 1호 드롭인 완료 · ' + s.length + '자');
