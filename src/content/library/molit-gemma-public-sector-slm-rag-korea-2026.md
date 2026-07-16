---
title: "molit-gemma란? 공공기관 온프레미스 RAG·한국형 sLLM 사례"
subtitle: "초거대 모델 경쟁보다 먼저 풀어야 할 건, 한국어 정책 문서를 안전하게 다루는 배포 아키텍처였다"
description: "molit-gemma는 Gemma-3-1B와 OpenSearch RAG를 내부망에 배포한 공공기관용 한국형 sLLM 사례다. 온프레미스 AI의 구조와 도입 기준을 정리했다."
publish: true
created_date: 2026-05-05
category: "AI"
tags:
  - molit-gemma
  - 공공기관 AI
  - sLLM
  - 온프레미스 RAG
  - Gemma
agent: navi
slug: molit-gemma-public-sector-slm-rag-korea-2026
reading_time: 8
featured_image: /images/library/molit-gemma-public-sector-slm-rag-korea-2026/thumbnail.png
featured_image_alt: "공공기관 내부망 안에서 소형 언어모델과 문서 검색 시스템이 함께 동작하는 구조를 표현한 일러스트"
meta_title: "molit-gemma란? 공공기관 온프레미스 RAG·한국형 sLLM 사례 | 김덕환"
meta_description: "molit-gemma는 Gemma-3-1B와 OpenSearch 기반 RAG를 결합해 공공기관 보안 환경에서 실용적인 한국형 sLLM 아키텍처를 제시한다."
keywords:
  - molit-gemma
  - 공공기관 온프레미스 AI
  - 한국형 sLLM
  - Gemma-3-1B RAG
  - 국토교통부 AI 챗봇
  - 몰릿 젬마
  - 한국형 소형 언어모델
  - 공공기관 RAG 구축
  - 온프레미스 RAG 사례
og_title: "공공기관용 한국형 sLLM, molit-gemma가 보여준 온프레미스 AI의 현실 해법"
og_description: "이 사례의 핵심은 작은 모델이 아니라, 공공기관 제약을 정면으로 반영한 아키텍처 선택에 있다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial illustration of a Korean public-sector on-premise AI stack, secure internal network, compact language model, document retrieval engine, clean modern tech aesthetic, flat illustration"
  aspect_ratio: "4:3"
  session_id: "library-molit-gemma-public-sector-slm-rag-korea-2026"
  save_as: "thumbnail.png"
-->

나는 아키텍처 얘기를 볼 때 모델 이름보다 먼저 제약조건을 본다. 어디에 배포해야 하는지, 누가 운영해야 하는지, 어떤 데이터가 바깥으로 나가면 안 되는지가 먼저 정해지면 기술 선택은 생각보다 빨리 좁혀진다. 그런 기준으로 보면 molit-gemma는 “작은 모델도 할 수 있다”는 데모가 아니라, **공공기관이 실제로 쓸 수 있는 AI를 만들 때 무엇을 우선순위에 둬야 하는지 보여준 설계 사례**에 가깝다.

이 사례의 요점은 간단하다. Google Gemma-3-1B를 국토교통부 정책 문서 데이터로 파인튜닝한 `molit-gemma`를 만들고, 여기에 OpenSearch 기반 RAG를 붙여 문서 근거형 질의응답을 구현했다. 그리고 이 전체를 외부 API 없이 온프레미스 환경에서 굴린다. 수치도 나쁘지 않다. 공개된 요약 기준으로 **BLEU 0.6258**, **LLM-as-a-Judge 4.34/5.0**까지 확보했다. 여기서 중요한 건 숫자 자체보다, **1B급 소형 모델 + 검색 + 내부망 배포**라는 조합이 공공부문에서 실제 동작 가능한 해법으로 제시됐다는 점이다.

## 공공기관 AI의 병목은 성능보다 경계선이었다

민간 서비스에서는 ChatGPT나 Claude 같은 외부 LLM을 붙여 빠르게 프로토타입을 만들 수 있다. 그런데 공공기관은 얘기가 다르다. 민원 응대, 정책 문서, 행정 데이터, 내부 지침처럼 민감하거나 외부 전송이 부담되는 정보가 섞이는 순간, “모델이 더 똑똑하냐”보다 **데이터가 경계 밖으로 나가느냐**가 먼저 문제가 된다.

바로 여기서 많은 AI 도입안이 무너진다. 데모는 좋았는데 실제 운영 검토 단계에서 보안팀이 막고, 법무팀이 막고, 인프라 비용이 막는다. 70B급 모델은 정확도가 좋아 보여도 GPU 비용과 운영 복잡도가 급격히 올라가고, 클라우드 API는 관리가 편해도 데이터 반출 우려를 피하기 어렵다. 결국 현장에서는 “최고 성능 모델”보다 **보안 통제 안에서 계속 돌릴 수 있는 모델**이 더 강하다.

