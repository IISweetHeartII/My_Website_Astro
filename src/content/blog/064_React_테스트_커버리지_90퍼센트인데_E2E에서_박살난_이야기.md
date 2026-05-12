---
title: "React 테스트 커버리지 90%인데 E2E에서 박살난 이야기"
subtitle: "Vitest 5개 프로젝트, 그리고 Cypress에서 Playwright로 갈아탄 이유"
description: "단위 테스트 커버리지가 높으면 안전할 줄 알았다. E2E를 돌리는 순간 무너졌다. 5개 프로젝트에서 Vitest를 쓰면서 깨달은 함정."
publish: false
meta_title: "React 테스트 커버리지 90%인데 E2E에서 박살난 이야기 | 김덕환"
meta_description: "Vitest, RTL, MSW, Playwright 실전 후기. 커버리지 숫자에 속지 않는 법."
keywords:
  - React 테스트
  - Vitest
  - Playwright
  - Cypress
  - 테스트 커버리지
  - E2E 테스트
  - RTL
  - MSW
og_title: "React 테스트 커버리지 90%인데 E2E에서 박살난 이야기"
og_description: "단위 테스트가 다 통과해도 E2E에서는 와장창. 5개 프로젝트 돌리면서 배운 것."
og_type: article
twitter_card: summary_large_image
created_date: 2026-05-12
updated_date: 2026-05-12
category: "개발"
featured_image: /images/blogs/064/064_00_thumbnail.png
featured_image_alt: "테스트 커버리지 90%인데 E2E에서 박살나는 일러스트"
slug: react-test-coverage-vs-e2e-reality
tags:
  - React
  - Vitest
  - Playwright
  - 테스트
  - 프론트엔드
---

테스트 커버리지 90% 찍었다. 안심했다. 그날 저녁 E2E를 돌렸다.

빨간 줄이 화면을 덮었다.

![커버리지 90% 리포트 옆에서 폭발하는 E2E 결과](/images/blogs/064/064_00_thumbnail.png)

<!--
  📸 이미지 프롬프트:
  prompt: "split screen illustration, left side green test coverage report at 90 percent with smiling developer character, right side red e2e test failures exploding with same character looking shocked, flat illustration, soft pastel colors, consistent character design"
  aspect_ratio: "4:3"
  session_id: "blog-064"
  save_as: "064_00_thumbnail.png"
-->

---

## 왜 Vitest로 갔나

지난 1년 동안 React/Node 프로젝트 5개에 테스트를 깔았다. 전부 Vitest다.

| 프로젝트                 | 성격                 | 쓴 이유                 |
| ------------------------ | -------------------- | ----------------------- |
| AgentGram (agentgram-js) | AI 에이전트 SDK      | ESM 네이티브 필요       |
| ax-score                 | 점수 계산 라이브러리 | 빠른 단위 테스트        |
| D-Link FE                | 팀 프로젝트          | Vite 기반이라 자동 선택 |
| Hebbian                  | 메시지 인박스        | TS + ESM 가볍게         |
| Testopi                  | 개인 도구            | 커버리지까지 붙임       |

Jest를 한 번도 안 깔았다는 게 신기했다. 이유는 단순했다.

- 신규 프로젝트 대부분 Vite 기반이다. 설정을 공유받으면 된다
- Jest API와 거의 같다. 마이그레이션 비용이 0에 가깝다
- 실행이 체감으로 2-5배 빠르다. 작은 차이가 아니라 "기다리느냐 안 기다리느냐"의 차이

Jest가 죽은 건 아니다. 회사 코드베이스, React Native, `next/jest` 매직 세팅 쓰는 곳엔 여전히 산다. 다만 신규 프로젝트에서 굳이 Jest를 고를 이유를 못 찾았다.

---

## 커버리지 함정에 빠진 날

Testopi에서 `@vitest/coverage-v8`을 붙였다. 컴포넌트, 유틸, 훅 다 통과. 라인 커버리지 89%, 브랜치 84%. 숫자가 예뻤다.

문제는 그 다음이었다.

실제 사용자 흐름을 Playwright로 처음부터 끝까지 돌렸더니, 단위 테스트에서는 절대 안 나오던 에러가 줄줄이 나왔다.

- 로그인 후 토큰이 헤더에 안 붙어서 다음 API가 401
- 모달이 닫히는 애니메이션 중에 다음 버튼을 누르면 race condition으로 두 번 호출
- 페이지 이동 시 React Query 캐시가 갱신 안 돼서 옛 데이터가 깜빡 보임
- iOS Safari에서만 `100vh`가 키보드 올라올 때 깨짐

단위 테스트는 **컴포넌트 안에서 props가 잘 동작하는지**만 본다. 컴포넌트 **사이**, 페이지 **사이**, 브라우저와 서버 **사이**에서 일어나는 일은 보지 않는다.

