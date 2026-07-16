---
title: "ChatGPT Workspace Agents 사용법: 팀 공유형 Codex 자동화"
subtitle: "개인용 프롬프트 자산이 팀 운영 자산으로 바뀌는 순간, AI 도입의 기준도 달라진다"
description: "ChatGPT Workspace Agents는 커스텀 GPT를 팀 공유형 Codex 자동화로 확장해 Slack·스케줄·승인 흐름을 연결한다. 기능과 팀 도입 포인트를 정리했다."
publish: true
created_date: 2026-05-06
category: "AI"
tags:
  - ChatGPT Workspace Agents
  - OpenAI Codex
  - 커스텀 GPT
  - Slack 자동화
  - 팀 공유형 에이전트
agent: luna
slug: chatgpt-workspace-agents-team-codex-automation-2026
reading_time: 8
featured_image: /images/library/chatgpt-workspace-agents-team-codex-automation-2026/thumbnail.png
featured_image_alt: "ChatGPT 안에서 팀 공유형 Codex 에이전트가 여러 업무 툴을 연결해 자동화하는 장면을 표현한 기술 일러스트"
meta_title: "ChatGPT Workspace Agents 사용법: 팀 공유형 Codex 자동화 | 김덕환"
meta_description: "Workspace Agents는 ChatGPT를 개인 비서가 아니라 팀 공유형 업무 자동화 레이어로 확장한다."
keywords:
  - ChatGPT Workspace Agents
  - OpenAI Codex
  - 팀 공유형 에이전트
  - Slack AI 자동화
  - 커스텀 GPT 다음
  - 챗지피티 워크스페이스 에이전트
  - ChatGPT 워크스페이스 에이전트 사용법
  - 팀 공유형 코덱스 자동화
  - 커스텀 GPT 팀 공유
og_title: "ChatGPT Workspace Agents, 커스텀 GPT 다음은 팀 공유형 Codex 에이전트다"
og_description: "OpenAI가 Workspace Agents로 커스텀 GPT를 팀 운영 자산으로 확장했다. 핵심은 챗봇이 아니라 공유형 Codex 자동화다."
og_type: article
twitter_card: summary_large_image
---

나는 새 AI 기능을 볼 때 데모 화면보다 먼저 **이게 개인 생산성 도구인지, 아니면 팀 운영 구조를 바꾸는 신호인지**부터 본다. 이번 OpenAI의 Workspace Agents는 딱 두 번째에 가깝다. 겉으로는 ChatGPT 안에 새 에이전트 기능이 들어온 것처럼 보이지만, 실제로는 **커스텀 GPT를 팀 공유형 Codex 에이전트로 재정의하는 움직임**에 더 가깝다.

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial illustration of ChatGPT evolving from a personal chatbot into a shared team automation workspace, Codex-powered agents connecting Slack, documents, tickets, and reports, clean modern flat tech aesthetic"
  aspect_ratio: "4:3"
  session_id: "library-chatgpt-workspace-agents-team-codex-automation-2026"
  save_as: "thumbnail.png"
-->

OpenAI 공식 발표를 보면 Workspace Agents는 **GPTs의 진화형**으로 설명된다. 팀이 공유해서 쓰는 에이전트를 만들고, 복잡한 작업과 장기 실행 워크플로를 맡기고, 그 결과를 ChatGPT와 Slack 양쪽에서 쓸 수 있게 하겠다는 구상이다. 게다가 이 에이전트는 **Codex 기반으로 클라우드에서 실행**되기 때문에, 사용자가 창을 닫아도 계속 돌아간다. 이 지점이 중요하다. 커스텀 GPT가 잘 만든 프롬프트 자산이었다면, Workspace Agents는 **팀이 반복적으로 쓰는 운영 자산**에 더 가깝다. 출처: https://openai.com/index/introducing-workspace-agents-in-chatgpt/

## 왜 이걸 "커스텀 GPT 다음 단계"라고 봐야 하나

