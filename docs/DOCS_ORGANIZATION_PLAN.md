# 📂 Docs 폴더 정리 계획

> **작성일**: 2025-11-17
> **목적**: docs 폴더를 효율적으로 관리하기 위한 분류 및 정리 계획

---

## 📊 현황 분석 (총 14개 파일)

### 1️⃣ 블로그 콘텐츠로 만들면 좋은 것 (일반 독자 대상)

| 파일명                             | 크기  | 상태    | 블로그 제목 제안                                                 |
| ---------------------------------- | ----- | ------- | ---------------------------------------------------------------- |
| **AEO_GUIDE.md**                   | 16KB  | ✅ 추천 | "SEO 대신 AEO가 대세? ChatGPT가 내 블로그를 인용하게 만드는 법"  |
| **FAQ_SCHEMA_USAGE.md**            | 7.8KB | ✅ 추천 | "AI 시대의 FAQ 작성법 - 구조화된 데이터로 검색 노출 10배 높이기" |
| **FAQ_QUICK_TEMPLATES.md**         | 7.6KB | ✅ 추천 | "3분 만에 FAQ 작성하기 - ChatGPT 활용 템플릿"                    |
| **GISCUS_IMPLEMENTATION_GUIDE.md** | 4.4KB | ✅ 추천 | "Astro 블로그에 GitHub Discussions 댓글 시스템 추가하기"         |
| **markdown-writing-guide.md**      | 4.1KB | ⚠️ 선택 | "마크다운 완벽 가이드 - 블로그 글쓰기 필수 문법"                 |
| **seo-optimization-guide.md**      | 12KB  | ⚠️ 선택 | "SEO/AEO 최적화 완벽 가이드 - AI 시대 검색 전략"                 |

**추천**: 위 6개 중 **상위 4개(AEO, FAQ 2개, Giscus)**를 블로그 글로 발행

---

### 2️⃣ 개발자 문서로 보관 (내부 참조용)

| 파일명                           | 크기  | 용도                     | 위치 제안        |
| -------------------------------- | ----- | ------------------------ | ---------------- |
| **design-system-guide.md**       | 2.9KB | 디자인 시스템 참조       | `docs/dev/`      |
| **development-guide.md**         | 5.2KB | 개발 환경 설정           | `docs/dev/`      |
| **publishing-workflow-guide.md** | 6.8KB | 발행 프로세스            | `docs/workflow/` |
| **production-best-practices.md** | 11KB  | 프로덕션 베스트 프랙티스 | `docs/dev/`      |
| **SETUP_PRODUCTION_TOOLS.md**    | 6.3KB | 도구 설정 가이드         | `docs/dev/`      |

**보관 이유**: 프로젝트 개발/유지보수에 필요한 내부 문서

---

### 3️⃣ 통합/정리 필요

| 파일명                                | 문제점                    | 해결 방안                        |
| ------------------------------------- | ------------------------- | -------------------------------- |
| **NEWSLETTER_QUICK_START.md** (5.1KB) | 중복 (간단 버전)          | newsletter-setup-guide.md와 통합 |
| **newsletter-setup-guide.md** (13KB)  | 중복 (상세 버전)          | 하나로 통합 → 블로그 글 발행     |
| **PERFORMANCE_OPTIMIZATION_PLAN.md**  | 구현 완료 (008번 글 있음) | 삭제 또는 아카이브               |

**제안**: 뉴스레터 2개 → 1개로 통합 후 블로그 글 발행

---

### 4️⃣ 삭제 고려

| 파일명                               | 삭제 이유                                   | 조치 |
| ------------------------------------ | ------------------------------------------- | ---- |
| **PERFORMANCE_OPTIMIZATION_PLAN.md** | "008. Astro 블로그 성능 최적화" 글로 대체됨 | 삭제 |

---

## 🎯 최종 정리 계획

### Step 1: 폴더 구조 개선

