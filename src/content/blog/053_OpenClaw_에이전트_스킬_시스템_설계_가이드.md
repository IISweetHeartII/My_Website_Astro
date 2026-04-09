---
title: "OpenClaw 에이전트 스킬 시스템 설계 가이드"
subtitle: "SKILL.md 하나로 AI 에이전트에게 전문 능력을 부여하는 법"
description: "OpenClaw의 스킬 시스템 구조를 설계부터 등록까지 단계별로 정리했습니다. SKILL.md 작성법, 트리거 설정, 콘텐츠 파이프라인 연동까지 실제 운영 기준으로 설명합니다."
publish: false
meta_title: "OpenClaw 에이전트 스킬 시스템 설계 가이드 | AI 에이전트 전문 능력 부여하기"
meta_description: "OpenClaw 스킬 시스템의 구조와 설계 원칙을 실제 운영 사례와 함께 정리한 교육 가이드입니다. SKILL.md 작성법부터 파이프라인 연동까지."
keywords:
  - OpenClaw
  - AI에이전트
  - 스킬시스템
  - SKILL.md
  - 멀티에이전트
  - 자동화
  - 에이전트설계
  - DevOps
og_title: "OpenClaw 에이전트 스킬 시스템 설계 가이드"
og_description: "SKILL.md 하나로 AI 에이전트에게 전문 능력을 부여하는 구조. 설계부터 운영까지."
og_type: article
twitter_card: summary_large_image
created_date: 2026-04-10
updated_date: 2026-04-10
category: "교육"
slug: openclaw-agent-skill-system-guide
tags:
  - OpenClaw
  - AI
  - 에이전트
  - 스킬
  - 자동화
  - 멀티에이전트

faq:
  - question: "OpenClaw 스킬이란 무엇인가요?"
    answer: "스킬은 에이전트에게 특정 작업 능력을 부여하는 구조화된 지침입니다. SKILL.md 파일 하나로 정의되며, 트리거 키워드에 반응해 자동으로 활성화됩니다."
  - question: "스킬은 어디에 만들어야 하나요?"
    answer: "반드시 해당 에이전트의 워크스페이스 안에 만들어야 합니다. 경로는 agents/{에이전트ID}/agent/skills/{스킬명}/SKILL.md 입니다. 루트 skills/ 디렉토리에는 생성하지 않습니다."
  - question: "하나의 스킬을 여러 에이전트가 공유할 수 있나요?"
    answer: "현재 OpenClaw 구조에서 스킬은 에이전트별로 독립적으로 관리됩니다. 같은 기능이 필요하면 각 에이전트 워크스페이스에 별도로 작성하되, shared/knowledge/에 공통 참조 문서를 두는 방식을 권장합니다."
  - question: "스킬과 cron의 차이는 무엇인가요?"
    answer: "스킬은 '어떻게 할 것인가'에 대한 지침이고, cron은 '언제 실행할 것인가'에 대한 스케줄입니다. 보통 cron의 프롬프트에서 '이 스킬을 사용해서'라고 지시하면 둘이 연결됩니다."
---

[지난 글](/blog/openclaw-discord-workflow)에서 OpenClaw로 Discord에서 AI에게 일을 시키는 구조를 다뤘다.

그 글의 핵심은 **자연어 → 실행**이었다. 그런데 한 가지 빠진 게 있었다. 에이전트가 *어떻게* 특정 작업을 잘 해내는지에 대한 이야기다.

대답은 간단하다. **스킬**이다.

---

## 스킬이 없으면 에이전트는 범용 AI일 뿐이다

에이전트를 처음 만들면 그냥 똑똑한 범용 AI다. 뭐든 할 수 있지만, 뭘 전문적으로 잘하진 않는다.

예를 들어 Cheese(치즈)에게 "블로그 글 써줘"라고 하면, 일단 뭔가 쓰긴 한다. 하지만 이런 것들을 매번 설명해야 한다:

- 파일명 넘버링은 어떻게 하지?
- frontmatter 형식은?
- 어느 디렉토리에 저장하지?
- `publish: false`로 해야 하나?
- SEO 필드는?

이걸 매번 프롬프트에 넣는 건 낭비다. 그래서 **스킬**이 필요하다.

스킬은 에이전트에게 **특정 작업의 전문 지식을 구조화해서 주입하는 방법**이다.

---

## SKILL.md — 스킬의 전부가 담긴 파일

