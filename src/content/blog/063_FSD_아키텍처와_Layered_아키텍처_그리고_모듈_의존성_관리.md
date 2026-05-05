---
title: "FSD vs Layered, 그리고 모듈 의존성 관리"
subtitle: "Omechu를 FSD로 마이그레이션하면서 배운 것들"
description: "FSD와 Layered 아키텍처를 비교하고, Omechu v2를 FSD로 마이그레이션하면서 features/page 레이어를 버린 이유, ESLint와 Husky로 의존성을 강제하는 방법까지 정리했다."
publish: true
meta_title: "FSD vs Layered, 그리고 모듈 의존성 관리 | 김덕환"
meta_description: "FSD와 Layered 아키텍처의 차이, 실제 Omechu 마이그레이션에서 features와 page 레이어를 버린 이유, ESLint·Husky로 모듈 의존성을 강제하는 실전 패턴."
keywords:
  - Feature-Sliced Design
  - FSD
  - Layered Architecture
  - 프론트엔드 아키텍처
  - 모듈 의존성 관리
  - ESLint
  - Husky
  - 의존성 역전 원칙
  - DIP
  - Next.js
  - Omechu
og_title: "FSD vs Layered, 그리고 모듈 의존성 관리"
og_description: "FSD와 Layered의 차이, Omechu 마이그레이션에서 배운 실전 교훈, ESLint·Husky로 의존성 강제하기."
og_type: article
twitter_card: summary_large_image
created_date: 2026-05-05
updated_date: 2026-05-05
category: "개발"
featured_image: /images/blogs/063/063_00_thumbnail.png
featured_image_alt: "Layered 빌딩과 FSD 도시 구획을 대비한 일러스트"
slug: fsd-layered-architecture-and-module-dependency
tags:
  - FSD
  - Layered Architecture
  - 프론트엔드 아키텍처
  - 모듈 의존성
  - ESLint
  - Husky
  - DIP
  - Next.js
  - Omechu
---

스터디 7주차 주제는 **폴더 구조와 아키텍처**다. FSD, Layered, 모듈 의존성 관리, 그리고 실제 프로젝트 리팩토링까지. 발표 자료를 그대로 쓰면 너무 휘발되니까, 내가 진짜로 겪은 이야기로 풀어서 글로 남긴다.

