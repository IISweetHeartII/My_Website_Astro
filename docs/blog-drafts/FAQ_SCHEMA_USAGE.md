# FAQ Schema 사용법 가이드

> ChatGPT, Perplexity, Claude가 여러분의 FAQ를 인용하도록 만드는 방법

## 개요

`FAQSchema` 컴포넌트는 블로그 포스트에 FAQ(자주 묻는 질문)를 추가할 때 사용합니다. 이 컴포넌트는 Schema.org FAQPage 구조화된 데이터를 자동으로 생성하여 AI 답변 엔진이 여러분의 FAQ를 쉽게 이해하고 인용할 수 있도록 합니다.

---

## 기본 사용법

### 1. BlogPost.astro에 FAQSchema 컴포넌트 추가

`src/layouts/BlogPost.astro` 파일을 수정:

```astro
---
import FAQSchema from "@/components/seo/FAQSchema.astro";

interface Props extends Pick<CollectionEntry<"blog">, "data"> {}

const {
  data: {
    // ... 기존 props
    faq, // 👈 추가
  },
} = Astro.props;
---

<html lang="ko">
  <head>
    <!-- ... 기존 메타 태그 ... -->

    <!-- FAQ Schema 추가 -->
    {faq && <FAQSchema faq={faq} />}

    <!-- ... 나머지 ... -->
  </head>

  <body>
    <!-- ... 본문 ... -->
  </body>
</html>
```

### 2. Content Collection 스키마에 FAQ 필드 추가

`src/content/config.ts` 파일을 수정:

```typescript
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // ... 기존 필드들 ...

    // FAQ 필드 추가
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { blog };
```

### 3. 블로그 포스트 Frontmatter에 FAQ 추가

`src/content/blog/your-post.md`:

```yaml
---
title: "React Hooks 완벽 가이드"
description: "React Hooks의 모든 것을 알려드립니다"
publish: true
created_date: 2025-01-17
tags:
  - React
  - JavaScript
  - Frontend

# FAQ 추가
faq:
  - question: "React Hooks란 무엇인가요?"
    answer: "React Hooks는 함수형 컴포넌트에서 상태(state)와 생명주기(lifecycle)를 사용할 수 있게 해주는 기능입니다. useState, useEffect 등이 대표적입니다."

  - question: "Hooks를 사용하면 어떤 장점이 있나요?"
    answer: "코드 재사용성이 높아지고, 클래스 컴포넌트보다 간결하며, 로직을 더 쉽게 분리할 수 있습니다. 또한 함수형 프로그래밍 패러다임에 더 잘 맞습니다."

  - question: "가장 많이 사용되는 Hook은 무엇인가요?"
    answer: "useState(상태 관리), useEffect(사이드 이펙트), useContext(전역 상태), useRef(DOM 참조) 순으로 많이 사용됩니다."
---
# 본문 내용...
```

---

## 본문에 FAQ 섹션도 추가하기 (권장)

Schema만 추가하는 것보다 **본문에도 FAQ 섹션을 표시**하면 더 효과적입니다:

```markdown
---
title: "React Hooks 완벽 가이드"
faq:
  - question: "React Hooks란 무엇인가요?"
    answer: "React Hooks는 함수형 컴포넌트에서 상태와 생명주기를 사용할 수 있게 해주는 기능입니다."
---

# React Hooks 완벽 가이드

[본문 내용...]

---

## 자주 묻는 질문 (FAQ)

### Q1. React Hooks란 무엇인가요?

React Hooks는 함수형 컴포넌트에서 상태(state)와 생명주기(lifecycle)를 사용할 수 있게 해주는 기능입니다. useState, useEffect 등이 대표적입니다.

### Q2. Hooks를 사용하면 어떤 장점이 있나요?

코드 재사용성이 높아지고, 클래스 컴포넌트보다 간결하며, 로직을 더 쉽게 분리할 수 있습니다.

### Q3. 가장 많이 사용되는 Hook은 무엇인가요?

useState(상태 관리), useEffect(사이드 이펙트), useContext(전역 상태), useRef(DOM 참조) 순으로 많이 사용됩니다.
```

---

## FAQ 작성 모범 사례

### ✅ 좋은 FAQ 예시

