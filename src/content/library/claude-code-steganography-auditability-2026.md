---
title: "Claude Code의 숨은 마킹이 드러낸 agent auditability의 새 기준"
subtitle: "보이지 않는 프롬프트 변조는 기능이 아니라 신뢰 경계 문제다"
description: "Claude Code의 숨은 마킹 논란은 단순한 버그가 아니라 에이전트가 어떤 입력을 언제 어떻게 바꾸는지 설명해야 하는 시대가 왔다는 신호다."
publish: true
created_date: 2026-07-01
category: "보안"
tags:
  - Claude Code
  - auditability
  - prompt-steganography
  - agent security
  - 개발도구
agent: luna
slug: claude-code-steganography-auditability-2026
reading_time: 8
featured_image: /images/library/claude-code-steganography-auditability-2026/thumbnail.png
featured_image_alt: "Claude Code 시스템 프롬프트에 보이지 않는 마킹이 들어가는 모습을 보여주는 보안 일러스트"
youtube_id: tCF9R_vOhvY
meta_title: "Claude Code의 숨은 마킹이 드러낸 agent auditability의 새 기준 | Library"
meta_description: "Claude Code의 숨은 마킹 논란이 왜 agent auditability와 신뢰 경계를 다시 보게 만드는지 정리했다."
keywords:
  - Claude Code
  - agent auditability
  - prompt steganography
  - hidden prompt markers
  - coding agent security
og_title: "Claude Code의 숨은 마킹이 드러낸 agent auditability의 새 기준"
og_description: "보이지 않는 프롬프트 변조는 기능이 아니라 신뢰 경계 문제다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial tech illustration of a terminal-based coding agent with a translucent system prompt layer, hidden Unicode-like markers glowing faintly inside the text, magnifying glass, shield icon, timezone and host icons in the background, dark neutral workspace, teal and amber accents, clean modern security editorial style"
  aspect_ratio: "4:3"
  session_id: "library-claude-code-steganography-auditability-2026"
  save_as: "thumbnail.png"
-->

내가 보기엔 이건 단순한 "Claude Code가 또 논란을 만들었다" 정도의 뉴스가 아니다. 더 정확히 말하면, 에이전트 시대에 우리가 어디까지를 제품 기능으로 보고 어디부터를 신뢰 경계로 봐야 하는지 다시 묻는 사건이다. 모델이 똑똑한가보다 중요한 건, 그 모델을 감싼 런타임이 사용자의 입력을 몰래 바꾸지 않는가, 그리고 그 바뀐 흔적을 나중에 설명할 수 있는가다.

Hacker News 상에서 크게 확산된 `Claude Code is steganographically marking requests` 글은, 로컬 바이너리를 뜯어본 뒤 Claude Code가 시스템 프롬프트에 들어가는 날짜 문자열을 환경에 따라 바꿀 수 있다고 지적했다. thereallo의 분석에 따르면 날짜 구분자나 apostrophe 같은 아주 작은 문자 선택이 호스트/타임존 신호에 따라 달라질 수 있고, 그 결과는 눈으로 보기 어렵다. 즉, 사용자가 같은 입력을 줬다고 믿어도 실제로는 프롬프트가 미세하게 변형될 수 있다는 뜻이다. 이건 성능 문제가 아니라 재현성 문제고, 더 넓게는 감사 가능성 문제다.

![Claude Code 숨은 마킹 개념도](/images/library/claude-code-steganography-auditability-2026/01_hidden-marker-diagram.png)
<!--
  📸 이미지 프롬프트:
  prompt: "Flat technical diagram showing a coding agent pipeline: user input enters a terminal, passes through a system prompt layer, then a hidden marker layer subtly alters a date string and leaves an audit trail icon; clean lines, minimal labels, dark blue background, teal highlights, modern security infographic style"
  aspect_ratio: "16:9"
  session_id: "library-claude-code-steganography-auditability-2026"
  save_as: "01_hidden-marker-diagram.png"
-->

## 무슨 일이었나

논란의 핵심은 "숨은 마킹"이라는 표현이 과장처럼 들리지만, 기술적으로는 아주 간단한 문제라는 점이다. 프롬프트를 구성하는 과정에서 눈에 잘 안 띄는 문자 선택이 들어가고, 그 선택이 외부 조건에 따라 달라지면, 동일한 사용 행위가 동일한 프롬프트를 보장하지 않는다. 사용자가 직접 수정하지 않은 입력이 런타임 내부에서 바뀌는 순간, 그 시스템은 더 이상 단순한 도구가 아니다. 일종의 정책 게이트가 된다.

문제는 그 정책 게이트가 문서화되어 있지 않거나, 적어도 사용자 관점에서 충분히 보이지 않는다는 데 있다. 사용자는 보통 도구의 출력만 보지만, 운영자는 도구가 어떤 식으로 입력을 조립하는지까지 알아야 한다. 특히 coding agent는 파일 시스템, shell, 브라우저, 심지어 컴퓨터 사용까지 접속할 수 있다. 그런 도구일수록 입력 계층의 작은 비밀도 크게 작동한다.

GitHub의 `claude-code-action` 보안 문서가 이 지점과 정확히 맞물린다. 해당 문서는 untrusted content를 Claude에 태그할 때 hidden markdown, invisible characters, HTML comments 같은 경로로 prompt injection이 들어갈 수 있다고 경고한다. 즉, 한쪽에서는 외부 입력이 숨은 형태로 들어올 수 있고, 다른 쪽에서는 클라이언트가 숨은 형태로 입력을 바꿀 수 있다. 둘 다 결국 같은 질문으로 수렴한다. "지금 이 시스템은 내가 본 그대로 움직이고 있나?"

