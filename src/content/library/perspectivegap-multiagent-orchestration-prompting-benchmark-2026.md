---
title: "멀티에이전트 오케스트레이터, 왜 자꾸 실패하나 — PerspectiveGap이 밝힌 14.9%의 충격"
subtitle: "서브에이전트에게 무엇을 알려줄지 모르는 것이 오케스트레이션의 핵심 취약점"
description: "PerspectiveGap 벤치마크가 27개 LLM을 테스트한 결과, 멀티에이전트 오케스트레이션 프롬프팅 평균 합격률이 14.9%에 불과했다. 멀티에이전트 시스템을 운영하는 개발자라면 지금 당장 읽어야 할 구조적 취약점 분석."
publish: true
created_date: 2026-06-10
category: "AI"
tags:
  - 멀티에이전트
  - AI 오케스트레이션
  - 벤치마크
  - LLM 성능
  - 에이전트 시스템
agent: cheese
slug: perspectivegap-multiagent-orchestration-prompting-benchmark-2026
reading_time: 8
featured_image: /images/library/perspectivegap-multiagent-orchestration-prompting-benchmark-2026/thumbnail.png
featured_image_alt: "멀티에이전트 오케스트레이션 네트워크에서 컨텍스트 누락으로 실패하는 서브에이전트 시각화"
meta_title: "멀티에이전트 오케스트레이터 14.9% 합격률 — PerspectiveGap 벤치마크 분석 | Library"
meta_description: "PerspectiveGap 벤치마크: 27개 LLM 멀티에이전트 오케스트레이션 프롬프팅 평균 합격률 14.9%. GPT-5.5 62% vs 나머지의 처참한 격차 분석."
keywords:
  - multiagent orchestration benchmark
  - PerspectiveGap arXiv 2606.08878
  - LLM orchestration prompting
  - 멀티에이전트 실패 원인
  - AI agent context distribution
og_title: "멀티에이전트 오케스트레이터가 자꾸 실패하는 이유 — 14.9% 합격률의 충격"
og_description: "PerspectiveGap 벤치마크가 밝힌 멀티에이전트 오케스트레이션의 핵심 취약점과 GPT-5.5 vs Claude 격차 분석"
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "Abstract network diagram showing an orchestrator node at top sending context fragments to multiple sub-agent nodes below, with some nodes missing critical information shown as empty puzzle pieces, flat illustration, tech aesthetic, dark background with cyan and red accent nodes, minimal style"
  aspect_ratio: "4:3"
  session_id: "library-perspectivegap-multiagent-orchestration-prompting-benchmark-2026"
  save_as: "thumbnail.png"
-->

멀티에이전트 시스템을 직접 운영해본 사람이라면 경험으로 알고 있다. 오케스트레이터가 서브에이전트를 잘못 지시하면 전체 파이프라인이 조용히 망가진다. 에러 메시지도 없이, 그냥 틀린 결과물이 나온다.

이제 그 실패를 정량화한 벤치마크가 나왔다. **PerspectiveGap** (arXiv:2606.08878) — 27개 상용 LLM을 테스트한 결과, 멀티에이전트 오케스트레이션 프롬프팅 평균 합격률은 **14.9%** 였다.

## PerspectiveGap이 측정하는 것

PerspectiveGap의 핵심 질문은 단순하다: *"오케스트레이터는 각 서브에이전트에게 무엇을 알려줘야 하는가?"*

이걸 제대로 하는 LLM이 거의 없다는 게 이 벤치마크의 발견이다.

벤치마크 구성:
- **110개 시나리오**, 각각 두 가지 포맷으로 평가
  - **role-fragment assignment**: 역할 조각을 올바른 에이전트에 배정
  - **free-form prompt writing**: 서브에이전트 프롬프트를 자유 형식으로 작성
- **10가지 토폴로지**: 연구팀의 실제 엔지니어링 경험에서 추출한 오케스트레이션 패턴
- **Prompt Economy 원칙** 기반: 최소한의 역할과 엔지니어링 오버헤드로 최대 유틸리티를 달성하는 루프 중심 설계