OpenClaw에서 스킬은 `SKILL.md` 파일 하나로 정의된다.

### 파일 위치

```text
~/.openclaw/agents/{에이전트ID}/agent/skills/{스킬명}/SKILL.md
```

예시:

```text
agents/cheese/agent/skills/blog-writer/SKILL.md
agents/kkami/agent/skills/infrastructure/SKILL.md
agents/navi/agent/skills/code-review/SKILL.md
agents/luna/agent/skills/deep-research/SKILL.md
agents/main/agent/skills/delegation/SKILL.md
```

중요한 규칙이 하나 있다: **루트 `skills/` 디렉토리에는 스킬을 만들지 않는다.** 반드시 해당 에이전트의 워크스페이스 안에 둔다. 이렇게 해야 에이전트별 책임이 명확하게 유지된다.

### SKILL.md 기본 구조

```yaml
---
name: blog-writer
description: Astro 블로그 포스트 작성 자동화. frontmatter 생성, SEO, 넘버링 관리.
triggers:
  - blog write
  - 블로그 작성
  - 포스트 작성
  - blog post
  - 글 써줘
---
```

이 frontmatter가 스킬의 메타데이터다. 하나씩 살펴보자.

---

## YAML Frontmatter 해부

### `name`

스킬의 고유 식별자. 디렉토리 이름과 일치시킨다.

```yaml
name: blog-writer
```

### `description`

한 줄 설명. 에이전트가 스킬을 선택할 때 이 설명을 참고한다. **구체적일수록 좋다.**

```yaml
# 나쁜 예
description: 블로그 관련 작업

# 좋은 예
description: Astro 블로그 포스트 작성 자동화. frontmatter 생성, SEO, 넘버링 관리.
```

### `triggers`

이 키워드가 사용자 요청에 포함되면 스킬이 활성화된다. 한국어와 영어 모두 등록해두는 게 좋다.

```yaml
triggers:
  - blog write        # 영어
  - 블로그 작성         # 한국어
  - 포스트 작성
  - blog post
  - 글 써줘           # 구어체도 OK
```

트리거는 정확한 매칭이 아니라 **포함 관계**로 동작한다. "블로그 글 하나 써줘"라는 요청에 "블로그 작성"과 "글 써줘" 두 트리거가 모두 반응할 수 있다.

---

## 스킬 본문 작성법

frontmatter 아래가 본문이다. 여기에 에이전트가 **실제로 따라야 할 절차와 규칙**을 적는다.

좋은 스킬 본문의 핵심 원칙은 세 가지다:

### 1. 절차를 명시하라

에이전트는 추론을 잘하지만, 순서가 있는 작업에서는 명시적 절차가 훨씬 안정적이다.

```markdown
## 포스트 작성 프로세스

### 1. 넘버링 확인
최신 번호 확인 후 다음 번호 = 최신 + 1. 3자리 zero-pad.

### 2. 파일 생성
파일명: `{번호}_{slug}.md`
위치: `src/content/blog/`

### 3. Frontmatter 작성
(템플릿 제공)

### 4. 본문 작성
(규칙 나열)
```

### 2. 템플릿을 제공하라

매번 형식을 추론하게 하지 말고, 복사해서 채울 수 있는 템플릿을 준다.

```yaml
---
title: "제목"
description: "150자 이내 설명"
created_date: "YYYY-MM-DD"
category: "개발"
tags: ["tag1", "tag2", "tag3"]
publish: false
---
```

### 3. 검증 방법을 포함하라

작업이 끝난 뒤 스스로 확인할 수 있는 검증 단계를 넣어야 한다.

```markdown
## 검증
빌드 성공 확인:
bun run build
```

이게 없으면 에이전트는 파일을 만들고 "끝났습니다"라고 보고하지만, 실제로 빌드가 깨지는 경우가 생긴다.

---

## 실전 예시: 현재 운영 중인 스킬들

우리 팀에서 실제로 쓰고 있는 스킬 배치를 정리하면 이렇다.

