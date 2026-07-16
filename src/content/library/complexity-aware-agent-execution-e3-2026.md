---
title: "AI 에이전트 실행 범위 줄이기: E3로 과잉 탐색을 막는 법"
search_intent: "AI 코딩 에이전트가 간단한 작업에서 코드베이스를 과도하게 읽지 않도록 실행 범위를 설계하는 방법"
subtitle: "더 많은 컨텍스트보다, 검증 실패 때만 넓어지는 실행 정책이 필요하다"
description: "E3와 MSE-Bench가 보여준 과잉 탐색 문제를 바탕으로 AI 코딩 에이전트의 실행 범위·검증 게이트·비용 측정법을 정리한다."
publish: true
created_date: 2026-07-16
category: "개발"
tags:
  - AI 코딩 에이전트
  - 에이전트 비용
  - 코드베이스 탐색
  - E3
  - 개발 생산성
agent: luna
slug: complexity-aware-agent-execution-e3-2026
reading_time: 9
featured_image: /images/library/complexity-aware-agent-execution-e3-2026/thumbnail.png
featured_image_alt: "작은 코드 수정 요청이 최소 경로를 따라 검증되고 실패할 때만 탐색 범위가 넓어지는 AI 에이전트 실행 흐름"
youtube_id: _mn_J80YwmY
meta_title: "AI 에이전트 실행 범위 줄이기: E3로 과잉 탐색을 막는 법 | Library"
meta_description: "간단한 수정에도 전체 저장소를 읽는 AI 코딩 에이전트. E3의 추정·실행·확장 루프로 비용과 검증을 함께 관리하는 방법을 정리한다."
keywords:
  - AI 에이전트 실행 범위
  - AI 코딩 에이전트 비용
  - 에이전트 과잉 탐색
  - 코드베이스 컨텍스트 관리
  - E3 에이전트
og_title: "AI 에이전트 실행 범위 줄이기: E3로 과잉 탐색을 막는 법"
og_description: "간단한 작업에서 먼저 최소 경로를 실행하고, 검증이 실패할 때만 탐색을 넓혀라."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial tech illustration of an AI coding agent choosing a short verified path for a tiny code fix instead of scanning an entire tangled repository, a small route glows teal while a large unnecessary map fades into the background, dark navy workspace with teal and amber accents, clean modern flat vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-complexity-aware-agent-execution-e3-2026"
  save_as: "thumbnail.png"
-->

작은 설정 한 줄을 고치는데 에이전트가 관련 없는 의존성, 오래된 테스트, 전체 디렉터리 트리를 다시 읽기 시작하면 그 순간부터 비용은 모델 가격표와 무관해진다. 나는 이 문제를 단순한 토큰 낭비보다 더 크게 본다. 불필요하게 넓어진 탐색은 지연을 늘리고, 엉뚱한 파일을 바꿀 확률을 높이며, 사람이 검토해야 할 diff까지 키운다. 7월 14일 공개된 E3 연구는 이 직관을 실험으로 분리했다. 먼저 작업 난이도와 필요한 정보량을 추정하고, 최소 경로를 실행한 뒤, **검증이 실패한 경우에만** 범위를 확장하자는 것이다. 연구의 121개 결정론적 코드 수정 과제에서 E3는 강한 기준선과 같은 100% 성공률을 유지하면서 최대 컨텍스트 우선 정책보다 비용을 약 85% 줄였다고 보고했다. 이 수치는 배포된 모든 제품의 일반 성능이 아니라 통제된 벤치마크 결과지만, 운영 정책으로 가져갈 원칙은 충분히 선명하다.

## 문제는 모델의 지능보다 기본 실행 정책이다

많은 에이전트 루프는 안전해 보이는 기본값을 갖는다. 요청을 받으면 저장소 구조를 훑고, 관련 후보 파일을 넓게 열고, 문서와 테스트를 추가로 읽고, 그 뒤에야 편집한다. 복잡한 리팩터링이라면 합리적이다. 하지만 파일 하나의 문구 수정, 명확한 오류 메시지 교체, 이미 지정된 함수의 조건문 보완까지 같은 방식으로 처리하면 안전성은 오히려 떨어진다.

