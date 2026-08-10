---
title: "MCP 도구 호출 감사: 서명된 실행 영수증으로 정책 결정을 검증하는 법"
search_intent: "MCP 도구 호출 감사 로그와 서명된 실행 증적을 설계하는 방법"
subtitle: "허용·차단 로그만으로는 부족하다. 어떤 정책이 어떤 도구 호출을 결정했는지 외부 검증 가능한 증적을 남겨야 한다"
description: "MCP 도구 호출에 정책 해시·결정·체인을 담은 서명 영수증을 남기고, 일반 감사 로그와 검증 가능한 실행 증적을 구분하는 방법을 정리한다."
publish: true
created_date: 2026-08-05
category: "보안"
tags:
  - MCP 보안
  - AI 에이전트 감사
  - 도구 호출 정책
  - 실행 증적
  - TEE
agent: luna
slug: mcp-signed-tool-call-receipts-2026
reading_time: 9
featured_image: /images/library/mcp-signed-tool-call-receipts-2026/thumbnail.png
featured_image_alt: "MCP 에이전트의 도구 호출이 정책 게이트와 서명된 실행 영수증을 통과하는 모습"
youtube_id: w9CgJtsi6B4
meta_title: "MCP 도구 호출 감사와 서명 영수증 설계 | 김덕환"
meta_description: "MCP 도구 호출의 허용·차단 기록을 정책 해시와 서명으로 검증 가능한 실행 증적으로 만드는 실무 기준을 정리했다."
keywords:
  - MCP 감사 로그
  - MCP 도구 호출 보안
  - AI 에이전트 실행 증적
  - 서명된 실행 영수증
  - MCP 정책 검증
og_title: "MCP 도구 호출은 왜 ‘서명된 영수증’까지 남겨야 할까"
og_description: "로그를 남겼다는 말과, 어떤 정책이 실제로 실행됐음을 검증할 수 있다는 말은 다르다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A polished 4:3 editorial illustration of an AI agent sending an MCP tool call through a secure policy gateway, with an amber approval and denial gate and a sealed signed receipt emerging into an auditor's verification panel, deep navy background, teal data paths, modern flat vector, no readable text"
  aspect_ratio: "4:3"
  session_id: "library-mcp-signed-tool-call-receipts-2026"
  save_as: "thumbnail.png"
-->

오늘의 MCP 운영에서 가장 취약한 문장은 “도구 호출 로그를 남겼다”다. 로그는 운영자가 쓴 기록일 수 있지만, 사고·감사·분쟁 뒤에 필요한 것은 **그 시점에 어떤 정책 묶음이 실제로 호출을 허용하거나 막았는지 제3자가 다시 확인할 수 있는 증적**이다. 8월 5일 Hacker News 새 글에 올라온 cMCP는 이 간극을 정면으로 건드렸다. 이 프로젝트는 모든 MCP 도구 호출을 Cedar 정책으로 평가하고, 세션 끝에 정책 bundle hash·호출 체인·서명을 담은 TRACE Claim을 낸다고 설명한다. 개발자 프리뷰이므로 이를 곧바로 표준 답으로 받아들일 단계는 아니다. 다만 MCP 공식 Authorization 규격이 HTTP 전송의 OAuth 권한 부여를 다루는 것과 달리, “허용된 뒤 실제 어떤 정책이 집행됐나”까지 증명하는 형식은 별도 운영 과제다. 나는 이 차이가 에이전트를 읽기 도구에서 외부 시스템을 바꾸는 실행자로 전환할 때 반드시 메워야 할 빈칸이라고 본다.

## 권한 부여와 실행 증명은 서로 다른 문제다

MCP Authorization 규격은 HTTP 기반 MCP 전송에서 OAuth 2.1을 통해 보호된 서버에 접근하는 흐름을 정의한다. 서버는 보호 자원 메타데이터를 제공하고, 클라이언트는 적절한 access token과 scope로 요청한다. 이 방식은 “이 클라이언트가 `files:read` 같은 범위를 요청하고 서버가 이를 받아들일 수 있는가”를 다루는 데 적합하다.

하지만 토큰이 유효했다는 사실만으로는 충분하지 않다. 운영 중에는 다음 질문이 남는다. 호출 당시의 정책 파일은 승인받은 버전이었나? 차단 결과가 난 뒤 요청이 우회 전송되지는 않았나? 사후에 운영자가 로그만 고쳐서 다른 설명을 만들 수는 없나? 보통의 애플리케이션 로그는 이 질문에 빠르게 답하지 못한다. 로그 저장소·서명 키·정책 파일이 같은 관리자 권한 아래 있다면, 기록을 신뢰하기 위한 전제가 바로 기록을 바꿀 수 있는 주체에 의존하기 때문이다.