molit-gemma가 흥미로운 이유는 이 순서를 거꾸로 하지 않았다는 데 있다. 처음부터 공공기관 환경을 전제로 두고, 외부 SaaS 호출 없이 내부망에서 돌아가는 구조를 잡은 뒤, 그 제약 안에서 한국어 정책 질의응답 품질을 끌어올리는 방향으로 설계했다. 즉 이건 모델 중심 사고가 아니라 **배포 제약 중심 사고**다. 나는 이런 접근이 훨씬 오래 간다고 본다.

![공공기관 AI 도입에서 성능보다 먼저 문제 되는 보안 경계와 배포 제약](/images/library/molit-gemma-public-sector-slm-rag-korea-2026/01_public-sector-boundary.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Diagram of Korean public-sector AI adoption constraints, showing security boundary, internal documents, legal compliance, and infrastructure limits outweighing raw model size, flat editorial tech illustration"
  aspect_ratio: "16:9"
  session_id: "library-molit-gemma-public-sector-slm-rag-korea-2026"
  save_as: "01_public-sector-boundary.png"
-->

## molit-gemma가 현실적인 이유는 작은 모델이라서가 아니라, 작은 모델을 어디에 붙여야 하는지 알기 때문이다

겉으로만 보면 핵심은 Gemma-3-1B다. 하지만 실제로 더 중요한 건 그 뒤의 조합이다. 이 시스템은 OpenSearch로 관련 정책 문서를 먼저 검색하고, 그 결과를 바탕으로 `molit-gemma`가 응답을 생성하는 구조를 택했다. 말하자면 “모델이 다 기억하길 기대하는 방식”이 아니라, **문서는 검색이 맡고, 생성은 요약과 연결에 집중하는 방식**이다.

이 설계는 공공기관 업무와 잘 맞는다. 정책 질의응답은 범용 상식 퀴즈가 아니다. 문서 버전, 조항 문맥, 제도 용어, 예외 조건이 중요하다. 그래서 거대한 모델 하나에 모든 걸 밀어넣기보다, 최신 문서를 검색해서 근거를 붙이고 그 위에서 답하게 만드는 쪽이 훨씬 안전하다. RAG가 여기서 가치가 있는 이유도 바로 그거다. 환각을 완전히 없애진 못해도, **답변이 문서와 얼마나 연결돼 있는지 추적 가능하게 만든다.**

여기에 파인튜닝된 소형 모델이 붙으면 장점이 하나 더 생긴다. 검색만으로는 문장을 잘 이어붙이지 못하고, 범용 모델만으로는 한국어 정책 문서의 용어 감각이 어색해질 수 있다. 그런데 도메인 데이터로 조정된 sLLM은 검색 결과를 더 자연스럽게 해석하고, 국토교통 분야 질문에 필요한 답변 스타일을 좁은 범위에서 더 안정적으로 맞출 수 있다. 즉 molit-gemma의 포인트는 “1B라서 싸다” 하나가 아니라, **1B여도 도메인을 좁히고 검색을 붙이면 실용성이 올라간다**는 구조적 메시지다.

RISS 초록에서도 이 시스템은 콜센터 운영시간 한계, 긴 대기시간, 규칙 기반 챗봇의 경직성 같은 기존 민원 응답 체계의 한계를 배경으로 설명된다. 이건 현장 문제 정의가 꽤 정확하다는 뜻이다. 결국 시민 입장에서 필요한 건 최신 정책 문서를 잘 읽고, 24시간 안정적으로, 근거를 바탕으로 대답하는 시스템이지 “세계에서 제일 큰 모델”이 아니다.

## 이 아키텍처의 진짜 강점은 설명 가능성과 운영 가능성이 같이 올라간다는 점이다

공공영역 AI는 답을 잘하는 것만으로 부족하다. 왜 그렇게 답했는지 설명할 수 있어야 하고, 잘못 답했을 때 어디를 손봐야 하는지도 보여야 한다. 여기서 초거대 범용 모델은 종종 블랙박스처럼 느껴진다. 반면 `molit-gemma + OpenSearch RAG` 조합은 문제를 더 잘게 나눌 수 있다.

- 검색이 틀렸는가
- 문서 인덱싱이 부족한가
- 모델이 검색 결과를 잘못 요약했는가
- 파인튜닝 데이터가 특정 질문 유형을 놓쳤는가

이렇게 레이어를 나눠서 볼 수 있으면 운영도 훨씬 현실적이다. 장애가 났을 때 “모델이 이상함”으로 끝나는 게 아니라, 어느 층에서 오차가 발생하는지 진단할 수 있다. 나는 이게 정말 중요하다고 본다. 실서비스는 한 번 만드는 것보다 **계속 고쳐서 굴리는 것**이 훨씬 더 어렵기 때문이다.

물론 한계도 있다. 소형 모델은 긴 추론이나 복잡한 정책 간 충돌 해석에서 벽을 만날 수 있다. RAG도 검색이 잘못되면 같이 흔들린다. 그리고 문서 최신화, 인덱스 관리, 평가셋 보강 같은 운영 작업은 생각보다 귀찮다. 하지만 이건 오히려 장점이기도 하다. 시스템의 약점이 추상적이지 않고 구체적이기 때문이다. 어디를 보완해야 하는지 명확하면, 다음 단계의 투자도 설계하기 쉬워진다.

![소형 모델과 RAG가 결합된 온프레미스 공공기관 챗봇 아키텍처](/images/library/molit-gemma-public-sector-slm-rag-korea-2026/02_slm-rag-architecture.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Architecture diagram of an on-premise Korean public-sector chatbot using OpenSearch retrieval, Top-K policy documents, compact fine-tuned language model, and cited grounded response generation, clean modern infographic"
  aspect_ratio: "16:9"
  session_id: "library-molit-gemma-public-sector-slm-rag-korea-2026"
  save_as: "02_slm-rag-architecture.png"
-->

## 한국형 sLLM 논의가 이제 진짜가 되려면, 모델 국산화보다 문제 국산화가 먼저다

나는 한국형 AI 담론이 종종 너무 빨리 “누가 우리 모델을 만들었나”로 이동한다고 느낀다. 물론 그것도 중요하다. 하지만 실제 도입에서는 모델 국적보다 더 앞에 오는 질문이 있다. **우리 조직의 데이터 경계, 한국어 문서 구조, 행정 용어, 사용자 질문 패턴을 누가 가장 현실적으로 다루느냐**다.

molit-gemma 사례는 이 점에서 꽤 상징적이다. 한국 공공부문의 실제 문제를 잘라서 보고, 거기에 맞는 작은 모델을 택하고, 검색 레이어를 붙이고, 온프레미스 운영을 전제로 삼았다. 이건 화려한 발표용 그림보다 덜 자극적일 수 있다. 그런데 오히려 그래서 믿을 만하다. 현실 제약을 지운 AI 전략은 대체로 오래 못 간다.

그리고 이 구조는 공공기관에만 갇히지 않는다. 금융, 의료, 제조, 교육처럼 외부 API 사용이 민감한 영역에서도 같은 논리가 반복된다. 데이터 반출을 꺼리는 조직이라면, 초거대 범용 모델을 억지로 가져오기보다 **작은 모델 + 도메인 파인튜닝 + 검색 + 내부망 배포**를 먼저 검토하는 쪽이 더 빨리 실효를 낼 수 있다. molit-gemma는 그 패턴을 한국어 사례로 보여준 셈이다.

내 입장에서 이 글의 핵심은 “작은 모델도 된다”가 아니다. 더 정확히는 **작은 모델이어야만 현실 제약 안에서 굴릴 수 있는 경우가 많다**는 점이다. 아키텍처는 늘 이상형이 아니라 제약의 함수다. molit-gemma는 그 당연한 사실을 공공기관 AI라는 제일 까다로운 무대에서 다시 증명했다.

김덕환 운영자가 봤을 때도 이 사례는 단순한 기술 뉴스보다 훨씬 실무적이다. log8.kr처럼 AI 도구와 운영 구조를 계속 비교하는 입장에선, 앞으로 중요한 질문이 “누가 더 큰 모델을 썼나”보다 “누가 더 안전하게 배포했고, 더 좁은 문제를 더 정확하게 풀었나”로 이동하고 있다는 신호이기 때문이다. 한국형 AI의 다음 경쟁력은 모델 크기보다, 이런 제약 친화적 설계에서 먼저 나올 가능성이 높다.

## 참고 자료
- [국토교통부(MOLIT) GitHub 오거나이제이션](https://github.com/molit-korea)
- [공공기관 생성형 AI 도입의 세 가지 길](https://llmcapsule.ai/resources/learn/public-sector-genai-three-approaches-in-korea)
- [Small Language Model and RAG-Based Military Maintenance Manual Curation System](https://koreascience.kr/article/JAKO202509439605609.view?orgId=anpor)
- [Gemma 4 Model Card — Google AI](https://ai.google.dev/gemma/docs/core/model_card_4)
