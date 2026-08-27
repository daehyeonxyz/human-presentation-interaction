# 프레젠테이션 생태계 조사 — 프레임워크·방법론·인터랙션 패턴

조사일 2026-07-25. 스타 수·최근 push는 GitHub API 실측. 인터랙티브 프레젠테이션 스킬의 기술 스택·검증 게이트·인터랙션 문법 설계의 근거 문서다.

## 1. HTML 프레젠테이션 프레임워크

| 프레임워크 | 스타 | 최근 push | 판정 |
|---|---|---|---|
| reveal.js | 72,015 | 2026-05 | 사실상 표준. fragment·Auto-Animate·발표자 모드·스케일링 전부 검증됨 |
| Slidev | 47,836 | 2026-07 | Vue 컴포넌트를 슬라이드에서 실행. 임베디드 인터랙션 최강. Node 빌드 필수 |
| impress.js | 38,198 | 2026-07 | 공간 배치 특화, 범용 발표에는 니치 |
| Motion Canvas | 18,838 | 2026-07 | 발표 도구가 아니라 애니메이션 영상 도구 |
| Marp | 12,236 | 2026-07 | Markdown→PDF/PPTX. 인터랙션 의도적 배제 |
| Spectacle | 10,144 | 2026-04 | React 저작. 런타임 부담 |
| WebSlides / Eagle.js | 6,317 / 4,054 | 2022 중단 | 신규 채택 비권장 |

핵심 참조 지점:

- **reveal.js 스케일링**: 고정 캔버스(`width: 1920, height: 1080`)를 뷰포트에 균일 스케일 (`transform: scale()` + minScale/maxScale). 이 방식을 차용하면 빌드 없이 1920x1080 고정 저작이 된다. https://revealjs.com/presentation-size/
- **fragment 시스템**: fade-up·highlight·grow 등 다양한 단계 공개 + `data-fragment-index` 명시 순서. 코드 하이라이트 단계 공개 내장.
- **reveal.js-d3**: 슬라이드/fragment 진행 = 차트 상태 전환 패턴의 대표 구현. https://github.com/gcalmettes/reveal.js-d3
- **AI 슬라이드 생성 계열**: anthropics/skills 공식 pptx 스킬(PPTX 계열), Gabberflast/academic-pptx-skill(action title 강제·논증 구조를 스킬로 코드화한 선례), Slidev 공식 AI 워크플로우.
- 차트 라이브러리 통설: D3 = 자유도·난도 최고, Chart.js = 간단 표준 차트, ECharts = 중간 난도에 툴팁·줌·brush 인터랙션 풍부.

## 2. 발표 방법론 (검증 게이트로 쓸 원칙)

- **Assertion-Evidence (Michael Alley)**: 슬라이드 제목 = 완결 문장 주장, 본문 = 시각 증거, 불릿 배제. 이해·회상 개선의 실증 연구 있음 (ASEE). 학술 발표 표준. https://writing.engr.psu.edu/slides_references.html
  - 주의: 사용자 실측 습관은 명사구 제목이다. "주장이 명확한 제목"이라는 원리는 가져오되, 문장형 제목 강제는 사용자 지문과 충돌한다. 제목 + 콜론 풀이 조합이 사용자식 등가물이다.
- **Minto 피라미드 / 맥킨지 액션 타이틀**: 결론 먼저, 3~5 논거, MECE. 제목만 이어 읽어도 덱 논리가 통하는 **horizontal logic 테스트**가 실무 관행. 스킬의 구성 검증 게이트로 직행 가능.
- **Duarte (slide:ology)**: 슬라이드에 75단어 초과면 문서다. 데이터 슬라이드는 데이터가 아니라 **데이터의 의미**를 보여야 한다.
- **Presentation Zen**: 신호 대 노이즈 극대화, 여백.
- **Takahashi**: 극단적 한 단어 슬라이드. 의미가 시퀀스에서 나온다.
- **CHI/UIST 관행**: 본문 최소 24pt·제목 32pt, 슬라이드당 핵심 메시지 하나, 로고·학회명 반복 등 노이즈 제거, "Any questions?" 단독 마무리 금지 → 기여 요약으로 끝. https://hci.rwth-aachen.de/presentation-guidelines
- 수렴점: "한 슬라이드 한 메시지" + 인지 부하 관리는 Alley·Minto·Duarte·CHI가 전부 일치한다. 사용자 철학(슬라이드당 주장 하나)과도 일치.

