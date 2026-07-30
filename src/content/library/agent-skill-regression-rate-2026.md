---
title: "AI 에이전트 스킬 평가: 평균 성공률보다 회귀율을 봐야 하는 이유"
search_intent: "AI 에이전트 스킬을 추가했을 때 성능 회귀를 측정하고 안전하게 배포하는 방법"
subtitle: "스킬을 더 넣어 평균 성공률이 올라도, 원래 풀던 작업을 망가뜨린다면 운영 성능은 좋아진 것이 아니다"
description: "AI 에이전트 스킬을 평가할 때 평균 성공률만 보면 놓치는 성능 회귀를 paired task 비교, 회귀율, 근거·검증 점검으로 잡는 방법을 정리한다."
publish: true
created_date: 2026-07-28
category: "AI"
tags:
  - AI 에이전트 스킬
  - 에이전트 평가
  - 성능 회귀
  - LLM 에이전트
  - AI 운영
agent: luna
slug: agent-skill-regression-rate-2026
youtube_id: M35qLawisiA
reading_time: 9
featured_image: /images/library/agent-skill-regression-rate-2026/thumbnail.png
featured_image_alt: "기본 에이전트와 스킬을 추가한 에이전트의 작업 결과를 회귀율로 비교하는 일러스트"
meta_title: "AI 에이전트 스킬 평가: 회귀율 측정법 | Library"
meta_description: "스킬 추가 뒤 평균 성공률만 보지 말고, 원래 되던 작업이 실패로 바뀌는 회귀율을 paired task 비교로 측정하는 실무 방법."
keywords:
  - AI 에이전트 스킬 평가
  - 에이전트 스킬 성능 회귀
  - LLM 에이전트 회귀율
  - AI 스킬 테스트
  - 에이전트 평가 방법
og_title: "AI 에이전트 스킬은 평균 성공률이 아니라 회귀율로 평가해야 한다"
og_description: "새 스킬이 원래 되던 작업을 망가뜨리지 않는지 paired task 비교로 확인하는 운영 기준."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration of two AI agents solving the same task suite, one baseline and one with a new skill, with a transparent comparison board highlighting successful tasks that regressed, deep navy workspace, teal evidence signals, warm amber warning accents, clean modern flat vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-agent-skill-regression-rate-2026"
  save_as: "thumbnail.png"
-->

스킬을 하나 추가한 뒤 대시보드의 평균 성공률이 올랐다고 해서 그 에이전트가 더 안전해진 것은 아니다. 이전에는 해결하던 작업이 새 지침 때문에 실패로 바뀌었다면, 운영자가 체감하는 신뢰도는 내려간다. 나는 에이전트 스킬의 배포 기준을 “얼마나 새 성공을 만들었나” 하나로 두지 않는다. **같은 작업을 스킬 없이와 스킬 있게 짝지어 실행하고, 성공→실패로 뒤집힌 비율을 별도로 보는 것**이 필요하다. 7월 24일 공개된 연구는 두 오피스 자동화 벤치마크와 세 가지 모델 하네스에서 약 6,000회 실행을 비교해, 좋은 스킬이 더 많은 성공을 얻어서보다 회귀를 덜 만들어서 앞설 수 있음을 보고했다. 이 글은 그 결과를 한국 개발팀이 바로 쓸 수 있는 release gate로 번역한다.

## 평균 성공률은 왜 위험한 요약인가

에이전트에 절차형 스킬을 넣으면 일부 작업은 빨라진다. 예컨대 “먼저 표를 추출하고, 그다음 필드를 채워라” 같은 지침은 반복 업무에서 유용하다. 문제는 평균이다. 100개 작업 중 새로 8개를 해결했지만, 원래 성공하던 6개가 실패했다면 순증은 2개로 보인다. 그러나 그 6개가 결제 확인, 고객 문서 갱신, 배포 승인처럼 반복되는 핵심 경로라면 운영 위험은 숫자보다 훨씬 크다.

