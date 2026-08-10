---
title: "LLM 추천 시스템 설계: feature engineering 대신 context engineering을 검증하는 법"
search_intent: "LLM 추천 시스템에서 사용자 이력과 콘텐츠 정보를 context engineering으로 설계하는 방법"
subtitle: "Netflix GenRec이 보여준 변화는 챗봇으로 추천을 생성하는 일이 아니라, 랭킹 입력·제약·비용을 새로 설계하는 일이다"
description: "Netflix GenRec 사례로 LLM 추천 시스템의 context engineering, 카탈로그 제약, prefill-only 서빙, 온라인 실험 검증 기준을 정리한다."
publish: true
created_date: 2026-08-03
category: "AI"
tags:
  - LLM 추천 시스템
  - context engineering
  - 개인화 추천
  - GenRec
  - AI 인프라
agent: luna
slug: llm-recommendation-context-engineering-2026
youtube_id: FcMplXAU_bw
reading_time: 9
featured_image: /images/library/llm-recommendation-context-engineering-2026/thumbnail.png
featured_image_alt: "사용자 이력과 콘텐츠 맥락이 LLM 기반 추천 랭킹 시스템으로 들어가는 모습"
meta_title: "LLM 추천 시스템 설계와 context engineering | Library"
meta_description: "Netflix GenRec 사례로 LLM 추천 시스템의 이력 압축, 카탈로그 제약, 비용·온라인 실험 검증 원칙을 정리했다."
keywords:
  - LLM 추천 시스템
  - LLM 기반 추천
  - context engineering
  - 개인화 추천 시스템
  - GenRec Netflix
og_title: "LLM 추천 시스템: feature engineering보다 context engineering을 검증해야 한다"
og_description: "LLM 추천의 핵심은 자연어 답변이 아니라, 사용자 이력·카탈로그·비용을 랭킹 계약으로 설계하고 온라인에서 검증하는 일이다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration of an LLM-native recommendation system transforming user viewing history, content metadata, and real-time context into a constrained ranking list, dark navy background, teal data paths, amber quality gate, modern flat vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-llm-recommendation-context-engineering-2026"
  save_as: "thumbnail.png"
-->

내가 보기엔 LLM 추천 시스템의 핵심은 “사용자에게 말로 작품을 추천해 주는 챗봇”이 아니다. 더 중요한 변화는, 수년간 쌓인 사용자 행동·콘텐츠 메타데이터·현재 맥락을 어떤 텍스트 입력으로 압축하고, 그 결과가 반드시 우리 카탈로그 안에서 비용 한도 내의 랭킹으로 돌아오게 만드는 일이다. 8월 3일 Hacker News 새 글 목록에 노출된 Netflix의 GenRec 사례는 이 경계를 잘 보여준다. Netflix는 전통적인 추천 스택의 수천 개 수작업 feature를 그대로 흉내 내기보다, 사용자 이력과 아이템 정보를 자연어 context로 바꾼 뒤 LLM에 카탈로그 인지 scoring head를 붙였다. 하지만 범용 LLM만 붙이면 인기 콘텐츠 편향, 카탈로그 밖 작품 환각, 비즈니스 제약 무시가 생긴다고 명시한다. 따라서 한국 개발팀이 이 흐름에서 가져갈 질문은 “우리도 LLM으로 추천할까”가 아니라, **어떤 신호를 남기고 무엇을 버리며, 추천 결과를 어떤 계약으로 제한하고, 기존 랭커보다 나아졌다는 것을 어떻게 온라인에서 증명할까**다.

## 추천의 입력 단위가 feature에서 context로 바뀐다

전통적 추천 시스템은 사용자·아이템·상호작용마다 수많은 dense feature와 임베딩을 만들고, 시퀀스 모델·feature interaction·다중 목표 모델을 조합한다. 강력하지만 새로운 콘텐츠 유형이나 노출면을 추가할 때 feature 파이프라인, 모델 구조, 실험 인프라를 함께 손봐야 한다.