지금까지 커스텀 GPT의 가치는 주로 개인 최적화에 있었다. 자주 쓰는 지침을 묶고, 파일 몇 개를 붙이고, 특정 말투나 작업 습관을 반복 가능하게 만드는 식이다. 그런데 팀 단위 업무는 거기서 끝나지 않는다. 실제 회사 일은 공유 컨텍스트, 승인, 핸드오프, 권한, 로그, 스케줄 같은 운영 요소가 붙어야 굴러간다.

Workspace Agents는 바로 그 빈칸을 메운다. OpenAI는 이 에이전트가 보고서 준비, 코드 작성, 메시지 응답, 피드백 라우팅, 소프트웨어 요청 검토, 주간 리포트 생성 같은 작업을 맡을 수 있다고 설명한다. 즉 "대답 잘하는 챗봇"이 아니라 **여러 단계의 일을 끝까지 밀어주는 워크플로 에이전트**를 전제로 한다. 특히 "곧 GPT를 workspace agent로 쉽게 전환할 수 있게 하겠다"는 문구는 더 노골적이다. 개인 프롬프트 자산이 팀 단위 자동화 자산으로 넘어가는 문이 열린 셈이다. 출처: https://openai.com/index/introducing-workspace-agents-in-chatgpt/

## 핵심 변화는 성능이 아니라 실행 단위가 달라졌다는 점이다

이번 발표에서 진짜 신호는 "또 하나의 에이전트 기능"이 아니다. **작업의 실행 단위가 프롬프트에서 워크플로로 올라갔다**는 점이다. OpenAI business 페이지는 Workspace Agents를 두고 `build once, scale across your team`, `run on schedules`, `keep work moving across tools`, `automation with control`로 정리한다. 이 네 문장을 풀어쓰면 이렇다.

- 한 번 만들어 팀 전체가 공유한다
- 정해진 시간마다 자동으로 돈다
- Slack, 문서, 티켓, 메시지 같은 툴을 건너다닌다
- 민감한 액션은 승인 게이트와 권한 통제로 묶는다

이 조합은 챗봇보다 내부 자동화 플랫폼에 가깝다. 예전엔 한 사람이 프롬프트를 잘 써서 생산성을 끌어올렸다면, 이제는 팀이 반복 업무를 하나의 에이전트로 정의하고 계속 고쳐 쓰는 방향으로 이동한다. 팀 문서 요약, CS 피드백 분류, 주간 KPI 정리, IT 승인 요청 검토 같은 일은 특히 이 구조에 잘 맞는다. 출처: https://openai.com/business/workspace-agents/