cMCP가 제안하는 TRACE Claim은 이 문제를 분리하려는 한 구현이다. README 기준으로 세션 증적에는 TEE 플랫폼 측정값, 실행 시점의 Cedar policy bundle SHA-256, 도구 호출의 결정과 audit-chain root/tip, canonical JSON에 대한 Ed25519 서명이 들어간다. 이 필드가 모두 있다고 자동으로 안전해지는 것은 아니다. 다만 단순히 `allowed=true` 한 줄을 저장하는 것보다, 어떤 정책과 어떤 체인이 그 결과를 만들었는지 묶어 검증할 재료가 생긴다.

![OAuth 권한 부여와 실제 도구 호출의 정책 집행·증명 계층을 분리한 구조](/images/library/mcp-signed-tool-call-receipts-2026/01_authorization-vs-proof.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 technical editorial illustration split into two connected layers: OAuth authorization issues a limited access token on the left, while a policy engine evaluates each MCP tool call and emits a tamper-evident signed proof on the right, deep navy background, teal flows, amber policy gate, clean flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-mcp-signed-tool-call-receipts-2026"
  save_as: "01_authorization-vs-proof.png"
-->

## 영수증에는 무엇을 묶어야 하나

실무에서 “암호화 서명”이라는 단어만 넣고 끝내면 오히려 위험하다. 검증자가 다시 확인할 수 있도록 최소한 호출의 식별자, 실행 근거, 정책의 정체성, 결과의 무결성, 검증 조건을 함께 설계해야 한다. 원문 요청 본문이나 액세스 토큰을 그대로 영수증에 넣으면 개인정보와 비밀이 새로 유출될 수 있으므로, 민감한 payload는 해시·데이터 분류·보존 위치로 대체하는 편이 낫다.

다음은 특정 제품 설정이 아닌, MCP gateway 앞에 둬도 되는 최소 영수증 계약의 예다. 예시에서 `policy_bundle_sha256`과 `tool_request_hash`는 별도 보관한 원문을 결합할 수 있는 식별자이지 원문을 공개하는 필드가 아니다.

```yaml
execution_receipt:
  receipt_version: "1"
  receipt_id: "rcpt_20260805_001"
  occurred_at: "2026-08-05T10:15:22Z"
  workflow_id: "customer-sync-42"
  tool: "crm.contacts.search"
  decision: "deny"
  decision_reason_code: "scope_missing"
  policy_bundle_sha256: "sha256:<approved-policy-hash>"
  tool_request_hash: "sha256:<redacted-request-hash>"
  audit_chain_tip: "sha256:<chain-tip>"
  key_id: "gateway-prod-2026-08"
  signature: "<detached-signature>"
```

여기서 핵심은 `decision`보다 `policy_bundle_sha256`이다. 허용과 차단 자체는 바뀌기 쉬운 결과지만, 승인 흐름에서 정책 해시를 고정하면 사후 검증자는 “우리가 승인한 정책과 같은 것이 실행됐나”를 비교할 수 있다. 체인 tip은 이 영수증 전후의 호출 순서를 연결하는 기준이 된다. 다만 체인은 삭제·보존 기간·시계 신뢰 문제를 해결하지 않는다. 키 회전 방식, 신뢰 anchor, 영수증의 최대 유효 기간도 함께 정해야 한다.

cMCP의 공개 문서는 enforcing, advisory, silent의 세 모드를 구분한다. enforcing에서는 거부된 호출을 HTTP 403으로 막고, advisory는 거부를 기록하지만 호출을 계속 진행한다. 이 차이는 도입 순서에 유용하다. 정책을 처음 적용할 때는 advisory로 false positive를 측정하되, 결제·고객 데이터 내보내기·배포처럼 되돌리기 어려운 도구는 enforcing 전환 전까지 허용하지 않는 편이 안전하다. 공식 README의 기본 설정은 enforcing이며, 하드웨어 감지에 실패한 경우 소프트웨어 전용 모드는 `CMCP_DEV_MODE=1`에서만 시작한다고 명시한다. 따라서 소프트웨어 모드의 서명 기록을 하드웨어 증명과 같은 보증으로 광고해서는 안 된다.

## 도입은 모든 호출이 아니라 고위험 경로부터 시작한다

서명 영수증을 모든 읽기 요청에 즉시 붙이면 저장 비용과 운영 복잡도만 늘 수 있다. 먼저 외부 상태를 바꾸거나 민감한 데이터 경계를 넘는 도구를 고르면 된다. 예를 들어 CRM 내보내기, 배포 승인, 결제 생성, 고객 계정 권한 변경은 영수증 가치가 높다. 공개 문서 검색이나 로컬 계산처럼 되돌릴 수 있고 영향이 작은 도구는 일반 구조화 로그로 시작해도 된다.

운영 절차는 다음 세 단계로 작게 검증할 수 있다.

```text
1. 도구 카탈로그에서 write·민감 데이터·외부 전송 도구를 high-risk로 표시한다.
2. high-risk 호출마다 승인된 정책 해시와 allow/deny 결과를 receipt에 묶고, 원문은 접근 제어된 별도 저장소에 둔다.
3. 배포 파이프라인 또는 독립 verifier가 표본 receipt의 서명·정책 해시·체인 연속성을 재검증하고, 실패하면 해당 도구를 enforcing 모드에서 중지한다.
```

![고위험 MCP 도구 호출에서 정책 해시, 서명, 독립 검증자가 연결되는 운영 루프](/images/library/mcp-signed-tool-call-receipts-2026/02_receipt-verification-loop.png)
<!--
  📸 이미지 프롬프트:
  prompt: "A 16:9 polished security operations illustration showing a high-risk MCP tool catalog feeding a policy hash gate, a signed execution receipt stored in a tamper-evident chain, and an independent verifier checking signature and freshness before a deployment decision, deep navy background, teal pathways, amber control points, modern flat vector, no readable text"
  aspect_ratio: "16:9"
  session_id: "library-mcp-signed-tool-call-receipts-2026"
  save_as: "02_receipt-verification-loop.png"
-->

검증 프로그램은 gateway와 분리된 권한으로 실행해야 한다. 같은 런타임이 policy도 읽고 receipt도 발행하고 verifier도 통과시킨다면, 기록은 있어도 독립성은 약하다. 최소한 승인된 정책 해시 목록, 검증 공개키, 최대 증적 나이는 중앙 배포 시스템 또는 보안팀이 관리하고, 실행 worker는 이를 수정하지 못하게 해야 한다. TEE는 이 분리를 강화할 수 있지만 하드웨어 도입 자체가 목표는 아니다. 먼저 누가 정책·키·로그·검증기를 각각 바꿀 수 있는지부터 분리해야 한다.

## 내 의견: 감사 로그의 다음 단위는 ‘말’이 아니라 검증 가능한 주장이다

나는 에이전트 감사의 기준이 “로그가 얼마나 많이 쌓였는가”에서 “독립된 검증자가 얼마나 적은 신뢰로 실행 사실을 확인할 수 있는가”로 이동한다고 본다. 가벼운 반론도 있다. 소규모 팀에는 TEE, 키 관리, 체인 검증이 과도하고 일반 로그면 충분하다는 주장이다. 맞다. 단순한 읽기 자동화까지 하드웨어 증명으로 감싸는 것은 비용 낭비다. 그러나 고객 데이터, 배포, 결제처럼 한 번의 도구 호출이 실질적 손실을 만들 수 있는 경로에서는 로그의 양이 아니라 정책 버전·결정·무결성을 한 영수증으로 결합하는 설계가 사고 후의 복구 비용을 줄인다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서는 새 gateway를 바로 도입하기보다, 지금 사용하는 에이전트의 도구 목록부터 위험도 세 단계로 나누는 것이 먼저다. high-risk 도구 하나를 골라 정책 해시와 결과를 남기는 receipt를 시범 적용하고, 일주일 뒤 실제 차단·재시도·검증 실패를 검토한다. 그 결과가 쌓이면 TEE 같은 강한 격리를 어디에 써야 하는지도 감이 아니라 실행 증거로 결정할 수 있다.

## 참고 자료

- [Show HN: cMCP, deny an AI agent's tool call and get a signed receipt — Hacker News, 2026-08-05 확인](https://news.ycombinator.com/item?id=49172545)
- [cMCP: Confidential MCP Runtime — 정책 hash, TRACE Claim, enforcing/advisory 모드, Developer Preview 상태](https://github.com/agentrust-io/cmcp)
- [Model Context Protocol Authorization Specification (2025-11-25) — HTTP 전송의 OAuth 권한 부여와 scope](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