## 3. 인터랙티브 발표 패턴과 함정

- **Guided attention (Bret Victor, explorable explanations)**: 인터랙션은 고립된 자유 조작 위젯이 아니라 주의를 특정 현상으로 유도하는 안내된 단계여야 한다. 발표에서는 "클릭당 한 현상"의 상태 전환으로 번역한다.
- **scrollytelling → 발표 번역**: 스크롤 트리거 차트 전환(독자 주도)을 fragment 진행 연동 차트 상태 전환(발표자 주도)으로 옮긴다.
- **키보드 포커스 충돌 (실증된 함정)**: iframe·인터랙티브 요소에 포커스가 넘어가면 화살표 키 내비게이션이 죽는다 (reveal.js issue #1619). 대책 = 인터랙션 모드 진입/이탈 명시 토글 + iframe 대신 same-document 컴포넌트.
- **발표자 통제권**: 인터랙티브 요소는 무대에서 한 손으로 조작 가능해야 한다 (클릭 타깃 크게). 모든 인터랙션 후 키보드 내비게이션 즉시 복구.
- **폴백 정적 상태**: 라이브 데이터·시뮬레이션은 실패 시 보여줄 정적 스냅샷을 함께 렌더한다 (Evil Martians 실전 보고). https://evilmartians.com/chronicles/web-slides-are-web-apps-live-interactivity-for-revealjs-and-slidev

## 4. 하네스 안의 기존 자산

**앵커링 경계 (2026-07-25 사용자 확정):** `design-decks`·`labsem-ppt`는 이 스킬의 앵커가 아니다. 정적 슬라이드 생성기의 절차·미감·템플릿을 기본값으로 끌어오면 지향점(research/north-star.md)이 하향 앵커링된다. 아래 표의 "관계"는 그 경계 안에서의 선별 참고 관계다.

| 자산 | 위치 | 이번 스킬과의 관계 |
|---|---|---|
| `design-decks` | `~/.claude/skills/design-decks/` | 비앵커. 검증된 개별 역학(1920x1080 고정 스테이지 스케일링, PDF/배포 스크립트)만 의식적으로 선별 참고. 절차·스타일 프리셋·템플릿 미감은 가져오지 않는다. MIT (frontend-slides @9906a34) |
| `labsem-ppt` | `~/.claude/skills/labsem-ppt/` | 비앵커. "소스에 없는 주장 금지·file:// 렌더 검증" 같은 규율만 참고. 절차 골격은 이 레포가 새로 정의한다 |
| `ppt-narration` 팩 | `~/projects/daehyeon-voice/packs/` | 슬라이드 텍스트·대본의 문체 SSOT. 서술 단계에서 레서(leader-writing)가 사용 |
| `slop-check` / anti-slop 기준 | `~/.claude/skills/slop-check/` + design/memory.md | 텍스트·디자인 AI 티 검증 게이트 |
| 디자인 팀 (나비) | `~/.claude/agents/design/` | 비주얼 QA accept gate·locked-token 가드. 시각 게이트는 /browse 렌더로만 |
| 실물 덱 + 디자인 노트 | `~/projects/applock-dashbord/tmp/slides/` | 사용자 승인 이력이 있는 디자인 시스템 실측 표본 |

## 5. 기술 스택 권고 (설계 제안의 근거)

1. **기본 경로 = zero-dependency 단일 HTML** (1920x1080 고정 캔버스 + 균일 스케일). 에이전트가 산출물을 완전 통제하고, file://로 열리고, 스크린샷 QA가 된다. fragment·호버·팝업·차트 상태 전환·시뮬레이션은 CSS 클래스 토글 + 상태 머신 JS로 구현한다 (reveal.js의 스케일링·fragment 역학만 차용, 코드 의존 없음).
2. **차트는 인라인 SVG 우선**, 복잡한 인터랙션 필요 시 Chart.js/ECharts 인라인 번들.
3. **무거운 라이브 데모 요구 시에만 Slidev 승급** (레포형 산출물).
4. 인터랙션 asset은 "인터랙션 문법 카탈로그" (hover-reveal, click-popup, fragment-chart, compare-slider, live-poll 폴백 등)로 스킬 안에 패턴화하고, 각 패턴에 발표자 통제권·폴백 규칙을 붙인다.
