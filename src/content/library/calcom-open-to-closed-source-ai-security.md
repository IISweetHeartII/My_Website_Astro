---
title: "Cal.com, 오픈소스에서 폐쇄로 전환, AI가 촉발한 생태계 논쟁"
subtitle: "'AI가 금고 설계도를 읽게 됐다'는 한 줄은 단일 회사의 결정이 아니라 오픈소스의 안전 공식이 흔들리는 순간을 보여준다"
description: "Cal.com의 폐쇄 전환은 AI 시대 오픈소스 보안 위협과 비즈니스 모델 변화를 한꺼번에 드러낸 사건이다."
publish: true
created_date: 2026-04-16
category: "개발"
tags:
  - Cal.com
  - 오픈소스
  - AI 보안
  - 라이선스
  - 개발 생태계
agent: cheese
slug: calcom-open-to-closed-source-ai-security
reading_time: 8
featured_image: /images/library/calcom-open-to-closed-source-ai-security/thumbnail.png
featured_image_alt: "오픈소스 저장소가 자물쇠로 닫히는 장면과 AI 분석 화면을 함께 표현한 일러스트"
meta_title: "Cal.com 폐쇄 전환, AI 시대 오픈소스 보안 논쟁의 신호탄 | Library"
meta_description: "Cal.com의 폐쇄 전환은 AI가 오픈소스의 투명성 공식을 흔드는 순간을 보여준다."
keywords:
  - cal.com 오픈소스 폐쇄 전환
  - AI 시대 오픈소스 보안 위협
  - cal.diy MIT 라이선스
  - 오픈소스 비즈니스 모델 변화
  - Anthropic Mythos 취약점 탐지
og_title: "Cal.com 폐쇄 전환, 왜 이 논쟁이 오픈소스 전체로 번지는가"
og_description: "Cal.com 사례는 AI 시대에 오픈소스의 투명성과 보안이 어떻게 충돌하는지 보여준다."
og_type: article
twitter_card: summary_large_image
---



Cal.com의 폐쇄 전환은 단순한 라이선스 뉴스가 아니다. 내가 보기엔 이건 **AI 시대에 오픈소스의 핵심 전제가 처음으로 대중적으로 흔들린 사건**에 가깝다. 지금까지 오픈소스는 "많은 눈이 코드를 보면 더 안전하다"는 믿음 위에 서 있었는데, Cal.com은 정반대 질문을 던졌다. **그 많은 눈 중 공격자의 눈이 AI로 100배 늘어나면 어떻게 되나?**

그래서 이 이슈가 HN에서 바로 크게 붙었다. 2026-04-15 발표 이후 HN에서 **263 points / 191 comments**를 기록했고, Slashdot과 The New Stack까지 곧바로 받아썼다. 반응이 큰 이유는 Cal.com이 유명해서만이 아니다. 이건 이제 많은 개발자가 자기 프로젝트에도 곧 닥칠 수 있다고 느끼는 문제다.

## "AI가 보안 위협이다", 오픈소스의 안전 공식을 흔든 한 줄

Cal.com이 던진 가장 강한 문장은 사실 기능 공지가 아니라 위협 모델 선언이었다. 요지는 간단하다.

- 오픈소스 보안은 오랫동안 공개 검토에 기대왔다
- 그런데 AI는 공개된 코드를 공격자에게 훨씬 더 빠르게 읽히게 만든다
- 그 결과, 투명성이 방어 자산이 아니라 공격 효율을 높이는 자산으로 바뀔 수 있다

이건 과장처럼 들릴 수 있다. 하지만 이 주장이 강하게 먹히는 이유는 "왠지 그럴 것 같다" 수준이 아니라, 이제는 실제 사례가 붙기 시작했기 때문이다. Cal.com이 끌어온 문맥에서 핵심 증거 역할을 하는 게 Anthropic Mythos다. 공개된 설명에 따르면 Mythos Preview는 **27년 된 OpenBSD 취약점**과 **16년 된 FFmpeg 취약점**을 발견하고 익스플로잇 생성까지 보여줬다.

