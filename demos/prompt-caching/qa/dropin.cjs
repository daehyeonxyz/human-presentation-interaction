/* 증보된 원고를 덱 2호의 본문·쪽 CSS 원본에 앉힌다. 한 번만 도는 스크립트이고 되풀이하면 실패한다.
   앉힌 뒤에는 qa/build-pc.cjs 로 배포본을 다시 짓는다.
     node qa/dropin.cjs   (demos/prompt-caching 에서 실행한다)
*/
const fs = require('fs');
const path = require('path');
const BODY = path.join(__dirname, 'pc-body.html');
const CSS = path.join(__dirname, 'pc-pages.css');
const JS = path.join(__dirname, 'pc-pages.js');

function edit(file, pairs) {
  let s = fs.readFileSync(file, 'utf8');
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(path.basename(file) + ' 에서 못 찾음: ' + a.slice(0, 70));
    s = s.replace(a, () => b);   /* 치환문의 $ 가 이스케이프로 먹히지 않게 함수로 넘긴다 */
  }
  fs.writeFileSync(file, s);
}

/* ===== 4쪽 해설 두 줄. 관찰 창 아래가 두 줄을 담는다 ===== */
edit(JS, [[
`var P4 = [
  { n: '요청 1', t: '어제 회의록을 요약해 줘', hit: 0,
    note: '첫 요청. 저장된 것이 없어 전부 새로 계산' },
  { n: '요청 2', t: '요약에서 결정 사항만 뽑아 줘', hit: 80,
    note: '앞부분이 같아 적중. 새 질문만 계산' },
  { n: '요청 3', t: '결정 사항을 표로 만들어 줘', hit: 0,
    mark: '(시스템 프롬프트를 바꾼 뒤)',
    note: '앞부분이 바뀌어 적중 실패. 전부 새로 계산' }
];`,
`var P4 = [
  { n: '요청 1', t: '어제 회의록을 요약해 줘', hit: 0,
    note: ['첫 요청. 저장된 것이 없어 전부 새로 계산', '이 요청의 앞부분이 캐시에 저장된다'] },
  { n: '요청 2', t: '요약에서 결정 사항만 뽑아 줘', hit: 80,
    note: ['앞부분이 같아 적중. 새 질문만 계산', '입력 대부분이 캐시 단가로 내려간다'] },
  { n: '요청 3', t: '결정 사항을 표로 만들어 줘', hit: 0,
    mark: '(시스템 프롬프트를 바꾼 뒤)',
    note: ['앞부분이 바뀌어 적중 실패. 전부 새로 계산', '바뀐 접두사가 새로 저장된다'] }
];`
], [
`  $('p4note').textContent = r ? r.note : '';`,
`  var note = $('p4note');
  note.textContent = '';
  if (r) {
    note.appendChild(document.createTextNode(r.note[0]));
    note.appendChild(document.createElement('br'));
    var sub = document.createElement('span');
    sub.className = 'p4note2';
    sub.textContent = r.note[1];
    note.appendChild(sub);
  }`
]]);

/* ===== 5쪽 곁 열. 머리와 항목 셋이 곁 문장 위에 선다 ===== */
edit(CSS, [[
`.p5side { grid-column: 9 / -1; grid-row: 3; display: flex; align-items: center;
  padding-left: var(--sp-16);
  font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: var(--ink-support); }`,
`.p5side { grid-column: 9 / -1; grid-row: 3; display: flex; flex-direction: column;
  gap: var(--sp-12); min-height: 0; padding-left: var(--sp-16); }
.p5sh { font-size: var(--fs-note); font-weight: var(--fw-bold); color: var(--ink-support);
  letter-spacing: var(--ls-none); padding: 0 var(--sp-20) var(--sp-8); }
.p5si { flex: 1 1 0; min-height: 0; display: flex; align-items: center; padding: 0 var(--sp-20);
  border-radius: var(--radius-md); background: var(--sunken);
  font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: var(--ink); }
.p5note { display: flex; align-items: center; padding: var(--sp-16) var(--sp-20) 0;
  font-size: var(--fs-note); font-weight: var(--fw-medium); line-height: var(--lh-note);
  letter-spacing: var(--ls-body); color: var(--ink-support); }`
], [
`.p4note { margin-top: auto; padding-top: var(--sp-24); min-height: 92px;
  font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: var(--ink-support); }`,
`.p4note { margin-top: auto; padding-top: var(--sp-24); min-height: 120px;
  font-size: var(--fs-body); font-weight: var(--fw-medium); line-height: var(--lh-body);
  letter-spacing: var(--ls-body); color: var(--ink); }
.p4note2 { color: var(--ink-support); }`
], [
`.p6it { flex: 1 1 0; min-height: 0; display: flex; align-items: center; padding: 0 var(--sp-40);
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
  letter-spacing: var(--ls-body); color: inherit; opacity: 0.72; }`
]]);

edit(BODY, [[
`    <p class="p5side ln">자주 바뀌는 것을 요청의 뒤로 보내면<br>접두사가 안정되어 적중률이 오른다</p>`,
`    <div class="p5side">
      <p class="p5sh">접두사를 안정시키는 방법</p>
      <p class="p5si ln">시스템 프롬프트와 도구 정의를<br>앞에 고정한다</p>
      <p class="p5si ln">날짜와 세션 값처럼 자주 바뀌는 것을<br>뒤로 보낸다</p>
      <p class="p5si ln">대화 이력은 그대로 두고<br>끝에만 덧붙인다</p>
      <p class="p5note ln">자주 바뀌는 것을 요청의 뒤로 보내면<br>접두사가 안정되어 적중률이 오른다</p>
    </div>`
], [
`      <span class="p6it">반복 전송</span>
      <span class="p6it">남는 차이는 새 질문 한 줄</span>
      <span class="p6it">글자 그대로 같은 접두사</span>
      <span class="p6it">100 에서 46</span>`,
`      <span class="p6it"><span class="p6n">반복 전송</span><span class="p6t ln">같은 앞부분이 요청마다 다시 나간다</span></span>
      <span class="p6it"><span class="p6n">남는 차이는 새 질문 한 줄</span><span class="p6t ln">겹침 비교에서 이음매가 없던 줄</span></span>
      <span class="p6it"><span class="p6n">글자 그대로 같은 접두사</span><span class="p6t ln">한 글자가 달라도 적중이 깨진다</span></span>
      <span class="p6it"><span class="p6n">100 에서 46</span><span class="p6t ln">적중률 60% 의 하루 입력 비용 <span class="ex">(예시)</span></span></span>`
]]);

console.log('덱 2호 드롭인 완료');
