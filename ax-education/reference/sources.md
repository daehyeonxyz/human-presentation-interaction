# 원천 조사 (2026-07-25 실측)

강의의 두 공식 원천에서 무엇을 쓸 수 있는지 조사한 기록이다. 모든 항목은 이날 실제 fetch로 확인했다.

## 원천 1: Claude Code 공식 문서 (code.claude.com/docs/ko)

전체 색인: https://code.claude.com/docs/llms.txt

교육 재료로 유효한 핵심 페이지:

- overview — Claude Code 정의, 설치 5경로(Terminal, VS Code, Desktop, Web, JetBrains), "할 수 있는 것" 9범주
- how-claude-code-works — agentic loop, 내장 도구, 프로젝트 상호작용. 에이전트 개념 교육의 정본
- glossary — agentic loop, compaction, CLAUDE.md, hooks, subagents, MCP 용어 정의
- context-window — **대화형 시뮬레이션 문서** (north-star 레퍼런스가 이 페이지다)
- memory — CLAUDE.md와 자동 메모리
- skills — 스킬 생성·관리·공유
- sub-agents — 커스텀 서브에이전트
- mcp / mcp-quickstart — 외부 도구 연결 (Drive, Jira, Slack 예시)
- hooks-guide — 작업 전후 자동화
- permission-modes / permissions / security — 권한 모드(Shift+Tab), 안전
- features-overview — CLAUDE.md, Skills, subagents, hooks, MCP, plugins를 언제 쓰는지 비교
- best-practices / common-workflows / prompt-library — 실무 패턴
- sessions / checkpointing — 세션 관리, 되감기
- agents (subagents, agent view, agent teams, workflows 비교) — 병렬화 스펙트럼
- routines / scheduled-tasks — 반복 업무 자동화
- artifacts — 산출물을 대화형 페이지로 공유
- chrome — 브라우저 연동
- costs / analytics — 비용 관리 (조직 관점)
- data-usage / security — 데이터 거버넌스 (기업 도입 관점)
- admin-setup / communications-kit / champion-kit — 조직 배포 플레이북

## 원천 2: Anthropic Academy (anthropic.skilljar.com)

확인된 강의 21종 중 이번 교육과 직결되는 것:

- **AI Fluency: Framework & Foundations** — 4D 프레임워크(Delegation, Description, Discernment, Diligence). 비개발자 AI 협업 교육의 정본
- **AI Capabilities and Limitations** — AI가 어떻게 동작하는지 입문
- **Claude 101** — 일상 업무에서의 Claude 활용
- **Introduction to Claude Cowork** — 실제 파일·프로젝트 위에서 Claude와 협업 (비개발자 친화 표면)
- **Claude Code 101** / **Claude Code in Action** — 도구 자체의 입문과 장시간 세션 운영
- **Introduction to agent skills** — 스킬 구축·설정·공유
- **Introduction to subagents** — 서브에이전트 활용
- **Introduction to Model Context Protocol** — MCP 서버·클라이언트 (심화 차시용)
- **AI Fluency for Builders** — 직군 특화 변형의 선례 (VC 특화 구성의 참고 틀)

## 원천이 아닌 것 (경계)

- Agent SDK, 게이트웨이, 엔터프라이즈 네트워크 구성 등 개발자·인프라 문서는 4시간 압축판 범위 밖이다. 20차시 확장 시 후반 차시 후보로만 남긴다.