| 에이전트 | 스킬 | 하는 일 |
|---------|------|---------|
| Rosie (main) | `council` | 에이전트 토론 오케스트레이션 |
| Rosie (main) | `delegation` | 태스크를 적절한 에이전트에게 위임 |
| Navi | `code-review` | PR diff 분석, 리뷰 코멘트 생성 |
| Navi | `architecture` | 아키텍처 패턴 분석, 개선안 제시 |
| Kkami | `secret-audit` | .env 권한, 평문 키 탐지, gitignore 검증 |
| Kkami | `infrastructure` | Gateway/디스크/메모리/에러 헬스체크 |
| Kkami | `investigate` | 장애 근본 원인 분석 (RCA) |
| Kkami | `review` | 코드 품질 리뷰 (Navi와 역할 분담) |
| Kkami | `health` | 코드 헬스 점수 산출 |
| Cheese | `agentgram-operations` | AgentGram 포스트/댓글/좋아요 관리 |
| Cheese | `blog-writer` | 블로그 포스트 작성 자동화 |
| Cheese | `content-pipeline` | IDEA → RESEARCH → DRAFT → REVIEW → PUBLISH |
| Luna | `deep-research` | 체계적 리서치 (브라우징, 논문, 레포) |
| Luna | `market-analysis` | 시장/경쟁사 분석 |

스킬 수가 많아 보이지만, 각각은 **하나의 파일**(SKILL.md)과 필요하면 보조 파일 몇 개가 전부다. 복잡한 코드베이스가 아니라 **구조화된 지침서**에 가깝다.

---

## 스킬과 Cron의 연결

스킬 자체는 "어떻게"에 대한 지식이다. 하지만 "언제"는 cron이 담당한다.

예를 들어 Cheese의 아침 포스트 cron은 이렇게 생겼다:

```text
ID: cheese-post-morning
스케줄: 매일 09:00
에이전트: cheese
메시지: "AgentGram 아침 포스트. agentgram-operations 스킬로 오늘의 아침 인사 포스트 작성 및 발행."
```

핵심은 메시지 안에 **"agentgram-operations 스킬로"**라는 문구가 들어간다는 점이다. 이 문구가 트리거에 매칭되면서 에이전트가 해당 스킬의 맥락을 로드한다.

이 구조의 장점은 명확하다:

1. **스킬**은 독립적으로 개선할 수 있다 (절차, 템플릿, 규칙 수정)
2. **cron**은 스케줄만 관리한다 (시간, 빈도 조정)
3. 둘을 분리해두면 한쪽을 바꿔도 다른 쪽에 영향이 없다

---

## 스킬 설계 체크리스트

새 스킬을 만들 때 이 체크리스트를 따르면 실수를 줄일 수 있다.

### 만들기 전에

- [ ] 이 작업을 담당할 에이전트가 누구인지 정했는가?
- [ ] 기존 스킬과 역할이 겹치지 않는가?
- [ ] 이 작업이 반복적이어서 스킬로 만들 가치가 있는가?

### SKILL.md 작성 시

- [ ] `name`이 디렉토리명과 일치하는가?
- [ ] `description`이 구체적인가? (범용적 설명 금지)
- [ ] `triggers`에 한국어/영어 모두 포함했는가?
- [ ] 절차가 번호로 정리되어 있는가?
- [ ] 템플릿이 제공되었는가?
- [ ] 검증 단계가 포함되었는가?

### 만든 후에

- [ ] 해당 에이전트의 `skills/` 디렉토리에 위치하는가?
- [ ] 트리거로 실제 호출이 되는가?
- [ ] cron 연동이 필요하면 등록했는가?

---

## 자주 하는 실수와 해결법

### 실수 1: 스킬을 루트에 만든다

```text
# 잘못된 위치
~/.openclaw/skills/blog-writer/SKILL.md

# 올바른 위치
~/.openclaw/agents/cheese/agent/skills/blog-writer/SKILL.md
```

루트 `skills/`는 시스템 예약 공간이다. 에이전트 전용 스킬은 반드시 해당 에이전트 워크스페이스 안에 둔다.

### 실수 2: description이 너무 모호하다

```yaml
# 나쁜 예 — 어떤 요청에 반응해야 할지 불명확
description: 코드 관련 작업

# 좋은 예 — 구체적인 범위와 동작이 명시됨
description: GitHub PR diff 분석, 보안/성능/구조 리뷰 코멘트 생성, approve/request-changes 판단.
```

### 실수 3: 트리거가 너무 넓다

```yaml
# 위험 — "코드"만 포함되면 모두 반응
triggers:
  - 코드

# 안전 — 의도가 명확한 트리거
triggers:
  - 코드 리뷰
  - PR 리뷰
  - code review
```

### 실수 4: 검증 단계가 없다

파일을 만들고 끝나는 스킬은 위험하다. 반드시 **실행 가능한 검증 명령**을 포함한다.

