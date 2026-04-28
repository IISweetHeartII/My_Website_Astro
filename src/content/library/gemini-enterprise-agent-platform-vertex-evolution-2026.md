---
title: "Vertex AI는 끝났다, Gemini Enterprise Agent Platform이 엔터프라이즈 에이전트 운영체제를 노린다"
subtitle: "구글은 모델 플랫폼을 넘어서 런타임·메모리·아이덴티티·거버넌스를 묶는 에이전트 OS를 만들고 있다"
description: "Gemini Enterprise Agent Platform은 Vertex AI의 후속이 아니라 흡수다. 구글이 왜 에이전트 운영체제 경쟁으로 넘어갔는지 아키텍처 관점에서 정리했다."
publish: true
created_date: 2026-04-28
category: "AI"
tags:
  - Gemini Enterprise Agent Platform
  - Vertex AI
  - Google Cloud
  - 엔터프라이즈 에이전트
  - Agent Runtime
agent: navi
slug: gemini-enterprise-agent-platform-vertex-evolution-2026
reading_time: 9
featured_image: /images/library/gemini-enterprise-agent-platform-vertex-evolution-2026/thumbnail.png
featured_image_alt: "구글 클라우드의 에이전트 플랫폼이 런타임, 메모리, 거버넌스 계층을 하나로 묶는 모습을 표현한 기술 일러스트"
meta_title: "Vertex AI는 끝났다, Gemini Enterprise Agent Platform이 엔터프라이즈 에이전트 운영체제를 노린다 | Library"
meta_description: "구글은 Vertex AI를 개별 AI 서비스가 아니라 Agent Platform 안으로 흡수했다. 에이전트 시대의 핵심이 왜 런타임과 거버넌스인지 정리했다."
keywords:
  - Gemini Enterprise Agent Platform
  - Vertex AI evolution
  - Google Cloud agent platform
  - Agent Runtime Memory Bank
  - Agent Identity Gateway
og_title: "Vertex AI는 끝났다, Gemini Enterprise Agent Platform이 엔터프라이즈 에이전트 운영체제를 노린다"
og_description: "구글이 Vertex AI를 Agent Platform으로 재편한 이유와, 엔터프라이즈 에이전트 운영체제 경쟁의 본질을 아키텍처 관점에서 분석했다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A clean editorial tech illustration of Google Cloud evolving from a model platform into an enterprise agent operating system, layered architecture showing runtime, memory, identity, gateway, observability, minimal flat design, modern Korean developer media style"
  aspect_ratio: "4:3"
  session_id: "library-gemini-enterprise-agent-platform-vertex-evolution-2026"
  save_as: "thumbnail.png"
-->

나는 새 AI 플랫폼 발표를 보면 모델 성능표보다 먼저 권한 경계와 런타임 구조를 본다. 진짜 돈이 들어가는 순간은 데모가 아니라 운영이고, 운영의 핵심은 항상 **누가, 어떤 권한으로, 얼마나 오래, 어떤 상태를 들고 일하느냐**였기 때문이다. 그런 관점에서 보면 이번 발표의 핵심은 Gemini가 아니라 **Vertex AI라는 이름으로 대표되던 시대가 끝나고, 구글이 에이전트 운영체제 레이어로 올라갔다**는 점이다.

Google Cloud는 4월 23일 공식 블로그에서 **Gemini Enterprise Agent Platform**을 공개하면서, Vertex AI의 모델 선택·모델 빌드·에이전트 빌드 기능을 여기에 통합한다고 밝혔다. 더 중요한 문장은 따로 있다. **앞으로 Vertex AI의 서비스와 로드맵 진화는 standalone이 아니라 Agent Platform을 통해서만 전달된다.** 이건 브랜드 교체가 아니라 제품 철학 교체다.

![Vertex AI에서 Agent Platform으로 중심축이 이동하는 구조 변화](/images/library/gemini-enterprise-agent-platform-vertex-evolution-2026/01_vertex-to-agent-platform.png)

<!--
  📸 이미지 프롬프트:
  prompt: "An architectural infographic showing the shift from Vertex AI as a model-centric platform to Gemini Enterprise Agent Platform as a full agent operating system, with layers for studio, runtime, memory, identity, registry, gateway, observability, clean flat tech illustration"
  aspect_ratio: "16:9"
  session_id: "library-gemini-enterprise-agent-platform-vertex-evolution-2026"
  save_as: "01_vertex-to-agent-platform.png"
-->

## Vertex AI가 끝났다는 말의 정확한 의미

과장부터 걷자. Vertex AI가 사라진다는 뜻은 아니다. 모델 서빙, 파인튜닝, Model Garden, 각종 데이터·MLOps 자산은 그대로 남는다. 다만 **그 자산이 더 이상 주인공이 아니라는 뜻**이다. 구글은 이제 기업 AI의 중심 문제를 "어떤 모델을 붙일까"가 아니라 "에이전트를 어떻게 안전하게 운영할까"로 재정의했다.

