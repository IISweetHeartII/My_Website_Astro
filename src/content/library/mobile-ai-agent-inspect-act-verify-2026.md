---
title: "모바일 AI 에이전트 테스트: inspect-act-verify로 잘못된 탭을 막는 법"
search_intent: "모바일 AI 에이전트가 iOS와 Android 앱을 안전하게 테스트하고 UI 오작동을 줄이는 방법"
subtitle: "화면을 한 번 읽고 연속 탭하는 자동화는 취약하다. 매 행동 뒤 현재 UI를 다시 관측하고 증거를 남겨야 한다"
description: "모바일 AI 에이전트 테스트에서 오래된 UI 참조로 생기는 오작동을 줄이는 inspect-act-verify 절차와 증거 기록 원칙을 정리한다."
publish: true
created_date: 2026-08-04
category: "개발"
tags:
  - 모바일 AI 에이전트
  - 모바일 앱 테스트
  - UI 자동화
  - agent-device
  - 접근성 트리
agent: luna
slug: mobile-ai-agent-inspect-act-verify-2026
reading_time: 9
featured_image: /images/library/mobile-ai-agent-inspect-act-verify-2026/thumbnail.png
featured_image_alt: "모바일 AI 에이전트가 현재 UI를 관측하고 행동 뒤 결과를 검증하는 실행 루프"
meta_title: "모바일 AI 에이전트 테스트: inspect-act-verify | 김덕환"
meta_description: "모바일 AI 에이전트가 오래된 화면 참조로 잘못 탭하지 않도록 inspect-act-verify와 증거 기록을 적용하는 방법."
keywords:
  - 모바일 AI 에이전트
  - 모바일 에이전트 테스트
  - AI 앱 테스트 자동화
  - UI 자동화 검증
  - agent-device 사용법
og_title: "모바일 AI 에이전트는 왜 매 행동 뒤 UI를 다시 읽어야 할까"
og_description: "모바일 UI는 행동 한 번으로 바뀐다. inspect-act-verify 루프로 오래된 참조와 검증 없는 탭을 줄이는 실무 원칙."
og_type: article
twitter_card: summary_large_image
youtube_id: LT0-djXlplw
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration of a mobile AI agent observing a smartphone accessibility tree, tapping one highlighted interface element, then receiving a fresh verified state card and evidence screenshot, deep navy background, teal information paths, amber verification gate, modern flat vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-mobile-ai-agent-inspect-act-verify-2026"
  save_as: "thumbnail.png"
-->

모바일 AI 에이전트의 신뢰성은 탭을 얼마나 빨리 연속 실행하느냐보다, **지금 보고 있는 화면이 아직 현재 상태인지 확인하는 속도**에서 결정된다. 팝업 하나, 키보드 등장, 네트워크 지연, 로그인 만료만 있어도 조금 전의 버튼 위치와 접근성 참조는 다른 의미를 갖는다. Callstack의 `agent-device`는 이 문제를 `inspect → act → verify` 흐름으로 다룬다. 화면 접근성 스냅샷에서 얻은 ref로 한 번 행동하고, UI가 안정된 뒤 달라진 결과를 다시 읽으며, 필요하면 스크린샷을 증거로 남긴다. Android의 최신 UI Automator도 predicate 기반 요소 탐색과 앱 상태의 명시적 제어를 강조한다. 즉 모바일 에이전트를 운영할 때 핵심 질문은 “다음 탭을 예측할 수 있는가”가 아니라 “직전 행동 뒤 바뀐 화면을 확인한 뒤에만 다음 탭을 허용하는가”다.

## 왜 모바일 UI에서는 직전 화면 정보가 곧바로 낡는가

웹 자동화도 화면 변화가 빠르지만 모바일 앱은 키보드, 전환 애니메이션, OS 권한 다이얼로그, 백그라운드 복귀가 앱의 화면 계층을 자주 바꾼다. 예를 들어 연락처 추가 화면에서 `추가` 버튼을 누른 뒤에는 입력 필드가 나타나고, 같은 좌표나 이전에 얻은 요소 ID는 더 이상 같은 대상을 가리키지 않을 수 있다. 에이전트가 이전 스냅샷의 `@e7`을 계속 믿으면 이름 대신 다른 입력칸을 채우거나, 이미 사라진 버튼을 다시 누르는 실패가 생긴다.

