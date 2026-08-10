---
title: "AI 코드 기여 검토 가이드: 생성 여부보다 책임 있는 변경을 확인하는 법"
search_intent: "AI가 작성한 코드 PR을 사람이 안전하게 검토하고 병합하는 방법"
subtitle: "AI 사용을 금지하거나 고백받는 규칙만으로는 품질을 만들 수 없다. 변경 근거·테스트·소유자를 PR 계약으로 남겨야 한다"
description: "AI 코드 기여를 사람 중심으로 검토하는 방법을 정리한다. 변경 범위, 설계 근거, 테스트 증거, 소유자 확인으로 안전한 병합 기준을 만든다."
publish: true
created_date: 2026-08-09
category: "개발"
tags:
  - AI 코드 리뷰
  - AI 코딩 에이전트
  - Pull Request
  - 소프트웨어 품질
  - 개발 거버넌스
agent: luna
slug: ai-code-contribution-review-contract-2026
reading_time: 9
featured_image: /images/library/ai-code-contribution-review-contract-2026/thumbnail.png
featured_image_alt: "AI가 제안한 코드 변경이 사람 리뷰어의 근거·테스트·소유자 검증 게이트를 통과하는 모습"
youtube_id: 6gzQQQoJCCU
meta_title: "AI 코드 기여 검토 가이드 | 김덕환"
meta_description: "AI가 만든 코드의 출처보다 변경 근거·테스트·책임자를 확인하는 PR 검토 계약과 실무 체크리스트를 소개한다."
keywords:
  - AI 코드 리뷰
  - AI 생성 코드 검토
  - AI 코딩 에이전트 PR
  - 풀 리퀘스트 리뷰 가이드
  - AI 코드 품질 관리
og_title: "AI 코드의 질문은 누가 썼나가 아니라 누가 책임질 수 있나이다"
og_description: "AI 코드 기여를 안전하게 병합하려면 생성 사실이 아니라 변경 근거, 테스트 증거, 소유자 확인을 PR에 남겨야 한다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration of an AI-assisted code change arriving at a human review desk, passing through three clear gates for rationale, tests, and accountable ownership; deep navy background, teal evidence cards, amber review markers, clean modern flat vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-ai-code-contribution-review-contract-2026"
  save_as: "thumbnail.png"
-->

AI가 쓴 코드인지 알아맞히는 일은 좋은 리뷰 기준이 아니다. 나는 AI 코딩 에이전트가 만드는 PR을 볼 때 생성 도구의 이름보다 먼저 세 가지를 확인한다. **무엇을 왜 바꿨는지, 어떤 실행으로 안전함을 보였는지, 문제가 생기면 누가 그 변경을 설명하고 고칠 수 있는지**다. 8월 7일 Mycelium 프로젝트는 기여자가 어떤 AI 도구를 써도 된다고 하면서도, 모델이 쓴 것처럼 보이는 코드는 병합하지 않겠다는 독특한 정책을 `CONTRIBUTING.md`에 76줄 추가했다. 표현은 유머와 취향이 섞여 있지만, 유지보수자가 실제로 피하고 싶은 것은 ‘AI 흔적’ 그 자체가 아니라 이해되지 않은 대량 변경과 리뷰 비용이다. 팀의 정책은 탐지 게임이 아니라, 각 변경을 사람이 책임질 수 있는 증거 묶음으로 만드는 방향이 더 오래 간다.

## AI 사용 고백과 품질 검증은 같은 문제가 아니다

Mycelium의 정책은 AI 사용 자체를 금지하지 않는다. LLM, 에이전트, 코드 리뷰 도구를 원하는 대로 써도 되지만, 병합되는 코드와 문서가 모델 산출물처럼 보이면 거절될 수 있다고 적는다. 작성자는 AI가 만든 코드를 다시 읽고 ‘Claude-babble’처럼 느껴지는 부분을 고쳐 쓰는 일을 권한다. 또한 모델이 고수준 설계까지 대신 판단하지는 못해도, 빠뜨린 변경이나 checked arithmetic 같은 세부 오류를 찾는 검토 도구로는 유용하다고 설명한다.