```
docs/
├── dev/                    # 개발자 전용 문서
│   ├── design-system-guide.md
│   ├── development-guide.md
│   ├── production-best-practices.md
│   └── SETUP_PRODUCTION_TOOLS.md
│
├── workflow/               # 워크플로우 가이드
│   └── publishing-workflow-guide.md
│
├── blog-drafts/           # 블로그로 발행할 초안
│   ├── AEO_GUIDE.md → "SEO 대신 AEO가 대세..."
│   ├── FAQ_SCHEMA_USAGE.md → "AI 시대의 FAQ 작성법..."
│   ├── FAQ_QUICK_TEMPLATES.md → "3분 만에 FAQ 작성하기..."
│   ├── GISCUS_IMPLEMENTATION_GUIDE.md → "GitHub Discussions 댓글..."
│   └── newsletter-complete-guide.md (통합 버전)
│
└── archive/               # 완료/중단된 문서
    └── PERFORMANCE_OPTIMIZATION_PLAN.md
```

### Step 2: 블로그 글로 발행 (우선순위)

1. **최우선 (핵심 콘텐츠)**
   - ✅ AEO_GUIDE.md → "SEO 대신 AEO가 대세? ChatGPT가 내 블로그를 인용하게 만드는 법"
   - ✅ FAQ_SCHEMA_USAGE.md + FAQ_QUICK_TEMPLATES.md → "AI 시대의 FAQ 완벽 가이드 - 3분 만에 작성하고 검색 노출 10배 높이기"

2. **2차 우선순위**
   - GISCUS_IMPLEMENTATION_GUIDE.md → "Astro 블로그에 GitHub Discussions 댓글 추가하기"
   - newsletter-complete-guide.md → "블로그에 뉴스레터 구독 기능 추가하기 - Resend 완벽 가이드"

3. **선택사항**
   - markdown-writing-guide.md → "마크다운 완벽 가이드"
   - seo-optimization-guide.md → AEO_GUIDE와 통합 고려

### Step 3: 정리 작업

**삭제**:

- ❌ PERFORMANCE_OPTIMIZATION_PLAN.md (이미 블로그 글로 발행됨)

**통합**:

- 🔀 NEWSLETTER_QUICK_START.md + newsletter-setup-guide.md
  → `newsletter-complete-guide.md`

**이동**:

- 📁 개발자 문서 → `docs/dev/`
- 📁 워크플로우 → `docs/workflow/`
- 📁 블로그 초안 → `docs/blog-drafts/`
- 📁 완료 문서 → `docs/archive/`

---

## 📝 블로그 발행 시 주의사항

### Frontmatter 필수 항목

```yaml
---
title: "제목"
description: "SEO 설명"
publish: true
created_date: 2025-11-17
tags:
  - 태그1
  - 태그2
slug: url-slug

# AEO 최적화
faq:
  - question: "질문"
    answer: "답변"
---
```

### 본문 작성 팁

1. **첫 문단에 핵심 답변** 배치
2. **불릿 포인트**와 **표** 활용
3. **본문 끝에 FAQ 섹션** 추가
4. **데이터와 출처** 명시

---

## 🎯 예상 효과

| 항목             | Before      | After                |
| ---------------- | ----------- | -------------------- |
| **docs 파일 수** | 14개 (혼재) | 9개 (정리됨)         |
| **블로그 글**    | -           | +4-6개 고품질 가이드 |
| **검색 노출**    | 낮음        | AEO 최적화로 향상    |
| **관리 편의성**  | 혼란        | 명확한 분류          |

---

## ⏱️ 작업 소요 시간

| 작업                 | 예상 시간   |
| -------------------- | ----------- |
| 폴더 구조 생성       | 5분         |
| 파일 이동/정리       | 10분        |
| 뉴스레터 통합        | 20분        |
| 블로그 글 작성 (4개) | 2-4시간     |
| **총 소요 시간**     | **3-5시간** |

---

## 다음 단계

1. ✅ 이 계획 검토
2. 🔄 폴더 구조 생성
3. 🔄 파일 이동 및 정리
4. 🔄 블로그 글 발행 (우선순위 순)
5. 🔄 효과 측정 (1개월 후)

---

**작성일**: 2025-11-17
**마지막 업데이트**: 2025-11-17