![PerspectiveGap 벤치마크 측정 구조 — 오케스트레이터 컨텍스트 분배 평가](/images/library/perspectivegap-multiagent-orchestration-prompting-benchmark-2026/01_benchmark-structure.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Clean infographic showing 3 columns: left column shows orchestrator with task, middle column shows 10 topology patterns as simple node graphs, right column shows pass/fail evaluation with percentage scores, flat design, soft blue and white palette, minimal labels"
  aspect_ratio: "16:9"
  session_id: "library-perspectivegap-multiagent-orchestration-prompting-benchmark-2026"
  save_as: "01_benchmark-structure.png"
-->

## 14.9% — 생각보다 훨씬 심각한 수치

27개 모델, 10개 회사의 테스트 결과를 보면 격차가 충격적이다.

| 모델 | 합격률 | leakage rate |
|------|--------|-------------|
| GPT-5.5 | **62.0%** | 49.1% |
| 나머지 평균 | **14.9%** | 246.5% |

두 가지 수치 모두 중요하다.

**합격률(combined pass rate)** 은 오케스트레이터가 서브에이전트에게 필요한 컨텍스트를 얼마나 정확하게 전달하는지를 측정한다. GPT-5.5의 62%도 낮은 편이지만, 평균 14.9%는 "거의 못 한다"는 수준이다.

**leakage rate** 는 더 흥미롭다. 246.5%라는 수치는 비율(proportion)이 아니라 시나리오당 정보 누출 이벤트 수다. 쉽게 말하면, 오케스트레이터가 서브에이전트에게 알아서는 안 되는 정보까지 흘려보내는 빈도가 극도로 높다는 뜻이다. GPT-5.5는 49.1%로 상대적으로 낮다.

## Claude Opus 4.7의 의외의 약점

벤치마크에서 흥미로운 발견 중 하나는 **Claude Opus 4.7**이다. 코딩 성능에서는 강세를 보이지만, 오케스트레이션 프롬프팅에서는 주목할만한 약점을 드러냈다.

이는 중요한 시사점이다. *코딩을 잘한다 ≠ 오케스트레이션을 잘한다.* 두 능력은 서로 다른 차원의 문제다.

- **코딩 성능**: 주어진 컨텍스트 안에서 정확한 코드를 생성하는 능력
- **오케스트레이션 프롬프팅**: 다른 에이전트의 관점에서 그 에이전트가 무엇을 알아야 하는지 판단하는 능력

후자는 일종의 **관점 전환(perspective-taking)** 능력이다. 오케스트레이터가 서브에이전트의 입장에서 "나는 무엇을 알아야 이 태스크를 완료할 수 있나?"를 모델링하는 것. 이걸 PerspectiveGap이라고 이름 붙인 이유다.

![모델별 PerspectiveGap 성능 비교 — 합격률과 leakage rate](/images/library/perspectivegap-multiagent-orchestration-prompting-benchmark-2026/02_model-comparison.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Bar chart visualization comparing AI model orchestration performance, GPT-5.5 bar significantly taller in green showing 62%, all other model bars in gray clustered low around 15%, leakage rate shown as secondary metric in red overlay, clean data visualization style, white background"
  aspect_ratio: "16:9"
  session_id: "library-perspectivegap-multiagent-orchestration-prompting-benchmark-2026"
  save_as: "02_model-comparison.png"
-->

## 한국 AI 개발자에게 실질적인 의미

멀티에이전트 시스템을 실제로 운영하는 입장에서 이 결과가 의미하는 것:

**1. 오케스트레이터 프롬프트를 더 정교하게 설계해야 한다**

현재 대부분의 멀티에이전트 구현에서 오케스트레이터 프롬프트는 "이런 태스크가 있으니 이 서브에이전트들을 써라" 수준에 머물러 있다. PerspectiveGap이 측정하는 것은 그 너머 — 각 서브에이전트에게 어떤 컨텍스트 슬라이스를 넘겨야 하는지의 판단이다.

**2. 컨텍스트 격리가 기본값이어야 한다**

leakage rate 246.5%는 오케스트레이터가 "필요한 것만 전달"보다 "아는 것 전부 전달" 방식으로 작동하는 경향을 보여준다. 멀티에이전트 시스템에서 컨텍스트 격리는 성능 최적화가 아니라 정확성의 문제다.

**3. 모델 선택 기준에 오케스트레이션 능력을 추가해야 한다**

코딩 벤치마크(HumanEval, SWE-bench)만으로 모델을 선택하면 오케스트레이션 성능을 놓친다. 멀티에이전트 파이프라인의 오케스트레이터 역할에는 PerspectiveGap 같은 오케스트레이션 특화 벤치마크가 필요하다.

**4. Prompt Economy 원칙을 설계에 반영하라**

벤치마크가 기반으로 삼은 Prompt Economy 원칙은 실용적이다: *최소한의 역할과 오버헤드로 최대 유틸리티*. 에이전트 수를 늘리는 것보다, 각 에이전트에게 무엇을 전달할지를 최적화하는 것이 더 효과적인 멀티에이전트 설계의 핵심이다.

---

PerspectiveGap은 멀티에이전트 오케스트레이션이 코딩 능력과 분리된, 별도로 평가되어야 할 역량임을 처음으로 정량화했다. 평균 14.9%는 현재 모델들이 이 문제를 아직 풀지 못했음을 보여준다. 동시에, GPT-5.5의 62%는 이 능력이 충분히 개선 가능한 영역임도 보여준다.

오케스트레이터가 서브에이전트의 관점을 얼마나 잘 이해하느냐 — 그게 멀티에이전트 시스템의 실질적 성능을 결정하는 숨겨진 변수다.

> 📄 논문 원문: [PerspectiveGap: A Benchmark for Multi-Agent Orchestration Prompting](https://arxiv.org/abs/2606.08878) (arXiv:2606.08878, 2026-06-07)

KPI impact: library_draft = 1

## 참고 자료

- [PerspectiveGap: A Benchmark for Multi-Agent Orchestration Prompting](https://arxiv.org/abs/2606.08878) — arXiv:2606.08878 원문 논문
- [PerspectiveGap 논문 HTML 전문](https://arxiv.org/html/2606.08878) — arXiv HTML 뷰어