```markdown
## 검증
- `bun run build` 성공 확인
- `gh pr list` 에서 새 PR 확인
- `openclaw cron list` 에서 등록 확인
```

---

## 콘텐츠 파이프라인: 스킬이 연결되는 실제 흐름

단일 스킬만으로 끝나지 않는 작업도 있다. 블로그 발행이 그렇다.

```text
IDEA → RESEARCH → DRAFT → REVIEW → PUBLISH
  │       │         │        │        │
 치즈    루나      치즈     나비     자동
```

이 파이프라인에서 스킬은 이렇게 연결된다:

1. **Cheese의 `content-pipeline`** → 전체 흐름을 관리하고 각 단계를 오케스트레이션
2. **Luna의 `deep-research`** → RESEARCH 단계에서 주제에 대한 리서치 수행
3. **Cheese의 `blog-writer`** → DRAFT 단계에서 리서치 결과를 받아 포스트 작성
4. **Navi의 `code-review`** → REVIEW 단계에서 PR 리뷰

각 스킬은 자기 역할만 알면 된다. 전체 흐름은 파이프라인 스킬이 조율한다. 이게 **마이크로서비스 아키텍처**와 비슷한 원리다. 각 스킬이 단일 책임을 갖고, 파이프라인이 오케스트레이션을 담당한다.

---

## 스킬 하나 만들어보기: 5분 튜토리얼

직접 해보자. Kkami에게 로그 분석 스킬을 만드는 과정이다.

### Step 1: 디렉토리 생성

```bash
mkdir -p ~/.openclaw/agents/kkami/agent/skills/log-analyzer
```

### Step 2: SKILL.md 작성

```markdown
---
name: log-analyzer
description: gateway.log / gateway.err.log 분석. 에러 패턴 탐지, 빈도 집계, 원인 추정.
triggers:
  - 로그 분석
  - log analyze
  - 에러 로그
  - error log
---

# Log Analyzer — 로그 분석

## 대상 파일
- `~/.openclaw/logs/gateway.log`
- `~/.openclaw/logs/gateway.err.log`

## 분석 프로세스

### 1. 최근 로그 수집
최근 24시간 또는 최근 1000줄 중 짧은 쪽 기준.

### 2. 에러 패턴 분류
- FATAL / ERROR / WARN 레벨 분류
- 동일 메시지 그룹핑 및 빈도 집계
- 최초/최종 발생 시간 기록

### 3. 원인 추정
에러 메시지와 스택 트레이스를 기반으로 가능한 원인을 제시.
- 네트워크 관련 (timeout, connection refused)
- 인증 관련 (token expired, unauthorized)
- 리소스 관련 (disk full, memory limit)
- 설정 관련 (invalid config, missing env)

### 4. 보고 형식
| 레벨 | 메시지 | 빈도 | 최초 발생 | 추정 원인 |
|------|--------|------|----------|----------|
| ERROR | ... | 12회 | 04-10 03:21 | 네트워크 timeout |

## 검증
- 분석 결과에 빈도 0인 항목이 없는지 확인
- 추정 원인이 비어있는 항목이 없는지 확인
```

### Step 3: 테스트

Kkami에게 "최근 에러 로그 분석해줘"라고 요청하면, `로그 분석` 트리거가 매칭되어 이 스킬이 활성화된다.

이게 전부다. 코드 한 줄 없이, 마크다운 하나로 에이전트에게 전문 능력을 부여했다.

---

## 마무리: 스킬은 에이전트의 근육이다

에이전트의 성격은 `SOUL.md`가, 규칙은 `AGENTS.md`가, 기억은 `MEMORY.md`가 담당한다.

그리고 **실제로 일을 잘하게 만드는 건 스킬**이다.

좋은 스킬을 만드는 건 결국 좋은 매뉴얼을 쓰는 것과 같다:

1. **대상이 명확하고** — 이 스킬이 뭘 하는지 한 줄로 설명 가능
2. **절차가 구체적이고** — 따라 하면 결과가 나오는 단계별 지침
3. **검증이 가능하다** — 끝난 뒤 성공 여부를 확인할 수 있는 방법

이 세 가지만 지키면, 범용 AI가 특화된 전문가로 바뀐다.

다음 글에서는 에이전트 6명이 실제로 어떻게 협업하는지 — 위임, 리뷰, 파이프라인 패턴을 더 깊이 다뤄보겠다.
