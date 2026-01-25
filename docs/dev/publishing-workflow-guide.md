# 블로그 발행 워크플로우 가이드

Obsidian에서 작성한 글을 Astro 블로그로 발행하는 과정에 대한 가이드입니다.

## 📝 필수 프론트매터 (Required Frontmatter)

모든 블로그 게시물은 파일 상단에 다음 프론트매터를 반드시 포함해야 합니다.

```yaml
---
title: 당신의 게시물 제목 # 게시물의 주요 제목
publish: true # 게시물이 사이트에 나타나려면 true로 설정
---
```

- `title`: 블로그 게시물의 메인 제목입니다.
- `publish`: 게시물을 공개할지 여부를 결정합니다. `true`로 설정해야 블로그에 표시됩니다. `false` 또는 필드 누락 시 게시되지 않습니다.

## 🎨 선택적 프론트매터 (Optional Frontmatter)

게시물을 더 풍부하게 만들고 싶다면 다음 필드를 추가할 수 있습니다.

```yaml
---
subtitle: 더 짧은 부제목 # 제목 아래에 표시
description: 간략한 요약 # SEO 및 미리보기에 사용 (150-160자 권장)
tags: [태그1, 태그2] # 게시물 카테고리 목록
created_date: YYYY-MM-DD # 게시 날짜 (자동 생성 가능)
featured_image: URL # 게시물 대표 이미지 URL
slug: your-custom-slug # 사용자 지정 URL 경로 (없으면 title로 자동 생성)
---
```

더 자세한 프론트매터 옵션은 [SEO 최적화 가이드](seo-optimization-guide.md)를 참고하세요.

## 🔄 게시 워크플로우 (Publishing Workflow)

### 1단계: Obsidian Vault 설정

1. Obsidian을 실행합니다.
2. "Open folder as vault" 선택
3. `C:\projects\My_Website_Astro\src\content\blog` 폴더를 선택합니다.
4. 이제 Obsidian에서 블로그 글을 작성할 준비가 완료되었습니다!

### 2단계: 글 작성

1. Obsidian에서 새 마크다운 노트를 생성합니다.
2. 노트 상단에 필수 및 선택적 프론트매터를 추가합니다.
3. [마크다운 작성 가이드](markdown-writing-guide.md)를 따라 본문을 작성합니다.
4. 이미지가 있다면 `public/images/` 폴더에 업로드합니다.

### 3단계: 로컬 미리보기

1. 터미널에서 개발 서버를 실행합니다:
   ```bash
   bun dev
   ```
2. `http://localhost:4321`에서 블로그를 미리 봅니다.
3. 파일을 저장하면 자동으로 새로고침됩니다 (Hot Module Replacement).

### 4단계: 발행

1. 게시할 준비가 되면 **프론트매터에서 `publish: true`로 설정**합니다.
2. Git을 사용하여 변경 사항을 커밋하고 푸시합니다:
   ```bash
   git add .
   git commit -m "feat: 새 블로그 포스트 추가 - [제목]"
   git push
   ```
3. 사이트가 자동으로 재빌드되어 게시물이 공개됩니다.

## 📁 파일 구조

```
프로젝트 루트/
├── src/content/blog/        # 📝 여기서 직접 글을 작성! (Obsidian vault)
│   ├── my-first-post.md
│   └── my-second-post.md
├── public/images/           # 🖼️ 이미지 파일 저장소
│   ├── post-images/
│   └── design/
└── tools/scripts/           # 🛠️ 유틸리티 스크립트
    ├── scrollAnimation.js
    ├── mobileMenu.ts
    └── toast.ts
```

## ⚡ 작동 원리

이 블로그는 **Astro의 Content Collections API**를 사용하여 작동합니다:

1. **직접 읽기**: Astro가 빌드 시 `src/content/blog/`의 마크다운 파일을 직접 읽습니다.
2. **필터링**: `publish: true`인 게시물만 페이지에 표시됩니다 (코드에서 런타임 필터링).
3. **동기화 불필요**: 별도의 동기화 스크립트가 필요 없습니다!

### 주요 장점

✅ **단일 소스**: `src/content/blog/`에서만 관리
✅ **즉시 반영**: 파일 저장 시 자동 업데이트
✅ **Git 통합**: 버전 관리가 간편
✅ **Obsidian 네이티브**: 모든 Obsidian 기능 사용 가능

## 🔍 문제 해결 (Troubleshooting)

게시물이 나타나지 않으면 다음 사항을 확인하세요:

### ✅ 기본 체크리스트

- [ ] `publish: true`로 설정되어 있습니까?
- [ ] 파일이 `src/content/blog/` 폴더에 올바르게 위치해 있습니까?
- [ ] 프론트매터에 YAML 구문 오류가 없습니까?
- [ ] 개발 서버를 재시작했습니까? (`bun dev`)

### 🐛 일반적인 문제들

**1. 프론트매터 구문 오류**

```yaml
# 잘못된 예시
---
title: My Post
publish true  # ❌ 콜론 누락
---

# 올바른 예시
---
title: "My Post"
publish: true  # ✅
---
```

**2. 파일 위치 문제**

- ✅ 파일이 `src/content/blog/` 디렉토리에 있는지 확인
- ✅ Obsidian vault가 올바른 폴더를 가리키는지 확인
- ⚠️ 파일 이름에 특수문자가 있으면 slug 사용 권장

**3. 개발 서버 문제**

```bash
# 개발 서버 재시작
# Ctrl+C로 중지 후
bun dev
```

**4. 빌드 오류**

```bash
# 빌드 테스트
bun build

# 빌드 결과 미리보기
bun preview
```

**5. Hot Reload가 작동하지 않음**

- 개발 서버를 재시작하세요
- 브라우저 캐시를 지우세요
- 파일명이 변경되었다면 서버를 재시작해야 합니다

## 📊 성능 최적화 팁

### 이미지 최적화

1. 이미지는 WebP 형식을 권장합니다.
2. 대용량 이미지는 압축하여 사용하세요.
3. `featured_image`에는 로컬 경로 또는 CDN 링크를 사용하세요.

### SEO 최적화

1. 모든 게시물에 `description` 필드를 포함하세요.
2. `tags`를 활용하여 카테고리를 분류하세요.
3. `slug`를 사용하여 의미 있는 URL을 만드세요.

## 💡 Pro Tips

### Obsidian 활용

- **템플릿 사용**: Obsidian의 템플릿 기능으로 프론트매터 자동 생성
- **링크 활용**: `[[노트명]]` 형식의 위키링크는 마크다운 링크로 변환 필요
- **태그 관리**: Obsidian의 태그 패널로 태그 관리

### Draft 관리

- `publish: false` 또는 필드를 생략하면 초안 상태
- 초안 파일은 빌드에서 제외됨
- 로컬 개발 시에도 `publish: true`인 파일만 표시됨

### Git 워크플로우

```bash
# 새 글 작성 시
git checkout -b post/new-post-title
git add src/content/blog/new-post.md
git commit -m "feat: 새 포스트 - 제목"
git push origin post/new-post-title

# Pull Request 생성 후 merge
```

## 🔗 관련 문서

- [SEO 최적화 가이드](seo-optimization-guide.md) - 검색 엔진 최적화 전략
- [마크다운 작성 가이드](markdown-writing-guide.md) - 마크다운 문법 참고
- [디자인 시스템 가이드](design-system-guide.md) - 브랜드 색상 및 스타일
- [개발 가이드](development-guide.md) - 개발 환경 설정
