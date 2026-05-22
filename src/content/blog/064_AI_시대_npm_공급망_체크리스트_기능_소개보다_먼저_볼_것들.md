---
title: "AI 시대 npm 공급망 체크리스트, 기능 소개보다 먼저 볼 것들"
subtitle: "TanStack 사고 이후에는 패키지 기능보다 배포·서명·의존성 검증 순서가 먼저다"
description: "TanStack npm 공급망 사고를 계기로, AI 도구 추천과 오픈소스 도입 전에 한국 개발팀이 먼저 확인해야 할 배포·서명·의존성 체크리스트를 정리했다."
publish: false
meta_title: "AI 시대 npm 공급망 체크리스트, 기능 소개보다 먼저 볼 것들 | 김덕환"
meta_description: "TanStack 사고 이후 AI 도구 추천 전에 먼저 봐야 할 npm 공급망 체크리스트. 배포, 서명, 의존성 검증, OIDC, install-time 리스크를 실무 기준으로 정리했다."
keywords:
  - TanStack npm 공급망 사고
  - npm 공급망 체크리스트
  - AI 도구 보안
  - GitHub Actions OIDC
  - 의존성 검증
  - install time security
og_title: "AI 시대 npm 공급망 체크리스트, 기능 소개보다 먼저 볼 것들"
og_description: "기능 소개보다 먼저 봐야 할 건 공급망 신뢰다. TanStack 사고와 에이전트 시대 흐름을 묶어 실무 체크리스트로 정리했다."
og_type: article
twitter_card: summary_large_image
created_date: 2026-05-13
updated_date: 2026-05-13
category: "개발"
featured_image: /images/blogs/064/064_00_thumbnail.png
featured_image_alt: "AI 에이전트 추천 화면 뒤에 npm 공급망 경고 체크리스트가 겹쳐진 보안 일러스트"
slug: ai-era-npm-supply-chain-checklist-before-tool-recommendations
tags:
  - TanStack
  - npm
  - 공급망 보안
  - AI 에이전트
  - GitHub Actions
  - OIDC
  - 의존성 관리
faq:
  - question: "AI가 추천한 npm 패키지는 바로 설치하면 안 되나요?"
    answer: "바로 프로덕션이나 개발 메인 환경에 설치하는 건 피하는 편이 낫다. 먼저 격리된 환경에서 버전, 라이프사이클 스크립트, git 의존성, maintainer 상태를 확인해야 한다."
  - question: "SLSA provenance나 서명이 있으면 충분히 안전한가요?"
    answer: "충분하지 않다. provenance는 출처를 더 잘 설명해주지만, 빌드 런타임 자체가 오염되지 않았다는 보장은 하지 않는다."
  - question: "작은 팀도 이 체크리스트가 필요한가요?"
    answer: "오히려 작은 팀일수록 필요하다. 한 번의 install-time 사고가 로컬 개발 환경, CI 시크릿, 배포 계정까지 한 번에 번질 수 있기 때문이다."
---

이제 AI 도구 추천 글에서 먼저 봐야 할 건 기능 표가 아니다. **이 패키지를 설치하는 순간 어디까지 실행되고, 누가 배포했고, 뭘 검증할 수 있는지**다. TanStack npm 공급망 사고는 그 순서를 완전히 바꿔놨다.

나는 이번 사건을 보면서 “좋은 도구를 빨리 소개하는 능력”보다 “안전하게 도입시키는 감각”이 더 중요해졌다고 느꼈다. 특히 에이전트와 오픈소스 추천이 폭증하는 지금은 더 그렇다. 추천 한 줄이 바로 `npm install`로 이어지고, 그 한 번의 설치가 로컬 키체인, CI 시크릿, 배포 권한까지 건드릴 수 있다.