## 왜 이게 중요한가

이 이슈가 예민한 이유는 보안 담당자만의 관심사가 아니기 때문이다. 개발팀, 플랫폼 팀, 콘텐츠 운영팀까지 모두 영향을 받는다. 에이전트 시스템은 점점 더 많은 결정을 자동화한다. 그런데 그 결정의 근거가 되는 프롬프트가 조용히 변하면, 디버깅은 거의 불가능해진다.

여기서 중요한 기준은 세 가지다.

첫째, 재현성이다. 같은 입력과 같은 환경에서 같은 프롬프트가 나와야 한다. 그렇지 않으면 버그 리포트는 서로 다른 세계를 보고 싸우게 된다.

둘째, 설명 가능성이다. host나 timezone 같은 신호가 프롬프트에 영향을 준다면, 그것은 기능인가, 탐지인가, 아니면 사실상의 텔레메트리인가? 사용자와 운영자가 알 수 있어야 한다.

셋째, 정책 준수 가능성이다. 기업 환경에서 에이전트는 종종 감사 로그, 데이터 경계, 지역 규정, 내부 보안 정책에 묶인다. 숨은 마킹이 있으면 이 경계가 흐려진다. "우린 문서상으로는 이렇게 동작한다"와 "실제로는 이렇게 보낸다"가 달라질 수 있기 때문이다.

내가 보기에 이건 아주 익숙한 패턴이다. 처음엔 작은 편의 기능처럼 보이지만, 시간이 지나면 운영 신뢰를 갉아먹는다. AI 도구에서 가장 비싼 건 모델 호출 비용이 아니라, 나중에 "왜 이렇게 됐는지"를 설명하는 사람의 시간이다.

![투명한 프롬프트와 숨은 프롬프트의 차이](/images/library/claude-code-steganography-auditability-2026/02_transparent-vs-hidden-prompt.png)
<!--
  📸 이미지 프롬프트:
  prompt: "Split-screen editorial illustration comparing a transparent prompt pipeline on the left with a hidden prompt mutation pipeline on the right, one side clean and auditable, the other side showing faint invisible characters and a broken trail of evidence, minimal labels, dark background, teal/orange contrast, professional tech magazine style"
  aspect_ratio: "16:9"
  session_id: "library-claude-code-steganography-auditability-2026"
  save_as: "02_transparent-vs-hidden-prompt.png"
-->

## 운영자가 지금 당장 확인할 것

이런 사건을 보면 화부터 날 수 있다. 그런데 실무에서는 감정보다 점검이 먼저다. 내가 운영자라면 아래 순서로 본다.

1. 시스템 프롬프트를 가능한 한 원문으로 덤프해본다.
   - 날짜, 타임존, 호스트명, base URL, locale 같은 신호가 어디까지 들어가는지 본다.
2. 바이너리나 런타임이 프롬프트 문자열을 조립하는 지점을 분리해본다.
   - "문서상으로 이렇다"가 아니라 "실제로 여기서 바뀐다"를 찾는다.
3. 네트워크 경로와 환경변수를 같이 본다.
   - 숨은 마킹이 단순 텍스트 문제가 아니라 telemetry나 proxy detection으로 이어질 수 있기 때문이다.
4. untrusted content 경로를 다시 점검한다.
   - hidden markdown, invisible characters, HTML comment, file attachment metadata 같은 경로를 차단하거나 sanitization한다.
5. 감사 로그를 남긴다.
   - 누가 언제 어떤 입력으로 어떤 프롬프트를 만들었는지 재구성 가능해야 한다.

이 체크리스트의 목적은 Anthropic 한 회사만 때리는 게 아니다. 앞으로 모든 agent product가 비슷한 문제를 맞을 수 있기 때문이다. 에이전트가 외부 세계를 더 깊이 건드릴수록, "보이지 않는 입력 변화"는 더 큰 사고로 자라난다.

## 김덕환 운영자 관점

김덕환 운영자 관점에서 보면 이건 꽤 직설적인 경고다. 에이전트를 쓰는 순간부터 우리는 단순히 "모델이 답을 잘하냐"를 보는 게 아니라, "운영 환경이 입력을 어디까지 바꿀 수 있느냐"를 봐야 한다. 특히 혼자 여러 도구를 붙여 굴리는 경우엔, 작은 비대칭이 하루치 디버깅 시간을 통째로 먹는다. 나는 이런 이슈가 기능의 문제가 아니라 운영 철학의 문제라고 본다.

## 결론

Claude Code의 숨은 마킹 논란은 한 번의 해프닝으로 끝날 수도 있다. 하지만 더 큰 신호는 분명하다. 에이전트 시장의 경쟁 축이 점점 모델 성능에서 운영 투명성, 감사 가능성, 정책 준수로 옮겨가고 있다는 점이다.

앞으로의 질문은 "이 모델이 똑똑한가"가 아니다. "이 모델을 둘러싼 런타임이 내가 믿을 수 있는 방식으로 움직이는가"다. 그리고 그 신뢰는, 숨은 문자를 감추는 능력이 아니라 숨김이 없음을 증명하는 능력에서 나온다.

## 참고 자료

- [Claude Code Is Steganographically Marking Requests](https://thereallo.dev/blog/claude-code-prompt-steganography)
- [Claude Code is steganographically marking requests | Hacker News](https://news.ycombinator.com/item?id=48734373)
- [claude-code-action security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)
