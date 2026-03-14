---
name: blog-write
description: 블로그 글 초안을 작성합니다. 주제, 이야기, 키워드를 인자로 받아 frontmatter와 본문, 이미지 프롬프트까지 완성된 마크다운 파일을 생성합니다.
argument-hint: "[주제 또는 아이디어]"
---

# blog-write 스킬

사용자가 제공한 주제나 이야기를 바탕으로 블로그 글 초안을 작성하고 파일로 저장합니다.

## 실행 순서

1. `src/content/blog/` 폴더의 파일 목록을 읽어 다음 글 번호를 파악한다 (현재 최신: 049, 다음: 050)
2. 사용자가 인자를 주지 않았으면 AskUserQuestion으로 주제와 하고 싶은 이야기를 물어본다
3. 아래 규칙에 따라 글을 작성하고 파일로 저장한다
4. 완성 후 파일 경로와 간략한 요약을 출력한다

## 파일명 규칙

```
src/content/blog/[번호]_[제목_언더스코어].md
```

예시: `050_나의_첫_사이드프로젝트_회고.md`

- 번호와 제목 구분: `. ` 대신 `_`
- 공백은 모두 `_` 로 대체

## Frontmatter 템플릿

```yaml
---
title: "제목"
subtitle: "부제목 (선택)"
description: "SEO 설명 - 검색 결과에 노출되는 문장. 150자 이내."
publish: false
meta_title: "제목 | 김덕환"
meta_description: "메타 설명 (description과 동일하거나 약간 다르게)"
keywords:
  - 키워드1
  - 키워드2
og_title: "OG 제목"
og_description: "OG 설명"
og_type: article
twitter_card: summary_large_image
created_date: YYYY-MM-DD
updated_date: YYYY-MM-DD
category: "카테고리"  # 개발 | 회고 | 교육 | 생산성 | 일상
featured_image: /images/blogs/[번호]/[번호]_00_thumbnail.png
featured_image_alt: "이미지 설명"
slug: 영문-slug-형식
tags:
  - 태그1
  - 태그2
---
```

> **주의**: `publish: false`로 저장한다. 사용자가 검토 후 직접 `true`로 바꾼다.

## 글쓰기 스타일 가이드

**톤 & 말투:**
- 구어체, 솔직한 1인칭 서술 ("나는", "나는 그때", "지금 돌아보면")
- 격식 없이 담백하게. 설명하듯이 쓰지 않는다
- 이모지는 사용자가 요청할 때만 사용
- 결론을 먼저 던지고 이야기를 풀어가는 구조

**구조:**
- 짧고 강렬한 오프닝 (1-3문장)
- `---` 구분선으로 섹션 분리
- `## 소제목` 으로 섹션 구분
- 마지막은 여운 있게 마무리 (날짜 or 짧은 한 마디)

**금지:**
- "안녕하세요! 오늘은 ~에 대해 알아보겠습니다" 같은 블로그 클리셰 문장
- 과도한 이모지 나열
- `bg-gradient-to-*` 사용 (TailwindCSS v4에서는 `bg-linear-to-*` 사용)

## 이미지 컨벤션

### 경로 규칙

```
public/images/blogs/[번호]/[번호]_[순번]_[영문-설명].png
```

| 종류 | 예시 경로 |
|------|----------|
| 썸네일 | `public/images/blogs/050/050_00_thumbnail.png` |
| 본문 1번 | `public/images/blogs/050/050_01_problem-description.png` |
| 본문 2번 | `public/images/blogs/050/050_02_solution.png` |

- 순번은 2자리 (`01`, `02`, ...), 썸네일은 `00`
- 설명은 영문 소문자 + 하이픈 (`business-fail`, `coding-start`)
- 확장자는 항상 `.png`
- 글 번호별로 서브폴더 분리

### 이미지 프롬프트 주석 형식

글 안에 이미지가 필요한 위치마다 아래 형식으로 삽입한다:

```markdown
![이미지 설명](/images/blogs/[번호]/[번호]_[순번]_[영문-설명].png)

<!--
  📸 이미지 프롬프트:
  prompt: "영문 이미지 생성 프롬프트, flat illustration, consistent style, same character"
  aspect_ratio: "16:9"
  session_id: "blog-[번호]"
  save_as: "[번호]_[순번]_[영문-설명].png"
-->
```

- **`session_id`**: 같은 글의 이미지들은 동일한 `blog-[번호]`로 스타일 일관성 유지
- **`aspect_ratio`**: 썸네일 `"4:3"`, 본문 `"16:9"` 권장
- **`save_as`**: OpenCode `/blog-images` 커맨드가 이 값으로 파일명 결정
- 이미지는 글 당 4-7개가 적당하다. 섹션 시작이나 감정의 전환점에 배치한다.

### 성능

PNG 원본을 저장해도 Cloudflare Polish(Lossless) 설정 시 방문자에게 자동 WebP 변환 제공.

## 카테고리 기준

| 카테고리 | 내용 |
|---------|------|
| 개발 | 기술, 코드, 트러블슈팅 |
| 회고 | 경험 회고, 후기, 성장 기록 |
| 교육 | 강연, 강의, 학습 |
| 생산성 | 도구, 워크플로우, 습관 |
| 일상 | 그 외 개인 이야기 |
