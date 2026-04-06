---
title: "디스코드에서 말하면 맥미니가 일하기 시작했다 - OpenClaw 자동화 워크플로우"
subtitle: "자연어 명령부터 에이전트 실행, cron 자동화, 블로그 발행까지 지금 내가 쓰는 방식"
description: "Discord에서 AI 에이전트에게 자연어로 지시하고, 맥미니 위 OpenClaw가 실제 파일 작업과 자동화를 수행하는 구조를 실제 운영 기준으로 정리했습니다."
publish: true
meta_title: "OpenClaw 자동화 워크플로우 | Discord로 AI 에이전트에게 일 시키는 법"
meta_description: "Discord + OpenClaw + Mac mini로 개인 AI 작업 시스템을 운영하는 실제 구조와 명령 흐름을 정리한 글입니다."
keywords:
  - OpenClaw
  - AI에이전트
  - Discord자동화
  - 맥미니홈서버
  - 개인자동화
  - 워크플로우
  - DevOps
  - AI활용
og_title: "디스코드에서 말하면 맥미니가 일하기 시작했다"
og_description: "자연어 명령, 에이전트 워크스페이스, cron 자동화까지. 내가 OpenClaw를 실제로 굴리는 방법."
og_type: article
twitter_card: summary_large_image
created_date: 2026-04-05
updated_date: 2026-04-05
category: DevOps
slug: openclaw-discord-workflow
tags:
  - OpenClaw
  - Discord
  - AI
  - 자동화
  - MacMini
  - 홈서버
  - 에이전트
featured_image: /images/blogs/052/052_00_thumbnail.png
featured_image_alt: "Discord와 Mac mini가 연결된 AI 자동화 워크플로우 컨셉 이미지"

faq:
  - question: "OpenClaw에서는 AI에게 어떻게 일을 시키나요?"
    answer: "보통은 Discord 채널에서 자연어로 요청합니다. OpenClaw Gateway가 메시지를 해당 에이전트 세션으로 라우팅하고, 에이전트는 read, exec, edit 같은 도구를 써서 실제 작업을 수행합니다."
  - question: "OpenClaw와 일반 AI 챗봇의 차이는 무엇인가요?"
    answer: "단순 답변이 아니라 로컬 파일 시스템, 프로젝트 디렉토리, cron, 세션 간 메시지 전달까지 연결된 실행 환경이라는 점이 다릅니다. 즉, 말만 하는 AI가 아니라 작업을 수행하는 운영 레이어가 붙어 있습니다."
  - question: "반복 작업도 자동화할 수 있나요?"
    answer: "가능합니다. OpenClaw의 cron 기능으로 브리핑, 모니터링, 콘텐츠 발행, 보안 점검 같은 반복 작업을 정기 실행할 수 있습니다."
  - question: "프로젝트 코드는 어디서 관리하나요?"
    answer: "에이전트 자체 문맥은 `agents/{id}/agent` 아래에 두고, 실제 git 프로젝트는 `~/.openclaw/projects/{org}/{repo}` 아래에 분리해서 관리합니다."
---

# 디스코드에서 말하면 맥미니가 일하기 시작했다

요즘 AI를 쓰는 방식은 크게 두 가지로 갈린다.

