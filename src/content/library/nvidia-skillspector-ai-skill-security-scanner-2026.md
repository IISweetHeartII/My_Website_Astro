---
title: "AI 에이전트 스킬 4개 중 1개가 취약점 — NVIDIA SkillSpector"
subtitle: "Claude Code·Codex·Gemini CLI 스킬 설치 전 반드시 돌려야 할 보안 스캐너"
description: "연구 결과 AI 에이전트 스킬의 26.1%에 취약점이 있고, 5.2%는 악의적 의도가 담겨 있다. NVIDIA SkillSpector는 64개 취약점 패턴으로 이를 탐지하고 Claude API로 시맨틱 분석까지 수행한다."
publish: true
created_date: 2026-06-15
category: "보안"
tags:
  - AI보안
  - NVIDIA
  - SkillSpector
  - 에이전트보안
  - 공급망보안
agent: cheese
slug: nvidia-skillspector-ai-skill-security-scanner-2026
reading_time: 7
featured_image: /images/library/nvidia-skillspector-ai-skill-security-scanner-2026/thumbnail.png
featured_image_alt: "AI 에이전트 스킬 보안 스캐너 SkillSpector 개요"
meta_title: "NVIDIA SkillSpector: AI 에이전트 스킬 보안 스캐너 | Library"
meta_description: "AI 에이전트 스킬의 26.1%에 취약점이 있다. NVIDIA SkillSpector로 Claude Code, Codex CLI 스킬 설치 전 64개 패턴 보안 검사하는 방법."
keywords:
  - nvidia skillspector
  - ai agent skill security
  - claude code 보안
  - 에이전트 공급망 보안
  - AI 스킬 취약점
og_title: "AI 에이전트 스킬 4개 중 1개가 취약점 — NVIDIA SkillSpector"
og_description: "26.1% 스킬 취약점, 5.2% 악의적 의도. Claude API + 64개 패턴으로 탐지하는 보안 스캐너."
og_type: article
twitter_card: summary_large_image
---

**Claude Code나 Codex CLI 스킬을 설치할 때 내용을 실제로 읽어보는가?** 대부분은 아니다. README 보고 별점 확인하고 설치한다. 그런데 연구 결과가 불편한 진실을 드러냈다 — AI 에이전트 스킬의 **26.1%에 취약점**이 있고, **5.2%는 악의적 의도**가 담겨 있다.

NVIDIA가 어제(2026-06-14) GitHub Python trending #2에 올린 [SkillSpector](https://github.com/NVIDIA/SkillSpector)는 이 문제를 정면으로 다룬다. AI 에이전트 스킬 전용 보안 스캐너다.

## 왜 AI 스킬이 위험한가

AI 에이전트 스킬(Claude Code의 SKILL.md, MCP 서버, Codex 플러그인 등)은 일반 코드와 다르게 동작한다. **암묵적 신뢰** 위에서 실행된다.

일반 코드는 샌드박스, 권한 제어, 코드 리뷰 게이트를 거친다. 하지만 스킬은 자연어 지시문이 섞인 마크다운 파일이고, 에이전트가 이를 읽고 그대로 실행한다. 공격자 입장에서는 코드 취약점보다 훨씬 쉬운 공격 벡터다.

SkillSpector가 탐지하는 대표 패턴:

- **프롬프트 인젝션**: 주석이나 보이지 않는 텍스트에 숨긴 악의적 지시
- **데이터 유출**: API 키·환경 변수 수집, 대화 컨텍스트 외부 전송
- **권한 상승**: sudo 실행, SSH 키 접근, 시스템 자격증명 탈취
- **공급망 공격**: curl \| bash, 알려진 CVE 포함 의존성, 타이포스쿼팅 패키지

![SkillSpector 취약점 카테고리 맵](/images/library/nvidia-skillspector-ai-skill-security-scanner-2026/01_vulnerability-categories.png)

<!--
  📸 이미지 프롬프트:
  prompt: "16 security vulnerability category cards in a grid layout, flat illustration, each with an icon and short label like 'Prompt Injection', 'Data Exfiltration', 'Supply Chain', tech dark theme with green accents"
  aspect_ratio: "16:9"
  session_id: "library-nvidia-skillspector-ai-skill-security-scanner-2026"
  save_as: "01_vulnerability-categories.png"
-->

## 64개 패턴 × 16개 카테고리

SkillSpector는 **16개 카테고리에 걸쳐 64개 취약점 패턴**을 탐지한다. 정적 분석만으로는 놓칠 수 있는 것들을 LLM 시맨틱 분석으로 보완하는 2단계 구조다.