`agent-device`의 공식 README는 스냅샷의 ref를 최신 출력에서만 사용하라고 명시한다. `--settle`로 행동 뒤 UI가 안정될 시간을 준 다음, 결과 diff에서 새 ref를 읽고 다음 명령을 선택하는 방식이다. 이 원칙은 특정 CLI의 문법이 아니라 상태가 변하는 모든 모바일 자동화의 기본 계약으로 볼 수 있다.

![행동 전 스냅샷과 행동 후 새 상태를 비교해 오래된 참조를 폐기하는 흐름](/images/library/mobile-ai-agent-inspect-act-verify-2026/01_fresh-ui-reference.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration comparing a stale mobile UI snapshot with a fresh post-action snapshot: old references fade out after a tap while new accessibility nodes and a visual diff appear, smartphone interface abstracted, deep navy background, teal nodes, amber stale warning, clean flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-mobile-ai-agent-inspect-act-verify-2026"
  save_as: "01_fresh-ui-reference.png"
-->

여기에는 지연 시간보다 더 중요한 문제가 있다. 모델은 화면이 바뀌지 않았다고 그럴듯하게 추론할 수 있지만, 실제 UI 상태를 재관측하지 않으면 그 추론을 반증할 방법이 없다. 그래서 각 행동의 입력에는 `observed_at`, 화면 또는 접근성 트리의 버전, 허용한 ref를 묶고, 다음 행동은 새 관측값이 있을 때만 실행하도록 설계하는 편이 안전하다. 단순 TTL을 두는 것보다 낫다. TTL은 시간이 지났음을 알리지만, 바로 직전 행동이 UI를 바꿨다는 사실까지 보장하지 않기 때문이다.

## inspect-act-verify를 작은 실행 계약으로 만든다

안전한 모바일 에이전트는 모든 일을 한 번에 계획해 실행하지 않는다. 한 행동의 기대 결과를 작게 정의하고, 실제 결과가 그 기대와 맞는지 확인한 후에만 다음 단계로 넘어간다. 다음은 `agent-device` 공식 quick start의 현재 동작을 바탕으로 정리한 최소 절차다. 실제 ref는 기기와 화면마다 다르므로 예시의 `@e2`, `@e7`을 복사해서는 안 된다.

```bash
# 1. 환경과 대상 기기를 먼저 점검한다.
agent-device doctor
agent-device open Contacts --platform ios

# 2. 현재 접근성 트리를 관측하고, 이 출력의 ref만 사용한다.
agent-device snapshot -i

# 3. 한 번만 행동한 뒤 UI가 안정될 때까지 기다린다.
agent-device press @e2 --settle

# 4. 결과 diff의 새 ref를 읽고 필요한 필드만 채운다.
agent-device fill @e7 "Ada" --settle

# 5. 사람이 재검토할 수 있는 증거를 남긴다.
agent-device screenshot ./contact-form.png
agent-device close
```

이 블록의 중요한 제약은 두 가지다. 첫째, `@e2`와 `@e7`은 고정 selector가 아니다. 스냅샷이 보여 준 현재 화면의 임시 참조다. 둘째, `--settle`은 성공을 증명하지 않는다. 안정된 뒤 diff나 다음 스냅샷에서 “예상한 입력 필드가 나타났는가”, “입력한 값이 남아 있는가”를 확인해야 한다. 화면 변화가 예상과 다르면 에이전트는 억지로 다음 단계로 진행하지 말고 스크린샷·로그를 남기고 중단해야 한다.

Android 공식 UI Automator 문서도 최신 2.4 API가 predicate 기반 요소 탐색과 앱 상태의 명시적 제어에 초점을 둔다고 설명한다. 이는 좌표 기반 매크로보다 역할·라벨·상태 같은 의미 있는 속성으로 현재 UI를 찾는 편이 유지보수성과 안정성을 높인다는 방향과 맞닿아 있다. 접근성 라벨, role, test ID를 제품 코드에 꾸준히 넣는 일은 테스트 편의가 아니라 에이전트가 화면을 오인하지 않게 하는 실행 인프라다.

## 성공 로그만 남기면 재현도 리뷰도 어렵다

모바일 자동화에서 “테스트 통과”는 너무 짧은 결과다. 사람이 확인해야 하는 PR, 버그 리포트, 고객 흐름 검증이라면 어떤 화면을 봤고 무엇을 눌렀으며 다음 화면이 어떻게 달라졌는지 남아야 한다. `agent-device`는 접근성 스냅샷, 스크린샷, 비디오, 로그, 트레이스, 네트워크 데이터 등을 진단·증거로 다룬다. 모든 기록을 저장할 필요는 없지만, 실패 또는 쓰기 성격의 행동에는 최소 증거 묶음이 필요하다.

권장하는 레코드는 다음처럼 작게 시작할 수 있다.

```yaml
mobile_agent_step:
  run_id: "qa-2026-08-04-01"
  observed_at: "2026-08-04T09:10:00Z"
  platform: "ios"
  state_source: "accessibility_snapshot"
  action: "press"
  target_ref: "@e2"
  expected_change: "contact_form_visible"
  verification: "post_action_diff"
  evidence: "artifacts/contact-form.png"
  outcome: "verified"
```

이 예시는 제품 설정 파일이 아니라 리뷰 가능한 기록의 형태다. 여기에는 사용자 이름, 인증 토큰, 전체 화면 원문처럼 민감한 정보를 넣지 않는다. 대신 실행 ID, 관측 시각, 어떤 상태 근거로 행동했는지, 기대와 실제 검증 결과, 증거 파일 위치를 남긴다. 실패 시에는 `outcome: blocked`와 원인만 기록해 사람이 다음 관측부터 다시 시작하도록 한다.

![모바일 에이전트의 관측, 단일 행동, 검증, 증거 보관을 연결한 QA 루프](/images/library/mobile-ai-agent-inspect-act-verify-2026/02_evidence-loop.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished mobile QA illustration showing an AI agent loop with four explicit stages: observe accessibility state, perform one UI action, verify the visual and semantic result, save screenshot evidence for reviewer; smartphone at center, deep navy background, teal pathways and amber control gate, modern flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-mobile-ai-agent-inspect-act-verify-2026"
  save_as: "02_evidence-loop.png"
-->

## 내 의견: 모바일 에이전트의 속도 경쟁은 재시도 횟수를 줄이는 경쟁이다

내 의견은 분명하다. 모바일 에이전트에 긴 작업 계획과 연속 탭 권한을 먼저 주는 팀은 데모 속도는 얻어도 운영 신뢰는 잃는다. UI를 한 번 관측하고 행동 뒤 다시 검증하는 과정은 느려 보인다. 가벼운 반론도 있다. 정해진 내부 테스트 앱에서는 잘 만든 selector와 E2E 스크립트가 더 빠르고 저렴하다. 맞다. 반복 가능한 경로는 테스트 스위트로 고정하는 편이 낫다. 하지만 화면 변화, 권한 팝업, 실제 계정 상태처럼 예외가 많은 탐색·QA 작업에서 에이전트의 강점은 고정 스크립트를 흉내 내는 데 있지 않다. 매 단계의 관측 근거를 갱신하고 예상과 달라졌을 때 안전하게 멈추는 데 있다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서는 모바일 자동화를 외부 행동이 포함된 운영 작업으로 취급하는 것이 좋다. 첫 도입에서는 결제·메시지 전송 같은 되돌리기 어려운 행동을 빼고, 읽기·탐색·스크린샷 검증 경로부터 `inspect → one action → verify → evidence`로 고정한다. 그 뒤 실제 실패 로그에서 자주 바뀌는 화면과 취약한 접근성 라벨을 고치면 된다. 모델을 바꾸는 것보다 먼저, 이전 화면을 믿고 행동하지 못하게 만드는 이 작은 경계가 모바일 에이전트의 사고 반경을 줄인다.

## 참고 자료

- [agent-device README — inspect-act-verify, 최신 ref 사용, `--settle`과 증거 저장](https://github.com/callstack/agent-device)
- [Android Developers — UI Automator: predicate 기반 요소 탐색과 앱 상태의 명시적 제어](https://developer.android.com/training/testing/other-components/ui-automator)
- [Qwen3.8-Max: A New Bar for Coding and Cowork — 장기 에이전트 실행에서 실제 앱과 상호작용·피드백 루프를 사용하는 공개 사례](https://qwen.ai/blog?id=qwen3.8)
