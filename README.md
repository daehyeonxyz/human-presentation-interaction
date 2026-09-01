# interactive-presentation

청중이 직접 보고 조작하며 이해하게 되는 발표 자료를 기획부터 구현과 검증까지 만드는 스킬이다. 산출물은 빌드 없이 `file://` 로 열리는 zero-dependency 단일 HTML 이고, 개념을 도형 몇 개로 그리는 대신 그 개념에 어떤 인터랙션이 필요한지 먼저 판정하고 실제로 구동되는 구현체 수준까지 만든다.

이 레포가 스킬의 본체이자 개발 이력이다. 루트의 스킬 파일이 배포 단위이고, `demos/` 와 `ax-education/` 과 `qa/` 는 그 스킬을 실전으로 검증한 기록이다.

## 의존성

**`outputs` 스킬이 함께 있어야 한다.** 화면에 인쇄될 글자의 문체와 화계와 금지 표현은 이 스킬이 정하지 않고 `outputs` 가 정한다. 6단계 서술과 9단계 검증이 그 문서를 실제로 연다.

- 이 스킬이 정하는 것: 무엇을 어떤 구조로 보여줄지. 페이지 메시지, 판, 등급, 셀 지도, 줄바꿈, 칸 분량
- `outputs` 가 정하는 것: 그 글자를 어떤 한국어로 쓸지. 문체, 화계, 종결, 리듬 수치, 금지 표현

## 구성

| 경로 | 내용 |
|---|---|
| `SKILL.md` | 실행 절차의 SSOT. 기획부터 검증까지 10단계 |
| `layout-taxonomy.md` | 원본 택소노미의 프레젠테이션 스테이지 어댑터. 스테이지 계약(배율·프레임·채움·면) |
| `interaction-grammar.md` | 조작 문법 `g-*`, 논리 구조 `m-*`, 복잡도 등급 대응, 안정성 가드레일, 검증된 판 기록 |
| `references/taxonomy.md` | 레이아웃 판단의 원본 분류 체계 (6부 23분류 139개 키워드) |
| `research/` | 지향점(north-star), 발표 철학 실측, 인터랙션 방법론 조사 |
| `templates/stage.html` | 무대 계약 뼈대. 8단계 구현의 출발점 |
| `templates/plan.md`, `templates/manuscript.md` | 기획서와 슬라이드 원고의 산출물 뼈대 |
| `checklists/build-selfcheck.md` | 구현 자가 점검표. 8단계 완료 판정용이고 코드와 대조한다 |
| `checklists/observation-request.md` | 관찰 요청 대본. 브라우저를 못 띄우는 자리의 9단계 절차 |
| `tools/fluid-gate.mjs` | 해상도 매트릭스 게이트 |
| `demos/` | 검증 덱. 주제별 폴더에 기획서와 원고와 산출물과 QA 증거가 있다 |
| `ax-education/` | 실전 발표 프로젝트. 디자인 시스템과 원고와 산출물의 실물 표본 |

## 설치

스킬로 쓰려면 루트의 스킬 파일을 `~/.claude/skills/interactive-presentation/` 에 둔다. `outputs` 를 그 옆에 함께 둔다.

```text
SKILL.md  layout-taxonomy.md  interaction-grammar.md
references/  research/  templates/  checklists/  tools/
```

`demos/` 와 `ax-education/` 과 `qa/` 는 검증 기록이라 배포에 필요하지 않다. 다만 `ax-education/디자인시스템.md` 와 `ax-education/tokens.css` 는 7단계가 참고하는 실물 표본이므로 함께 두면 도움이 된다.

## 스테이지 계약

`templates/stage.html` 이 그 구현체다. 다섯 해상도에서 아래를 검사해 통과한 코드다.

- 배율은 `min(vw/1920, vh/1080)`, 설계 폭은 1920~2560 가변, 설계 높이는 1080 고정이다. 화면비가 맞지 않으면 레터박스를 남기고 그 색은 그 쪽의 캔버스 색이다.
- 네 변 여백은 80 이고 그 안쪽은 12열 격자다. 본체 행이 `1fr` 이라 아래가 남지 않는다.
- 좌우 키는 쪽 넘김, `Space` 는 그 쪽의 다음 조작, `End` 는 완료 상태다. 완료된 쪽에서 `Space` 는 처음 상태로 되돌린다.
- 조작 뒤 초점이 풀려 키보드 내비게이션이 즉시 복구된다.
- 커서가 `pointer` 인 요소는 전부 호버 반응을 낸다. 호버 미리보기가 있는 곳에는 클릭 고정이 함께 있다.
- 모든 판은 안정성 가드레일을 지킨다. 목록은 `interaction-grammar.md` 가 갖는다.

## 검증

```bash
node tools/fluid-gate.mjs            # 레포의 덱 전부
node tools/fluid-gate.mjs <덱 경로>   # 지정한 덱 하나
```

deliverables 폴더의 덱을 자동으로 찾아 다섯 해상도(4:3, 16:10, 16:9, 21:9 두 가지)에서 스테이지 폭 계산과 렌더 배율과 여백 유지와 네 변 넘침과 호버 전수 반응과 키보드 계약을 검사한다. 캡처는 `qa/matrix/` 에 남는다. playwright 가 필요하다.

브라우저를 띄울 수 없는 자리에서는 `checklists/observation-request.md` 로 사용자에게 관찰을 요청하고 그 답을 완료 증거로 삼는다.

## 데모 덱

| 덱 | 주제 | 검증한 것 |
|---|---|---|
| `demos/subagents` | 서브에이전트와 병렬 작업 | 가변 폭 스테이지, point-map 판 첫 실물 |
| `demos/prompt-caching` | 프롬프트 캐싱과 비용 | drag-compare · drag-threshold · input-sandbox 판 첫 실물 |

덱의 수치는 전부 시뮬레이션 예시이고 화면에 예시 표기가 있다.