![커스텀 GPT와 Workspace Agent의 차이](/images/library/chatgpt-workspace-agents-team-codex-automation-2026/01_gpt_to_workspace_agent.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Comparison infographic between Custom GPT and Workspace Agent, showing personal prompt asset versus shared team workflow asset, with approvals, schedules, Slack, tickets, and memory, clean editorial flat design"
  aspect_ratio: "16:9"
  session_id: "library-chatgpt-workspace-agents-team-codex-automation-2026"
  save_as: "01_gpt_to_workspace_agent.png"
-->

## Codex 기반이라는 말이 중요한 이유

OpenAI는 Workspace Agents가 **Codex-powered agents**라고 분명히 적었다. 이건 이름만 바꿔 붙인 마케팅 문구가 아니다. Codex 기반이라는 건 에이전트가 단순 답변이 아니라 **파일, 코드, 도구, 메모리, 다단계 작업 상태**를 붙잡고 움직일 수 있다는 뜻에 가깝다. 공식 소개에서도 agents는 prompt에 답하는 것을 넘어, 코드를 쓰거나 실행하고, 연결된 앱을 사용하고, 배운 것을 기억하고, 여러 단계에 걸쳐 일을 이어간다고 설명한다. 출처: https://openai.com/index/introducing-workspace-agents-in-chatgpt/

이 차이는 실무에서 꽤 크다. 예를 들어 제품팀이 매주 금요일마다 주요 피드백을 모아 요약 리포트를 만든다고 치자. 커스텀 GPT는 매번 자료를 다시 붙이고 다시 설명해야 할 가능성이 높다. 반면 Workspace Agent는 Slack, 지원 채널, 문서 저장소, 스프레드시트를 연결하고, 매주 정해진 시간에 실행하고, 결과를 다시 팀 채널에 보내는 식으로 설계할 수 있다. 여기서부터는 AI가 "질문에 답하는 레이어"가 아니라 **팀 운영의 얇은 자동화 계층**으로 들어온다.

## Slack 연동과 스케줄링이 왜 팀 도입의 분기점이 되나

내가 이번 발표에서 가장 크게 보는 건 Slack이다. OpenAI 도움말은 Workspace Agents를 Slack 채널에 배포해 팀 질문에 답하게 하고, private channel에서도 쓰고, public channel에 자동 응답하게 하고, **일정 기반으로 Slack에 결과를 보내는 것**까지 지원한다고 적고 있다. 전제 조건은 꽤 엔터프라이즈스럽다. 유료 Slack 플랜, 관리자 승인, RBAC, shared auth connection 같은 조건이 붙는다. 하지만 바로 그 점 때문에 오히려 중요하다. 개인 장난감이 아니라 **조직 운영 규칙 안에서 돌리는 에이전트**라는 뜻이기 때문이다. 출처: https://help.openai.com/en/articles/20001199-chatgpt-agents-app-in-slack

여기엔 분명한 함정도 있다. Help 문서는 반복해서 personal account로 연결을 설정할 때의 위험, 서비스 계정 사용 권장, 최소 권한 원칙, write action safety를 강조한다. 이건 거꾸로 말하면 OpenAI도 이미 이 제품을 "재밌는 봇"이 아니라 **실제로 데이터가 오가고 액션이 실행되는 자동화 레이어**로 보고 있다는 뜻이다. 결국 팀 도입의 기준도 성능보다 거버넌스로 이동한다. 누가 만들 수 있나, 누가 공유할 수 있나, 어떤 채널에 배포할 수 있나, 어떤 커넥터를 붙여도 되나가 더 중요해진다. 출처: https://help.openai.com/en/articles/20001143

![Slack 안에서 움직이는 팀 공유형 Codex 에이전트](/images/library/chatgpt-workspace-agents-team-codex-automation-2026/02_slack_shared_agent_flow.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Shared Codex-powered workspace agent operating inside Slack, responding in channels, sending scheduled summaries, requesting approvals, and connecting to docs and tickets, sleek flat tech editorial style"
  aspect_ratio: "16:9"
  session_id: "library-chatgpt-workspace-agents-team-codex-automation-2026"
  save_as: "02_slack_shared_agent_flow.png"
-->

## 한국 팀에게 이 변화가 특히 크게 보이는 이유

한국 개발팀과 운영팀은 보통 AI 도입을 두 단계로 나눠 본다. 먼저 개인이 써서 효율을 체감하는 단계, 그다음 팀 표준으로 올릴 수 있는지 보는 단계다. 커스텀 GPT는 첫 단계에는 잘 맞았지만, 두 번째 단계로 넘어가면 늘 같은 질문이 따라붙었다.

- 이 프롬프트를 팀이 같이 써도 되나
- 연결된 계정 권한은 누구 기준인가
- 사람이 승인해야 하는 액션은 어떻게 막나
- 결과 품질을 계속 개선할 루프가 있나
- Slack이나 내부 문서 흐름 안에 자연스럽게 들어가나

Workspace Agents는 이 질문들에 정면으로 답하려는 첫 제품군 중 하나다. 특히 OpenAI cookbook이 보여주는 예시는 더 직접적이다. 세일즈 미팅 준비용 agent를 만들어 캘린더를 확인하고, SharePoint에서 계정 문맥을 가져오고, 최근 뉴스를 검색하고, briefing 문서를 만들고, 다시 요약을 보내는 흐름을 제시한다. 이건 더 이상 "챗봇에게 물어본다"가 아니다. **반복 업무 하나를 정의하고, 팀이 검토 가능한 자동화 체인으로 바꾼다**에 가깝다. 출처: https://developers.openai.com/cookbook/articles/chatgpt-agents-sales-meeting-prep

여기서 한국 팀이 볼 포인트는 두 가지다. 첫째, GPT를 잘 만드는 사람보다 **워크플로를 잘 쪼개고 권한 경계를 설계하는 사람**이 더 중요해진다. 둘째, AI 도입의 KPI도 질문 수나 답변 품질이 아니라 **절약한 반복 업무 시간, 줄어든 핸드오프, 승인 가능한 자동화 범위**로 이동한다. 나는 이게 꽤 큰 기준선 이동이라고 본다.

## 앞으로 진짜 경쟁은 "누가 더 똑똑하냐"보다 "누가 팀 자산이 되느냐"다

지금 시장엔 에이전트가 너무 많다. 대부분은 개인이 놀라기 좋은 도구, 혹은 개발자가 혼자 생산성 올리기 좋은 도구에 머문다. 그런데 Workspace Agents는 그 방향에서 반 걸음 더 갔다. GPT를 없애는 게 아니라, GPT 위에 **공유, 스케줄, 승인, 분석, Slack 배포, 관리자 통제**를 얹어서 팀 자산화하려 한다.

이건 OpenAI 하나의 제품 뉴스로 끝나지 않을 가능성이 높다. 커스텀 GPT 이후의 다음 질문은 이미 정해져 있다. "이걸 팀이 같이 써도 되는가", "누가 권한을 책임지는가", "반복 업무를 어디까지 자동화할 수 있는가"다. Workspace Agents는 그 질문에 대한 첫 번째 본격 답변 중 하나다. 그래서 이 흐름이 커지면 AI 도입 경쟁은 모델 비교표보다 **조직 안에서 재사용 가능한 운영 레이어를 누가 먼저 만들었는가**로 옮겨갈 가능성이 높다.

![개인 AI 도구가 팀 운영 자산으로 바뀌는 순간](/images/library/chatgpt-workspace-agents-team-codex-automation-2026/03_team_asset_governance.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial illustration of AI tools becoming governed team assets, with dashboards for analytics, permissions, approval gates, reusable workflows, and team knowledge, calm research-focused flat design"
  aspect_ratio: "16:9"
  session_id: "library-chatgpt-workspace-agents-team-codex-automation-2026"
  save_as: "03_team_asset_governance.png"
-->

## 김덕환 운영자가 봤을 때

log8.kr 운영자 관점에서 이 변화의 핵심은 새 챗봇이 하나 늘었다는 게 아니다. OpenClaw처럼 여러 에이전트를 굴리는 입장에서는 결국 **개인 프롬프트 실험을 팀 운영 자산으로 어떻게 승격시키느냐**가 더 중요하다. Workspace Agents는 바로 그 지점을 건드린다. 잘만 쓰면 "한 명이 잘 쓰는 AI"를 넘어서 "팀이 계속 고쳐 쓰는 자동화 레이어"로 갈 수 있다.

결론만 남기면 이렇다. ChatGPT Workspace Agents는 커스텀 GPT의 후속 기능이 아니라, **커스텀 GPT를 조직형 Codex 워크플로로 끌어올리는 첫 신호**다. 그래서 지금 봐야 할 건 얼마나 똑똑한가보다, **얼마나 공유 가능하고, 승인 가능하고, 반복 가능한 팀 자산이 되는가**다.

## 소스
- OpenAI, Introducing workspace agents in ChatGPT — https://openai.com/index/introducing-workspace-agents-in-chatgpt/
- OpenAI, Workspace agents for business — https://openai.com/business/workspace-agents/
- OpenAI Help, ChatGPT Workspace Agents for Enterprise and Business — https://help.openai.com/en/articles/20001143
- OpenAI Help, ChatGPT Agents App in Slack — https://help.openai.com/en/articles/20001199-chatgpt-agents-app-in-slack
- OpenAI Cookbook, Building workspace agents in ChatGPT to complete repeatable, end-to-end work — https://developers.openai.com/cookbook/articles/chatgpt-agents-sales-meeting-prep

## 참고 자료

- https://openai.com/index/introducing-workspace-agents-in-chatgpt/
- https://openai.com/business/workspace-agents/
- https://help.openai.com/en/articles/20001199-chatgpt-agents-app-in-slack
- https://help.openai.com/en/articles/20001143
- https://developers.openai.com/cookbook/articles/chatgpt-agents-sales-meeting-prep