90%라는 숫자는 그 모든 "사이"를 0%로 두고 만든 숫자였다.

![테스트 피라미드와 커버리지가 비추지 못하는 사이 공간](/images/blogs/064/064_01_test-pyramid-gaps.png)

<!--
  📸 이미지 프롬프트:
  prompt: "test pyramid illustration, unit tests at bottom in green, integration in middle yellow, e2e at top red, with dark gaps between layers labeled 'race condition' 'auth flow' 'cache' 'browser bugs', flat illustration, same character peering into the gaps with confused expression, soft pastel"
  aspect_ratio: "16:9"
  session_id: "blog-064"
  save_as: "064_01_test-pyramid-gaps.png"
-->

---

## Cypress에서 Playwright로 갈아탄 이유

E2E의 필요성을 깨닫고, 처음엔 Cypress를 썼다 ([22번 글](https://log8.kr/blog/cypress-e2e-testing)에 정리해뒀다). 시간여행, 자동 대기, 친절한 UI. 좋았다.

그런데 D-Link 프로젝트에 들어가서 Playwright를 처음 만났다. 한 달 만에 Cypress가 답답해졌다.

| 비교              | Cypress        | Playwright                     |
| ----------------- | -------------- | ------------------------------ |
| 브라우저          | Chromium 위주  | Chromium, Firefox, WebKit 전부 |
| 탭/창 다루기      | 어려움 (한 탭) | 자연스럽게 됨                  |
| 모바일 시뮬레이션 | 제한적         | 디바이스 프리셋 풍부           |
| 병렬 실행         | 유료 (Cloud)   | 무료, 기본 제공                |
| async/await       | Chain 문법     | 평범한 JS                      |
| 속도              | 느린 편        | 빠른 편                        |

iOS Safari 버그를 잡으려면 WebKit이 필요했다. Cypress로는 못 잡는다. Playwright는 `webkit.launch()` 한 줄이면 된다.

```ts
// playwright.config.ts
projects: [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'firefox',  use: devices['Desktop Firefox'] },
  { name: 'webkit',   use: devices['Desktop Safari'] },
  { name: 'iphone',   use: devices['iPhone 14'] },
],
```

이 한 블록으로 위에서 말한 iOS Safari `100vh` 버그를 잡았다. Cypress 그대로 갔다면 사용자 컴플레인이 와서야 알았을 것이다.

Cypress가 나쁘다는 게 아니다. 시작하기엔 더 친절하다. 다만 **실제 사용자 환경의 폭**이 커질수록 Playwright의 무게추가 무거워진다.

---

## 그래서 지금 내가 쓰는 조합

```
┌─────────────────────────────┐
│  Playwright (E2E)           │ ← 사용자 흐름, 브라우저별 검증
├─────────────────────────────┤
│  Vitest + RTL + MSW         │ ← 컴포넌트, 통합, API 모킹
├─────────────────────────────┤
│  Vitest (순수 함수)         │ ← 유틸, 훅, 비즈니스 로직
└─────────────────────────────┘
```

비중도 바뀌었다. 예전엔 "단위 80, 통합 15, E2E 5"였다면, 지금은 **"단위 50, 통합 30, E2E 20"**.

E2E는 느리고 비싸지만, 실제 사고가 거기서 난다. 그 비중을 더 줘야 한다는 걸 너무 늦게 알았다.

MSW는 같이 안 쓰면 손해다. 백엔드 안 기다리고 401, 500, 네트워크 타임아웃 다 시뮬레이션 된다. 단위/통합 단계에서 "실제 API 비스무리한 상황"을 만들어주는 유일한 도구다.

---

## 정리

- **신규 React/Node 프로젝트는 Vitest가 기본값.** Jest 굳이 안 가도 됨
- **커버리지 숫자에 속지 마라.** 90%는 "전체의 90%"가 아니라 "내가 본 곳의 90%"다
- **E2E 비중을 늘려라.** 5%는 너무 적다. 20% 정도는 가야 사용자 사고가 보인다
- **Cypress로 시작했다면 Playwright를 한 번 시도해봐라.** WebKit과 병렬 실행만으로도 갈 이유가 충분하다
- **MSW로 에러 케이스를 강제 시뮬레이션해라.** 진짜 사고는 200 OK가 아니라 401, 500, 타임아웃에서 난다

테스트는 코드가 안 깨지는지 보는 작업이 아니라, **내 가정이 안 깨지는지 보는 작업**이다. 단위 테스트는 한 컴포넌트 안의 가정만 본다. 사용자가 실제로 쓰는 흐름은 컴포넌트 밖에 있다.

숫자가 90이라고 안심하지 말 것. 그 90 너머가 진짜 위험 구역이다.

— 2026.05.12