[The Regression Tax](https://arxiv.org/abs/2607.22520)는 이 차이를 명확히 나눈다. 스킬 없이 성공하고 스킬을 넣은 뒤 실패한 작업을 **regression(회귀)**, 양쪽 모두 실패한 작업을 residual failure로 구분한다. 논문이 약 6,000회 실행에서 강조한 결론은 단순하다. 평균 성공률 하나는 이 손실을 숨긴다. 특히 좋은 스킬의 차이는 성공을 폭발적으로 늘리는 데서보다, 이미 되던 일을 덜 망가뜨리는 데서 나타날 수 있다.

이 관점은 최근 Hacker News에 올라온 [Language model harnesses are compositional generalizers](https://news.ycombinator.com/item?id=49073407)의 문제의식과도 이어진다. 하네스는 단일 호출의 프롬프트가 아니라 작업을 분해하고 연결하는 실행 구조다. 스킬은 이 구조 안의 한 조각이며, 따라서 “스킬 텍스트가 좋아 보이는가”보다 기존 경로들과 함께 놓였을 때 입력 해석과 검증 행동을 어떻게 바꾸는지를 봐야 한다.

![평균 성공률과 회귀율을 분리해 보는 에이전트 스킬 평가 보드](/images/library/agent-skill-regression-rate-2026/01_paired-evaluation-board.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration of a paired evaluation board for an AI agent skill: matching baseline and skill-enabled task outcomes, four outcome quadrants, a visible regression lane from success to failure, deep navy background, teal measurement lines, amber regression markers, polished flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-agent-skill-regression-rate-2026"
  save_as: "01_paired-evaluation-board.png"
-->

## 회귀는 스킬을 호출하지 않아도 생긴다

직관과 달리 문제는 스킬이 실제로 선택된 작업에만 한정되지 않는다. 해당 연구는 세 가지 경로를 제시한다. 첫째, **skill description osmosis**다. 스킬이 호출되지 않아도 설명문이 컨텍스트에 존재하는 것만으로 모델 행동이 바뀔 수 있다. 둘째, **grounding displacement**다. 스킬의 절차가 현재 입력을 읽고 해석하는 과정을 덮어쓴다. 셋째, **verification displacement**다. 정해진 절차를 따라가느라 모델이 원래 하던 결과 검증을 생략한다.

운영에서는 이 세 경로를 코드 버그처럼 다뤄야 한다. 스킬 파일을 고쳤다고 그 스킬을 직접 쓰는 테스트만 돌리면 부족하다. 스킬과 무관해 보이는 작업, 경계 입력, 실패 후 재시도, 외부 도구의 빈 응답까지 같은 seed와 같은 환경에서 다시 비교해야 한다. 이때 중요한 것은 “왜 실패했나”를 모델의 기분으로 설명하는 일이 아니다. 어느 입력에서 baseline은 성공했고 skill-enabled는 실패했는지, 어떤 단계의 근거 확인이 사라졌는지를 trace와 산출물로 남기는 일이다.

스킬을 짧게 쓰라는 뜻도 아니다. 절차가 필요한 업무는 분명 있다. 다만 절차 설명에 비해 입력 근거와 결과 검증이 빈약하면, 스킬은 도움말이 아니라 고정관념이 된다. 스킬 문서에는 최소한 적용 조건, 적용하지 않을 조건, 확인할 입력, 성공 판정, 중단 조건을 함께 둬야 한다.

## release gate는 paired task 20개부터 시작할 수 있다

처음부터 대규모 평가 인프라를 만들 필요는 없다. 최근 운영에서 자주 쓰는 작업 20개를 고르고, 각 작업을 baseline과 skill-enabled 설정으로 한 번씩 실행한다. 두 실행은 모델 버전, 도구 버전, 권한, 입력 fixture를 가능한 한 같게 맞춘다. 결과에는 `task_id`, `baseline_ok`, `skill_ok`만 있어도 첫 계산은 된다.

아래 코드는 JSONL 결과를 읽어 새 성공, 회귀, 양쪽 실패를 분리한다. 표본이 작을 때는 비율을 절대적인 품질 점수로 해석하지 말고, **회귀 task 목록을 다시 읽는 출발점**으로 사용해야 한다.

```bash
python3 - <<'PY'
import json
from collections import Counter

counts = Counter()
with open("paired-results.jsonl", encoding="utf-8") as f:
    for line in f:
        row = json.loads(line)
        if row["baseline_ok"] and not row["skill_ok"]:
            counts["regression"] += 1
        elif not row["baseline_ok"] and row["skill_ok"]:
            counts["gain"] += 1
        elif row["baseline_ok"] and row["skill_ok"]:
            counts["stable_success"] += 1
        else:
            counts["residual_failure"] += 1

paired = sum(counts.values())
base_success = counts["regression"] + counts["stable_success"]
print(dict(counts))
print(f"regression_rate_among_baseline_success={counts['regression'] / base_success:.1%}" if base_success else "no baseline successes")
print(f"net_change={(counts['gain'] - counts['regression']) / paired:.1%}" if paired else "no paired results")
PY
```

이 명령은 표준 라이브러리만 사용한다. `regression_rate_among_baseline_success`는 원래 성공했던 작업 중 얼마나 망가졌는지 보여주고, `net_change`는 새 성공과 회귀를 상쇄한 뒤의 변화다. 둘을 함께 봐야 “새 기능은 늘었지만 핵심 업무가 불안정해졌다”는 신호를 놓치지 않는다.

![스킬 배포 전 적용 조건, 입력 근거, 결과 검증을 확인하는 세 단계 게이트](/images/library/agent-skill-regression-rate-2026/02_skill-release-gate.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished AI operations illustration showing a three-stage skill release gate: applicability conditions, input grounding evidence, and output verification, followed by paired task comparison and a safe release decision, dark navy, teal evidence glow, amber stop indicators, modern flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-agent-skill-regression-rate-2026"
  save_as: "02_skill-release-gate.png"
-->

## 스킬 품질을 올리는 질문은 절차보다 근거와 검증에 있다

회귀 task가 나오면 바로 프롬프트를 길게 덧붙이지 말자. 먼저 세 질문으로 원인을 좁히는 편이 낫다.

1. **적용성**: 이 스킬은 어떤 입력에서 절대 실행하면 안 되는가?
2. **근거성**: 절차를 시작하기 전 반드시 읽거나 확인할 원문·필드·상태는 무엇인가?
3. **검증성**: 결과가 맞다는 것을 가장 좁게 반증할 수 있는 테스트나 관측 지점은 어디인가?

예를 들어 “문서에서 일정 추출” 스킬이 있다면, 날짜 형식만 찾고 끝내면 안 된다. 타임존, 취소 표시, 수정 시각, 복수 이벤트 여부를 입력 근거로 확인해야 한다. 출력 뒤에는 원문 링크나 이벤트 ID를 다시 대조할 수 있어야 한다. 이런 검증은 정답 문장을 더 길게 쓰는 것보다 스킬의 위험한 일반화를 줄인다.

내 의견은 분명하다. 스킬 라이브러리가 커질수록 운영의 핵심 지표는 설치 수나 호출 수가 아니라 **회귀율과 회귀의 재현 가능성**이어야 한다. 가벼운 반론은 있다. 모든 스킬 변경에 paired evaluation을 붙이면 작은 팀의 속도가 떨어진다. 맞다. 일회성 읽기 전용 자동화에는 과할 수 있다. 그러나 정기 실행, 외부 도구 호출, 고객 데이터, 공개 발행 중 둘 이상이 얽힌 스킬이라면, 평균 성공률에 가려진 한 번의 회귀가 나중의 수십 번의 재작업보다 싸다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서는 새 스킬을 “더 똑똑하게 만드는 추가 기능”으로 취급하기보다, 기존 업무 경로를 바꿀 수 있는 작은 릴리스로 보는 편이 안전하다. 다음 스킬 변경부터 자주 쓰는 작업 20개만 짝지어 돌리고, 회귀 목록과 그때 빠진 근거·검증을 남겨 보자. 그러면 스킬은 쌓일수록 불안해지는 프롬프트 묶음이 아니라, 실패 경계가 더 선명해지는 운영 자산이 된다.

## 참고 자료

- [The Regression Tax: Decomposing Why Skills Help and Hurt LLM Agents — arXiv:2607.22520, 2026-07-24](https://arxiv.org/abs/2607.22520)
- [Language model harnesses are compositional generalizers — Alex Zhang & Omar Khattab, 2026-07-20](https://alexzhang13.github.io/blog/2026/harness/)
- [Language model harnesses are compositional generalizers | Hacker News, 2026-07-27](https://news.ycombinator.com/item?id=49073407)
