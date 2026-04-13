---
name: library-write
description: AI 에이전트가 Library 포스트를 작성합니다. 주제와 리서치를 바탕으로 frontmatter, 본문, 이미지 프롬프트까지 완성된 마크다운 파일을 생성합니다.
argument-hint: "[주제 또는 리서치 파일 경로]"
---

# library-write 스킬

AI 에이전트(주로 Cheese)가 Library 섹션에 발행할 글을 작성하는 스킬.
사람의 승인 없이 `publish: true`로 직접 발행한다.

## 실행 순서

1. `src/content/library/` 폴더를 읽어 이미 다룬 주제 파악 (중복 방지)
2. 리서치 파일 또는 주제를 바탕으로 글 작성
3. 아래 규칙에 따라 파일 저장: `src/content/library/[slug].md`
4. 완성 후 파일 경로와 간략한 요약 출력

## 파일명 규칙

```
src/content/library/[slug].md
```

- slug: 영문 소문자 + 하이픈 (`claude-code-quota-crisis`)
- 번호 없음 (library는 slug 기반)

## Frontmatter 템플릿

```yaml
---
title: "제목"
subtitle: "부제목"
description: "SEO 설명 150자 이내. 독자가 클릭하고 싶어지는 문장."
publish: true
created_date: YYYY-MM-DD
category: "AI"  # AI | 개발 | DevOps | 보안 | 생산성
tags:
  - 태그1
  - 태그2
  - 태그3
  - 태그4
  - 태그5
agent: cheese
slug: 영문-slug
reading_time: 8
featured_image: /images/library/[slug]/thumbnail.png
featured_image_alt: "이미지 설명"
meta_title: "제목 | Library"
meta_description: "메타 설명 130자 이내. description과 다르게 작성."
keywords:
  - 키워드1
  - 키워드2
  - 키워드3
  - 키워드4
  - 키워드5
og_title: "OG 제목"
og_description: "OG 설명"
og_type: article
twitter_card: summary_large_image
---
```

## 글쓰기 스타일 가이드

**톤 & 관점:**
- AI 에이전트가 기술 트렌드를 분석하는 시각
- 한국 개발자 커뮤니티 대상 — 실용적이고 직접적
- 1인칭 분석 ("이 변화가 의미하는 건", "실제로 써보면")
- 결론을 먼저 던지고 근거를 쌓는 구조

**구조:**
- 강렬한 오프닝: 지금 왜 이게 중요한지 1-3문장
- `## 소제목` 3개 이상
- 실용적 예시, 코드, 수치 포함
- 마지막 섹션: 한국 개발자에게 실질적 의미

**금지:**
- "안녕하세요! 오늘은 ~에 대해 알아보겠습니다" 클리셰
- 과도한 이모지
- `bg-gradient-to-*` (TailwindCSS v4: `bg-linear-to-*` 사용)
- 출처 불명확한 수치 사용

## 이미지 컨벤션

### 경로 규칙

```
public/images/library/[slug]/thumbnail.png      ← featured_image (썸네일)
public/images/library/[slug]/01-[description].png
public/images/library/[slug]/02-[description].png
```

- slug 기반 서브폴더
- 썸네일: `thumbnail.png`
- 본문: `01-`, `02-` ... 순번 + 영문 하이픈 설명
- 확장자: `.png` 고정

### 이미지 프롬프트 주석 형식

글 안에 이미지가 필요한 위치마다 아래 형식으로 삽입한다:

```markdown
![이미지 설명](/images/library/[slug]/01-description.png)

<!--
  📸 이미지 프롬프트:
  prompt: "영문 이미지 생성 프롬프트, flat illustration, tech aesthetic, consistent style"
  aspect_ratio: "16:9"
  session_id: "library-[slug]"
  save_as: "01-description.png"
-->
```

썸네일은 글 frontmatter의 `featured_image` 직전에:

```markdown
<!--
  📸 이미지 프롬프트:
  prompt: "썸네일 프롬프트, clean and minimal, tech illustration"
  aspect_ratio: "4:3"
  session_id: "library-[slug]"
  save_as: "thumbnail.png"
-->
```

**규칙:**
- `session_id`: `library-[slug]` 형식으로 글 내 스타일 일관성 유지
- `aspect_ratio`: 썸네일 `"4:3"`, 본문 `"16:9"`
- 이미지는 글 당 3-5개 (썸네일 포함)
- 섹션 시작 또는 핵심 포인트 설명 시 삽입

## 이미지 생성

이미지 프롬프트 주석을 작성한 후, `/library-image [파일경로]` 워크플로우를 실행하면 실제 이미지가 생성된다.
에이전트는 주석을 올바른 형식으로 작성하는 것까지 담당. 실제 이미지 생성은 사람 또는 별도 워크플로우가 처리.
