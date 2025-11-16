# 🚀 Astro 프로젝트 성능 최적화 계획

> **작성일**: 2024-09-19
> **목표**: Obsidian Blogger의 성능 최적화 및 GitHub Discussions 댓글 시스템 도입

## 📊 현재 상태 분석

### ✅ 잘 구성된 부분
- Astro v5.15.8 최신 버전 사용
- TailwindCSS v4.1.17 최신 버전
- 필수 통합: MDX, Sitemap, ExpressiveCode, RobotsTxt
- Obsidian 직접 통합 (src/content/blog/에서 직접 작성)

### ⚠️ 개선 필요 영역
- 이미지 최적화 서비스 미설정
- Vite 빌드 최적화 미적용
- Markdown 설정 불완전 (gfm, smartypants 누락)

## 🎯 1단계: 핵심 성능 최적화

### A. 이미지 최적화 (Sharp 도입)

**현재 상태**: 기본 이미지 서비스 사용
**목표**: Sharp 서비스로 3-5배 성능 향상

```javascript
// astro.config.mjs 추가 설정
image: {
  service: 'sharp',           // 고성능 이미지 처리
  domains: ['log8.kr'],       // 원격 이미지 보안
  remotePatterns: [
    { protocol: 'https' }     // HTTPS 이미지만 허용
  ]
}
```

**필요 패키지**:
```bash
pnpm add sharp
```

### B. Vite 빌드 최적화

**목표**: 빌드 시간 단축 및 번들 크기 최적화

```javascript
// astro.config.mjs vite 설정 확장
vite: {
  plugins: [tailwindcss()],
  build: {
    cssCodeSplit: true,       // CSS 청크 분할
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['astro'],  // Vendor 청크 분리
          utils: ['slugify']  // 유틸리티 라이브러리 분리
        }
      }
    }
  }
}
```

### C. Markdown 설정 완성

**현재**: remarkMermaid만 설정
**목표**: GFM, SmartyPants 추가로 완전한 Markdown 지원

```javascript
// astro.config.mjs markdown 설정 확장
markdown: {
  gfm: true,                  // GitHub Flavored Markdown
  smartypants: true,          // 타이포그래피 최적화
  remarkPlugins: [
    [remarkMermaid, {
      simple: true,
      wrap: null,
      mermaidConfig: {
        theme: "default",
        securityLevel: "loose",
        startOnLoad: true,
      },
    }],
  ],
  // ... 기존 설정 유지
}
```

## 💬 2단계: GitHub Discussions 댓글 시스템

### 시스템 선택: Giscus

**선택 이유**:
- GitHub Discussions 기반 (요구사항 부합)
- 한국어 완벽 지원
- 활발한 커뮤니티와 업데이트
- Astro와 쉬운 통합

### 구현 계획

**A. Giscus 설정**
```bash
# 필요 패키지
pnpm add @giscus/react
```

**B. 컴포넌트 구조**
```
src/components/
├── comments/
│   ├── GiscusComments.astro
│   └── CommentsSection.astro
```

**C. 블로그 포스트 통합**
- 모든 블로그 포스트에 자동 댓글 섹션 추가
- frontmatter로 댓글 비활성화 옵션 제공
- Pretendard 폰트와 일관된 디자인

**D. GitHub 저장소 설정**
- 현재 프로젝트 저장소 활용
- Discussions 기능 활성화
- 카테고리 구조:
  - 📝 Blog Posts (블로그 댓글)
  - 💡 Ideas (아이디어 제안)
  - 🗣️ General (일반 토론)

### 테마 설정
```javascript
// 사이트 테마와 일치
{
  theme: 'light',           // 기본 라이트 테마
  themeURL: '',             // 커스텀 CSS (선택사항)
  lang: 'ko',               // 한국어
  inputPosition: 'top',     // 댓글 입력창 위치
  reactionsEnabled: true,   // 리액션 활성화
}
```

## 📅 실행 일정

### Phase 1: 성능 최적화 (우선)
1. ✅ 계획 수립 및 문서화
2. ⏳ Sharp 이미지 최적화 도입
3. ⏳ Vite 빌드 설정 최적화
4. ⏳ Markdown 설정 완성
5. ⏳ 변경사항 커밋 및 배포
6. ⏳ 성능 테스트 및 검증

### Phase 2: 댓글 시스템 (후순위)
1. ⏳ GitHub Discussions 활성화
2. ⏳ Giscus 설정 및 테스트
3. ⏳ 컴포넌트 개발
4. ⏳ 블로그 포스트 통합
5. ⏳ 디자인 최적화
6. ⏳ 사용자 테스트

## 🎯 성공 지표

### 성능 최적화
- **이미지 로딩**: 30% 이상 개선
- **빌드 시간**: 20% 이상 단축
- **번들 크기**: 15% 이상 감소
- **Lighthouse 점수**: 95+ 유지

### 댓글 시스템
- **사용자 경험**: 직관적인 댓글 작성
- **디자인 일관성**: 사이트 테마와 완전 통합
- **성능 영향**: 페이지 로딩 시간 5% 이내 증가

## 📝 참고사항

- **백업**: 변경 전 현재 설정 백업
- **테스트**: 각 단계별 철저한 테스트
- **문서화**: 모든 변경사항 문서 업데이트
- **모니터링**: 성능 변화 지속 관찰

---

**다음 단계**: Phase 1 성능 최적화부터 시작하여 단계별 진행