![AI 추천과 npm 설치 사이의 신뢰 경계](/images/blogs/064/064_00_thumbnail.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial illustration of an AI agent recommending npm packages on a chat screen while a developer faces a large security checklist overlay between recommendation and install button, modern flat style, Korean tech blog aesthetic, dark navy and mint color palette"
  aspect_ratio: "4:3"
  session_id: "blog-064"
  save_as: "064_00_thumbnail.png"
-->

---

## TanStack 사고가 진짜로 바꾼 질문

이번 사건의 핵심은 단순히 유명 패키지가 뚫렸다는 데 있지 않다. 더 불편한 포인트는 **정상적인 릴리스 파이프라인과 정상처럼 보이는 provenance 위에서도 악성 배포가 가능했다**는 점이다.

TanStack 포스트모템 기준으로 공격자는 `pull_request_target` 계열 워크플로와 캐시 오염, OIDC 토큰 악용을 연쇄로 묶어 다수의 `@tanstack/*` 패키지 악성 버전을 배포했다. 여기서 많은 팀이 착각하기 쉬운 지점이 있다.

- "서명됐으니 안전하다"
- "trusted publishing이면 안전하다"
- "유명 maintainer 패키지라 안전하다"

이번 사고는 셋 다 자동 정답이 아니라는 걸 보여줬다. **서명이 틀린 게 아니라, 서명되기 전 런타임 경계가 먼저 무너진 것**에 가깝다. 그래서 지금 필요한 질문도 달라진다.

> 이 도구가 유명한가?
> 
> 보다 먼저,
> 
> **이 도구는 어떤 경로로 배포되고, install time에 무엇을 실행하며, 우리 팀은 그걸 어디까지 검증할 수 있나?**

---

## 왜 AI 시대엔 이 문제가 더 커지나

AI가 개발 워크플로 안으로 들어오면서 패키지 설치는 더 잦아졌고, 더 빨라졌고, 더 무심해졌다. 채팅창에서 추천받고 바로 붙여 넣는 흐름이 생겼기 때문이다.

여기에 이번 주 연구 시그널이 겹친다.

- **Constraint Drift**는 멀티에이전트 시스템에서 원래 걸어둔 제약이 메모리, 위임, 도구 호출을 거치며 약해질 수 있다고 짚었다.
- **ComplexMCP**는 도구 수가 많고 상태가 복잡해질수록 상위 모델도 쉽게 과신하고 복구를 포기한다고 보여줬다.
- **Why Retrying Fails**는 실패한 시도의 문맥이 다음 재시도를 오염시켜, 재시도 자체가 리스크가 될 수 있다고 설명했다.

이 논문들이 TanStack 사건을 직접 다룬 건 아니다. 그런데 메시지는 묘하게 한 곳으로 수렴한다. **도구 체인이 길어질수록 “한 번 더 해보자”가 안전을 회복시키는 게 아니라, 오히려 위험을 깊게 밀어 넣을 수 있다**는 점이다.

AI 추천 → 설치 → 실패 → 재시도 → 다른 에이전트가 우회 설치. 이 흐름은 편해 보이지만, 공급망 관점에선 아주 안 좋은 기본값이다.

![에이전트 시대 설치 파이프라인 리스크](/images/blogs/064/064_01_agent-install-risk-pipeline.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Flow diagram illustration of AI recommendation to npm install to retry loop to CI deployment, with red risk markers appearing at recommendation, install-time scripts, retry contamination, and publish permission boundaries, flat security infographic style"
  aspect_ratio: "16:9"
  session_id: "blog-064"
  save_as: "064_01_agent-install-risk-pipeline.png"
-->

---

## 한국 개발팀용 npm 공급망 체크리스트 7가지

아래 체크리스트는 거창한 보안 프로그램이 아니라, **오늘 당장 팀 기본값을 바꾸는 용도**로 보면 된다.

### 1. AI가 추천한 패키지는 메인 환경에서 바로 설치하지 않는다

이제 `npm i`는 정보 조회가 아니라 **코드 실행 가능 이벤트**로 봐야 한다. 새 패키지는 최소한 아래 순서로 본다.

- 격리된 샌드박스 또는 throwaway 브랜치에서 먼저 확인
- 패키지 페이지와 저장소, 최근 릴리스 시간, maintainer 변경 이력 확인
- 회사 메인 CI나 실제 배포 워크플로에서 바로 시험 설치 금지

### 2. 정확한 버전과 lockfile 없이는 추천도 문서도 남기지 않는다

"이거 좋아요"보다 위험한 말이 `latest로 깔아보세요`다. 팀 문서, 사내 위키, README, 블로그 예제까지 모두 포함해서 **정확한 버전과 lockfile 기준**으로 남기는 편이 낫다.

특히 AI가 자동 생성한 설치 가이드는 범위 버전, floating tag, 대충 맞는 명령어를 섞어낼 때가 많다. 이런 답변은 편하지만 재현성과 감사 가능성은 낮다.

### 3. `scripts`, `optionalDependencies`, git dependency를 먼저 본다

많은 팀이 package 이름과 stars만 보고 안심한다. 그런데 install-time 사고는 보통 다른 곳에서 터진다.

- `postinstall`, `prepare`, `preinstall`
- `optionalDependencies`
- registry tarball이 아니라 git commit을 직접 물어오는 dependency

나는 새 패키지를 볼 때 README보다 `package.json`부터 훑는 습관이 더 실무적이라고 본다. 설치 전에 실행되는 훅이 무엇인지 모르면, 설치 자체를 승인한 게 아니라 **미지의 스크립트 실행을 승인한 것**에 가깝다.

### 4. OIDC와 publish 권한은 "있다/없다"가 아니라 "어디에만 있나"로 본다

TanStack 사건이 보여준 건 OIDC가 나쁘다는 게 아니다. **권한을 mint할 수 있는 런타임 경계가 너무 넓으면 OIDC도 공격 표면이 된다**는 점이다.

최소한 이건 바로 볼 수 있다.

- `permissions: id-token: write`가 정말 publish job에만 있는지
- PR 검증 job과 release job이 캐시를 공유하는지
- `pull_request_target`에서 checkout + install이 가능한지
- 외부 PR과 privileged workflow가 섞이는 구간이 있는지

### 5. 서명과 provenance는 통과 스티커가 아니라 조사 시작점으로 쓴다

서명 검증은 계속 필요하다. 다만 거기서 멈추면 안 된다. provenance가 말해주는 건 대체로 **어디서 빌드됐는가**이지 **그 빌드가 무해했는가**는 아니다.

그래서 팀 질문도 이렇게 바꿔야 한다.

- "서명됐나?"만 묻지 말고
- **"어느 워크플로에서, 어떤 권한으로, 어떤 캐시를 거쳐 서명됐나?"**까지 본다

### 6. 설치 사고 대응은 패키지 삭제보다 시크릿 회전이 먼저다

영향 버전을 설치했다면 “지우고 다시 깔면 되겠지”가 제일 위험하다. install-time 실행이 있었다면 이미 로컬, CI, 배포 환경을 만졌을 수 있다.

우선순위는 보통 이렇다.

1. 영향 환경 식별
2. GitHub / npm / 클라우드 / Vault / SSH 자격증명 회전
3. CI runner, 캐시, artifact 재검토
4. 그 다음에야 의존성 정리

### 7. 도구 추천 정책 자체에 공급망 항목을 넣는다

이제는 "성능 좋다", "DX 좋다", "스타 많다"만으로 추천하면 부족하다. 특히 한국 팀이 사내 도입 문서나 기술 블로그를 쓸 땐 아래 항목을 같이 적는 편이 좋다.

- 배포 채널: npm, GitHub Release, 바이너리, Docker 중 무엇인지
- 검증 정보: 서명, provenance, checksum, SBOM 제공 여부
- 설치 표면: lifecycle script, native binary download 여부
- 운영 이력: 최근 maintainer 변경, 사고 이력, 보안 공지 채널
- 도입 원칙: 로컬 실험 허용 / CI 사용 금지 / production 승인 필요 같은 경계

![실무용 npm 공급망 체크리스트 카드](/images/blogs/064/064_02_npm-supply-chain-checklist-card.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Clean checklist infographic for Korean developers about npm supply chain security: sandbox install, pin versions, inspect scripts, isolate OIDC, verify provenance, rotate secrets, recommendation policy. Modern editorial card design, flat vector, readable icon system"
  aspect_ratio: "16:9"
  session_id: "blog-064"
  save_as: "064_02_npm-supply-chain-checklist-card.png"
-->

---

## 오늘 바로 팀에 적용하는 30분 점검 루틴

실무에선 거대한 보안 프레임워크보다 **짧은 루틴**이 더 오래 간다. 나는 아래 정도만 해도 팀 체감이 꽤 달라질 거라고 본다.

### 10분 — CI 위험 신호 찾기

```bash
rg "pull_request_target|id-token: write|npm install|pnpm install|yarn install" .github/workflows
```

이걸로 외부 PR, install, publish 권한이 어디서 겹치는지 먼저 본다.

### 10분 — 새 패키지 도입 템플릿 만들기

사내 문서든 PR 템플릿이든 아래 4줄만 추가해도 좋다.

- 설치 버전 고정 여부
- lifecycle script 존재 여부
- provenance/서명 확인 방법
- production/CI 사용 승인자

### 10분 — AI 추천 사용 규칙 한 줄 추가하기

팀 위키나 에이전트 프롬프트에 이 문장 하나만 넣어도 꽤 유효하다.

> AI가 추천한 패키지는 메인 환경에 즉시 설치하지 않고, 격리 환경 검증과 버전 고정 후 도입한다.

이런 문장은 사소해 보여도, 실제로는 추천에서 설치까지의 마찰을 의도적으로 만든다. 지금은 그 마찰이 필요하다.

---

## 결론: 이제 좋은 추천은 빠른 추천이 아니라 안전한 추천이다

예전에는 도구 글을 쓸 때 "뭘 할 수 있나"가 메인이었다. 지금은 그 앞에 질문 하나가 더 붙는다. **"이걸 설치해도 되나"**.

TanStack 사고는 특정 패키지 하나의 해프닝으로 끝날 얘기가 아니다. AI 에이전트, MCP 도구, CLI 자동화, 오픈소스 추천이 늘어날수록 설치와 배포는 더 자주 자동화될 거고, 그만큼 공급망 기본값이 실력의 일부가 된다.

그래서 나는 이제 기능 소개보다 먼저 **배포 경로, 서명 경계, 의존성 실행면**을 본다. 2026년의 추천 감각은 취향보다 신뢰 설계에 더 가깝다.

2026-05-13
