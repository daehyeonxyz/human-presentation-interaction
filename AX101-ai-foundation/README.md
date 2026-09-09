# AX101-ai-foundation

AX 101 (Claude Zero to One) 인터랙티브 발표의 기획서와 제작 자산이다. 다음 단계는 이 폴더를 참조해 `interactive-presentation` 스킬로 단일 HTML 발표를 만드는 것이다.

## 무엇이 어디에

| 경로 | 내용 | 언제 여나 |
|---|---|---|
| `AX101-index.md` | 기획서 겸 슬라이드 원고. 24장의 메시지 · 판 · 등급 · 셀 지도 · `[text]` · `[interaction]` · 대본 | 화면에 뭐가 어떻게 나오는지 보러 |
| `tokens.css` | 값의 단일 원본. 스킬의 ax-education 토큰 + 이 덱의 결정 | 구현할 때 `<style>`에 복사 |
| `assets/ASSETS.md` | 자산 목록과 준비 상태 | 무엇이 있고 무엇을 받아야 하는지 보러 |
| `assets/cover-bg.jpg` · `assets/lettermark/` | 배경 사진과 워드마크 | 1장 · 24장 |
| `assets/webfonts/` | Pretendard 서브셋(이 원고의 글자) · Samsung Sharp Sans | 전 장 |
| `assets/icons/` | 단색 SVG 기호 16종 | 기호가 필요한 장 |
| `assets/captures/CAPTURE-LIST.md` | 대조용 화면 캡처 요청 7종 | 캡처를 찍기 전에 |
| `assets/logos/README.md` | 2장 로고 자리 | 로고를 받았을 때 |
| `content/mirinae-robotics.md` | 14장 시연용 가상 회사 자료 | 시연 전 실제로 첨부해 볼 때 |
| `content/skill-example/투자검토보고서/` | 18장 · 20장이 말하는 "스킬 폴더"의 실물 예시 | 스킬이 뭔지 손으로 보여 줄 때 |
| `deliverables/AX101.html` | 발표 HTML. 자기완결 단일 파일 | 발표를 띄울 때. 브라우저로 열고 좌우 키 · Space · End |
| `qa/build/` · `qa/build.mjs` | 덱의 원본(CSS · HTML · JS)과 조립 스크립트 | 화면을 고칠 때. 고친 뒤 `node qa/build.mjs` |
| `qa/shots.mjs` · `qa/shots/` | 쪽별 정지 · 완료 캡처 | 렌더를 확인할 때 |
| `qa/extract-glyphs.py` · `qa/subset-font.py` | 서체 서브셋 재생성 | 원고의 `[text]`가 바뀌었을 때 |

## 다음 단계

1. `deliverables/AX101.html`을 열어 조작을 관찰한다. 기획서 끝의 "구현 기록 > 남은 검증"이 관찰 항목이다
2. `AX101-index.md`의 "남은 결정" 11개와 `[확인 필요]`를 확인한다. 수치 확인 전에는 7장 수치 줄을 뺀다
3. `assets/captures/CAPTURE-LIST.md`의 캡처를 찍어 재현의 대조 근거로 둔다
4. 화면을 고치면 `qa/build/`를 고치고 `node qa/build.mjs` 뒤 스킬 루트에서 `PLAYWRIGHT_DIR=<playwright 경로> node tools/fluid-gate.mjs AX101-ai-foundation/deliverables/AX101.html`
5. 원고가 바뀌면 `python3 qa/extract-glyphs.py` 뒤 `python3 qa/subset-font.py <PretendardVariable.woff2>`

## 규칙 요약

- 화면의 글자는 `AX101-index.md`의 `[text]`에 있는 것만. 구현이 문장을 발명하지 않는다
- 조작은 그 장의 주장을 증명할 때만. 눌러서 펼치기만 하는 조작은 두지 않는다
- 청중이 쓰는 것은 Claude Chat 하나다. 외부 개발 도구 이야기를 두지 않는다
- 서드파티 로고와 사내 화면 캡처는 화면에 올리지 않는다
