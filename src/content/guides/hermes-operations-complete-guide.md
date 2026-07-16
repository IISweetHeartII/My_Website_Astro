---
title: "Hermes 운영 가이드 결정판"
subtitle: "프로필, 게이트웨이, cron, kanban을 한 번에 운영하는 실전 플레이북"
description: "Hermes Agent를 개인 운영체제처럼 쓰기 위한 결정판 가이드 초안입니다. 프로필 구조, gateway 운영, cron 설계, kanban 규약, 시크릿 관리와 FAQ를 한 페이지에 모읍니다."
publish: true
draft: true
created_date: 2026-07-15
updatedDate: 2026-07-15
category: "Guides"
tags:
  - Hermes Agent
  - AI agent operations
  - kanban
  - cron
slug: hermes-operations-complete-guide
reading_time: 7
guideVersion: "0.1"
toolVersion: "Hermes v0.18.x 기준"
meta_title: "Hermes 운영 가이드 결정판 | 김덕환"
meta_description: "Hermes Agent 운영을 프로필, gateway, cron, kanban, 시크릿 관리 관점에서 한 페이지로 정리하는 결정판 가이드 초안입니다."
keywords:
  - Hermes Agent 운영
  - AI 에이전트 kanban
  - Hermes cron
  - 에이전트 운영 가이드
og_title: "Hermes 운영 가이드 결정판"
og_description: "프로필, 게이트웨이, cron, kanban을 실제 운영 관점에서 묶는 Hermes 결정판 가이드 초안."
og_type: article
twitter_card: summary_large_image
faq:
  - question: "Hermes 운영을 처음 점검할 때 가장 먼저 보는 명령은 무엇인가요?"
    answer: "먼저 `hermes status`로 런타임 상태를 확인하고, 작업형 환경에서는 `hermes profile list`로 어떤 프로필이 살아 있는지 확인합니다. 그 다음 gateway나 cron처럼 장기 실행되는 구성요소를 따로 봅니다."
  - question: "프로필을 나누는 기준은 무엇인가요?"
    answer: "권한과 목적이 다르면 프로필을 나눕니다. 예를 들어 개인 비서, Discord pet, 시장 모니터링, 콘텐츠 운영은 메모리·cron·gateway 권한이 달라야 하므로 각각 별도 프로필로 둡니다."
  - question: "cron 작업은 어떻게 이름을 붙이나요?"
    answer: "사람이 읽는 목적어와 주기를 같이 담습니다. 예: `profile-content-weekly-report`처럼 소유 프로필, 업무 영역, 산출물을 드러내면 실패 알림을 봤을 때 바로 담당 범위를 알 수 있습니다."
  - question: "Kanban 작업자는 왜 바로 완료하지 않고 review-required로 block하나요?"
    answer: "코드 변경은 실행됐더라도 인간 검토 전에는 합쳐진 상태가 아닙니다. 그래서 변경 파일, 테스트, PR URL을 comment로 남긴 뒤 `kanban_block(reason=\"review-required: ...\")`로 멈추는 편이 안전합니다."
  - question: "Gateway 문제를 볼 때 위험한 행동은 무엇인가요?"
    answer: "토큰이나 채널 ID를 공개 로그에 출력하는 것입니다. 상태 확인은 서비스 라벨과 health output 위주로 하고, 실제 토큰은 Bitwarden이나 OS 키체인 같은 시크릿 저장소에서만 다룹니다."
  - question: "Hermes 설정을 바꾼 뒤 어떤 검증을 하나요?"
    answer: "설정 파일 문법을 확인한 뒤 실제 명령을 한 번 실행합니다. 예를 들어 도구 설정이면 `hermes tools`로 로드 여부를 보고, cron이면 dry-run 또는 즉시 실행으로 stdout과 exit code를 남깁니다."
  - question: "장기 실행 작업의 heartbeat는 언제 필요한가요?"
    answer: "수 분 이상 걸리는 빌드, 크롤링, 학습, 대량 검증에는 주기적으로 heartbeat를 남깁니다. Kanban 작업은 오래 침묵하면 dispatcher가 stale run으로 회수할 수 있습니다."
  - question: "운영 문서에 내부 경로를 그대로 써도 되나요?"
    answer: "공개 글에는 쓰면 안 됩니다. 내부 경로, 토큰명, 개인 채널명, 계정 식별자는 `<PROFILE_HOME>`이나 `<GATEWAY_TOKEN>` 같은 플레이스홀더로 바꾼 뒤 secret grep을 통과해야 합니다."
  - question: "작은 실패 알림이 반복될 때 운영자는 무엇을 해야 하나요?"
    answer: "동일 원인의 반복 실패는 매번 보고하지 말고 dedupe합니다. 새 정보가 없으면 조용히 누적하고, 인간 결정이 필요할 때만 원인·영향·선택지를 담아 알립니다."
  - question: "가이드 본문은 어떻게 업데이트하나요?"
    answer: "상단의 Guide version과 Last updated를 같이 바꾸고, 변경 내역을 짧게 남깁니다. 예: `Guide v0.2: cron dedupe와 gateway launchd 점검 절차 추가`처럼 버전 핀을 유지합니다."