![디스코드에서 말하면 맥미니가 일하기 시작했다](/images/blogs/052/052_00_thumbnail.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A sleek Mac mini on a minimalist wooden desk, a glowing Discord logo hovering above it, connected by digital energy lines to floating holographic screens showing code and automated tasks, modern flat illustration, premium dark mode aesthetic, deep blue and purple tones, wide aspect ratio"
  aspect_ratio: "16:9"
  session_id: "blog-052"
  save_as: "052_00_thumbnail.png"
-->

하나는 **질문하고 답을 받는 방식**이고, 다른 하나는 **일을 맡기고 결과물을 받는 방식**이다.

나는 후자를 원했다.

"이 저장소 클론해서 구조 좀 봐줘."
"이 cron 왜 자꾸 실패하는지 로그 보고 고쳐줘."
"글 하나 써서 발행 준비해줘."

이런 요청을 할 때마다 내가 SSH 접속해서 경로 찾고, 로그 열고, 파일 만들고, 커밋할 준비를 하는 건 솔직히 귀찮다. 그래서 만든 게 지금의 **OpenClaw 기반 개인 작업 시스템**이다.

겉으로 보면 그냥 Discord에서 AI랑 대화하는 것처럼 보인다. 하지만 실제로는 뒤에서 **맥미니 위 OpenClaw Gateway**, **에이전트별 워크스페이스**, **프로젝트 디렉토리**, **cron 자동화**, **세션 간 협업**이 같이 돌아간다.

오늘은 내가 실제로 어떤 식으로 AI에게 일을 시키고, 그 명령이 어떻게 실행되는지 정리해보려고 한다.

---

## 한 줄 요약: 말은 Discord에서, 일은 맥미니에서

현재 구조를 아주 단순하게 그리면 이렇다.

```text
Discord
  ↓
OpenClaw Gateway (:18789)
  ↓
Agent Session (예: kkami)
  ├── read / edit / write / exec 같은 도구 호출
  ├── memory 검색
  ├── 다른 에이전트와 sessions_send 협업
  └── 필요하면 프로젝트 repo 직접 수정
       ↓
Mac mini 로컬 파일 시스템
```

![OpenClaw 자동화 워크플로우 아키텍처](/images/blogs/052/052_01_architecture.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A conceptual diagram showing a smartphone with a Discord interface sending a message to a central 'OpenClaw Gateway' hub, which then fans out to multiple agent sessions performing tasks on a Mac mini, clean modern flat illustration, 16:9 aspect ratio, premium technology aesthetic"
  aspect_ratio: "16:9"
  session_id: "blog-052"
  save_as: "052_01_architecture.png"
-->

즉, 내가 Discord에서 "까미야, 내 웹사이트 저장소 클론해서 한번 봐줘"라고 말하면,

그건 단순한 채팅이 아니라 **실행 가능한 작업 요청**이 된다.

AI는 답변만 만드는 게 아니라, 실제로:

- 저장소를 클론하고
- `package.json`을 읽고
- `astro.config.mjs`를 확인하고
- 디렉토리 구조를 훑고
- 결과를 다시 Discord로 보고한다.

이게 내가 원했던 차이였다.

---

## 내가 AI에게 명령하는 방식: 사실 쉘 명령보다 자연어가 먼저다

많은 사람이 "AI 자동화"라고 하면 터미널에 복잡한 명령어를 먼저 떠올린다.

근데 실제로 내가 제일 자주 쓰는 인터페이스는 **Discord 채널**이다.

예를 들면 이런 식이다.

```text
My_Website_Astro 저장소 클론해서 어떤 구조인지 봐줘.
```

혹은 더 짧게:

```text
이거 왜 안 되냐
로그 좀 보고 고쳐줘
```

심지어 음성으로 말해도 된다. Discord에서 음성/오디오가 텍스트로 풀리면, 그 내용이 그대로 에이전트 요청으로 들어간다.

![자연어 명령과 쉘 명령의 차이](/images/blogs/052/052_02_interface.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A comparison layout: Left side showing a cluttered terminal with complex gray text, Right side showing a clean vibrant Discord chat window with a simple natural language request, a bridge connecting them, flat illustration style, 16:9 aspect ratio"
  aspect_ratio: "16:9"
  session_id: "blog-052"
  save_as: "052_02_interface.png"
-->

중요한 건 **내가 먼저 쉘 명령을 외울 필요가 없다는 것**이다.

나는 의도를 말하고,
OpenClaw는 그 의도를 **세션**, **도구 호출**, **파일 작업**으로 변환한다.

이건 일반 챗봇과 꽤 다르다. 보통의 챗봇은 "이렇게 해보세요"에서 끝나지만, 이 구조에서는 실제로 해본다.

---

## 그럼 뒤에서는 무슨 명령이 실행될까?

자연어가 전부는 아니다. 결국 실제 작업은 로컬 환경에서 실행되어야 한다.

예를 들어 저장소를 살펴보는 요청이 들어오면, 내부적으로는 대략 이런 종류의 작업이 일어난다.

```bash
git clone https://github.com/IISweetHeartII/My_Website_Astro.git ~/.openclaw/projects/IISweetHeartII/My_Website_Astro
find . -maxdepth 2
cat package.json
cat astro.config.mjs
```

물론 내가 Discord에 이 명령을 직접 친 건 아니다. 에이전트가 요청의 맥락을 보고 필요한 도구를 골라 실행한다.

여기서 포인트는 두 가지다.

### 1) 사람은 의도를 말한다

- "클론해줘"
- "구조 봐줘"
- "발행 준비해줘"
- "에러 원인 찾아줘"

### 2) 에이전트는 수단을 선택한다

- 파일 읽기 → `read`
- 파일 수정 → `edit`, `write`
- 셸 실행 → `exec`
- 다른 에이전트 호출 → `sessions_send`
- 과거 맥락 찾기 → memory 검색

즉, **자연어는 인터페이스**이고, **실행은 도구 체인**이다.

---

## 내 작업 공간은 두 층으로 나뉜다

이 구조에서 제일 중요했던 설계 중 하나가 **작업 공간 분리**였다.

### 1. 에이전트의 집: `agents/{id}/agent`

예를 들어 까미의 기본 워크스페이스는 이런 식이다.

```text
~/.openclaw/agents/kkami/agent
```

여기에는 이런 것들이 들어 있다.

- `SOUL.md` — 말투와 정체성
- `AGENTS.md` — 운영 규칙
- `MEMORY.md` / `memory/` — 장기/일일 메모리
- `skills/` — 전용 스킬
- `scripts/`, `docs/`, `tmp/`

쉽게 말하면 **에이전트가 어떻게 행동해야 하는지에 대한 문맥**이 이 폴더 안에 있다.

### 2. 실제 프로젝트 공간: `~/.openclaw/projects/{org}/{repo}`

반면 git 저장소는 여기로 모은다.

```text
~/.openclaw/projects/IISweetHeartII/My_Website_Astro
```

이렇게 분리해두면 좋은 점이 많다.

- 에이전트 설정과 실제 제품 코드를 섞지 않는다
- 여러 저장소를 일관된 규칙으로 관리할 수 있다
- "AI의 메모"와 "실제 서비스 코드"의 경계를 유지할 수 있다

![에이전트 문맥과 프로젝트 저장소의 분리](/images/blogs/052/052_03_workspace.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Two distinct glowing digital zones in a landscape format: one labeled 'Agent Context' with memory files, the other labeled 'Live Projects' with git repositories, connected by controlled data pipes, high-tech architectural feel, flat illustration, 16:9 aspect ratio"
  aspect_ratio: "16:9"
  session_id: "blog-052"
  save_as: "052_03_workspace.png"
-->

이건 생각보다 중요하다. AI가 파일을 만질 수 있게 되면, **어디까지가 자기 문맥이고 어디부터가 실제 제품 코드인지** 구분하는 게 안전성의 시작이기 때문이다.

---

## 지금 내 OpenClaw는 어떻게 돌아가고 있나?

운영 레벨에서 보면 핵심은 OpenClaw Gateway다.

내 맥미니에서는 이런 식으로 상태를 확인할 수 있다.

```bash
openclaw status
```

실제로 이 명령으로 확인하면, 대략 이런 정보가 나온다.

- Gateway가 `127.0.0.1:18789`에서 실행 중인지
- Discord 채널 연결 상태가 정상인지
- 어떤 에이전트들이 활성화되어 있는지
- 최근 세션이 어떤 모델로 돌아가는지
- 메모리 인덱스가 준비되어 있는지

내 현재 구성은 대략 이런 느낌이다.

- **5개 에이전트** 운영
  - main (전략/조율)
  - navi (리뷰)
  - kkami (보안/개발/DevOps)
  - cheese (콘텐츠/SNS)
  - luna (리서치)
- Discord 채널별로 에이전트 대화 연결
- 반복 작업은 cron으로 자동 실행
- 에이전트끼리 필요한 경우 `sessions_send`로 직접 협업

여기서 재미있는 건, 이 시스템이 단일 AI 하나가 모든 걸 하는 구조가 아니라는 점이다. 역할을 나눠두면 생각보다 운영이 편해진다.

예를 들어:

- 코드 리뷰는 나비
- 글이나 SNS는 치즈
- 보안/인프라는 까미
- 전략 판단은 로지

이런 식으로 **성격과 책임을 분리**해두면, 자연어로 위임하는 경험이 훨씬 선명해진다.

---

## 에이전트끼리도 말한다: `sessions_send`

이 시스템에서 꽤 중요한 기능이 하나 더 있다.

바로 **에이전트 간 직접 대화**다.

예를 들어 까미가 작업하다가 리뷰가 필요하면, 사람을 다시 거치지 않고 나비에게 이런 식으로 요청할 수 있다.

```text
이 변경 검토해줘.
어떤 파일이 바뀌었고, 리스크가 뭔지 봐줘.
```

내부적으로는 `sessions_send`가 이런 역할을 한다.

이게 왜 좋냐면,
단일 AI에게 모든 걸 시키는 것보다
**역할이 분리된 여러 AI가 협업하는 편이 결과 품질이 더 안정적이기 때문**이다.

특히 다음 같은 경우에 효과가 크다.

- 까미가 코드 수정 → 나비가 리뷰
- 치즈가 콘텐츠 작성 → 까미가 기술 정확성 점검
- 루나가 리서치 수집 → 로지가 최종 요약

![에이전트 간 협업 (sessions_send)](/images/blogs/052/052_04_collaboration.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A group of unique AI character avatars sitting around a virtual conference table in a high-tech digital space, collaborating on a project board, speech bubbles connecting them, vibrant colors, premium flat illustration, 16:9 aspect ratio"
  aspect_ratio: "16:9"
  session_id: "blog-052"
  save_as: "052_04_collaboration.png"
-->

사람 팀의 역할 분담을 AI 운영에 가져온 셈이다.

---

## 반복 작업은 cron으로 넘긴다

매번 말로 시키기 귀찮은 일은 cron으로 고정한다.

예를 들면 이런 것들이다.

- 아침 브리핑
- 보안 리스크 점검
- 에러 로그 스캔
- 콘텐츠 발행 보조
- 좋아요/댓글/포스팅 자동화
- 주간 리뷰

확인은 이런 식으로 한다.

```bash
openclaw cron list
```

문제가 생기면:

```bash
openclaw cron run <jobId>
openclaw cron edit <jobId>
```

이 흐름이 중요한 이유는 분명하다.

처음에는 자연어로 일을 시키다가,
반복 패턴이 보이면 그 작업을 **운영 레벨의 자동화**로 승격시킬 수 있다.

즉,

1. 사람이 한두 번 시킨다
2. AI가 그 패턴을 수행한다
3. 반복되면 cron으로 묶는다
4. 사람은 예외 상황만 본다

이게 결국 자동화가 성숙하는 과정이다.

---

## 실제로 자주 쓰는 운영 명령들

자연어 인터페이스가 편하긴 하지만, 운영자는 결국 상태를 직접 볼 수 있어야 한다. 내가 자주 쓰는 OpenClaw 명령은 대충 이 정도다.

### 전체 상태 확인

```bash
openclaw status
```

### Gateway 상태 확인 / 재시작

```bash
openclaw gateway status
openclaw gateway restart
```

### cron 확인

```bash
openclaw cron list
openclaw cron run <jobId>
openclaw cron edit <jobId>
```

### 로그 보기

```bash
tail -f ~/.openclaw/logs/gateway.log
tail -f ~/.openclaw/logs/gateway.err.log
```

### Health 확인

```bash
curl -s http://127.0.0.1:18789/health
```

내 경험상 중요한 건 "명령어를 많이 아는 것"보다, **어느 레이어의 문제인지 빨리 구분하는 것**이다.

예를 들어:

- Discord 응답이 이상하다 → 채널/세션 문제인가?
- 작업은 시작했는데 실패한다 → 도구 호출/권한/경로 문제인가?
- cron만 죽는다 → 프롬프트, timeout, job 설정 문제인가?
- 전체가 멈췄다 → Gateway 문제인가?

이렇게 레이어를 나눠서 보면 디버깅이 훨씬 빨라진다.

---

## 보안 때문에 일부러 불편하게 만든 부분도 있다

AI가 파일을 읽고 수정할 수 있다는 건 강력한 동시에 위험하다.

그래서 몇 가지는 일부러 규칙을 강하게 잡았다.

### 1. 시크릿 단일 소스

민감한 값은 `~/.openclaw/.env` 하나로 모은다.

왜냐하면 `.env`가 여기저기 흩어지기 시작하면,
언젠가 반드시 누락되고,
언젠가 반드시 잘못된 파일이 커밋된다.

### 2. 프로젝트와 에이전트 문맥 분리

아까 말했듯이,
에이전트의 규칙/메모와 실제 제품 코드를 같은 디렉토리에 두지 않는다.

### 3. 직접 push보다 브랜치 + PR 선호

AI가 글을 쓰든 코드를 고치든,
바로 main에 밀어버리는 구조는 사고를 키우기 쉽다.

그래서 기본 원칙은 이렇다.

1. 브랜치 생성
2. 변경 작성
3. 빌드/검증
4. PR 생성
5. 리뷰 후 머지

사람이 한 번 더 보고 머지하는 단계는 여전히 유효하다.

---

## 오늘 이 글도 사실 같은 방식으로 쓰고 있다

재미있는 건, 이 글 자체도 지금 설명하는 구조 위에서 쓰고 있다는 점이다.

실제 흐름은 거의 이랬다.

1. Discord에서 "내가 너한테 어떤 명령을 어떻게 실행하고 있는지 블로그 글 하나 써줘"라고 요청
2. 에이전트가 내 웹사이트 저장소를 로컬에 클론
3. 기존 블로그 구조와 발행 규칙 확인
4. OpenClaw 현재 상태와 문서 확인
5. 새 마크다운 파일 생성
6. 빌드 검증 후 브랜치에 커밋 준비

즉, 이 글은 단순히 OpenClaw를 설명하는 글이 아니라,
**OpenClaw가 실제로 작동한 결과물**이기도 하다.

이런 자기참조적인 경험이 꽤 재밌다. 도구를 설명하는 글이 도구 자체로 생산된다는 점에서 말이다.

---

## 내가 이 구조에서 가장 좋아하는 부분

결국 내가 좋아하는 건 화려한 AI 데모가 아니다.

좋아하는 건 다음 세 가지다.

### 1. 인터페이스가 가볍다

Discord에서 말 걸듯 요청하면 된다.
굳이 매번 터미널부터 열 필요가 없다.

### 2. 실행은 무겁다

겉은 가볍지만, 뒤에서는 실제 파일 시스템과 프로젝트와 자동화가 움직인다.

### 3. 점점 시스템이 된다

처음엔 사람과 AI의 대화였던 것이,
나중엔 반복이 쌓여 **운영 체계**가 된다.

이게 핵심이다.

AI를 "똑똑한 답변기"로만 쓰면 생산성이 조금 오르는 수준에서 끝난다.
하지만 **실행 환경, 워크스페이스, 메모리, 자동화, 협업 규칙**까지 붙이면 얘기가 달라진다.
그때부터는 진짜로 "일을 맡길 수 있는 시스템"이 된다.

---

## 마무리: 내가 원하는 건 AI 친구가 아니라 AI 작업 시스템이다

나는 AI와 수다 떨려고 이걸 만든 게 아니다.

내가 원한 건,
말하면 움직이고,
기록하고,
반복을 자동화하고,
필요하면 다른 에이전트와 협업하고,
문제가 나면 로그를 보고 고칠 수 있는 **작업 시스템**이었다.

지금의 OpenClaw 운영은 아직 완벽하진 않다.
가끔 timeout도 나고, 경로 문제도 나고, cron이 삐끗할 때도 있다.

근데 중요한 건 방향이다.

나는 점점 더 자주,
"어떻게 하지?"보다
"누구에게 맡기지?"를 먼저 생각하게 됐다.

그리고 그 질문에 Discord 채널 하나로 답할 수 있게 된 게,
내가 이 구조를 계속 다듬는 이유다.

앞으로는 여기서 더 나아가서,

- 블로그 발행 자동화
- 리서치 → 글 초안 → 검토 → 배포 흐름 연결
- 장애 감지 → 수정 → 보고 자동화
- 개인 지식 베이스와 프로젝트 작업의 더 강한 연결

같은 것들을 계속 붙여볼 생각이다.

AI를 잘 쓰는 사람과,
AI를 **운영하는 사람** 사이에는 생각보다 큰 차이가 있다.

![AI 작업 시스템의 비전](/images/blogs/052/052_05_vision.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A developer standing in a vast, organized digital control room directing a symphony of automated AI agents, glowing circuits and data flows everywhere, hopeful and powerful atmosphere, futuristic flat illustration, 16:9 aspect ratio"
  aspect_ratio: "16:9"
  session_id: "blog-052"
  save_as: "052_05_vision.png"
-->

나는 이제 전자보다 후자를 더 재밌어한다.