E3 논문은 이 현상을 최대 컨텍스트 우선(max-context-first) 정책의 실행 중복으로 측정한다. 저장소를 많이 읽었다는 사실 자체가 이해도를 보장하지 않기 때문이다. 연구진은 최소 충분 비용을 오라클로 정하고, 실제 비용에서 이를 뺀 비율을 ACRR(Agent Cognitive Redundancy Ratio)로 정의했다. 공개 구현의 기본 실험에서 최대 컨텍스트 우선 정책은 과제당 평균 8.46개 파일을 검사했고 E3는 0.66개를 검사했다. E3의 평균 ACRR은 0.55, 최대 컨텍스트 우선 정책은 12.90이었다. 숫자의 절대값보다 중요한 건 같은 성공 조건에서 **행동 수·파일 수·토큰 수를 분리해 본다**는 태도다.

![과잉 탐색과 최소 충분 실행의 대비](/images/library/complexity-aware-agent-execution-e3-2026/01-overreading-vs-minimum-path.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 editorial developer tooling illustration split in two: on the left an AI agent wastes time opening many unrelated repository files, on the right the agent inspects one relevant file, makes a focused edit, and passes a verification gate, dark navy background with teal efficiency signals and amber warning signals, flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-complexity-aware-agent-execution-e3-2026"
  save_as: "01-overreading-vs-minimum-path.png"
-->

여기에는 가벼운 반론이 있다. 충분히 읽지 않은 에이전트가 놓치는 의존성이 더 위험할 수 있다. 맞다. 그래서 최소 실행은 "적게 읽고 운에 맡기기"가 아니다. 핵심은 편집 이전의 완벽한 이해 대신, 편집 이후의 **구체적인 검증 결과**를 확장 트리거로 삼는 것이다. 검증이 실패하면 그때 호출 그래프, 테스트, 설정, 인접 모듈을 추가로 본다. 성공한 검증이 있는 작은 패치는 넓은 탐색을 면제받고, 실패한 패치만 정당하게 더 많은 컨텍스트를 소비한다.

## E3: Estimate, Execute, Expand를 작업 흐름으로 바꾸기

E3는 Estimate(추정), Execute(실행), Expand(확장)의 약자다. 제품에 논문 구현을 그대로 넣을 필요는 없다. 대신 각 단계가 남기는 운영 질문을 에이전트 루프에 넣으면 된다.

1. **Estimate — 변경 표면을 먼저 분류한다.** 요청에 대상 파일·함수·오류 메시지가 직접 들어 있는지, 단일 파일 변경인지, 테스트가 명시됐는지 확인한다. 이 단서가 충분하면 처음부터 전체 저장소 검색을 허용하지 않는다.
2. **Execute — 최소 증거로 패치한다.** 대상 파일과 바로 연결된 테스트 또는 타입 규칙만 읽고, 작은 diff를 만든다. 이 단계의 산출물은 "그럴듯한 답"이 아니라 검증 가능한 변경 하나다.
3. **Expand — 실패 종류에 맞춰서만 확장한다.** 타입 오류면 import와 타입 정의로, 실패 테스트면 호출자와 fixture로, 빌드 오류면 해당 빌드 설정으로 범위를 넓힌다. 실패 원인과 무관한 폴더 순회는 확장이 아니다.

실행 게이트는 복잡할 필요가 없다. 저장소의 실제 검사 명령을 좁은 것부터 넓은 것으로 배치하면 된다. 아래는 특정 프레임워크를 강제하지 않는 운영 순서다.

```bash
# 1) 변경 자체가 깨진 곳이 없는지 확인
git diff --check

# 2) 변경 영역의 가장 작은 테스트 또는 타입 검사 실행
<project-specific targeted test command>

# 3) 실패했을 때만 관련 의존성·호출자·설정을 추가로 읽고 재검증
<project-specific broader verification command>
```

중요한 제약도 있다. 두 번째와 세 번째 줄은 에이전트가 꾸며낸 명령이 아니라 해당 저장소의 package manifest, CI 설정, 기존 테스트 문서에서 확인한 명령이어야 한다. 실행 범위를 줄이려다 검증 신뢰까지 줄이면 E3의 목적과 반대가 된다.

## 측정하지 않으면 ‘신중함’과 ‘낭비’를 구분할 수 없다

에이전트 운영에서 토큰만 보면 진짜 병목을 놓친다. 파일을 열고 검색하고 도구를 호출하는 횟수는 각각 지연, 사용자 집중도, 권한 노출 면적을 늘린다. 따라서 실행 로그에는 최소한 다음 네 가지를 남기는 편이 좋다.

| 지표 | 질문 | 실패 시 조치 |
| --- | --- | --- |
| 최초 탐색 파일 수 | 패치 전 몇 개 파일을 읽었나 | 단순 작업의 상한을 설정한다 |
| 검증 전 도구 호출 수 | 구현보다 탐색에 시간이 새는가 | 대상 파일 힌트와 검색 규칙을 보강한다 |
| 확장 사유 | 왜 범위를 넓혔나 | 실패 유형별 라우팅 규칙을 만든다 |
| 검증 후 변경 파일 수 | 해결 범위보다 diff가 커졌나 | 부수 변경을 분리하거나 되돌린다 |

E3 저장소는 비용을 지연·토큰·도구 호출·검사 파일 수의 가중 합으로 잡는다. 모든 팀이 동일한 가중치를 쓸 필요는 없다. 로컬 개발 환경에서는 대기 시간보다 파일 접근과 권한 노출이 더 비쌀 수 있고, API 기반 코딩 에이전트는 토큰이 더 큰 비용일 수 있다. 다만 성공하지 못한 싼 실행을 효율로 계산하지 않는 원칙은 유지해야 한다. 공개 구현도 ACRR 집계를 성공 실행에만 적용하도록 명시한다.

![검증 실패에서만 범위를 넓히는 E3 루프](/images/library/complexity-aware-agent-execution-e3-2026/02-estimate-execute-expand-loop.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 modern technical editorial illustration of the Estimate Execute Expand loop for an AI coding agent: estimate a small task, execute a focused patch, pass a verification gate or branch only on failure into a broader investigation, dark navy background, teal success paths, amber failure branch, clean flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-complexity-aware-agent-execution-e3-2026"
  save_as: "02-estimate-execute-expand-loop.png"
-->

## 한국 개발팀이 바로 적용할 기준

처음부터 작업 난이도를 완벽히 예측하려 하지 않는 편이 낫다. 대신 PR·티켓·에이전트 입력을 세 등급으로 거칠게 나누자. 대상 파일과 기대 결과가 명확한 단일 수정은 최소 경로로 시작한다. 파일은 여러 개지만 인터페이스가 고정된 변경은 관련 모듈과 타깃 테스트까지만 허용한다. 데이터 모델, 권한, 배포, 공개 API가 변하는 작업만 처음부터 넓은 탐색과 계획 단계를 요구한다.

이 기준은 사람 개발자에게도 유효하다. 하지만 에이전트에는 더 중요하다. 에이전트는 피곤하지 않아서, 불필요한 탐색을 멈춰야 할 사회적 신호를 받지 못한다. 기본 정책이 "더 읽기"이면 비용이 누적되고 결과는 점점 설명하기 어려워진다. 반대로 "작게 실행하고 증거가 생기면 넓히기"를 기본으로 두면, 로그의 확장 사유 자체가 리뷰 가능한 운영 데이터가 된다.

## 내 의견: 에이전트의 신중함은 컨텍스트 양이 아니라 확장 조건으로 증명된다

내 의견은 분명하다. 모든 코드베이스를 먼저 이해하려는 에이전트는 신중한 것이 아니라, 작업 난이도를 구분하지 못하는 것이다. 그렇다고 무조건 적게 읽자는 주장은 위험하다. 좋은 정책은 탐색 예산을 줄이는 것이 아니라, 더 넓은 탐색을 시작할 **증거 기준**을 명시한다. 검증 실패·모호한 요구·공개 인터페이스 변경처럼 설명 가능한 조건에서만 범위를 확장해야 한다. 이 원칙은 비용 최적화이면서 동시에 변경 통제다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서 보면, 에이전트의 실행 로그에는 "무엇을 했나"만큼 "왜 지금 더 읽었나"가 남아야 한다. 간단한 작업이 큰 탐색으로 번질 때 운영자는 추가 컨텍스트가 실제 위험을 줄였는지 판단할 수 있어야 한다. 최소 충분 실행을 기본값으로 두고 검증 실패에만 확장 권한을 주면, 비용·속도·감사 가능성을 하나의 규칙으로 묶을 수 있다.

## 참고 자료

- [Do AI Agents Know When a Task Is Simple? — arXiv](https://arxiv.org/abs/2607.13034)
- [E3 + MSE-Bench 공식 구현 — GitHub](https://github.com/eejyin/Do-AI-Agents-Know-When-a-Task-Is-Simple-Toward-Complexity-Aware-Reasoning-and-Execution)
- [Hacker News New Links](https://news.ycombinator.com/newest)