---

> 이 문서는 `/guides/` 섹션 스캐폴드 검증을 위한 placeholder 초안입니다. 실제 발행 전에는 내부 경로와 개인 운영 사례를 모두 공개 가능한 표현으로 치환하고, 시크릿 grep과 사실 확인을 통과해야 합니다.

## 빠른 결론

Hermes를 오래 운영하려면 “모델 하나를 잘 고르는 문제”보다 런타임 경계, 프로필 분리, cron 실패 처리, kanban handoff 규약을 먼저 잡아야 합니다. 운영자는 매번 즉흥적으로 고치지 않고, 어떤 프로필이 어떤 권한으로 어떤 일을 반복하는지 문서와 로그로 추적해야 합니다.

이 가이드의 v0.1은 구조 확인용 초안입니다. 최종본은 설치부터 장애 대응까지 한 페이지에서 끝나는 한국어 결정판 가이드를 목표로 합니다.

## Guide v0.1: Hermes v0.18.x 기준

- Last updated: 2026-07-15
- 기준 버전: Hermes v0.18.x
- 상태: draft placeholder
- 다음 업데이트: 실제 운영 사례, 검증 명령, 공개 가능한 스크린샷 추가

## 프로필 구조 설계

프로필은 “말투만 다른 캐릭터”가 아니라 권한과 메모리, cron, gateway 연결을 나누는 운영 단위입니다. 개인 비서, 콘텐츠 운영, Discord pet, 시장 감시처럼 목적이 다른 에이전트는 서로 다른 프로필로 분리해야 합니다.

좋은 프로필 설계는 다음 질문에 답합니다.

1. 이 프로필이 읽어도 되는 데이터는 무엇인가?
2. 이 프로필이 쓸 수 있는 외부 채널은 어디인가?
3. 실패했을 때 누가 알림을 받아야 하는가?
4. 메모리가 오래 남아도 안전한가?

## Gateway 운영 원칙

Gateway는 사람과 에이전트를 연결하는 입구입니다. 그래서 “켜져 있다”보다 “올바른 프로필, 올바른 채널, 올바른 권한으로 연결돼 있다”가 더 중요합니다.

운영 점검은 보통 다음 순서로 진행합니다.

```bash
hermes profile list
hermes status
launchctl list | grep hermes
```

공개 문서에는 실제 토큰, 내부 채널 ID, 개인 계정 식별자를 쓰지 않습니다. 예시는 `<DISCORD_CHANNEL_ID>`, `<TELEGRAM_CHAT_ID>`, `<PROFILE_NAME>`처럼 치환합니다.

## Cron 설계 원칙

cron은 반복 작업이 아니라 반복되는 책임입니다. 이름에는 소유자, 업무 영역, 산출물이 드러나야 합니다. 실패 알림은 매번 길게 보내지 않고, 원인이 같으면 dedupe해서 운영자가 액션할 수 있는 정보만 남깁니다.

좋은 cron handoff에는 다음 네 가지가 들어갑니다.

- 실행 주기
- 성공 시 산출물
- 실패 시 영향
- 사람이 결정해야 하는 조건

## Kanban 작업 규약

Kanban 작업자는 상태를 보드에 남깁니다. 코드 변경이 포함된 작업은 빌드와 테스트를 통과해도 바로 완료하지 않고, 변경 파일과 검증 증거를 comment로 남긴 뒤 review-required 상태로 block하는 편이 안전합니다.

예시는 다음과 같습니다.

```text
kanban_comment: changed_files, tests_run, pr_url
kanban_block: review-required: guides scaffold PR opened
```

## 시크릿과 공개 문서 경계

운영 가이드는 실전성이 있어야 하지만, 실전 경로와 토큰을 그대로 공개하면 안 됩니다. 발행 전에는 최소한 다음 패턴을 검색합니다.

```bash
git grep -n "token\|secret\|password\|api_key\|PRIVATE" -- src/content/guides
```

검색 결과가 모두 공개 가능한 플레이스홀더인지 확인한 뒤 publish 상태로 바꿉니다.

## FAQ

FAQ는 검색과 AI 인용을 위해 짧은 문답이 아니라 실행 가능한 답변이어야 합니다. 각 답변에는 가능하면 실제 명령어, 판단 기준, 실패했을 때의 다음 행동을 포함합니다.

이 placeholder에는 FAQ 스키마 배선을 검증하기 위한 10개 문답이 frontmatter에 들어 있습니다. 최종본에서는 각 문답을 본문 설명과 연결하고, 실제 운영 캡처나 검증 로그를 추가합니다.
