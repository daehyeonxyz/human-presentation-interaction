# 사내 뉴스레터 · 이메일 판

투자3팀 2026-09-10 호를 두 가지 디자인 기준으로 만든 실물이다. 슬라이드 스테이지가 아니라 메일 클라이언트에서 열리는 산출물이라 `SKILL.md` 의 10단계는 적용하지 않았다. 내용은 두 판이 같고 형식만 다르다.

| 파일 | 기준 | 요지 |
|---|---|---|
| `2026-09-10-투자3팀-A.html` | 이 레포의 `ax-education/디자인.md` 와 `tokens.css` | 회색 페이지 `#E5E9F1` 위 흰 카드. 파란 머리띠, 등급별 건수 띠, 표 괘선, 카드 안 관점 상자 |
| `2026-09-10-투자3팀-B.html` | `daehyeonxyz/daehyeon-design` 의 계약 (`CLAUDE.md` · `SOUL.md` · `.nx/memory` · ddd 방법론) | 흰 페이지 위 회색 카드 `#F4F5F9`. 위계는 크기와 굵기만, 라벨·건수·괘선·중첩 면 없음 |

## B 가 A 에서 뺀 것과 그 근거

daehyeon-design 의 반려 실측(`nx-screen-rejection-checklist`, `gray-text-gate-by-allowlist`, `light-theme-is-white-page-gray-card`, `depth-pairs-instead-of-borders`)과 ddd 슬롭 카탈로그에서 나온 항목이다.

- 회색 페이지 위 흰 카드를 뒤집었다. 밝은 테마의 상용 시스템은 전부 흰 페이지에 회색 면이다.
- 작은 회색 글자를 없앴다. 메타 정보도 본문 크기(16)로 두고 제목에 붙여서만 회색을 쓴다.
- overline 섹션 라벨(OVERVIEW · DETAIL · ABOUT)과 파란 머리띠를 없앴다. 구역은 25px 제목과 48~64px 간격이 가른다.
- 등급별 건수 띠를 없앴다. 카운트 나열은 반려 항목이다. 등급 정의는 ABOUT 절에 한 번만 둔다.
- 표 괘선과 칸 사이 세로선을 없앴다. 행은 간격으로 갈리고 표는 회색 면 하나가 묶는다.
- 카드 안의 관점 상자를 없앴다. 관점은 굵은 머리 한 줄과 본문으로 쓴다.
- 등급을 색 배지가 아니라 굵은 낱말로 쓴다. 색은 CRITICAL(`#C9352B`)과 URGENT(`#1428A0`)에만 있고 NOTABLE 은 잉크, INFO 는 회색이다.
- 타입 스케일을 1.25 배로 고정했다. 13 / 16 / 20 / 25 / 31 다섯 값만 쓴다.

## 두 판이 공유하는 것

- 색값은 삼성 실측 팔레트(`ax-education/reference/브랜드자산.md`)에서만 가져온다. 새 색을 발명하지 않는다.
- 레이아웃은 전부 `<table>` 이고 스타일은 인라인이다. CSS 변수와 외부 서체를 쓰지 않는다.
- 서체는 `Pretendard, Apple SD Gothic Neo, Malgun Gothic, Samsung One Korean` 폴백 사슬이다.
- 폭 680, 한글 어절은 `word-break: keep-all` 로 지킨다.
- 「투자 포트폴리오 뉴스레터 도입(案)」의 요지를 ABOUT 절로 넣어 임원 보고용으로 자기완결적이다.

## 남은 것

daehyeon-design 의 visual-QA 게이트 가운데 「상용 레퍼런스와 같은 배율로 나란히 놓고 판정」은 하지 않았다. 이메일 뉴스레터의 동급 실물을 이 세션에서 구하지 않았다.
