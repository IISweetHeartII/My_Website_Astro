---
title: "LLM 추론 하드웨어 벤치마크: LPU·GPU 데모를 배포 판단으로 바꾸는 6개 지표"
search_intent: "LLM 추론 하드웨어 벤치마크에서 LPU GPU NPU 성능을 비교하는 방법과 토큰 속도 측정 기준"
subtitle: "작은 Transformer를 돌린 데모의 교육적 가치는 크지만, 제품 도입 판단에는 모델·정확도·지연 분포·전력까지 같은 영수증에 있어야 한다"
description: "LPU·GPU·NPU LLM 추론 데모를 볼 때 확인할 모델, 정확도, TTFT, 토큰 속도, 동시성, 전력 지표와 재현 가능한 기록법을 정리한다."
publish: true
created_date: 2026-08-25
youtube_id: Hizos8NQiKA
category: "개발"
tags:
  - LLM 추론
  - AI 하드웨어
  - LPU
  - GPU 벤치마크
  - 온디바이스 AI
agent: luna
slug: lpu-lite-inference-benchmark-checklist-2026
reading_time: 9
featured_image: /images/library/lpu-lite-inference-benchmark-checklist-2026/thumbnail.png
featured_image_alt: "작은 Transformer 데모와 실제 LLM 추론 벤치마크 지표를 구분하는 AI 하드웨어 일러스트"
meta_title: "LLM 추론 하드웨어 벤치마크: LPU·GPU 데모 비교법 | 김덕환"
meta_description: "LPU·GPU·NPU LLM 추론 데모를 실제 도입 판단으로 바꾸는 6개 지표와 측정 영수증 형식을 소개한다."
keywords:
  - LLM 추론 하드웨어 벤치마크
  - LLM 추론 벤치마크
  - LPU 성능 비교
  - GPU LLM 속도 측정
  - NPU 추론 성능
og_title: "LLM 추론 하드웨어 데모를 믿기 전 확인할 6개 지표"
og_description: "작은 모델의 빠른 데모와 실제 배포 성능을 혼동하지 않기 위한 모델·정확도·지연·전력 측정법."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration contrasting a tiny transformer chip demo with a production LLM benchmark dashboard, showing model size, latency, throughput, concurrency and power as clear visual gauges; deep navy background, teal evidence lines, warm amber review markers, modern flat technical vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-lpu-lite-inference-benchmark-checklist-2026"
  save_as: "thumbnail.png"
-->

작은 Transformer가 FPGA에서 실제로 다음 글자를 예측하는 장면은 AI 하드웨어를 이해하는 데 훌륭한 출발점이다. LPU Lite는 MicroGPT를 대상으로 self-attention forward pass를 구현했고, 제작자도 이 설계가 상용 LPU의 1:1 복제나 배포용 제품이 아니라 교육용 프로젝트라고 명시한다.[1] 나는 이런 데모를 과소평가할 이유는 없다고 본다. 다만 “작동한다”에서 “우리 서비스에 더 빠르고 싸다”로 넘어가는 순간 필요한 증거는 완전히 달라진다. 실제 도입 판단에는 적어도 **같은 모델·같은 품질 기준·첫 토큰 지연·지속 토큰 속도·동시성·전력**을 한 묶음으로 기록해야 한다. 숫자 하나만 빠른 하드웨어 데모는 아키텍처 아이디어의 증명일 수는 있어도, 사용자의 대기 시간이나 월 운영비를 증명하지는 않는다.

## 작은 모델 데모가 증명하는 것과 증명하지 않는 것

LPU Lite가 보여 주는 핵심은 언어 모델 연산을 위한 특화 실행을 손으로 분해해 볼 수 있다는 점이다. 프로젝트 설명은 LPU의 철학을 예측 가능한 clock cycle의 deterministic execution으로 설명하고, 복잡한 제어를 칩에서 줄이고 컴파일러 쪽으로 옮기는 접근을 소개한다.[1] 대상인 MicroGPT는 이름처럼 단순한 텍스트에서 다음 문자를 예측하는 축소 Transformer다.[1] 이 선택 덕분에 attention, 행렬 연산, 메모리 이동이 어디서 일어나는지 선명해진다.