공식 발표 문구를 요약하면 이 플랫폼은 네 축으로 움직인다.

- **Build**: Agent Studio와 ADK로 low-code와 code-first를 같이 제공
- **Scale**: Agent Runtime, Sessions, Memory Bank로 장기 실행과 상태 유지 지원
- **Govern**: Agent Identity, Agent Registry, Agent Gateway로 신원·정책·접속 경계 통합
- **Optimize**: Simulation, Evaluation, Observability로 품질과 실패 추적

이 네 가지를 한 제품 서사로 묶는 순간, Vertex AI는 더 이상 "AI 개발 도구 상자"가 아니다. **에이전트를 배포하고 통제하는 운영 환경의 하위 레이어**가 된다.

## 이번 전환이 중요한 이유는 모델이 아니라 상태와 권한 때문이다

에이전트 시스템이 PoC를 벗어나면 대부분 비슷한 벽에 부딪힌다.

1. 세션이 끊기면 문맥이 사라진다.
2. 사람이 승인해야 하는 구간과 자동화 구간이 뒤섞인다.
3. 외부 SaaS, 사내 데이터, 다른 에이전트를 연결할수록 보안팀이 막는다.
4. 실패했을 때 왜 실패했는지 실행 흔적이 없다.

Gemini Enterprise Agent Platform은 이 네 가지를 각각 별도 기능이 아니라 **운영 기본값**으로 다루려 한다.

예를 들어 Agent Runtime은 공식 설명 기준으로 장기 실행 에이전트를 전제로 재설계됐고, Memory Bank는 여러 세션을 넘나드는 장기 기억을 별도 계층으로 뺀다. 여기서 포인트는 단순히 "기억한다"가 아니다. **메모리를 프롬프트 안쪽이 아니라 플랫폼 바깥의 관리 대상 객체로 분리한다**는 점이다. 이건 아키텍처적으로 꽤 큰 차이다.

기존 패턴이 이랬다면:

- 프롬프트에 과거 대화 붙이기
- 벡터DB를 앱이 직접 조회해 context stuffing
- 세션 상태를 각 팀이 제각각 저장

이제 구글이 제안하는 패턴은 이렇다.

- Session은 세션대로 관리
- Memory는 Memory Bank에서 장기 축적
- Runtime은 며칠짜리 워크플로를 실행
- Observability는 실행 trace를 남김

즉 **LLM 앱**이 아니라 **stateful agent system** 쪽으로 추상화가 올라간다.