이 정책을 그대로 복제할 필요는 없다. “AI처럼 보이는가”는 사람마다 다르고, 특히 비영어권 팀이나 표준화된 코드베이스에서는 문체만으로 판정하기 어렵다. AI 사용 공개를 불리하게 만드는 규칙은 문제를 숨기는 유인도 만든다. 하지만 이 사례가 정확히 짚는 것은 있다. PR 작성자가 생성 속도만 얻고 변경을 이해하지 못하면, 병합 순간의 시간이 절약된 대신 유지보수자가 나중에 이자를 낸다.

따라서 팀이 물어야 할 질문은 “AI를 썼나?” 하나가 아니다.

1. **변경 의도**: 사용자 문제, 버그 재현 조건, 설계 선택지가 PR 설명에 있는가.
2. **변경 경계**: 의도와 무관한 포맷 변경·의존성 갱신·리팩터링이 함께 섞이지 않았는가.
3. **검증 증거**: 테스트, 타입 검사, 린트, 수동 확인 중 무엇을 실제 실행했고 결과가 무엇인가.
4. **책임 소유자**: 작성자가 실패 시 재현·수정할 수 있는가. 코드 소유자와 리뷰어가 위험도를 이해하는가.

![AI 사용 여부를 묻기보다 변경 의도·범위·검증·소유자를 확인하는 PR 검토 계약](/images/library/ai-code-contribution-review-contract-2026/01_review-contract.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration of a pull request transformed into four structured evidence cards: intent, scoped diff, executed tests, and accountable owner; a human reviewer checks each card before merge, deep navy background, teal data paths, amber quality gates, modern flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-ai-code-contribution-review-contract-2026"
  save_as: "01_review-contract.png"
-->

## 리뷰 가능한 변경으로 쪼개는 최소 계약

AI 에이전트가 한 번에 수십 파일을 고치는 상황에서 리뷰를 ‘코드를 잘 읽는 능력’에만 맡기면 병목이 생긴다. 먼저 PR 자체를 검토 가능한 단위로 제한해야 한다. 기능 구현, 포맷 정리, 의존성 갱신, 테스트 리팩터링을 한 PR에 섞지 않는 원칙은 AI 시대에 더 중요해졌다. 생성 속도가 빨라질수록 무관한 변경을 끼워 넣는 비용도 낮아지기 때문이다.

실무에서는 PR 설명에 아래 네 줄을 요구하면 시작하기 좋다.

```text
문제/의도: 어떤 사용자 또는 운영 문제를 해결하는가?
변경 범위: 바뀐 모듈과 의도적으로 건드리지 않은 경계는 무엇인가?
검증: 실제 실행한 명령과 결과는 무엇인가?
소유: 배포 뒤 이상이 생기면 누가 재현하고 되돌릴 수 있는가?
```

여기서 중요한 것은 그럴듯한 서술을 채우는 일이 아니다. 리뷰어는 설명에서 선언한 범위와 실제 diff가 일치하는지 확인해야 한다. 예를 들어 인증 로직 하나를 고친 PR에 lockfile 대규모 갱신이 섞였다면, AI가 만들었는지와 관계없이 별도 변경으로 분리하는 편이 안전하다. 반대로 아주 작은 수정이라도 입력 검증이나 권한 경로를 바꾸면 테스트 증거와 rollback 방법이 필요하다.

Mycelium 커밋은 `CONTRIBUTING.md` 한 파일에 76줄을 더했고, GitHub 커밋 메타데이터상 총 77줄의 변화다. 이런 작은 문서 변경도 논쟁을 부를 수 있는 이유는 정책이 이후 모든 기여의 리뷰 기준을 바꾸기 때문이다. 코드 줄 수가 적다는 사실은 위험도가 낮다는 뜻이 아니다. 특히 AI 사용 규칙, 보안 정책, 배포 설정은 영향을 받는 사람과 실행 경로를 함께 검토해야 한다.

## 실행 결과를 PR의 증거로 남기는 법

테스트 명령을 ‘돌렸습니다’라고 적는 것만으로는 부족하다. 저장소마다 정식 검증 명령이 다르므로, 존재하지 않는 명령을 템플릿에 고정하지 말고 프로젝트의 `CONTRIBUTING.md`, `package.json`, CI 설정을 먼저 읽어야 한다. 다만 Git 저장소라면 다음 세 명령은 변경 범위와 공백·충돌을 확인하는 기본 read-only 점검으로 실제 실행할 수 있다.

```bash
# 현재 작업 트리와 변경 파일 목록을 확인한다.
git status --short
git diff --stat

# 공백 오류를 검사하고, 리뷰할 diff를 다시 읽는다.
git diff --check
git diff
```

이 결과는 테스트를 대체하지 않는다. 대신 ‘어떤 파일이 바뀌었는가’라는 가장 기본적인 질문을 자동 요약보다 신뢰할 수 있게 만든다. 그 다음 저장소의 공식 테스트 명령을 실행하고, 실패했다면 실패를 숨기지 말고 PR에 남긴다. 통과한 테스트가 변경의 안전성을 완전히 증명하지 못한다는 사실도 함께 적어야 한다. 테스트가 없는 경계는 리뷰어가 수동 시나리오나 feature flag, staged rollout을 요구할 이유가 된다.

또 하나의 원칙은 모델 출력의 설명을 증거로 취급하지 않는 것이다. AI가 “모든 테스트를 통과했다”고 말해도 CI 로그, 명령 출력, 배포 전후 지표가 없으면 주장일 뿐이다. 반대로 사람이 쓴 코드도 검증 결과가 없으면 같은 기준으로 멈춰야 한다. 도구별 이중 잣대를 없애면 팀은 생성 도구의 유행보다 결과의 재현성에 집중할 수 있다.

![코드 변경과 실제 실행된 테스트·정적 검사·CI 결과를 연결해 병합 판단을 만드는 흐름](/images/library/ai-code-contribution-review-contract-2026/02_execution-evidence.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished software engineering illustration showing a code diff linked to terminal test output, static analysis checks, CI status, and a rollback decision before merge; deep navy background, teal verified signals, amber caution markers, clean flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-ai-code-contribution-review-contract-2026"
  save_as: "02_execution-evidence.png"
-->

## 내 의견: AI 정책의 목표는 흔적 제거가 아니라 책임 밀도를 높이는 일이다

나는 ‘AI가 쓴 티가 나면 거절한다’는 문구를 일반 팀 정책으로 권하지 않는다. 좋은 코드의 문체는 팀마다 다르고, 공개 여부를 벌점으로 만들면 숨김만 늘어날 수 있다. 가벼운 반론도 있다. 모든 PR에 의도·검증·소유자를 요구하면 작은 오타까지 느려진다는 주장이다. 맞다. 그래서 위험도에 따라 기록 밀도를 달리해야 한다. 문서 오타는 짧은 설명과 미리보기면 충분할 수 있지만, 권한·결제·데이터 삭제·배포 경로를 바꾸는 PR은 실행 증거와 복구 계획이 필요하다. 핵심은 AI의 흔적을 지우는 일이 아니라, 생성 속도가 빨라진 만큼 사람이 이해하고 책임지는 정보의 밀도를 올리는 일이다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서는 다음 AI 보조 PR 하나에만 네 줄 계약을 시험 적용하면 된다. `문제/의도`, `변경 범위`, `검증`, `소유`를 PR 본문에 적고, 리뷰어는 `git diff --check` 결과와 실제 테스트 로그를 먼저 확인한다. 일주일 뒤 리뷰에서 가장 자주 되묻는 질문을 모아 템플릿에 반영하면, AI 도구를 통제하는 규칙보다 더 실용적인 병합 기준이 남는다.

## 참고 자료

- [Mycelium AI Policy 커밋 — GitHub, 2026-08-07: `CONTRIBUTING.md`에 AI 도구 사용, 사람 검토, 기여 병합 기준을 76줄 추가](https://github.com/hawkw/mycelium/commit/b77e854bcbbe7c64f644e4c6ceeaebb74c80c79a)
- [Mycelium `CONTRIBUTING.md` — 해당 커밋의 원문: AI 도구 사용을 허용하면서도 사람이 이해·재작성한 기여를 요구하는 근거](https://raw.githubusercontent.com/hawkw/mycelium/b77e854bcbbe7c64f644e4c6ceeaebb74c80c79a/CONTRIBUTING.md)
- [Mycelium AI Policy — Hacker News newest 목록, 2026-08-09 확인](https://news.ycombinator.com/item?id=49224303)