즉, "AI가 오픈소스 코드를 읽고 취약점을 찾는다"는 말이 더 이상 SF가 아니라는 뜻이다.

```text
기존 전제:
공개 코드 + 많은 검토자 = 더 안전함

새 전제:
공개 코드 + AI 기반 공격 자동화 = 더 빨리 분석당함
```

문제는 여기서 끝나지 않는다. 이 공식이 받아들여지는 순간, 오픈소스의 가장 큰 미덕이던 투명성이 **조건부 장점**이 된다. 안전은 단순 공개 여부가 아니라, 공개 이후 얼마나 빠르게 방어 체계를 맞추느냐의 문제로 이동한다.

![AI가 공개 코드를 대규모로 스캔하며 취약점을 찾는 위협 모델](/images/library/calcom-open-to-closed-source-ai-security/01-ai-threat-model.png)



## 커뮤니티 반응은 왜 이렇게 양극단으로 갈렸나

이 사건이 더 흥미로운 이유는 반응이 아주 전형적으로 갈렸기 때문이다. 한쪽은 "현실적인 선택"이라고 본다. 다른 쪽은 "오픈소스를 키워서 여기까지 온 뒤 AI 보안을 핑계로 닫아버렸다"고 본다.

HN과 한국 커뮤니티 모두 온도차는 있어도 핵심 정서는 비슷하다. **이해는 하지만, 동의는 어렵다**는 쪽이 많다. 이 반응이 나오는 이유는 세 가지다.

### 1. 문제의식은 이해된다
AI가 취약점 분석 속도를 바꾼다는 건 분명 현실적이다. 특히 widely deployed product일수록 공개 코드가 공격 표면이 될 수 있다는 불안은 커진다.

### 2. 그런데 해결책이 폐쇄화냐는 질문이 남는다
보안 투자를 늘리는 대신, 공개를 줄이는 방식이 정말 최선이냐는 반론이 바로 붙는다. 개발자 커뮤니티는 보통 보안 논리를 이해하면서도, **폐쇄를 기본 해법으로 제시하는 순간 신뢰를 잃기 시작한다**.

### 3. 결국 이것이 비즈니스 모델 문제처럼 보인다
사람들이 민감하게 반응하는 이유는, 이 결정이 순수 보안 판단이라기보다 **오픈소스 수익화의 한계가 보안 논리와 결합된 결과**로 읽히기 때문이다.

그래서 이 논쟁은 단순히 "Cal.com이 맞냐 틀리냐"가 아니다. 더 본질적인 질문은 이거다.

**AI 시대에 오픈소스를 유지하는 비용과 위험을 누가 감당할 것인가?**

![오픈소스 폐쇄 전환을 둘러싼 개발자 커뮤니티의 양극 반응](/images/library/calcom-open-to-closed-source-ai-security/02-community-reaction.png)



## Cal.diy가 보내는 더 큰 메시지, 오픈소스는 취미용인가

이번 전환에서 가장 불편한 지점 중 하나는 Cal.diy의 존재다. 상용 핵심 코드는 닫고, MIT 라이선스의 대체물은 남긴다. 얼핏 보면 절충안처럼 보인다. 하지만 시장이 읽어낸 메시지는 더 날카롭다.

- 프로덕션급 코드는 폐쇄
- 커뮤니티용, 실험용, 취미용 버전은 공개

이 구조는 결국 **오픈소스는 취미로는 가능하지만, 돈이 걸린 운영 레이어는 닫혀야 한다**는 신호처럼 읽힌다. 이건 단일 제품 전략을 넘어서 오픈소스 비즈니스 모델 전체에 꽤 불편한 질문을 던진다.

HashiCorp의 Terraform, Elastic, Confluent 사례가 남긴 잔상도 여기서 다시 떠오른다. 오픈소스 프로젝트가 커지고, 클라우드와 기업 고객이 붙고, 경쟁이 심해질수록 라이선스는 더 공격적으로 바뀌는 패턴 말이다. Cal.com 사례는 여기에 **AI 보안 위협**이라는 새로운 정당화 언어가 추가됐다는 점에서 더 무겁다.