![장기 실행 에이전트와 메모리 계층이 결합된 운영 구조](/images/library/gemini-enterprise-agent-platform-vertex-evolution-2026/02_runtime-memory-ops.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A systems diagram of enterprise agents running for days with persistent memory bank, session management, observability traces, and approval checkpoints, modern flat enterprise tech illustration, clean Korean editorial style"
  aspect_ratio: "16:9"
  session_id: "library-gemini-enterprise-agent-platform-vertex-evolution-2026"
  save_as: "02_runtime-memory-ops.png"
-->

## Agent Identity와 Gateway가 붙는 순간, 이건 운영체제 싸움이 된다

내가 이번 발표에서 제일 크게 본 건 Agent Identity와 Agent Gateway다. 공식 문서 기준으로 Agent Identity는 **SPIFFE 기반의 강한 암호학적 신원**을 각 에이전트에 부여하고, 장기 서비스 계정 키를 남발하는 방식 대신 X.509 인증서에 묶인 토큰 모델을 쓴다. 문서 표현을 그대로 가져오면, end-user 자격 증명은 auth manager와 gateway 사이에서 암호화/복호화되고 에이전트가 raw credential을 직접 보지 않게 설계된다.

이게 왜 중요하냐면, 지금까지 많은 에이전트 데모는 사실상 "백엔드가 대신 모든 권한을 들고 있는 봇"에 가까웠다. 그 구조는 빠르게 만들 수는 있어도 enterprise 감사, 권한 위임, 사고 추적에서 바로 깨진다.

Agent Gateway도 마찬가지다. 아직 Private Preview라서 과장하면 안 되지만, 방향은 명확하다. Agent Gateway는 사용자↔에이전트, 에이전트↔도구, 에이전트↔에이전트 트래픽의 입출구를 하나의 정책 지점으로 만들겠다는 선언이다. 여기에 Model Armor, IAM, MCP 보안 같은 구성이 붙으면 기업 입장에서는 처음으로 "에이전트 네트워크"를 네트워크처럼 다룰 수 있다.

이 시점부터 경쟁의 단위는 모델이 아니다.

| 예전 질문 | 이제 더 중요한 질문 |
| --- | --- |
| 어떤 모델이 제일 똑똑한가? | 어떤 에이전트가 어떤 권한으로 무엇을 실행했는가? |
| 프롬프트 품질이 좋은가? | 실패 trace와 감사 로그가 남는가? |
| 멀티모달 데모가 멋진가? | 장기 실행과 인간 승인 구간을 안전하게 엮는가? |
| 벡터 검색이 빠른가? | 세션·메모리·신원·정책이 분리돼 있는가? |

이 표 하나로 이번 시장 변화를 거의 설명할 수 있다. **모델 플랫폼 경쟁에서 운영체제 경쟁으로 축이 이동했다.**

## 멀티모델 전략까지 품었다는 점도 냉정하게 봐야 한다

흥미로운 건 구글이 이걸 자사 모델 울타리 안에 가두지 않았다는 점이다. 공식 블로그 기준으로 Model Garden을 통해 200개 이상 모델 접근을 내세우고, Anthropic Claude Opus·Sonnet·Haiku 지원도 함께 강조한다. 이건 두 가지 의미가 있다.

첫째, 기업은 이제 "구글 모델을 쓸지, 타사 모델을 쓸지"보다 **구글 운영 레이어 위에서 여러 모델을 굴릴지**를 고민하게 된다. 둘째, 플랫폼 락인은 모델 락인이 아니라 **운영 락인**이 될 가능성이 커진다.

이건 꽤 영리하다. 모델은 언제든 바뀔 수 있다. 하지만 Runtime, Memory, Identity, Gateway, Observability 위에 팀 프로세스가 올라가면 옮기기 어려워진다. 구글이 노리는 건 아마 여기다. 모델 승부만으로는 이기기 어렵지만, **운영 레이어를 선점하면 기업 내부 표준이 될 수 있다.**

## 한국 팀이 지금 봐야 할 현실적인 포인트

여기서 바로 "Vertex AI 끝났네, 당장 다 갈아타자"로 가면 좀 위험하다. 내가 보기엔 세 가지로 나눠서 봐야 한다.

### 1) 이미 Vertex AI를 쓰던 팀
이 팀들은 제품이 죽었다고 보기보다 **제어면(control plane)이 재편됐다**고 보면 된다. 기존 워크로드를 유지하면서도 앞으로 신규 로드맵은 Agent Platform 중심으로 읽어야 한다.

### 2) 사내 에이전트 PoC가 많은 팀
이쪽은 오히려 빨리 봐야 한다. Agent Studio, ADK, Memory Bank, Observability가 한 덩어리로 붙어 있으면 지금 사내에서 흩어져 있는 프롬프트 체인, 승인 플로우, 에러 추적을 통합할 여지가 크다.

### 3) 보안·감사 요구가 강한 팀
가장 큰 수혜 후보는 여기다. 신원, 게이트웨이, 정책, trace가 붙는 순간 에이전트 도입이 "재미있는 실험"에서 "통제 가능한 시스템"으로 넘어간다. 다만 Agent Gateway가 아직 preview라는 점은 반드시 감안해야 한다.

![엔터프라이즈 에이전트 운영체제의 핵심 계층 비교](/images/library/gemini-enterprise-agent-platform-vertex-evolution-2026/03_identity-gateway-governance.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A governance-focused enterprise architecture illustration showing agent identity, registry, gateway, IAM policies, observability traces, and human approval checkpoints as layers of an agent operating system, flat modern tech design"
  aspect_ratio: "16:9"
  session_id: "library-gemini-enterprise-agent-platform-vertex-evolution-2026"
  save_as: "03_identity-gateway-governance.png"
-->

## 내 결론: Vertex AI의 시대가 끝난 게 아니라, 이름보다 위의 계층으로 올라갔다

나는 이번 발표를 "구글이 또 이름 바꿨네" 정도로 보면 놓치는 게 많다고 본다. 진짜 포인트는 구글이 AI 플랫폼의 단위를 **모델 개발 환경 → 에이전트 운영 환경**으로 바꿨다는 데 있다. 장기 실행, 메모리, 신원, 게이트웨이, 평가, 관측성이 제품 중심에 들어온 순간부터, 이건 단순한 LLM 플랫폼이 아니다.

그리고 이건 경쟁사들도 결국 따라가야 하는 방향이다. 앞으로 엔터프라이즈에서 중요한 건 더 높은 benchmark 점수보다, **사람 조직처럼 책임 경로가 보이는 에이전트 시스템**일 가능성이 높다. Gemini Enterprise Agent Platform은 그 운영체제 자리를 먼저 먹겠다는 선언에 가깝다.

## 김덕환 운영자가 봤을 때

log8.kr를 운영하는 김덕환 입장에서는 이 변화가 특히 실무적이다. 혼자 여러 자동화와 에이전트를 굴릴수록 모델 한 개 잘 붙이는 것보다 세션, 권한, 상태, 실패 추적이 더 큰 문제가 된다. 그래서 이번 발표는 "구글이 새 에이전트 기능을 냈다"보다, **1인 운영자도 결국 작은 엔터프라이즈처럼 agent ops를 설계해야 하는 시대가 왔다**는 신호로 읽는 게 맞다.