내 두 프로젝트 [D-Link](https://github.com/IISweetHeartII)와 [Omechu v2](https://github.com/IISweetHeartII/Omechu-v2)는 둘 다 FSD다. 그중 Omechu는 처음엔 FSD가 아니었고, 마이그레이션 과정에서 우리 팀이 공식 FSD를 그대로 따르지 않고 **레이어를 두 개 버린** 결정을 했다. 그 이야기를 중심으로 쓴다.

![Layered 빌딩과 FSD 도시 구획을 대비한 일러스트](/images/blogs/063/063_00_thumbnail.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Side by side comparison illustration: left side shows a layered tall building with 4 floors labeled UI, Application, Domain, Infrastructure connected by an elevator going downward only. Right side shows a city map with distinct districts labeled widgets, entities, shared, app, connected by roads. Flat illustration style, soft pastel colors, isometric perspective, clean and minimal, educational diagram aesthetic"
  aspect_ratio: "4:3"
  session_id: "blog-063"
  save_as: "063_00_thumbnail.png"
-->

---

## 왜 아키텍처가 필요한가

새 파일을 어디에 둘지 5분 이상 고민해본 적 있다면, 그건 아키텍처가 필요하다는 신호다.

도시 비유가 가장 잘 맞는다. 무계획 도시는 결국 골목길 미로가 된다. 한 블록 안에 주거·상가·공장이 뒤섞이고, 어느 길로 가야 빠른지 아무도 모른다. 코드도 똑같다. 처음엔 `src/components`, `src/utils` 두세 폴더로 시작한다. 6개월 뒤에는 `utils` 안에 200개 파일이 있고, 그중 어느 게 어디서 쓰이는지 아무도 모른다. 새 멤버가 오면 첫 주를 폴더 탐색에 다 쓴다.

아키텍처는 그 미로를 막는 도시 계획이다. 큰 두 갈래는 **Layered**(층으로 쌓기)와 **FSD**(구역으로 자르기)다.

---

## Layered Architecture — 회사 선배가 알려준 관점

나는 Layered를 직접 운영해본 적은 없다. 대신 회사에서 Layered를 쓰는 선배에게 물어봤더니 이런 답이 돌아왔다.

> "의존성을 다르게 놓아야 한다. UI를 그리는 것과 API를 받아서 데이터를 채우는 것은 분리해야 한다. 처음에는 목 데이터로 프론트만 만들어두는데, 이후 백엔드가 swagger 명세서를 주면 거기 맞춰서 타입과 API 호출을 갈아끼우는 게 자연스럽기 때문이다."

이게 정확히 Layered 정신이다. FSD 공식 블로그도 똑같은 말을 한다.

> _"Layered architecture remains relevant for frontend because it protects the code that changes least (domain rules and workflows) from the details that change most (UI and integrations)."_
> — [feature-sliced.design](https://feature-sliced.design/blog/frontend-layered-architecture)

요지는 같다. **변하지 않는 것(도메인)을 변하기 쉬운 것(UI/API)에서 보호한다.**

### 4계층 구조

| 계층           | 역할                          | 예시                        |
| -------------- | ----------------------------- | --------------------------- |
| Presentation   | UI, 컴포넌트, 라우트          | `<UserCard />`, 페이지      |
| Application    | 유스케이스, 뷰모델, 상태 조합 | `useUserProfile()` 훅       |
| Domain         | 비즈니스 규칙, 순수 모델      | `User`, `Order` 타입과 검증 |
| Infrastructure | API client, storage, SDK      | axios 래퍼, localStorage    |

규칙은 단 하나. **위에서 아래로만 import.** 반대 금지.

### 빌딩 비유

빌딩으로 비유하면 이렇다. 4층(UI)은 1층(Infra)으로 내려가는 엘리베이터를 탈 수 있다. 그런데 1층은 4층을 모른다. 1층에서 4층으로 올라가는 엘리베이터는 없다. 그래야 1층(인프라)을 통째로 갈아끼워도 4층(UI)이 안 무너진다. 선배가 말한 "swagger로 API를 갈아끼울 수 있어야 한다"가 바로 이거다.

![Layered 4층 빌딩 다이어그램](/images/blogs/063/063_02_layered-building.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Cross-section illustration of a 4-floor building, each floor labeled top to bottom: Presentation (UI components), Application (use cases, hooks), Domain (business rules), Infrastructure (API client, storage). One-way elevator going only downward with arrows. Each floor has small icons representing its role. Flat illustration, soft pastel colors, clean educational diagram, isometric perspective"
  aspect_ratio: "16:9"
  session_id: "blog-063"
  save_as: "063_02_layered-building.png"
-->

### 한계 — 기능이 4층에 흩어진다

장점은 명확하지만 한계도 명확하다. 한 기능을 추가하려면 4층을 다 건드린다. 로그인 하나 만든다고 치면:

- Presentation: `<LoginForm />`
- Application: `useLogin()` 훅
- Domain: `Credential` 타입, 검증 규칙
- Infrastructure: `loginApi()` 호출

기능 하나를 보려면 4개 폴더를 동시에 열어야 한다. FSD 공식 글의 표현을 빌리면:

> _"features are scattered across layers"_

그리고 더 큰 함정이 있다.

> _"Shared becomes an escape hatch"_

경계가 모호한 코드는 다 `shared`로 들어간다. 6개월 뒤 `shared` 폴더 안에 비즈니스 로직이 가득 차 있다. Layered는 이 함정을 막는 장치가 약하다.

---

## FSD — 도시 구획으로 자르기

FSD(Feature-Sliced Design)는 다른 답을 낸다. **수평으로 자르지 말고 수직으로 자르자.**

도시 비유로 다시. Layered가 "빌딩 한 채를 4층으로 나눈다"라면, FSD는 "도시를 구역으로 나눈다"다. 강남(`features/auth`), 홍대(`features/cart`), 공항(`shared`). 각 구역은 자체 완결적이다. 안에 거주(ui)·상업(model)·교통(api)이 다 들어 있다. 다른 구역과는 **도로(public API)** 로만 연결된다. 강남 가려면 강남대로로 들어가지, 강남 골목길에 갑자기 진입하지 않는다.

그런데 FSD가 Layered와 정반대인 건 아니다. FSD 공식 글의 표현이 정확하다.

> _"Layers and features are not opposites."_

FSD = **Layered + 수직 슬라이싱**. 큰 틀의 의존성 규율은 그대로 가져가고, 그 안에서 기능별로 다시 자른다.

### FSD 7개 표준 레이어

위에서 아래로만 import.

| 레이어      | 역할                                    |
| ----------- | --------------------------------------- |
| `app`       | 진입점, provider, 전역 설정             |
| `processes` | (선택) 다단계 플로우                    |
| `pages`     | 라우트 페이지                           |
| `widgets`   | 독립 UI 블록 (Header, Sidebar)          |
| `features`  | 사용자 액션 단위 (LoginForm, AddToCart) |
| `entities`  | 비즈니스 객체 (User, Product)           |
| `shared`    | UI kit, util, api client (도메인 무관)  |

각 레이어 안에는 **slice**(도메인별 폴더)가 있고, slice 안에는 **segment**(`ui/`, `model/`, `api/`, `lib/`)가 있다.

```
features/
├── auth/                ← slice
│   ├── ui/              ← segment
│   ├── model/
│   ├── api/
│   └── index.ts         ← Public API
└── cart/
```

한국어 자료의 표현을 빌리면 [FSD는 "느슨한 결합과 높은 응집력"](https://emewjin.github.io/feature-sliced-design/)을 추구한다. 그리고 가장 인상적인 한 줄은 FSD 공식의 이 표현이다.

> _"Layering is not 'folders,' it's dependency discipline."_

폴더 구조 자체가 아키텍처가 아니다. **의존성을 어떻게 강제하느냐**가 진짜 아키텍처다. 이건 글 마지막에서 다시 만난다.

![FSD 도시 구획 다이어그램](/images/blogs/063/063_01_fsd-city-layers.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Top-down city map illustration showing 7 distinct districts labeled app, processes, pages, widgets, features, entities, shared. Each district has its own buildings and small icons inside. One-way arrows between districts pointing only downward in hierarchy: app at top, shared at bottom. Roads connecting districts labeled 'public API'. Flat illustration, soft pastel colors, clean educational style"
  aspect_ratio: "16:9"
  session_id: "blog-063"
  save_as: "063_01_fsd-city-layers.png"
-->

---

## Omechu 마이그레이션 — 우리는 왜 FSD를 골랐나

이제 진짜 이야기. **Omechu v2는 처음엔 FSD가 아니었다.** 평범한 Next.js 구조였다가, 도메인이 커지면서 한계가 보이기 시작했고, 우리 팀은 FSD로 마이그레이션을 결정했다.

### 팀원 설득 — 장단점을 솔직하게

팀원들에게 처음 FSD를 꺼냈을 때, 거부감이 작지 않았다. 그래서 장단점을 둘 다 솔직하게 깠다.

**장점:**

- 의존성 관리가 편하다. 단방향 규칙 하나만 지키면 순환 참조 거의 안 생긴다.
- 새 멤버가 들어와도 "이건 어디에 넣어요?"가 빠르게 풀린다. 도메인 단위라 직관적이다.
- 도메인 단위로 응집도가 높다. 한 도메인을 통째로 삭제하거나 다른 프로젝트로 옮기는 게 쉽다.

**단점:**

- 러닝 커브가 진짜 가파르다. 첫 2주 동안은 매번 "이게 widget이야 entity야 feature야?"에서 회의가 멈춘다.
- 진입장벽 높다. 신규 합류자가 곧바로 적응하기 어렵다.
- 작은 프로젝트엔 과하다. DEV 글에서도 [_"FSD is simply too much"_](https://dev.to/arjunsanthosh/mastering-feature-sliced-design-lessons-from-real-projects-2ida)라는 표현이 나온다.

그런데 이걸 한번 익히고 나면, 솔직히 다른 구조가 답답해 보인다. 그래서 팀원들에게 이렇게 말했다. "처음 2주만 같이 버티자. 그다음부터는 우리가 더 빨리 짠다." 결과적으로 그 말이 맞았다.

### 우리는 features 레이어를 버렸다

가장 어려운 결정이었다. 실전 사례 글에서도 정확히 같은 고민을 짚는다.

> _"The harder part of FSD is figuring out where one feature ends and another begins."_

우리도 똑같았다. "이 모달이 widget이야 feature야 entity야?" 매번 30분씩 토론. 계속 이러다간 마이그레이션 자체가 끝나질 않겠다 싶었다. 그래서 결단했다.

**기준을 두 개로 압축했다.**

- UI 성격이 강한 것 → `widgets`
- 도메인 비즈니스 로직 → `entities`
- 둘이 만나는 영역은 widget이 entity의 Public API를 import

이 기준으로 정리하니까 `features`에 남는 게 없었다. 그래서 통째로 비웠고, 결국 폴더 자체를 제거했다. Omechu의 현재 `src/` 는 4개 레이어다.

```
src/
├── app/         ← Next.js app router (라우팅 + 전역 설정)
├── widgets/     ← UI 블록
├── entities/    ← 도메인
├── shared/      ← 공통
└── proxy.ts
```

D-Link는 features를 안 버렸지만 거의 안 쓴다. `payment` 하나만 남았고, 나머지는 widgets/entities로 흡수됐다. 두 프로젝트가 비슷한 결론에 도달한 셈이다.

![Omechu FSD 레이어 다이어트 전후 비교](/images/blogs/063/063_05_omechu-before-after.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Side by side comparison illustration. Left side titled 'BEFORE — FSD 7 layers' showing a tall stack of folders: app, processes, pages, widgets, features, entities, shared. Right side titled 'AFTER — Omechu 4 layers' showing a shorter cleaner stack: app, widgets, entities, shared. Two folders 'pages' and 'features' shown with strikethrough on the left, with arrows indicating they were merged into 'app' and 'widgets/entities'. Flat illustration, soft pastel colors, clean educational diagram, before/after format"
  aspect_ratio: "16:9"
  session_id: "blog-063"
  save_as: "063_05_omechu-before-after.png"
-->

### 우리는 page 레이어도 버렸다 — Next.js와의 충돌

Next.js App Router를 쓰면 `app/` 폴더가 라우팅을 담당한다. 그런데 FSD에는 `pages` 레이어가 따로 있다. **이름이 겹치고 역할도 겹친다.**

[FSD 공식 답](https://feature-sliced.design/docs/guides/tech/with-nextjs)은 이렇다. `src/pages/`를 유지하고, Next.js의 `app/page.tsx`는 thin re-export만 한다.

```ts
// app/example/page.tsx
export { ExamplePage as default, metadata } from "@/pages/example";
```

이렇게 하면 Next.js 라우팅과 FSD 구조가 둘 다 살아있다. 하지만 모든 라우트마다 한 줄짜리 re-export 파일을 만들어야 한다. 페이지 50개면 re-export 파일 50개.

**우리 답은 달랐다.** 보일러플레이트가 너무 많아서, `pages` 레이어 자체를 통째로 없애고 `app/` 폴더 안에서 직접 페이지를 작성하기로 했다. 공식 권장과 다른 결정이지만 우리 팀 컨벤션으로 명문화했다. 둘 다 valid한 선택이고, 우리는 후자를 택했다.

> 정리:
>
> - **공식 답**: `src/pages/` 유지 + `app/`에서 thin re-export
> - **Omechu 답**: `pages` 제거 + `app/`에서 직접 작성 (보일러플레이트 절감)

### 그래서 store와 protected route는 어디에 놨나?

이게 마이그레이션 후반부에 나온 진짜 질문들이었다. 우리 답을 풀어둔다.

**store (zustand)는 `shared/store/` 또는 `entities/{slice}/model/`.**

- 도메인 무관한 전역 상태(테마, 토스트, 모달 매니저 등)는 `shared/store/`
- 특정 도메인에 종속된 상태(현재 유저, 선택한 메뉴 등)는 `entities/{도메인}/model/`

기준은 단순하다. **이 store를 entity 없이 다른 프로젝트로 옮길 수 있는가?** 옮길 수 있으면 shared, 못 옮기면 그 entity 안에.

**protected route는 Next.js Route Group.**

```
src/app/
├── (auth)/         ← 로그인/회원가입 페이지 (인증 안 된 사용자용)
├── (private)/      ← 인증 필요한 페이지
├── (public)/       ← 누구나 접근 가능
├── api/
└── layout.tsx
```

괄호로 묶으면 URL에는 안 나타나면서 layout과 미들웨어를 분리할 수 있다. `(private)` 폴더에는 별도 layout에서 미들웨어 검증을 걸어두면, 그 아래 페이지들은 자동으로 인증 체크가 된다. URL은 `/dashboard` 같은 게 그대로다.

이건 FSD 규칙이 아니라 Next.js 기능을 빌린 거지만, FSD의 "app은 라우팅과 전역 설정만 담당한다" 정신과 잘 맞는다.

---

## 모듈 의존성 관리 — 헤더가 두 개가 되는 이유

이제 이 글의 진짜 본론. 아키텍처를 그려놨다고 끝이 아니다. **그 규율을 어떻게 강제하느냐**가 진짜 아키텍처다. 다시 그 한 줄.

> _"Layering is not 'folders,' it's dependency discipline."_

내가 실제로 겪은 사고 하나로 시작한다.

### 헤더가 두 개가 됐다

내가 `Header` 컴포넌트를 `entities`에 두기로 했다고 하자. 그런데 어떤 멤버가 `shared`에 있는 `LoadingPage`를 만들면서 그 안에서 `Header`를 직접 import해버렸다.

```tsx
// shared/ui/LoadingPage.tsx — 이게 문제
import { Header } from "@/entities/header"; // ❌ FSD 위반
```

이 `LoadingPage`가 다른 페이지 안에서 또 쓰이면? 그 페이지는 보통 자기 layout에서 이미 `Header`를 그리고 있다. 그래서 **헤더가 화면에 두 개 나온다.**

이건 단순한 UI 버그가 아니다. **의존성 방향 위배**가 본질이다. `shared`는 `entities`보다 아래 레이어다. 아래는 위를 모르는 게 원칙이다. 이 한 줄을 어겼더니, "왜 헤더가 두 개지?"부터 시작해서 한참을 헤맸다.

![헤더가 두 개로 렌더된 의존성 위반 사고 다이어그램](/images/blogs/063/063_03_double-header-bug.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Diagram showing a webpage rendered with two header bars stacked at the top, with confused user emoji. Below the page, an arrow diagram showing dependency violation: 'shared/LoadingPage' with red arrow pointing UP to 'entities/Header', crossed out with a red X. Caption text: '↑ 위로 import = FSD 위반'. Flat illustration, soft pastel colors with red warning accents, clean educational diagram style"
  aspect_ratio: "16:9"
  session_id: "blog-063"
  save_as: "063_03_double-header-bug.png"
-->

### 단방향 의존성 — 지하철 비유

순환 참조는 지하철로 비유하면 가장 직관적이다. 1호선이 출발하려면 2호선이 출발해야 하고, 2호선이 출발하려면 1호선이 출발해야 한다고 치자. 그러면 둘 다 영원히 못 출발한다. 코드 의존성도 똑같다. A가 B를 import하고 B가 A를 import하면, 모듈 로딩이 꼬인다. 이게 zustand 같은 store에서 더 무섭다.

### zustand에서도 같은 문제

A 스토어가 B 스토어를 구독하고 B가 A를 구독하면, 한쪽이 업데이트될 때마다 무한 루프. 디버깅 지옥이다. 이건 정말 잡기 어렵다. 스택 트레이스가 두 store를 왔다갔다 하면서 "도대체 어디서 시작된 거야?"가 된다. **사전에 막는 게 유일한 답**이다.

### ESLint로 강제하기 — Omechu 실제 설정

말로만 "단방향으로 import 하세요"는 절대 안 지켜진다. 사람은 까먹는다. 사람을 안 믿고 도구를 믿어야 한다.

Omechu의 실제 `eslint.config.mjs` 일부 발췌.

```js
// FSD: shared → 상위 레이어 import 금지
{
  files: ["src/shared/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/app/*", "@/widgets/*", "@/entities/*"],
            message:
              "FSD 위반: shared는 상위 레이어(app, widgets, entities)를 import할 수 없습니다.",
          },
        ],
      },
    ],
  },
},

// FSD: widgets → 다른 widgets/entities 슬라이스 내부 deep import 금지
{
  files: ["src/widgets/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/widgets/*/*", "@/widgets/*/*/**"],
            message:
              "FSD 위반: 다른 widgets 슬라이스 내부 경로 접근 금지. 해당 슬라이스의 index.ts(Public API)만 사용하세요.",
          },
          // entities도 같은 규칙
        ],
      },
    ],
  },
},
```

이 설정이 켜져 있으면, 누가 아까 그 `LoadingPage` 같은 코드를 쓰면 IDE에 빨간 줄이 그어진다. 에러 메시지에 "FSD 위반"이라고 한국어로 친절히 알려준다. **사고 자체가 commit 단계까지 못 간다.**

추가로 우리는 이것도 켰다.

```js
"import/no-cycle": ["error", { maxDepth: 10 }],
"import/no-self-import": "error",
```

순환 참조 자체를 ESLint가 잡는다.

### Husky pre-commit으로 못 박기

ESLint만으로는 부족하다. ESLint를 IDE에서 무시하고 그냥 commit해버리는 사람도 있다. CI에서 막아도 그땐 이미 push된 다음이다. 그래서 **pre-commit이 첫 방어선**이다.

Omechu의 `.husky/pre-commit`.

```sh
#!/usr/bin/env sh
(cd omechu-app && pnpm exec lint-staged --config lint-staged.config.mjs)
```

그리고 `lint-staged.config.mjs`.

```js
export default {
  "**/*.{js,jsx,ts,tsx,mjs}": [
    "eslint --fix",
    "prettier --write",
    () => "tsc --noEmit --pretty false",
  ],
  "**/*.{json,md,css}": ["prettier --write"],
};
```

`git commit` 누르면 자동으로:

1. ESLint가 돌고 (의존성 위반 발견 시 fail)
2. Prettier가 포맷 정리
3. TypeScript가 타입 체크

하나라도 fail하면 **commit 자체가 안 된다.** "지금은 급하니까 일단 커밋하고 나중에 고치자"가 불가능하다. 이게 처음엔 답답하지만 한두 달 지나면 이게 없는 프로젝트가 무섭다.

### Public API 패턴 — 옵션 vs 필수

여기는 실수하기 쉬운 부분이라 따로 뗀다. Public API 얘기를 할 때 사람들이 자주 헷갈리는데, **두 가지 다른 얘기**가 섞여 있다.

**1. 슬라이스 내부의 export를 일일이 `index.ts`에 정리하기 → 옵션이다.**

```ts
// widgets/header/index.ts
export { Header } from "./ui/Header";
export { useHeaderNav } from "./model/useHeaderNav";
export type { HeaderProps } from "./ui/Header";
```

작은 팀에선 이걸 매번 관리하는 게 부담이다. 코드 한 줄 추가할 때마다 `index.ts`도 같이 손봐야 한다. 두 가지 관리 포인트가 생기는 셈. `eslint-plugin-unused-imports` 같은 도구로 unused export를 잡으면 충분히 갈음 가능하다.

**2. 슬라이스 끼리 import할 때는 무조건 `index.ts`(Public API)를 통과해야 한다 → 필수다.**

```ts
// ✅ OK
import { Header } from "@/widgets/header";

// ❌ 금지 (슬라이스 내부 deep import)
import { Header } from "@/widgets/header/ui/Header";
```

왜 필수냐면, 다른 슬라이스가 내 내부 파일에 의존하기 시작하면 **리팩토링 자유도가 사라진다.** `ui/Header.tsx`를 `ui/HeaderBar.tsx`로 이름만 바꿔도 다른 슬라이스 N개를 같이 고쳐야 한다. 슬라이스 간 경계가 사라져버린 거다.

Omechu는 이 두 번째 규칙을 ESLint로 강제한다. 위에 보여준 `@/widgets/*/*` 패턴 금지가 그거다.

**핵심: 1번은 옵션, 2번은 필수.** 이걸 헷갈리면 안 된다.

### DIP — 프론트엔드에서도 유효한가?

이건 사실 처음에 나도 의심했다. DIP(Dependency Inversion Principle, 의존성 역전 원칙)는 NestJS, Spring Boot의 IoC 컨테이너에서 자주 듣던 얘기다. 프론트엔드에 정말 필요한가?

**유효하다.** 다만 백엔드처럼 거창한 IoC 컨테이너가 필요한 건 아니다.

처음에 인용한 선배의 말을 다시 보자.

> "UI를 그리는 것과 API를 받아서 데이터를 채우는 것은 분리해야 한다. 처음에는 목 데이터로 FE만 만들고, 나중에 swagger로 갈아끼우는 게 자연스럽기 때문이다."

이게 사실상 DIP다. 컴포넌트(고수준 모듈)가 fetch/axios(저수준 모듈)를 직접 부르는 게 아니라, **`UserRepository` 같은 인터페이스에 의존**하면 된다.

```ts
// 1. 추상화 — 인터페이스 정의
interface UserRepository {
  getUser(id: string): Promise<User>;
}

// 2. 컴포넌트는 인터페이스만 본다 (구현은 모름)
function UserProfile({ repo }: { repo: UserRepository }) {
  const { data } = useQuery(['user'], () => repo.getUser('me'));
  return <Card>{data?.name}</Card>;
}

// 3. 구현은 갈아끼운다
class ApiUserRepository implements UserRepository {
  async getUser(id: string) {
    return axios.get(`/users/${id}`).then(r => r.data);
  }
}

class MockUserRepository implements UserRepository {
  async getUser(id: string) {
    return { id, name: '목 데이터' };
  }
}
```

이게 선배가 말한 그 흐름이다. **처음엔 `MockUserRepository`로 FE 다 만들고, 백엔드가 swagger 주면 `ApiUserRepository`로 갈아끼운다.** 컴포넌트는 한 줄도 안 바뀐다. 테스트할 때도 mock 주입하면 끝.

콘센트 비유가 가장 직관적이다. 콘센트 규격(인터페이스)만 같으면 어떤 가전제품(구현)이든 꽂힌다. 가전제품을 바꿔도 콘센트는 그대로다.

![콘센트 비유로 풀어본 DIP 다이어그램](/images/blogs/063/063_04_dip-plug-analogy.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Illustration of a wall outlet labeled 'UserRepository (interface)' in the center. Three different appliances with same plug shape on the left side: a coffee machine labeled 'ApiUserRepository', a lamp labeled 'MockUserRepository', a kettle labeled 'CacheUserRepository'. Arrows showing each can plug into the same outlet. Above the outlet, a React component labeled 'UserProfile' depending only on the outlet shape. Flat illustration, soft pastel colors, clean educational style, friendly and intuitive"
  aspect_ratio: "16:9"
  session_id: "blog-063"
  save_as: "063_04_dip-plug-analogy.png"
-->

DIP는 Layered든 FSD든 둘 다 적용된다. Layered에서는 도메인이 인프라 인터페이스만 의존하는 형태로, FSD에서는 widget이 entity의 Public API(인터페이스 역할)에만 의존하는 형태로. **이름은 다르지만 같은 원칙이다.**

> 더 깊게 파고 싶다면 [Dependency Inversion in React: Building Truly Testable Components](https://cekrem.github.io/posts/dependency-inversion-in-react/) 글이 좋다.

---

## 결론 — 정답은 없다

| 상황                      | 추천                                                     |
| ------------------------- | -------------------------------------------------------- |
| 작은 프로젝트, 1~2명      | Layered도 충분 (또는 Feature-First 가벼운 구조)          |
| 도메인 많은 SaaS, 협업 팀 | FSD가 진가를 발휘                                        |
| Next.js 쓰는 팀           | FSD 도입 시 `pages` 레이어 처리 방식 미리 결정           |
| 어떤 구조든 공통          | 단방향 의존성 + ESLint + Husky로 강제, UI/API 분리(=DIP) |

마지막으로 한 번만 더.

> _"Layering is not 'folders,' it's dependency discipline."_

**아키텍처는 폴더 구조가 아니라 의존성 규율이다.** 폴더만 잘 나눠놓고 import는 자유롭게 하면, 그건 FSD를 흉내낸 미로일 뿐이다. ESLint와 Husky가 진짜 일을 한다.

---

## 참고 링크

**FSD 공식**

- [Feature-Sliced Design 공식](https://feature-sliced.design)
- [FSD x Next.js 가이드](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- [The Ultimate Next.js App Router Architecture](https://feature-sliced.design/blog/nextjs-app-router-guide)
- [Layered Architecture: Still Relevant for Frontend?](https://feature-sliced.design/blog/frontend-layered-architecture)
- [@feature-sliced/eslint-config](https://github.com/feature-sliced/eslint-config)

**의존성 / 도구**

- [Dependency Inversion in React (cekrem)](https://cekrem.github.io/posts/dependency-inversion-in-react/)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- [Modularizing React Applications (Martin Fowler)](https://martinfowler.com/articles/modularizing-react-apps.html)

**한국어 자료**

- [(번역) 기능 분할 설계 — 최고의 프런트엔드 아키텍처](https://emewjin.github.io/feature-sliced-design/)

**실전 사례**

- [Mastering Feature-Sliced Design: Lessons from Real Projects](https://dev.to/arjunsanthosh/mastering-feature-sliced-design-lessons-from-real-projects-2ida)
- [How to deal with NextJS App Router and FSD problem](https://dev.to/m_midas/how-to-deal-with-nextjs-using-feature-sliced-design-4c67)

---

7주차 발표 준비하다가 글이 너무 길어졌다. 그래도 스터디 끝나도 두고두고 펼쳐볼 수 있게 다 정리해뒀다. 같이 공부하는 분들에게 도움이 되면 좋겠다.

2026년 5월