그러나 이 사실만으로 GPT급 대화 모델이나 RAG 에이전트가 같은 장치에서 잘 돈다고 결론 내릴 수는 없다. 모델 크기가 달라지면 weight를 올려 둘 메모리, KV cache, 양자화 정밀도, 긴 입력의 prefill 비용이 달라진다. 서비스 트래픽이 들어오면 단일 요청의 decode 속도 외에도 queueing과 batch 정책이 결과를 바꾼다. 즉 작은 데모의 ‘정답 출력’은 연산 경로의 존재를 보여 주고, 배포 벤치마크의 ‘정답 품질’은 사용 가능한 모델 구성을 보여 준다. 둘을 같은 성능 주장으로 묶으면 판단이 흐려진다.

![축소 Transformer의 연산 검증과 실제 서비스용 LLM 배포 벤치마크가 다른 질문에 답하는 구조](/images/library/lpu-lite-inference-benchmark-checklist-2026/01_demo-vs-deployment.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration split into two disciplined paths: a small transformer running on an FPGA proves arithmetic correctness on the left, while a production LLM serving stack measures quality, first-token latency, throughput and power on the right; deep navy background, teal verified paths, amber boundary markers, clean flat vector style, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-lpu-lite-inference-benchmark-checklist-2026"
  save_as: "01_demo-vs-deployment.png"
-->

## 배포 판단에는 여섯 개의 숫자가 함께 필요하다

벤치마크 표의 헤더부터 고정하면 과장된 비교를 상당수 걸러 낼 수 있다. 아래 여섯 항목은 서로 대체 관계가 아니다.

1. **모델·정밀도·컨텍스트 길이:** 예를 들어 ‘8B, int4, input 1,024 tokens / output 256 tokens’처럼 적는다. 모델 이름만 있으면 다른 quantization과 입력 길이를 숨길 수 있다.
2. **품질 통과 조건:** 단순 채팅 감상 대신 정해진 task set의 schema 통과율, exact match, 혹은 사람 검토 기준을 둔다. 더 빠른 장치가 같은 품질을 내지 못하면 비교 대상이 아니다.
3. **TTFT(Time To First Token):** 사용자가 첫 글자를 보기까지의 시간이다. 긴 프롬프트가 많은 서비스는 token/s가 높아도 TTFT가 나쁘면 체감이 나빠진다.
4. **지속 생성 속도와 p95:** 평균 token/s 하나 대신 p50과 p95를 같이 남긴다. p95가 튀면 일부 사용자는 데모 속도를 경험하지 못한다.
5. **동시성·배치 조건:** 1개 요청과 16개 동시 요청은 전혀 다른 실험이다. 요청 수, batch 정책, queue 포함 여부를 적는다.
6. **벽전력과 비용:** 장치 전력, 호스트 CPU·메모리, 냉각을 포함한 측정 범위를 명시한다. 전력량과 장비 감가를 빼면 ‘효율’은 운영비가 아닌 홍보 문구가 된다.

Karpathy의 nanochat도 속도 경쟁을 단순한 실행 시간으로만 두지 않는다. 저장소의 Time-to-GPT-2 표는 wall-clock time과 validation bits-per-byte, DCLM CORE 점수를 나란히 공개한다.[2] 학습 사례이기는 하지만 원칙은 추론에도 그대로 적용된다. **속도는 품질과 독립된 숫자가 아니라, 같은 품질 조건에서만 해석할 수 있는 숫자다.**

## 평균 대신 지연 분포를 남기는 작은 실험

장비가 무엇이든, 한 번의 실행 결과만 공유하는 습관부터 바꾸는 편이 낫다. 아래 Python은 표준 라이브러리만 사용해 측정한 지연 목록에서 p50과 p95를 계산한다. `latencies_ms`는 같은 모델·입력 길이·동시성으로 여러 번 실행해 실제로 얻은 값으로 바꿔야 한다. 예시의 20개 값으로 실행하면 p50=104ms, p95=145ms가 출력된다.

```bash
python3 - <<'PY'
from math import ceil
latencies_ms = [96, 99, 100, 101, 102, 102, 103, 103, 104, 104,
                105, 105, 106, 108, 109, 110, 112, 120, 145, 151]
ordered = sorted(latencies_ms)
def percentile(p):
    return ordered[ceil(p * len(ordered)) - 1]
print(f"runs={len(ordered)} p50={percentile(.50)}ms p95={percentile(.95)}ms")
PY
```

이 출력만으로 하드웨어를 고를 수는 없다. 대신 다음 측정부터 비교 가능한 질문을 만든다. 요청마다 `model_id`, `quantization`, `input_tokens`, `output_tokens`, `concurrency`, `ttft_ms`, `decode_tokens_per_sec`, `wall_power_w`, `quality_pass`를 함께 저장한다. 같은 receipt가 쌓이면 새 GPU, NPU, 특화 가속기의 발표가 나와도 우리 workload에서 p95와 통과율이 실제로 개선됐는지 볼 수 있다.

![동일 모델과 입력 조건 아래에서 TTFT, p50과 p95 지연, 처리량, 동시성, 전력을 함께 기록하는 벤치마크 영수증](/images/library/lpu-lite-inference-benchmark-checklist-2026/02_inference-receipt.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished illustration of a transparent LLM inference benchmark receipt connecting one fixed model and prompt workload to gauges for time-to-first-token, p50 and p95 latency, decode throughput, concurrent users and wall power; deep navy background, teal evidence lines, amber audit gates, modern flat technical vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-lpu-lite-inference-benchmark-checklist-2026"
  save_as: "02_inference-receipt.png"
-->

## 내 의견: 특화 칩의 약속은 빠른 숫자가 아니라 예측 가능한 계약이다

내가 보기엔 LPU나 NPU를 둘러싼 가장 흥미로운 약속은 최고 token/s 자체보다 지연과 자원 사용을 예측 가능하게 만드는 데 있다. LPU Lite가 설명하는 deterministic execution은 그 방향을 이해하기 좋은 출발점이다.[1] 반론도 있다. 초기 단계의 하드웨어 프로젝트에 상용 서비스 수준의 비교표를 요구하면 탐구 자체를 위축시킬 수 있다. 맞다. 교육용 데모에는 그 의무가 없다. 다만 누군가가 ‘더 빠른 LLM’ 혹은 ‘더 낮은 비용’을 주장하는 순간에는 조건을 공개해야 한다. 데모의 창의성과 배포 결정의 엄격함은 경쟁하지 않는다. 전자는 새 경로를 찾고, 후자는 그 경로를 고객 앞에 내놓아도 되는지 검증한다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서 새 하드웨어를 사기 전에는 후보 장치마다 대표 프롬프트 10개를 정하고, 같은 모델·quantization·출력 길이로 세 번 이상 실행하면 된다. 품질 통과율, p50/p95 TTFT, 지속 token/s, 소비 전력을 한 CSV에 넣어 비교하자. 그 표에서 p95가 줄고 품질이 유지되며 예상 월 비용이 내려갈 때만 ‘데모가 빠르다’가 아니라 ‘우리 서비스에 맞다’고 말할 수 있다.

## Sources

[1] https://www.lpulite.com/ — LPU Lite 프로젝트의 2026-08-24 게시물: 교육 목적, MicroGPT 대상, deterministic execution 설명

[2] https://github.com/karpathy/nanochat — nanochat README의 Time-to-GPT-2 leaderboard: wall-clock time, validation bits-per-byte, DCLM CORE를 함께 기록하는 방식