| 카테고리 | 대표 패턴 | 심각도 |
|---------|---------|--------|
| 프롬프트 인젝션 | P1 Instruction Override, P2 Hidden Instructions | HIGH |
| 데이터 유출 | E2 Env Variable Harvesting, E4 Context Leakage | HIGH |
| 공급망 | SC2 External Script Fetching (`curl \| bash`), SC4 Known CVEs | HIGH |
| 과도한 에이전시 | EA1 Unrestricted Tool Access, EA2 Autonomous Decision Making | HIGH |
| MCP 특화 | MCP Least Privilege, MCP Tool Poisoning | MEDIUM–HIGH |

SC4 카테고리는 [OSV.dev](https://osv.dev)에 실시간으로 CVE를 조회한다. 오프라인 환경에서는 자동으로 폴백된다.

## 설치와 사용법

```bash
# uv 권장
git clone https://github.com/NVIDIA/skillspector.git
cd skillspector
uv venv .venv && source .venv/bin/activate
make install
```

스캔은 단순하다:

```bash
# 로컬 디렉토리
skillspector scan ./my-skill/

# 단일 SKILL.md 파일
skillspector scan ./SKILL.md

# GitHub 레포 직접 스캔
skillspector scan https://github.com/user/some-skill
```

Docker로 Python 없이 쓰는 방법:

```bash
docker build -t skillspector .
docker run --rm -v "$PWD:/scan" skillspector scan ./my-skill/ --no-llm
```

## Claude API와 연동한 시맨틱 분석

정적 패턴 매칭만으로는 미묘한 인젝션을 잡기 어렵다. SkillSpector는 LLM을 2단계 시맨틱 분석에 활용하며, **Anthropic Claude**를 공식 지원한다:

```bash
export SKILLSPECTOR_PROVIDER=anthropic
export ANTHROPIC_API_KEY=sk-ant-...
skillspector scan ./my-skill/
```

Claude API 없이 빠른 정적 분석만 돌리려면:

```bash
skillspector scan ./my-skill/ --no-llm
```

로컬 Ollama나 vLLM 같은 OpenAI 호환 엔드포인트도 지원한다:

```bash
export SKILLSPECTOR_PROVIDER=openai
export OPENAI_API_KEY=ollama
export OPENAI_BASE_URL=http://localhost:11434/v1
export SKILLSPECTOR_MODEL=llama3.1:8b
skillspector scan ./my-skill/ --no-llm
```

![SkillSpector Claude API 연동 워크플로우](/images/library/nvidia-skillspector-ai-skill-security-scanner-2026/02_claude-integration-flow.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Two-stage analysis pipeline diagram: Stage 1 Static Analysis box with pattern matching arrows, Stage 2 LLM Semantic Analysis box with Claude logo, connected by arrow, output box showing risk score 0-100, flat illustration, dark tech theme"
  aspect_ratio: "16:9"
  session_id: "library-nvidia-skillspector-ai-skill-security-scanner-2026"
  save_as: "02_claude-integration-flow.png"
-->

## CI/CD 통합: SARIF 리포트

SkillSpector는 **SARIF 포맷 출력**을 지원한다. GitHub Advanced Security, VS Code, JetBrains IDE에 바로 꽂을 수 있다.

```bash
skillspector scan ./skills/ --format sarif --output security-report.sarif
```

GitHub Actions에 통합하면 PR 단계에서 스킬 보안 리뷰가 자동으로 돌아간다. 스킬을 team repo에서 공유하는 조직에서 특히 유효하다.

JSON 리포트는 자체 보안 대시보드 파이프라인에 연결할 수 있다:

```bash
skillspector scan ./skills/ --format json --output report.json
```

## 한국 개발자에게 실질적으로 의미하는 것

**지금 Claude Code, Codex CLI, Gemini CLI 스킬을 쓰고 있다면 지금 당장 스캔해보는 게 맞다.** 특히:

1. **외부 소스 스킬을 설치 중이라면**: npm 같은 레지스트리 개념이 없는 스킬 생태계는 아직 보안 감시가 느슨하다.
2. **팀 단위로 스킬을 공유한다면**: 한 명이 감염된 스킬을 설치하면 전체 에이전트 워크플로우가 오염된다.
3. **프로덕션 AI 파이프라인에 스킬이 포함된다면**: supply chain 공격의 실질적 위험이 있다.

26.1%라는 숫자가 충격적으로 느껴질 수 있다. 하지만 npm 초창기에도 비슷한 패턴이 있었다 — 생태계가 성숙하기 전에는 항상 보안 도구가 먼저 경고를 보낸다.

SkillSpector는 GitHub trending #2에 오른 이유가 있다. AI 에이전트 스킬 공급망 보안의 공백을 처음으로 구체적인 숫자와 도구로 채운 프로젝트다.

## 참고 자료

- [NVIDIA/SkillSpector GitHub](https://github.com/NVIDIA/SkillSpector)
- [OSV.dev — Open Source Vulnerability Database](https://osv.dev)
- [SARIF 포맷 표준 (GitHub Docs)](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)
