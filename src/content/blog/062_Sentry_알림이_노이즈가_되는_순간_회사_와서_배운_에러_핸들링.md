---
title: "Sentry 알림이 노이즈가 되는 순간 — 회사 와서 배운 에러 핸들링"
subtitle: "401, 403을 다 잡으면 진짜 장애를 놓친다"
description: "학생 때 try/catch만 배우면 끝나지만, 실무에선 '잡은 에러를 어디로 보내느냐'가 80%다. Sentry 노이즈, Axios 인터셉터, 에러 분류 멘탈 모델까지."
publish: true
meta_title: "Sentry 알림이 노이즈가 되는 순간 | 김덕환"
meta_description: "회사 와서 배운 React 에러 핸들링 — Sentry 노이즈를 만들지 않는 분류 기준, Axios 인터셉터로 단일 게이트키퍼 만들기, AI에게 정확히 시키는 법."
keywords:
  - 에러 핸들링
  - Sentry
  - Axios
  - React
  - 인터셉터
  - 실무
  - 프론트엔드
og_title: "Sentry 알림이 노이즈가 되는 순간"
og_description: "401, 403을 다 잡으면 진짜 장애를 놓친다 — 회사 와서 배운 에러 핸들링."
og_type: article
twitter_card: summary_large_image
created_date: 2026-05-03
updated_date: 2026-05-03
category: "개발"
featured_image: /images/blogs/062/062_00_thumbnail.png
featured_image_alt: "Sentry 알림 노이즈와 에러 분류 개념 일러스트"
slug: sentry-noise-error-handling-at-work
tags:
  - React
  - 에러핸들링
  - Sentry
  - Axios
  - 실무
---

회사 들어온 지 얼마 안 됐을 때, 선배가 한 말이 있다.

> "Sentry에 모든 에러가 다 잡히게 하면 안 돼."

처음엔 이해가 안 됐다. 에러는 다 잡아야 하는 거 아닌가? 안 잡으면 모르고 넘어가잖아.

근데 한 달쯤 지나서 Sentry 대시보드를 열어봤다. 401, 403, 401, ValidationError, 401, 403... 토큰 만료된 사용자, 권한 없는 페이지 접근, 폼 입력 오류. 전부 **예상 가능한** 에러였다. 그리고 그 예상 가능한 에러들이 **진짜 알아야 할** 런타임 에러를 묻고 있었다.

선배의 말이 그제야 와닿았다.

---

