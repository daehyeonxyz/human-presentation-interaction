# 자산 목록

`AX101-index.md`의 `[image]`가 가리키는 자산의 준비 상태다. 구현은 여기 있는 것만 쓰고 없는 것은 그리지 않는다. 배포본에서는 전부 base64로 HTML 안에 들어간다(자기완결).

## 준비된 것

| 자산 | 경로 | 규격 | 쓰는 장 | 상태 |
|---|---|---|---|---|
| 배경 사진 | `cover-bg.jpg` | 1280×720 JPEG · 153KB | 1 · 24 | 준비됨. 2560 화면에서 2배로 늘어나므로 더 큰 원본이 있으면 교체 |
| 워드마크 (흰색) | `lettermark/White/Samsung_Orig_Wordmark_WHITE_RGB.png` | 공식 PNG | 1 · 24 | 준비됨. 직접 그리지 않는다 |
| 워드마크 (파랑 · 검정) | `lettermark/Blue/` · `lettermark/Black/` | 공식 PNG | 예비 | 준비됨. 밝은 캔버스에 워드마크를 둘 일이 생기면 쓴다 |
| 국문 서체 | `webfonts/PretendardVariable-subset.woff2` | 가변 wght 45~920 · 서브셋 · 140KB 안팎 · 덱 원본의 글자까지 포함 | 전 장 | 준비됨. 이 원고의 `[text]` 글자로 서브셋했다. 원본 Pretendard 1.3.9 (SIL OFL) |
| 서브셋 글자 목록 | `webfonts/glyphs.txt` | 원고 글자 전부 | 서브셋 입력 | `qa/extract-glyphs.py`가 만든다. 원고가 바뀌면 다시 돌린다 |
| 영문 표시 서체 | `webfonts/SamsungSharpSans-{Regular,Medium,Bold}.woff2` · `-subset.woff2` | 400 · 500 · 700 · 원본 각 58KB · 라틴 서브셋 각 25KB | kicker · 쪽 번호 · 부제 · 표지 영문 | 준비됨. 영문 전용이라 한글 자리에 쓰지 않는다. 덱은 서브셋을 싣는다 |
| 기호 16종 | `icons/*.svg` | 24×24 · stroke 2 · `currentColor` | 아래 표 | 준비됨. 단색 SVG. 인라인으로 넣고 색은 CSS가 정한다 |

### 기호 쓰임

| 파일 | 뜻 | 쓰는 장 |
|---|---|---|
| `lock.svg` | 못 만지는 것 | 3장 모델 칸 |
| `question.svg` | 막막함 | 11장 좌 반응 |
| `check.svg` | 정해짐 · 안다 | 11장 우 반응 · 9장 판정 |
| `cross.svg` | 모른다 · 지어냄 | 9장 판정 · 14장 판정 |
| `arrow-up.svg` | 전송 | 채팅 재현의 원형 전송 버튼 (3 · 6 · 10 · 14 · 21장) |
| `arrow-right.svg` · `arrow-left.svg` | 읽기 · 쓰기 방향 | 21장 두 창 사이 |
| `arrow-both.svg` | 양방향 | 예비 |
| `file.svg` | 파일 칩 · 조사 표시 | 10 · 14 · 15 · 16 · 21장 |
| `folder.svg` | 스킬 폴더 | 18 · 20 · 22장 |
| `person.svg` | 사람 노드 | 20장 |
| `link.svg` | 커넥터 | 22장 항목 2 |
| `slash.svg` | 명령어 | 22장 항목 3 |
| `brain.svg` | 뇌의 크기 라벨 | 7장 막대 라벨 옆 |
| `memory.svg` | 메모리 목록 | 13장 우 칸 |
| `close.svg` | 파일 칩 닫기 | 파일 칩 오른쪽 위 |

## 받아야 하는 것

| 자산 | 쓰는 장 | 어떻게 쓰나 | 못 받으면 |
|---|---|---|---|
| ChatGPT · Gemini · Claude 로고 | 2장 | 정식 자산을 받으면 타일 왼쪽에 48px. `logos/README.md` | 이름 표기로 간다(현재 기본값) |
| 화면 캡처 5종 | 8 · 13 · 15 · 21장 | 화면에 올리지 않고 인라인 재현의 대조용. `captures/CAPTURE-LIST.md` | 재현은 원고 글자대로 만들고 캡처 없이 진행 |
| 배경 사진 원본 (1920 이상) | 1 · 24 | `cover-bg.jpg` 교체 | 지금 파일로 간다. 프로젝터에서는 차이가 작다 |

## 만들지 않는 것

- 뇌 사진, Claude Chat 캡처를 본문에 올리지 않는다. 프로젝터에서 대비가 눌리고 2560 화면에서 늘어난다
- 서드파티 로고를 그리지 않는다
- 실제 서비스명(커넥터)을 확인 전에 화면에 올리지 않는다