```yaml
faq:
  - question: "TypeScript를 배우는 데 얼마나 걸리나요?"
    answer: "JavaScript 기초가 있다면 TypeScript 기본 문법은 1-2주면 익힐 수 있습니다. 실무에서 능숙하게 사용하려면 3-6개월 정도의 경험이 필요합니다."

  - question: "TypeScript의 단점은 무엇인가요?"
    answer: "초기 학습 곡선이 있고, 작은 프로젝트에서는 설정이 복잡할 수 있습니다. 또한 빌드 시간이 약간 늘어날 수 있습니다."
```

**특징**:

- ✅ 질문이 구체적이고 명확함
- ✅ 답변이 간결하면서도 유용한 정보 제공
- ✅ 실제 사용자가 궁금해할 만한 내용

### ❌ 나쁜 FAQ 예시

```yaml
faq:
  - question: "좋나요?"
    answer: "네."

  - question: "이거 어때요?"
    answer: "좋습니다. 많이 사용하세요."
```

**문제점**:

- ❌ 질문이 너무 모호함
- ❌ 답변이 구체적이지 않음
- ❌ AI가 인용할 만한 가치가 없음

---

## FAQ 질문 아이디어

블로그 주제별로 자주 나오는 질문 패턴:

### 튜토리얼/가이드

- "X란 무엇인가요?"
- "X를 배우는 데 얼마나 걸리나요?"
- "X의 장점/단점은 무엇인가요?"
- "X를 사용하기 위한 사전 지식은?"
- "X와 Y의 차이점은?"

### 비교 글

- "어떤 경우에 X를 사용해야 하나요?"
- "X는 Y를 대체할 수 있나요?"
- "초보자에게는 어떤 걸 추천하나요?"

### 트러블슈팅

- "가장 흔한 오류는 무엇인가요?"
- "X 오류가 나는 이유는?"
- "성능 문제를 해결하려면?"

---

## FAQ Schema가 생성하는 JSON-LD 예시

위의 FAQ를 사용하면 다음과 같은 구조화된 데이터가 자동 생성됩니다:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "React Hooks란 무엇인가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "React Hooks는 함수형 컴포넌트에서 상태와 생명주기를 사용할 수 있게 해주는 기능입니다."
      }
    }
  ]
}
```

이 데이터를 ChatGPT, Perplexity, Claude가 읽고 답변에 인용합니다!

---

## FAQ 효과 측정

### 1. 수동 테스트

정기적으로 (월 1회) AI에게 질문하고 여러분의 FAQ가 인용되는지 확인:

```
ChatGPT: "React Hooks가 뭐야?"
Perplexity: "React Hooks란 무엇인가요?"
Claude: "React Hooks에 대해 설명해줘"
```

### 2. Google Search Console

- Performance → Queries → "무엇", "어떻게", "왜" 포함 검색어 확인
- AI Overviews 노출 여부 확인

---

## 추가 팁

### 1. FAQ는 3-5개가 적당

- 너무 적으면 효과가 적음
- 너무 많으면 중요한 질문이 희석됨

### 2. 답변은 2-4문장이 이상적

- 너무 짧으면 정보가 부족
- 너무 길면 AI가 요약하기 어려움

### 3. 모든 포스트에 FAQ가 필요하진 않음

- 튜토리얼/가이드: **필수**
- 비교/리뷰: **권장**
- 개인 일상: 선택

---

## 문제 해결

### FAQ가 표시되지 않아요

1. Frontmatter에 `faq` 필드가 올바르게 작성되었는지 확인
2. `src/content/config.ts`에 FAQ 스키마가 추가되었는지 확인
3. `BlogPost.astro`에 `<FAQSchema faq={faq} />`가 추가되었는지 확인

### FAQ Schema가 제대로 생성되는지 확인하려면?

1. 빌드 후 브라우저에서 페이지 열기
2. 우클릭 → "페이지 소스 보기"
3. `<script type="application/ld+json">`를 검색
4. FAQPage 타입의 JSON-LD가 있는지 확인

### Google Search Console에서 오류가 나요

- [Google Rich Results Test](https://search.google.com/test/rich-results)에서 URL 테스트
- 오류 메시지 확인 후 수정

---

**작성일**: 2025-01-17
**관련 문서**: [AEO_GUIDE.md](./AEO_GUIDE.md)
