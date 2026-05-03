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

회사 들어온 지 얼마 안 됐을 때, 선배가 지나가듯 한 말이 있다.

> "Sentry에 모든 에러가 다 잡히게 하면 안 돼."

처음엔 이해가 안 됐다. 에러는 다 잡아야 하는 거 아닌가? 안 잡으면 모르고 넘어가잖아. 학교에선, 부트캠프에선 분명히 그렇게 배웠는데.

근데 한 달쯤 지나서 내가 짠 코드가 올라간 Sentry 대시보드를 처음 열어봤다.

```
401 Unauthorized × 3,247
403 Forbidden × 1,891
422 ValidationError × 5,412
401 Unauthorized × 824
...
```

토큰 만료된 사용자, 권한 없는 페이지 접근, 폼 입력 오류. 전부 **예상 가능한** 에러였다. 그리고 그 예상 가능한 에러들이 **진짜 알아야 할** 런타임 에러를 묻고 있었다. 어딘가 페이지 한 곳이 정말로 터지고 있었는데, 401 만 개 사이에 끼어 있었다.

선배의 말이 그제야 와닿았다.

이 글은 학생 때 못 배웠던, "에러를 잡고 나서" 의 이야기다.

---

![Sentry 알람창에 쌓이는 401, 403 노이즈](/images/blogs/062/062_01_sentry-noise.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of a developer drowning in notification bells and alert icons, mostly labeled 401 and 403, with a small red flame icon hidden underneath, dark blue background, minimal style"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_01_sentry-noise.png"
-->

## 학생 때는 안 배우는 것

학생 때는 에러 핸들링을 배워도 보통 여기서 끝난다.

- `try/catch` 잘 쓰자
- React에서는 `ErrorBoundary` 만들자
- 에러 나면 `console.error` 찍고, fallback UI 띄우자

처음엔 이게 전부인 줄 알았다. 책에도 그렇게 나오니까.

근데 회사 와서 보니 진짜 어려운 건 다른 데 있었다.

**핵심은 "에러를 잡느냐" 가 아니라, "잡은 에러를 어디로 보내느냐" 다.**

학생 프로젝트는 사용자가 본인 한 명이다. 에러가 나든 말든 큰일 안 난다. 콘솔에 빨간 글씨 떠도 그냥 새로고침 한 번이면 끝이다.

회사는 다르다.

매일 만 명, 십만 명이 들어온다. 그 중 일정 비율은 무조건 401을 본다 — 토큰 만료, 로그인 풀림, 다른 탭에서 로그아웃. 또 일정 비율은 403을 본다 — 권한 없는 페이지 직접 URL로 진입, 만료된 결제 권한. 그리고 폼을 잘못 채워서 422를 받는 사람들. 이게 모두 "진짜 장애" 가 아니라 **"정상적으로 일어나는 일"** 이다.

그 정상적인 일이 다 Sentry로 가면? 진짜 알람은 묻힌다.

이걸 깨진 창문 이론이라고 부른다.

> 알람창에 노이즈가 쌓이면, 사람들은 알람을 보지 않게 된다.
> 알람을 보지 않게 되면, 진짜 사고가 났을 때 30분 늦게 발견한다.

---

## Sentry가 노이즈가 되는 4단계

내가 본 패턴은 이렇다. 거의 항상 이 순서로 망가진다.

**1단계 — "일단 다 보내자".** 신입이 들어와서 안전하게 짠다. 모든 API 호출에 `try/catch`. catch 안에서 `Sentry.captureException`. 안전제일.

**2단계 — 알람 채널이 시끄러워짐.** 처음엔 슬랙 채널에 올라오는 401, 403을 누군가 일일이 본다. "이건 그냥 토큰 만료네", "이건 폼 validation이네". 한 사람이 견디다가 결국 알람 채널을 음소거한다.

**3단계 — 진짜 장애를 늦게 발견.** 어느 날 결제 페이지가 30분간 터졌는데, 슬랙엔 401만 가득해서 아무도 못 봤다. 누가 직접 들어와봐야 안다.

**4단계 — Sentry 무료 티어 한도 동남, 청구서 폭발.** 한 달 5,000 / 50,000 이벤트 한도가 며칠 만에 끝난다. 유료 플랜으로 올린다. 노이즈에 돈 쓰는 거다.

회사에서 이 4단계를 다 본 적이 있다. 마지막 단계에 도달하면, 그제야 누군가 "에러 핸들링 좀 정리하자" 한다. 근데 그때는 이미 코드 곳곳에 흩어져 있다.

**처음부터 분류했으면 됐을 일이다.**

---

## 에러 분류 멘탈 모델

실무에서 가장 먼저 해야 하는 건 분류다. 내가 회사 와서 배운 분류 기준은 이렇다.

| 종류        | 예시                         | 처리 방향                          |
| ----------- | ---------------------------- | ---------------------------------- |
| 인증/인가   | 401, 403                     | UI 안내, 리다이렉트 — Sentry X     |
| 사용자 입력 | 400, 422 (validation)        | 폼에 inline 표시 — Sentry X        |
| 비즈니스 룰 | 409 (충돌), 429 (rate limit) | 토스트/모달 — Sentry X 또는 sample |
| Not Found   | 404 (리소스)                 | 페이지 안내 — Sentry X             |
| 인프라      | 5xx, 네트워크 타임아웃       | 자동 재시도 후 Sentry              |
| 알 수 없음  | undefined.foo, 파싱 실패     | 무조건 Sentry                      |

핵심 아이디어 한 줄로:

> **사용자가 봐야 할 에러는 UI로, 개발자가 봐야 할 에러는 Sentry로.**

이 분류를 코드 레벨에서 강제하지 않으면, 새로 들어온 사람이 자연스럽게 모든 에러를 다 보고하게 짠다. "안전하게" 짜는 거다. 근데 그 안전함이 노이즈가 된다.

![예상된 에러와 예상 못한 에러를 분리하는 게이트](/images/blogs/062/062_02_error-classification.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of a sorting machine with three lanes — green for handled UI errors, yellow for retry, red for sentry alert, errors as colored boxes flowing through, minimal style, isometric perspective"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_02_error-classification.png"
-->

---

## 명령적 vs 선언적 — 어느 한쪽이 정답이 아니다

이 글을 쓰기 전 다른 분들의 글을 찾아 읽었는데, 거의 모든 글이 같은 메시지를 다른 표현으로 강조하고 있었다.

> "선언적 vs 명령적은 우열이 아니다. 같이 쓰는 것이 정답이다." — [hhs1210](https://velog.io/@hhs1210/React-에러-핸들링-안정성-설계)

학생 때는 둘 중 하나가 더 좋다고 배운다. 보통 "선언적이 좋다, ErrorBoundary 써라" 라고. 근데 실무는 둘 다 필요하다.

| 처리 방식 | 도구                    | 어디에 쓰나                     |
| --------- | ----------------------- | ------------------------------- |
| 명령적    | try/catch, onError      | 폼 제출, 버튼 클릭, 단발성 액션 |
| 선언적    | ErrorBoundary, Suspense | 페이지 렌더, 트리 단위 fallback |

둘은 보완관계다.

- **명령적이 강한 곳**: 사용자 액션 직후 — 폼 제출 시 "이메일 형식이 틀렸어요" 같이 즉각 inline 피드백이 필요한 경우. 이걸 ErrorBoundary로 잡으면 페이지 전체가 fallback으로 빠진다. 과하다.
- **선언적이 강한 곳**: 렌더 트리 어딘가가 터졌을 때 — 데이터가 비정상이라 컴포넌트가 throw한 경우. 모든 컴포넌트를 try/catch로 감쌀 순 없다. 트리 위에서 ErrorBoundary가 받는 게 자연스럽다.

**나의 기준 한 줄**: _사용자 액션의 즉각 피드백은 명령적, 그 외 트리 어딘가의 사고는 선언적._

이 구분이 머리에 박혀 있으면, 다음 섹션에서 다룰 인터셉터/ErrorBoundary/React Query 의 책임이 자연스럽게 갈린다.

---

## Axios 인터셉터 — 프론트엔드의 게이트키퍼

Spring 백엔드 해본 사람은 `@ControllerAdvice` + `@ExceptionHandler` 패턴이 익숙할 거다. 모든 컨트롤러의 예외를 한 군데서 모아서 분류하고, 응답을 일관된 형태로 변환한다. 그리고 컨트롤러는 이 분류 로직을 신경 쓰지 않는다.

**프론트엔드도 똑같은 패턴이 가능하다. 그게 Axios 인터셉터다.**

내가 개인 프로젝트에서 처음 인터셉터를 안 쓰고 짰을 때는, 거의 모든 컴포넌트마다 이런 코드가 있었다.

```tsx
// 안 좋은 예 — 컴포넌트마다 분류 로직 흩어짐
function MyPage() {
  useEffect(() => {
    api.get("/me").catch((e) => {
      if (e.response?.status === 401) router.push("/login");
      else if (e.response?.status >= 500) Sentry.captureException(e);
      else toast.error("문제가 생겼어요");
    });
  }, []);
}
```

이게 100군데에 흩어져 있다고 생각해보자. 분류 기준 하나 바꾸려면 100군데 수정. 신입이 추가한 컴포넌트는 또 자기 마음대로 짠다.

인터셉터로 옮기면 이렇게 된다.

```ts
// api/client.ts — 게이트키퍼
import axios from "axios";
import * as Sentry from "@sentry/react";

export const api = axios.create({ baseURL: "/api" });

// Request 단계 — 토큰 주입
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response 단계 — 분류 + 라우팅
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 1. 인증/인가 — UI 처리, Sentry X
    if (status === 401) {
      redirectToLogin();
      return Promise.reject(error);
    }
    if (status === 403) {
      showToast("권한이 없습니다");
      return Promise.reject(error);
    }

    // 2. 사용자 입력 — 컴포넌트가 직접 처리
    if (status === 400 || status === 422) {
      return Promise.reject(error);
    }

    // 3. 비즈니스 룰 — 알림은 가벼이
    if (status === 409 || status === 429) {
      return Promise.reject(error);
    }

    // 4. 인프라 — Sentry로
    if (status >= 500 || !error.response) {
      Sentry.captureException(error, {
        tags: { type: status ? "infra-5xx" : "network" },
        extra: { url: error.config?.url, method: error.config?.method },
      });
    }

    return Promise.reject(error);
  },
);
```

여기서 얻는 것:

- **단일 진입점**: 모든 API 응답이 이 한 군데를 거친다
- **분류 책임 일원화**: 어디로 보낼지 결정하는 코드가 흩어지지 않는다
- **컴포넌트 단순화**: `useQuery`, `useMutation` 안에서 다시 try/catch 안 짜도 된다
- **메타데이터 자동 추가**: Sentry로 보낼 때 URL, method 같은 컨텍스트도 인터셉터가 붙여줄 수 있다

스프링 `@ControllerAdvice` 가 백엔드 에러의 게이트키퍼라면, Axios 인터셉터는 프론트엔드 에러의 게이트키퍼다. 같은 사고방식이다.

![Spring ControllerAdvice와 Axios interceptor 대응 구조](/images/blogs/062/062_03_axios-interceptor.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration showing two parallel architectures — left side labeled 'Spring @ControllerAdvice', right side labeled 'Axios Interceptor', both as funnels collecting requests into a single gate, minimal blue and green palette"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_03_axios-interceptor.png"
-->

---

## 에러를 클래스로 계층화하기

HTTP status code 만으로 분류하다 보면 한계가 온다. 같은 422 인데 어떤 건 폼 inline, 어떤 건 모달, 어떤 건 토스트 — 컨텍스트마다 다르다. [wendy9253 글](https://velog.io/@wendy9253/React-에러-핸들링)에서 본 패턴이 이걸 깔끔하게 풀어준다. 에러를 status 가 아니라 **성격** 으로 분류하는 거다.

```ts
// 베이스
export class AppError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 도메인 — 비즈니스 룰
export class DomainError extends AppError {}
export class ValidationError extends DomainError {}
export class DuplicateError extends DomainError {}

// 표현 — UI/시스템
export class PresentationError extends AppError {}
export class NetworkError extends PresentationError {}
export class AuthError extends PresentationError {}
```

인터셉터에서 status code 를 받아 적절한 클래스로 변환해서 재던지면, 컴포넌트는 status 를 신경 쓸 필요 없다.

```ts
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error.response?.status;
    if (status === 401) throw new AuthError("로그인이 필요해요");
    if (status === 422) throw new ValidationError(error.response.data?.message);
    if (status === 409) throw new DuplicateError(error.response.data?.message);
    if (status >= 500) throw new NetworkError("서버에 문제가 있어요", error);
    throw error;
  },
);
```

컴포넌트 쪽:

```tsx
try {
  await createOrder(payload);
} catch (e) {
  if (e instanceof ValidationError) form.setError("email", e.message);
  else if (e instanceof DuplicateError) showModal("이미 등록된 이메일이에요");
  else throw e; // 나머지는 ErrorBoundary 로
}
```

**status 가 아니라 의미로 분기하니 의도가 분명해진다.** 그리고 `instanceof` 체크는 IDE가 자동완성도 해준다.

---

## 401은 좀 더 복잡하다 — 토큰 리프레시 큐잉

위 코드에서 `redirectToLogin()` 으로 끝낸 401은 사실 더 정교해질 수 있다. 액세스 토큰이 만료됐을 때 리프레시 토큰으로 자동 갱신하고, 같은 요청을 재시도하는 패턴이다.

문제는 **동시에 여러 요청이 401을 받았을 때**다. 그냥 매번 리프레시를 호출하면 같은 리프레시 토큰을 N번 호출하게 된다 (서버가 재사용 방지하는 경우 모두 실패).

해결은 큐잉.

```ts
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // 이미 리프레시 진행 중 — 끝나길 기다린다
      return new Promise((resolve) => {
        queue.push((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          original._retried = true;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      queue.forEach((cb) => cb(newToken));
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      original._retried = true;
      return api(original);
    } catch (e) {
      queue = [];
      redirectToLogin();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  },
);
```

이런 패턴을 컴포넌트마다 짠다고 생각하면 답이 없다. 인터셉터 한 군데에서 처리하니까 가능한 거다.

---

## 인터셉터만으론 부족한 곳

인터셉터는 **네트워크 응답** 만 잡는다. 그래서 두 가지가 빠진다.

1. **렌더 중에 터지는 에러** — `undefined.map()`, 컴포넌트 내부 throw
2. **데이터 가공/파싱 단계 에러** — 응답은 200인데 스키마가 깨진 경우

이건 ErrorBoundary와 React Query (또는 TanStack Query) 가 채운다.

**ErrorBoundary** 는 렌더 단계 게이트키퍼다. 단, 트리 전체를 한 ErrorBoundary로 감싸지 말 것. 페이지마다, 위젯마다 스코프를 나눠야 부분 fallback이 가능하다.

```tsx
<RootErrorBoundary>
  {" "}
  {/* 앱 전체 — 마지막 안전망 */}
  <Header />
  <PageErrorBoundary>
    {" "}
    {/* 페이지 단위 — 페이지만 fallback */}
    <Dashboard>
      <WidgetErrorBoundary>
        {" "}
        {/* 위젯 단위 — 카드만 fallback */}
        <RevenueChart />
      </WidgetErrorBoundary>
    </Dashboard>
  </PageErrorBoundary>
</RootErrorBoundary>
```

차트 하나가 터졌다고 페이지 전체가 흰 화면이 되면 안 된다.

한 가지 함정이 있다. **ErrorBoundary 는 동기 렌더 에러만 잡는다.** 이벤트 핸들러, `setTimeout`, Promise 안에서 던진 에러는 못 잡는다. [wendy9253](https://velog.io/@wendy9253/React-에러-핸들링) 글에서도 강조하는 부분이다.

해결법은 두 가지.

1. **state 로 끌어올리기** — catch 한 에러를 state에 저장하고, 그 state에서 다시 throw. 그러면 다음 렌더에서 ErrorBoundary가 잡는다.
2. **React Query 의 `throwOnError` 옵션** — useQuery 결과 에러를 자동으로 렌더 단계로 흘려보낸다.

```tsx
const { data } = useQuery({
  queryKey: ["user"],
  queryFn: fetchUser,
  throwOnError: true, // 에러를 위쪽 ErrorBoundary 까지 올림
});
```

이러면 컴포넌트는 성공 케이스만 다루면 된다. 실패는 위쪽 ErrorBoundary 가 책임진다.

**React Query** 는 데이터 페칭 게이트키퍼다. 인터셉터에서 `Promise.reject` 한 에러를 컴포넌트가 어떻게 받을지 정의하는 곳이다.

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status >= 400 && status < 500) return false; // 4xx는 재시도 의미 없음
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: any) => {
        const status = error?.response?.status;
        if (status === 422) return; // 폼 컴포넌트가 처리
        toast.error("작업 중 문제가 생겼어요");
      },
    },
  },
});
```

React Query 의 또 다른 강력한 패턴은 **Optimistic Update + 롤백**이다. 좋아요, 즐겨찾기처럼 빠른 UI 피드백이 중요한 액션에서 쓴다. [hhs1210 글](https://velog.io/@hhs1210/React-에러-핸들링-안정성-설계) 의 좋아요 예시가 인상 깊었다.

```ts
useMutation({
  mutationFn: likePost,
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: ["post", postId] });
    const previous = queryClient.getQueryData(["post", postId]);
    queryClient.setQueryData(["post", postId], (old: any) => ({
      ...old,
      likeCount: Math.max(0, (old.likeCount ?? 0) + 1),
    }));
    return { previous }; // context 로 전달
  },
  onError: (_err, postId, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["post", postId], context.previous);
    }
  },
});
```

핵심:

- **`onMutate`** — 서버 응답 기다리지 않고 UI 먼저 업데이트, 이전 값을 context 로 보관
- **`onError`** — 실패하면 context 로 원복
- **`Math.max(0, ...)`** — 좋아요 취소 시 음수 방지 같은 방어 코드. 사소해 보이지만 실제로 자주 빠진다

이 패턴을 쓰면 사용자 입장에선 응답이 즉각 반영되고, 실패해도 자연스럽게 원래대로 돌아간다.

요약하면 게이트키퍼는 세 층이다.

| 층          | 잡는 것                   | 도구             |
| ----------- | ------------------------- | ---------------- |
| 네트워크    | API 응답 에러 (4xx/5xx)   | Axios 인터셉터   |
| 데이터 흐름 | 재시도, 컴포넌트 분배     | React Query 옵션 |
| 렌더링      | 컴포넌트 throw, undefined | ErrorBoundary    |

세 층이 각자 자기 책임만 지면, 컴포넌트 코드가 깔끔해진다.

---

## Fallback 은 메시지가 아니라 액션이다

ErrorBoundary 의 fallback UI 가 _"문제가 발생했습니다"_ 한 줄로 끝나면 사용자는 새로고침밖에 못 한다. [bsh-ko 글](https://bsh-ko.tistory.com/12)에서 강조하는 게 이거다.

> "에러 핸들링은 방어 코드가 아니라 UX 설계의 일부다."

좋은 fallback 은 **다음에 뭘 해야 할지** 보여준다. `react-error-boundary` 라이브러리가 이걸 깔끔하게 도와준다 ([coding-cherry 글](https://coding-cherry.tistory.com/62) 참고).

```tsx
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  if (error instanceof AuthError) {
    return (
      <div>
        <p>로그인이 필요해요.</p>
        <button onClick={() => router.push("/login")}>로그인 하러가기</button>
      </div>
    );
  }
  return (
    <div>
      <p>잠시 문제가 생겼어요.</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={Fallback}
  onReset={() => queryClient.clear()}
  resetKeys={[userId]}
>
  <Dashboard />
</ErrorBoundary>;
```

- **`resetErrorBoundary`** — 에러 상태를 풀고 다시 렌더. "다시 시도" 버튼이 자연스럽다
- **`resetKeys`** — 특정 값이 바뀌면 자동으로 리셋 (예: userId가 바뀌면)
- **`onReset`** — 리셋될 때 캐시 비우기 같은 부수 작업

핵심 원칙 한 줄.

> 에러 메시지에는 항상 action 이 따라와야 한다.

다시 시도, 로그인, 홈으로, 문의하기. **막다른 길을 만들지 말 것.** 이게 안 되면, 사용자는 그냥 사이트를 떠난다.

---

## Sentry 자체에서 한 번 더 거른다

인터셉터에서 분류해서 보내도, 가끔 라이브러리가 자동으로 보내는 에러나 중복 이벤트가 끼어든다. Sentry SDK는 그걸 거를 훅을 제공한다.

```ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,

  // 알려진 노이즈는 아예 안 보냄
  ignoreErrors: [
    "ResizeObserver loop limit exceeded", // 브라우저 흔한 워닝
    "Non-Error promise rejection captured",
    /chrome-extension:\/\//, // 확장 프로그램 발 에러
  ],

  beforeSend(event, hint) {
    const error = hint.originalException as any;

    // 401/403이 어떻게든 흘러들어온다면 여기서 한번 더 차단
    const status = error?.response?.status;
    if (status === 401 || status === 403) return null;

    // 네트워크 끊김은 환경 문제 — 사용자 환경 정보만 태그로 남기고 알림은 X
    if (error?.message === "Network Error") {
      event.tags = { ...event.tags, networkIssue: true };
    }

    return event;
  },
});
```

`beforeSend` 에서 `null` 을 리턴하면 Sentry로 안 보낸다. 인터셉터를 빠져나간 에러도 마지막에 한번 더 걸러진다. 이중 안전장치.

---

## 환경별로 다르게 처리한다

또 하나 회사 와서 깨달은 것: **dev 환경과 prod 환경은 에러를 다르게 다뤄야 한다.**

- **dev**: 에러를 시끄럽게 던져야 한다. 콘솔, 빨간 박스, 스택트레이스. 개발자가 무조건 보게.
- **prod**: 에러를 조용하게 다뤄야 한다. 사용자에겐 친절한 메시지, 개발자에겐 Sentry.

이걸 하나의 헬퍼로 만들 수 있다.

```ts
export function reportError(error: unknown, context?: Record<string, any>) {
  if (import.meta.env.DEV) {
    console.error("[reportError]", error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}
```

dev에선 그냥 콘솔로, prod에선 Sentry로. 컴포넌트는 환경을 신경 쓸 필요 없다.

---

## 내가 처음 했던 실수

부끄럽지만 적어둔다. 입사 첫 달에 짰던 코드.

```tsx
// 😱 모든 catch에서 무조건 Sentry로 보냄
try {
  await api.post("/orders", payload);
} catch (e) {
  Sentry.captureException(e); // ← 422도, 401도, 5xx도 다 여기로
  toast.error("문제가 생겼어요");
}
```

뭐가 문제냐면,

1. **422**: 사용자가 폼을 잘못 채운 거다. 사용자 잘못. Sentry로 보낼 게 아니라 폼 inline에 표시할 일.
2. **401**: 토큰 만료. 사용자 잘못 아니지만 정상 흐름. 로그인 페이지로 보내면 되는 일.
3. **5xx**: 이건 진짜 보내야 함. 근데 위 코드는 422, 401과 섞여서 의미가 흐려진다.
4. **toast 메시지**: 422면 "이메일 형식을 확인해주세요" 가 나와야 하는데 "문제가 생겼어요" 라고만 떴다. 사용자가 뭘 고쳐야 할지 모른다.

그 주에 QA 에서 "토스트가 너무 모호해요" 피드백이 왔고, 그제야 분류 안 한 게 보였다. 인터셉터로 옮기고 분류하니, 422는 폼이 알아서 처리하고, 401은 자동 리다이렉트, 5xx만 Sentry. 토스트는 사라졌다.

**좋은 에러 핸들링은, 사용자가 다음에 뭘 해야 할지 알게 만든다.** "문제가 생겼어요" 는 핸들링이 아니라 회피다.

---

## AI에게 에러 처리 시킬 때

요즘은 코드 짤 때 AI에게 시키는 일이 많다. 근데 그냥 "에러 처리 잘 해줘" 하면, AI는 무조건 모든 에러를 try/catch로 감싸고 console.error 로 뿌린다. **학생 때 코드와 똑같다.**

비교해보자.

❌ **나쁜 프롬프트**

> "이 코드에 에러 처리 추가해줘."

→ 결과: 모든 함수에 try/catch, catch 안에 `console.error` 또는 `Sentry.captureException`. 분류 없음. 컴포넌트마다 흩어진다.

✅ **좋은 프롬프트**

> "이 API 호출에 에러 처리를 추가해줘. 단, 다음 분류를 따라줘.
>
> - 401, 403, 422 같은 예상된 에러는 Sentry에 보내지 마. UI에서만 처리해.
> - 5xx와 네트워크 에러는 인터셉터에서 Sentry로 보내고 컴포넌트는 토스트만.
> - 컴포넌트 내부에서 try/catch는 가능하면 쓰지 마. React Query의 onError를 활용해.
>
> 분류 로직은 `src/api/client.ts` 의 인터셉터에 모아둬."

→ 결과: 인터셉터에서 분류, 컴포넌트는 깔끔. 이건 거의 시니어 코드처럼 나온다.

명시적으로 분류 기준을 주면 결과가 달라진다. AI에게 일을 시키는 게 아니라, 같이 일하는 거에 가깝다.

추가로 Claude Code의 `/security-review` 스킬을 PR 전에 한번 돌리면 — 보안 관련 에러 처리 누락도 같이 잡아준다. 인증 실패를 그냥 삼키는 코드, 토큰을 로그에 찍는 코드, 에러 메시지에 내부 정보가 노출되는 코드 같은 것들. 본인 코드를 객관적으로 보기 어려울 때 유용하다.

(다른 에러 핸들링 보조 오픈소스 도구들 — `@total-typescript/ts-reset`, `neverthrow`, `effect-ts` 같은 것들 — 은 다음 글에서 정리하겠다.)

![AI에게 에러 분류 기준을 명시적으로 전달하는 프롬프트](/images/blogs/062/062_04_ai-prompting.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of a developer giving a clear blueprint document to a robot assistant, the document showing a sorting tree with error categories, soft pastel palette, minimal style"
  aspect_ratio: "16:9"
  session_id: "blog-062"
  save_as: "062_04_ai-prompting.png"
-->

---

## PR 전 체크리스트

내가 매번 PR 올리기 전에 자문하는 항목들이다.

- [ ] 새로 추가한 API 호출 — 인터셉터를 우회한 곳은 없나?
- [ ] catch 블록에서 `Sentry.captureException` 을 직접 호출했다면, 그게 정말 필요한가? (인터셉터에서 이미 처리되지 않나?)
- [ ] 사용자에게 보여주는 토스트는 다음에 뭘 해야 할지 알려주나? (`"문제가 생겼어요"` 는 금지)
- [ ] 422 응답이 폼 inline에 표시되나? 토스트로만 끝나면 사용자가 어디가 잘못됐는지 모른다.
- [ ] 새 페이지에 ErrorBoundary 스코프가 잡혀 있나?
- [ ] dev 환경에선 에러가 잘 보이나? (`console.error` 가 너무 조용히 묻히지 않나)
- [ ] Sentry `ignoreErrors` 에 추가할 노이즈가 있나?

이 7개를 짧게 훑는 데 1분도 안 걸린다. 근데 이걸 안 보면 나중에 노이즈로 한 시간 후회한다.

---

## 정리

회사 들어와서 가장 크게 바뀐 건 "에러를 어떻게 잡느냐" 가 아니라 **"잡은 에러를 어디로 보내느냐"** 였다. 그리고 그 "어디" 는 한 곳이 아니라 여러 층이었다.

학생 때는 잡기만 잘하면 됐다. 실무는 분류와 라우팅이 80%다.

핵심을 한 줄씩.

- **사용자가 봐야 할 에러는 UI로** — 401, 403, 422는 Sentry로 보내면 노이즈
- **개발자가 봐야 할 에러만 Sentry로** — 5xx와 unknown
- **분류는 인터셉터 한 곳에서** — Spring `@ControllerAdvice` 처럼
- **렌더 에러는 ErrorBoundary 가 분담** — 스코프 나눠서
- **데이터 흐름은 React Query 가 분담** — `retry`, `onError`
- **마지막 안전망은 Sentry `beforeSend`**
- **dev는 시끄럽게, prod는 조용하게**
- **토스트는 사용자가 다음에 뭘 해야 할지 알려주는 메시지여야 한다**

그리고 가장 크게 와닿은 한 줄.

> **에러 핸들링은 방어 코드가 아니라 UX 설계의 일부다.**

어떤 에러를 보여줄지, 어떤 액션을 제안할지, 어떤 톤으로 말할지 — 이건 기획 단계부터 같이 고민해야 하는 일이지 코드를 다 짠 다음에 try/catch 로 덮는 일이 아니다.

학생 때 이걸 알았다면 좋았을 텐데, 사실 학생 때는 알 수가 없다. 사용자가 본인 한 명일 땐 노이즈가 노이즈인 줄 모르니까. 그리고 fallback이 막다른 길인지 알기 어려우니까.

선배 한마디가 한 달 늦게 이해됐다. 이 글이 누군가에겐 더 빨리 닿길.

---

## 참고한 글

이 글을 정리하면서 도움 받은 글들. 같은 주제를 다른 각도에서 본다면 추천한다.

- [React 에러 핸들링 안정성 설계 — hhs1210](https://velog.io/@hhs1210/React-에러-핸들링-안정성-설계) — 401 큐잉, Optimistic 롤백 패턴이 잘 정리됨
- [React 에러 핸들링 — wendy9253](https://velog.io/@wendy9253/React-에러-핸들링) — 에러 클래스 계층 (AppError → DomainError / PresentationError) 설계가 깔끔함
- [React 에러 핸들링과 안전성 — coding-cherry](https://coding-cherry.tistory.com/62) — `react-error-boundary` 라이브러리 활용 (resetKeys, onReset) 예시
- [React 에러 핸들링 — bsh-ko](https://bsh-ko.tistory.com/12) — "에러 핸들링은 UX 설계의 일부" 라는 메타 관점

— 2026-05-03