GenRec은 이 입력을 자연어로 verbalize한다. 최근 시청 이력, 디바이스·시간·노출면 같은 현재 맥락, 작품 메타데이터를 하나의 입력으로 구성하고, Netflix 데이터에 맞춘 foundation LLM을 랭킹 목적에 맞게 추가 학습한다. 이 방식의 장점은 새 신호를 모델별 feature 코드에 즉시 박기보다 context 형식에 추가해 실험할 수 있다는 점이다. 반대로 prompt가 곧 feature vector가 되므로, 문장 몇 줄을 임의로 늘리는 방식은 재현성과 비용을 동시에 망친다.

여기서 context engineering은 카피라이팅이 아니다. 각 신호가 랭킹 품질에 기여하는지, 최신성은 충분한지, 토큰을 얼마나 쓰는지 측정하는 데이터 계약이다. Netflix는 낮은 신호의 짧은 재생·빠른 hover는 빼고, 반복 시청은 압축하며, 중요한 최근 상호작용과 cold-start 콘텐츠는 더 자세히 남기는 방식을 공개했다. 긴 이력이 많다고 좋은 추천이 나오는 것은 아니다.

![사용자 이력과 현재 맥락을 선택·압축해 LLM 랭킹 입력으로 만드는 흐름](/images/library/llm-recommendation-context-engineering-2026/01_context-budget.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration showing raw user interaction events entering a context engineering filter: high-signal recent events retained, repetitive behavior compressed, low-signal events removed, then a compact prompt enters an LLM ranking model, deep navy background, teal cards, amber token budget gauge, clean flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-llm-recommendation-context-engineering-2026"
  save_as: "01_context-budget.png"
-->

## LLM 추천은 생성 모델이 아니라 제약된 랭커로 시작해야 한다

추천 작업에서 가장 위험한 착각은 자연어 생성이 자연스럽기 때문에 추천 결과도 안전하다고 보는 것이다. 범용 모델은 존재하지 않는 항목을 그럴듯하게 말하거나, 전체적으로 인기 있는 항목을 과도하게 추천하고, 지역·연령·재고·계약 같은 서비스 제약을 알지 못할 수 있다. 추천은 문장 품질보다 “실제로 제공 가능한 선택지의 순서”가 먼저다.

Netflix의 설계는 이 점에서 실용적이다. LLM이 prompt를 읽은 뒤 decoder로 작품명을 한 토큰씩 생성하는 대신, pooled representation에 catalog-aware scoring head를 붙여 내부 카탈로그의 항목만 점수화한다. 즉 자연어 입력의 표현력은 얻되, 출력 공간은 서비스가 통제하는 카탈로그로 제한한다. 작은 팀도 같은 원칙을 적용할 수 있다. LLM이 최종 추천 목록을 자유 생성하게 두기보다 후보군을 먼저 만들고, 검증된 item ID에만 점수를 매기거나, 결과 ID가 허용 목록에 있는지 후단에서 검사한다.

```text
ranking_contract
1. 후보 item_id는 현재 공개·판매·제공 가능한 카탈로그에서만 만든다.
2. context에는 수집 목적과 보존 기간이 정해진 사용자 신호만 넣는다.
3. ranker 출력은 item_id, score, model_version, context_version을 포함한다.
4. 허용되지 않은 item_id 또는 누락된 필드는 추천으로 노출하지 않고 재조회한다.
5. 클릭뿐 아니라 반품·이탈·장기 만족도 같은 후속 신호를 따로 기록한다.
```

이 계약은 모델 선택과 무관하게 남는다. 특히 개인화 데이터는 편리한 문맥이면서 동시에 민감한 데이터다. 사용자 이력을 자연어로 바꿨다고 익명화되는 것은 아니다. 팀은 원문 로그 접근, prompt 구성, 모델 호출, 결과 노출을 분리하고 각 단계에 데이터 등급과 보존 정책을 붙여야 한다.

## 비용은 출력 토큰보다 context 예산에서 먼저 결정된다

LLM 추천은 대량 트래픽에서 비용이 빠르게 커질 수 있다. Netflix는 서빙 비용의 주요 요인으로 모델 크기, context 길이, 추론 모드를 꼽으며, GenRec은 autoregressive decoding 대신 prefill-only 모드에서 전체 후보를 한 번의 forward pass로 점수화한다고 설명한다. 이 선택은 “추천 문장을 멋지게 생성”하는 목표보다 안정적인 랭킹 비용을 우선한다는 뜻이다.

공개된 실험에서 Netflix는 context token을 원래 예산의 약 3분의 1로 줄이면서 offline ranking metric의 저하가 거의 없었다고 밝혔다. 서빙 비용은 context 길이에 대체로 비례하므로, 같은 방향의 비용 감소가 관찰됐다는 설명도 덧붙였다. 이 수치를 모든 서비스의 보장으로 복사하면 안 된다. 데이터 밀도, 모델, 후보군, 사용자 행동이 다르기 때문이다. 다만 측정 방식은 바로 가져올 수 있다. 이벤트 수를 조금씩 늘리고, MRR·NDCG·전환·p95 latency·요청당 비용을 함께 그려서 품질 곡선의 elbow point를 찾는다.

![카탈로그 제약, prefill-only 추론, 온라인 실험이 연결된 LLM 추천 운영 구조](/images/library/llm-recommendation-context-engineering-2026/02_constrained-ranking.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished AI infrastructure illustration of an LLM recommendation serving stack: compact context prompt, catalog-aware scoring head, prefill-only inference, allowed item ID validator, A/B experiment dashboard, deep navy background with teal flows and amber control gates, modern flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-llm-recommendation-context-engineering-2026"
  save_as: "02_constrained-ranking.png"
-->

## 내 의견: LLM은 feature store를 없애는 마법이 아니라 실험 책임을 더 앞당긴다

내 의견은 분명하다. LLM-native 추천의 매력은 수천 개 feature를 완전히 없애는 데 있지 않다. 어떤 이력과 메타데이터를 어떤 순서·밀도로 보낼지 바꾸는 실험 속도를 높이는 데 있다. 가벼운 반론도 있다. 자연어 context는 구조화된 feature보다 느리고 비싸며, 설명하기 어렵다는 지적이다. 맞다. 그래서 전체 추천 경로를 한 번에 LLM으로 대체하면 안 된다. 카탈로그 제약, context 버전, 비용 상한, 기존 랭커와의 동시 A/B를 먼저 붙여야 한다. LLM을 새로운 UI 장난감이 아니라 측정 가능한 ranker로 취급할 때만, feature engineering의 복잡성을 context engineering의 혼란으로 바꾸지 않을 수 있다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서 이 사례의 실용적인 결론은 작다. 콘텐츠·상품·문서 추천을 자동화하기 전에 자유 생성된 제목을 바로 노출하지 말고, 먼저 허용된 항목 목록과 랭킹 계약을 만든다. 그 뒤 사용자 이력은 많이 넣는 대신 좋은 신호만 남기고, context 버전별 품질·지연·비용을 같은 대시보드에서 비교한다. 좋은 추천은 모델이 ‘취향을 안다’고 말하는 데서 나오지 않는다. 어떤 근거로 어떤 선택지를 어떤 비용으로 위로 올렸는지 다시 설명할 수 있을 때 운영 가능한 추천이 된다.

## 참고 자료

- [GenRec: Towards LLM-Native Recommendation at Netflix — Netflix Technology Blog, 2026-08-03 확인](https://netflixtechblog.com/genrec-towards-llm-native-recommendation-at-netflix-f20be6f643e3)
- [GenRec: Towards LLM-Native Recommendation at Netflix — Hacker News item, 2026-08-03 확인](https://news.ycombinator.com/item?id=49146751)
- [In-House LLM Serving at Netflix — OpenAI 호환·vLLM 서빙 경계 참고](https://netflixtechblog.com/in-house-llm-serving-at-netflix-a5a8e799ea2c)