![Sentry 알람창에 쌓이는 401, 403 노이즈](/images/blogs/062/062_01_sentry-noise.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of a developer drowning in notification bells and alert icons, mostly labeled 401 and 403, with a small red flame icon hidden underneath, dark blue background, minimal style"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_01_sentry-noise.png"
-->

## 에러 핸들링이 왜 중요한가 — 학생 때 못 배운 이유

학생 때는 에러 핸들링을 배워도 "try/catch 잘 쓰자" 정도로 끝난다. 글로벌 ErrorBoundary 만들고, fallback UI 띄우고. 끝.

근데 실무는 다르다.

핵심은 **"에러를 잡느냐"가 아니라, "잡은 에러를 어디로 보내느냐"** 다.

학생 프로젝트는 사용자가 본인 한 명이다. 에러가 나든 말든 큰일 안 난다. 회사는 다르다. 매일 만 명, 십만 명이 들어온다. 그 중 일정 비율은 무조건 401을 본다 — 토큰 만료, 로그인 풀림. 그게 다 Sentry로 가면 진짜 알람은 묻힌다.

이걸 깨진 창문 이론이라고 부른다.

> 알람창에 노이즈가 쌓이면, 사람들은 알람을 보지 않게 된다.

그리고 알람을 보지 않게 되면, 진짜 사고가 났을 때 30분 늦게 발견한다.

---

## 에러 분류 — 예상 vs 예상 외

실무에서 가장 먼저 해야 하는 건 분류다.

| 종류           | 예시                       | 처리                           |
| -------------- | -------------------------- | ------------------------------ |
| 예상된 에러    | 401, 403, 422 (validation) | UI에서 안내 후 종료 — Sentry X |
| 인프라 에러    | 5xx, 네트워크 타임아웃     | 재시도 + 일정 횟수 후 Sentry   |
| 예상 못한 에러 | undefined.foo, unknown     | 무조건 Sentry                  |

이 분류를 코드 레벨에서 강제하지 않으면, 새로 들어온 사람이 자연스럽게 모든 에러를 다 보고하게 짠다. 안전하다고 느끼니까. 근데 그게 노이즈가 된다.

![예상된 에러와 예상 못한 에러를 분리하는 게이트](/images/blogs/062/062_02_error-classification.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of a sorting machine with three lanes — green for handled UI errors, yellow for retry, red for sentry alert, errors as colored boxes flowing through, minimal style, isometric perspective"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_02_error-classification.png"
-->

---

## Axios가 왜 글로벌 처리에 좋은가

Spring 백엔드 해본 사람은 `@ControllerAdvice` + `@ExceptionHandler` 패턴이 익숙할 거다. 모든 컨트롤러의 예외를 한 군데서 모아서 분류하고 응답을 변환한다.

프론트는? **Axios 인터셉터가 그 역할을 한다.**

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 예상된 에러 — Sentry로 안 보냄
    if (status === 401) {
      redirectToLogin();
      return Promise.reject(error);
    }
    if (status === 403) {
      showToast("권한이 없습니다");
      return Promise.reject(error);
    }
    if (status === 422) {
      // validation은 컴포넌트가 직접 처리
      return Promise.reject(error);
    }

    // 인프라 에러 — 알림
    if (status >= 500) {
      Sentry.captureException(error, {
        tags: { type: "infra" },
      });
    }

    return Promise.reject(error);
  },
);
```

여기가 핵심이다.

- **단일 진입점**: 모든 API 응답이 이 한 군데를 거친다
- **분류 책임 일원화**: 어디로 보낼지 결정하는 코드가 흩어지지 않는다
- **컴포넌트 단순화**: useQuery, useMutation 안에서 다시 try/catch 안 짜도 된다

스프링 `@ControllerAdvice` 가 백엔드 에러의 게이트키퍼라면, Axios 인터셉터는 프론트엔드 에러의 게이트키퍼다.

![Spring ControllerAdvice와 Axios interceptor 대응 구조](/images/blogs/062/062_03_axios-interceptor.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration showing two parallel architectures — left side labeled 'Spring @ControllerAdvice', right side labeled 'Axios Interceptor', both as funnels collecting requests into a single gate, minimal blue and green palette"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_03_axios-interceptor.png"
-->

---

## 안 하면 어떤 문제가 생기나

분류 없이 "다 잡아서 다 보내자" 하면 일어나는 일:

1. **Sentry 무료 티어 이벤트 한도가 며칠 만에 동남**
2. **알람 슬랙 채널이 무음 처리됨**
3. **진짜 장애가 났을 때 30분 늦게 발견**
4. **아무도 안 고치는 깨진 창문 = 기술 부채**

특히 마지막. 한번 노이즈가 쌓이면 정리하기 어렵다. "이 에러는 무시해도 되는 건가?" 판단을 매번 하게 되고, 결국 다 무시한다. 그리고 다 무시하기 시작하면 — Sentry는 그냥 비싼 로그 저장소가 된다.

---

## AI한테 에러 처리 시킬 때

요즘은 코드 짤 때 AI에게 시키는 일이 많다. 근데 그냥 "에러 처리 잘 해줘" 하면, AI는 무조건 모든 에러를 try/catch로 감싸고 console.error로 뿌린다. 학생 때 코드와 똑같다.

좀 더 정확하게 시키는 법:

> "이 에러는 예상된 것(401, 403, validation)이니 Sentry에 보내지 말고 UI에서 안내만 해. 5xx와 unknown 에러만 Sentry로 보내."

명시적으로 분류 기준을 주면 결과가 달라진다.

추가로 Claude Code의 `/security-review` 스킬을 PR 전에 한번 돌리면 — 보안 관련 에러 처리 누락도 같이 잡아준다. 인증 실패를 그냥 삼키는 코드, 토큰을 로그에 찍는 코드 같은 거.

(다른 에러 핸들링 보조 오픈소스 도구들은 다음 글에서 정리하겠다.)

![AI에게 에러 분류 기준을 명시적으로 전달하는 프롬프트](/images/blogs/062/062_04_ai-prompting.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of a developer giving a clear blueprint document to a robot assistant, the document showing a sorting tree with error categories, soft pastel palette, minimal style"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_04_ai-prompting.png"
-->

---

## 정리

회사 들어와서 가장 크게 바뀐 건 "에러를 어떻게 잡느냐" 가 아니라 **"잡은 에러를 어디로 보내느냐"** 였다.

학생 때는 잡기만 잘하면 됐다. 실무는 분류가 80%다.

- **예상된 에러는 UI로** — Sentry로 보내면 노이즈
- **인프라 에러는 재시도 후 Sentry**
- **예상 못한 에러만 무조건 Sentry**
- **분류는 Axios 인터셉터 한 군데에서** — Spring `@ControllerAdvice` 처럼

선배 한마디가 한 달 늦게 이해됐다. 이 글이 누군가에겐 더 빨리 닿길.

— 2026-05-03
