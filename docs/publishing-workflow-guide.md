# 블로그 발행 워크플로우 가이드

Obsidian에서 작성한 글을 Astro 블로그로 발행하는 과정에 대한 가이드입니다.

## 📝 필수 프론트매터 (Required Frontmatter)

모든 블로그 게시물은 파일 상단에 다음 프론트매터를 반드시 포함해야 합니다.

```yaml
---
title: 당신의 게시물 제목    # 게시물의 주요 제목
publish: true            # 게시물이 사이트에 나타나려면 true로 설정
---
```

- `title`: 블로그 게시물의 메인 제목입니다.
- `publish`: 게시물을 공개할지 여부를 결정합니다. `true`로 설정해야 블로그에 표시됩니다. `false`, `draft: true`, 또는 필드 누락 시 게시되지 않습니다.

## 🎨 선택적 프론트매터 (Optional Frontmatter)

게시물을 더 풍부하게 만들고 싶다면 다음 필드를 추가할 수 있습니다.

```yaml
---
subtitle: 더 짧은 부제목    # 제목 아래에 표시
description: 간략한 요약    # SEO 및 미리보기에 사용 (150-160자 권장)
tags: [태그1, 태그2]             # 게시물 카테고리 목록
created_date: YYYY-MM-DD       # 게시 날짜 (자동 생성 가능)
featured_image: URL            # 게시물 대표 이미지 URL
slug: your-custom-slug         # 사용자 지정 URL 경로 (없으면 title로 자동 생성)
---
```

더 자세한 프론트매터 옵션은 [SEO 최적화 가이드](seo-optimization-guide.md)를 참고하세요.

## 🔄 게시 워크플로우 (Publishing Workflow)

### 1단계: 글 작성
1. Obsidian에서 새 마크다운 노트를 생성합니다.
2. 노트 상단에 필수 및 선택적 프론트매터를 추가합니다.
3. [마크다운 작성 가이드](markdown-writing-guide.md)를 따라 본문을 작성합니다.

### 2단계: 발행 준비
1. 게시할 준비가 되면 `publish: true`로 설정합니다.
2. 파일을 프로젝트의 `src/content/blog/` 폴더에 저장합니다.
3. 이미지가 있다면 `public/images/` 폴더에 업로드합니다.

### 3단계: 동기화 및 빌드
1. 프로젝트 루트에서 동기화 스크립트를 실행합니다:
   ```bash
   pnpm run sync
   ```
2. 로컬에서 확인하려면 개발 서버를 실행합니다:
   ```bash
   pnpm run dev
   ```

### 4단계: 배포
1. Git을 사용하여 변경 사항을 커밋하고 푸시합니다:
   ```bash
   git add .
   git commit -m "feat: 새 블로그 포스트 추가 - [제목]"
   git push
   ```
2. 사이트가 자동으로 재빌드되어 게시물이 공개됩니다.

## 📁 파일 구조

```
프로젝트 루트/
├── src/content/blog/        # 블로그 포스트 저장소
│   ├── my-first-post.md
│   └── my-second-post.md
├── public/images/           # 이미지 파일 저장소
│   ├── post-images/
│   └── design/
└── tools/scripts/           # 동기화 스크립트
    └── sync-obsidian.js
```

## 🛠️ 동기화 시스템

이 프로젝트는 Obsidian 폴더와 Astro 프로젝트 간의 자동 동기화를 지원합니다.

### 동기화 스크립트 작동 방식
- `tools/scripts/sync-obsidian.js`가 Obsidian의 블로그 폴더를 스캔합니다.
- `publish: true`인 파일만 `src/content/blog/`로 복사됩니다.
- 개발 서버 실행 시 자동으로 동기화가 수행됩니다.

### 수동 동기화
```bash
pnpm run sync
```

## 🔍 문제 해결 (Troubleshooting)

게시물이 나타나지 않으면 다음 사항을 확인하세요:

### ✅ 기본 체크리스트
- [ ] `publish: true`로 설정되어 있습니까?
- [ ] 파일이 `src/content/blog/` 폴더에 올바르게 위치해 있습니까?
- [ ] 프론트매터에 YAML 구문 오류가 없습니까?
- [ ] 변경 사항을 Git으로 커밋하고 푸시했습니까?

### 🐛 일반적인 문제들

**1. 프론트매터 구문 오류**
```yaml
# 잘못된 예시
---
title: My Post
publish true  # 콜론 누락
---

# 올바른 예시
---
title: "My Post"
publish: true
---
```

**2. 파일 경로 문제**
- 파일이 `src/content/blog/` 디렉토리에 있는지 확인
- 파일 이름에 특수문자나 공백이 없는지 확인

**3. 동기화 문제**
```bash
# 동기화 스크립트 재실행
pnpm run sync

# 개발 서버 재시작
pnpm run dev
```

**4. 빌드 오류**
```bash
# 빌드 테스트
pnpm run build

# 빌드 결과 미리보기
pnpm run preview
```

## 📊 성능 최적화 팁

### 이미지 최적화
1. 이미지는 WebP 형식을 권장합니다.
2. 대용량 이미지는 압축하여 사용하세요.
3. `featured_image`에는 CDN 링크 사용을 권장합니다.

### SEO 최적화
1. 모든 게시물에 `description` 필드를 포함하세요.
2. `tags`를 활용하여 카테고리를 분류하세요.
3. `slug`를 사용하여 의미 있는 URL을 만드세요.

## 🔗 관련 문서

- [SEO 최적화 가이드](seo-optimization-guide.md) - 검색 엔진 최적화 전략
- [마크다운 작성 가이드](markdown-writing-guide.md) - 마크다운 문법 참고
- [디자인 시스템 가이드](design-system-guide.md) - 브랜드 색상 및 스타일
- [배포 가이드](../DEPLOYMENT.md) - 다양한 플랫폼 배포 방법