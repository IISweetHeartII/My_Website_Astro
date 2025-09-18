# Cursor IDE Rules Guide

## 📁 .cursor 폴더 구조

이 프로젝트는 Cursor IDE의 규칙 시스템을 활용하여 코딩 스타일과 가이드라인을 자동화합니다.

```
.cursor/
└── rules/
    ├── astro_blog_style_guide.mdc    # 색상 시스템 & 스타일 가이드
    ├── seo-guide.mdc                 # SEO/AEO 최적화 가이드
    ├── aeo-strategy.mdc              # AI 검색 최적화 전략
    ├── markdown-style-guide.mdc      # 마크다운 작성 규칙
    ├── publishing-guide.mdc          # 게시물 발행 가이드
    └── DEPLOYMENT.md                 # 배포 가이드
```

## 🎨 핵심 규칙 파일 설명

### 1. astro_blog_style_guide.mdc
**목적**: 프로젝트 전반의 색상 시스템과 스타일 가이드 정의

**주요 내용**:
- **색상 팔레트**: Tailwind 기반 브랜드 색상 시스템
  - Primary: `#485E8E` (블루그레이)
  - Accent: `#00FF6A` (형광 연두)
  - Background: `#FFFFFF`, `#F9FAFB`
  - Text: `#1F2937`, `#6B7280`
- **폰트 시스템**: Pretendard (한글 최적화)
- **개발 프레임워크**: Astro + TailwindCSS
- **광고 통합**: Google AdSense 배치 가이드

**적용 방식**: `alwaysApply: true` - 모든 파일에 자동 적용

### 2. seo-guide.mdc
**목적**: 블로그 게시물의 SEO/AEO 최적화 가이드

**주요 내용**:
- **필수 속성**: `title`, `publish`
- **중요 속성**: `subtitle`, `description`, `created_date`
- **AEO 최적화**: AI 검색 엔진을 위한 질문 형식 제목
- **SEO 메타데이터**: 150-160자 description 권장

**적용 방식**: `alwaysApply: false` - 블로그 콘텐츠 작성 시에만 적용

### 3. aeo-strategy.mdc
**목적**: Answer Engine Optimization (AI 검색 최적화) 전략

**주요 내용**:
- AI 검색 엔진 (ChatGPT, Gemini, Claude) 최적화
- 질문-답변 형식의 콘텐츠 구조
- 실제 경험과 독창적 인사이트 강조
- 최신성과 신뢰성 신호 구축

### 4. markdown-style-guide.mdc
**목적**: 일관된 마크다운 작성 스타일 가이드

**주요 내용**:
- 제목 구조 및 계층
- 코드 블록 스타일링
- 링크 및 이미지 포맷
- 리스트 작성 규칙

### 5. publishing-guide.mdc
**목적**: 블로그 게시물 발행 프로세스 가이드

**주요 내용**:
- Obsidian → Astro 동기화 프로세스
- `publish: true` 설정 방법
- 이미지 최적화 및 관리
- 태그 및 카테고리 분류

### 6. DEPLOYMENT.md
**목적**: 다양한 플랫폼 배포 가이드

**주요 내용**:
- 환경 변수 설정 (`SITE_URL`, `BASE_URL`)
- 로컬 개발 환경 구성
- 프로덕션 배포 시나리오
- URL 라우팅 처리

## 🚀 Cursor IDE 활용법

### 1. 자동 적용 규칙
- `astro_blog_style_guide.mdc`는 항상 활성화
- 코딩 시 자동으로 색상 시스템과 스타일 가이드 적용

### 2. 컨텍스트별 규칙
- 블로그 콘텐츠 작성 시 `seo-guide.mdc` 활성화
- 마크다운 파일 편집 시 관련 가이드 자동 적용

### 3. 새로운 규칙 추가 방법
1. `.cursor/rules/` 디렉토리에 `.mdc` 파일 생성
2. 메타데이터 설정:
   ```yaml
   ---
   description: 규칙 설명
   globs: ["적용할 파일 패턴"]
   alwaysApply: true/false
   ---
   ```
3. 마크다운 형식으로 가이드라인 작성

## 🔧 설정 권장사항

### VS Code Extensions 호환성
- Cursor IDE 규칙은 VS Code에서도 활용 가능
- `.vscode/settings.json`과 연동하여 일관된 개발 환경 구축

### Prettier 연동
- `.prettierrc` 설정과 `.cursor` 규칙을 함께 사용
- 자동 포맷팅 + 스타일 가이드 준수

## 📋 체크리스트

### 새 개발자 온보딩
- [ ] Cursor IDE 설치 및 설정
- [ ] 프로젝트 열기 시 `.cursor` 규칙 자동 로드 확인
- [ ] 색상 시스템 이해 및 적용 테스트
- [ ] 블로그 게시물 작성 프로세스 실습

### 규칙 유지보수
- [ ] 새로운 색상 추가 시 `astro_blog_style_guide.mdc` 업데이트
- [ ] SEO 가이드라인 변경 시 `seo-guide.mdc` 수정
- [ ] 배포 프로세스 변경 시 `DEPLOYMENT.md` 갱신

## 🔗 관련 문서
- [TailwindCSS v4 마이그레이션 가이드](../README.md)
- [프로젝트 전체 구조](../README.md)
- [개발 환경 설정](../.vscode/settings.json)

---

> **주의**: `.cursor` 폴더의 규칙 파일들은 프로젝트의 핵심 가이드라인을 담고 있습니다. 수정 시 팀원들과 충분한 논의 후 진행하세요.