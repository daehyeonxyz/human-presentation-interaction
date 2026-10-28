# ax-tf

삼성벤처투자 AX TF 에서 이 레포의 디자인 체계(`../tokens.css`)로 만든 산출물이다. 발표 덱이 아니라 메일 포스터와 스킬 설명서, 공지문이고, 값은 모두 `tokens.css` 의 `:root` 를 복사해 쓴다.

## 구성

| 경로 | 내용 |
|---|---|
| `skill-contest-poster/` | 사내 첫 SKILL 공모전 안내 포스터. 메일 본문에 붙이는 세로 이미지 한 장 |
| `skill-visualize/` | 스킬 하나를 사내 공지용 설명서 한 장(1920×1080)으로 만드는 스킬과 예시 |
| `newsletter-notice/` | AX TF 데일리 뉴스레터 전사 공지. 메일 본문에 붙이는 세로 이미지 한 장 |

## tokens.css 와 다른 점

- 두 산출물 모두 장 제목에 Hahmlet 을 쓴다. `design-system.md` 의 서체는 Pretendard 하나이고, 포스터 검토에서 제목이 밋밋하다는 반려를 받아 서체 후보 여섯 개를 같은 배율로 놓고 사용자가 고른 결과다.
- `skill-visualize` 의 채팅창은 `tokens.css` 의 Claude 다크 재현 값(`--k-*`)을 쓰고, 답변 아이콘은 Claude 아이콘을 SVG 로 다시 그린 근사치다.

## skill-contest-poster

```text
poster.html     원본. 열면 1920 폭 세로 포스터 한 장이다
poster.png      poster.html 을 1920 폭으로 캡처한 것. 메일에는 이 이미지를 붙인다
podium.png      시상대 렌더. poster.html 이 이 이미지 위에 금액 글자를 올린다
podium/         시상대 렌더 원본 (three.js 장면과 캡처 스크립트)
fonts/          Pretendard 네 굵기와 Hahmlet 가변 서체
```

시상대를 다시 렌더하는 순서는 다음과 같다.

```bash
cd ax-tf/skill-contest-poster/podium
npm i three@0.169.0 playwright
cd .. && python -m http.server 8765 &
cd podium && node render.js
```

`render.js` 가 블록 윗면의 화면 좌표를 출력한다. 블록 크기나 카메라를 바꾸면 `poster.html` 의 `.amt` 세 개의 `left`·`top` 을 그 좌표로 다시 맞춘다.

## skill-visualize

스킬 본체다. 배포할 때는 이 폴더를 그대로 zip 으로 묶어 올린다. 절차는 `skill-visualize/SKILL.md`, 칸별 기준은 `skill-visualize/references/content-guide.md` 에 있다.

`examples/` 에는 사내 스킬 네 개(svic-formal-format, deal-sourcing, knox-email, skill-visualize)의 설명서 예시가 있다. `deal-sourcing-brief.png` 는 deal-sourcing 스킬에 동봉된 예시 입력으로 `build_brief.py` 를 실행한 화면이다.