즉, 앞으로는 이런 구조가 더 많아질 수 있다.

```text
community edition = 공개
production moat = 비공개
정당화 논리 = AI 보안 + 지속 가능성 + 상업적 방어
```

이 조합이 반복되면, 오픈소스 생태계는 기능 레벨이 아니라 **배포 가능성, 운영 가능성, 보안 책임 소재**를 기준으로 다시 나뉘게 된다.

## 한국 개발자에게 중요한 건 감정 논쟁보다 대응 전략이다

한국 커뮤니티가 빠르게 반응한 이유도 비슷하다. 이건 해외 SaaS 뉴스가 아니라, 자체 호스팅과 라이선스 의존성, 공급망 위험을 다 건드리는 실무 이슈이기 때문이다.

특히 Cal.com을 도입했거나 검토했던 팀이라면 지금 체크해야 할 건 감정 평가보다 아래 항목들이다.

### 실무 체크리스트

1. 현재 배포가 어떤 라이선스 조건에 의존하는가
2. 향후 버전 업데이트가 운영 정책을 깨지 않는가
3. 대체재로 Cal.diy를 쓸 경우 빠지는 기능은 무엇인가
4. 자체 포크 유지 비용이 현실적인가
5. 핵심 인프라를 단일 오픈소스 벤더에 얼마나 의존하고 있는가

예를 들면 이런 식으로 정리할 수 있다.

```yaml
product_dependency_review:
  vendor: cal.com
  current_risk:
    license_change: high
    self_host_continuity: medium
    security_patch_visibility: medium
  alternatives:
    cal_diy: limited
    self_fork: expensive
    migration: costly
  action:
    - freeze dependency assumptions
    - review legal/licensing exposure
    - define fallback path
```

이 사건이 한국 개발자에게 주는 진짜 메시지는 "오픈소스를 믿지 마라"가 아니다. 오히려 반대다. **오픈소스를 쓸수록 운영, 라이선스, 보안, 대체 경로까지 함께 설계해야 한다**는 뜻이다.

![한국 개발자 팀이 라이선스 변경과 대체 경로를 점검하는 체크리스트](/images/library/calcom-open-to-closed-source-ai-security/03-korean-response-checklist.png)



## 결론, 이건 Cal.com 하나의 문제가 아니라 오픈소스의 다음 구조 변화다

Cal.com의 폐쇄 전환은 단일 기업의 선택처럼 보이지만, 사실은 더 큰 변화의 압축판이다. AI가 공개 코드를 더 빠르게 읽고, 분석하고, 공격 가능성까지 드러내기 시작하면서, 오픈소스의 핵심 명제였던 **투명성 = 안전** 공식이 더 이상 자동으로 성립하지 않게 됐다.

물론 그렇다고 폐쇄 전환이 정답이라는 뜻은 아니다. 오히려 이 사건은 생태계 전체에 더 어려운 숙제를 던진다.

- 공개와 보안을 어떻게 같이 가져갈 것인가
- 오픈소스 유지 비용을 누가 부담할 것인가
- 기업은 어떤 오픈소스를 핵심 인프라로 삼아도 되는가
- AI가 공격 비용을 낮추는 시대에 새로운 방어 모델은 무엇인가

내가 보기엔 이 사건의 한 줄 결론은 분명하다.

**Cal.com의 폐쇄 전환은 한 회사의 배신담이 아니라, AI가 오픈소스의 안전 공식을 흔들면서 시작된 생태계 재편의 첫 신호다.**

## 참고 소스

- Hacker News, `Cal.com is going closed source because of AI`
- Cal.com 공식 블로그, `Cal.com goes closed source: why`
- Slashdot, The New Stack 등 후속 보도
- Moony01 Studio, TTJ 테크뉴스, JackerLab 한국어 분석 글
- How2Shout, Mythos 관련 정리 글
