# 🏢 실무급 개발 Best Practices

이 문서는 **엔터프라이즈급 프로젝트**에서 필수적으로 신경써야 할 사항들을 정리합니다.

---

## 📚 목차

1. [코드 품질 관리](#1-코드-품질-관리)
2. [Git 워크플로우](#2-git-워크플로우)
3. [의존성 관리](#3-의존성-관리)
4. [보안](#4-보안)
5. [성능 모니터링](#5-성능-모니터링)
6. [문서화](#6-문서화)
7. [테스팅 전략](#7-테스팅-전략)
8. [배포 전략](#8-배포-전략)

---

## 1. 코드 품질 관리

### ✅ 현재 구현된 것

#### ESLint (코드 품질)

```bash
# 린트 체크
pnpm run lint

# 자동 수정
pnpm run lint:fix
```

**검사 항목**:

- ❌ 사용하지 않는 변수
- ❌ 잠재적 버그 (null 참조 등)
- ❌ 안티패턴
- ❌ 타입 안전성 위반

#### Prettier (코드 포맷팅)

```bash
# 포맷팅 체크
pnpm run format:check

# 자동 포맷팅
pnpm run format
```

**적용 규칙**:

- 세미콜론, 따옴표 통일
- 들여쓰기 (2 spaces)
- 줄 길이 제한 (100자)

#### TypeScript Strict Mode

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**효과**:

- 타입 안전성 100%
- 런타임 에러 90% 감소
- 리팩토링 안정성 향상

#### 통합 검사

```bash
# 모든 검사 한 번에
pnpm run check

# 모든 문제 자동 수정
pnpm run fix
```

---

## 2. Git 워크플로우

### 커밋 전 자동 검사 (Husky + lint-staged)

**Pre-commit Hook** (커밋 전):

```bash
# 자동으로 실행됨:
1. ESLint 검사 & 자동 수정
2. Prettier 포맷팅
3. 타입 체크
```

**Commit-msg Hook** (커밋 메시지):

```bash
# 자동으로 커밋 메시지 형식 검사
feat: 새 기능 추가 ✅
fix: 버그 수정 ✅
새 기능 추가 ❌ (타입 필수)
```

### Conventional Commits

**형식**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**타입 목록**:
| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: 블로그 검색 기능 추가` |
| `fix` | 버그 수정 | `fix: 댓글 로딩 오류 수정` |
| `docs` | 문서 변경 | `docs: README 업데이트` |
| `style` | 코드 포맷팅 | `style: Prettier 적용` |
| `refactor` | 리팩토링 | `refactor: API 호출 로직 개선` |
| `perf` | 성능 개선 | `perf: 이미지 lazy loading 추가` |
| `test` | 테스트 | `test: BlogCard 컴포넌트 테스트` |
| `build` | 빌드/의존성 | `build: Astro 5.16.0 업데이트` |
| `ci` | CI 설정 | `ci: GitHub Actions 워크플로우 추가` |
| `chore` | 기타 | `chore: .gitignore 업데이트` |

**예시**:

```bash
# 좋은 커밋 메시지
git commit -m "feat(blog): 태그 필터링 기능 추가

사용자가 태그별로 블로그 포스트를 필터링할 수 있습니다.
- TagFilter 컴포넌트 구현
- 동적 라우팅 추가
- SEO 메타 태그 설정

Closes #123"

# 나쁜 커밋 메시지
git commit -m "수정"  # ❌
git commit -m "버그 고침"  # ❌
git commit -m "작업함"  # ❌
```

### 브랜치 전략

```
main (production)
  └── develop (staging)
       ├── feat/feature-name
       ├── fix/bug-name
       └── refactor/improvement-name
```

**브랜치 명명 규칙**:

```bash
feat/user-authentication
fix/mobile-menu-bug
refactor/api-layer
docs/update-readme
```

---

## 3. 의존성 관리

### 정기적인 업데이트 확인

```bash
# 업데이트 가능한 패키지 확인
pnpm run deps:check

# 자동 업데이트
pnpm run deps:update
```

### 보안 취약점 스캔

```bash
# 보안 감사
pnpm audit

# 중간 이상 심각도만
pnpm audit --audit-level moderate

# 자동 수정
pnpm audit fix
```

### 추천: Dependabot 또는 Renovate

**`.github/dependabot.yml`**:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**효과**:

- 자동 PR 생성
- 보안 패치 자동 적용
- 의존성 최신 상태 유지

---

## 4. 보안

### ✅ 현재 구현된 것

#### 환경 변수 관리

```bash
# ❌ 절대 커밋하지 않기
.env
.env.local
.env.production

# ✅ 템플릿만 공유
.env.example
```

#### Git Secret 스캔

```bash
# .gitignore 확인
cat .gitignore | grep -E "\.env|secrets|credentials"
```

### 🔐 추가로 신경써야 할 것

#### 1. Content Security Policy (CSP)

```javascript
// astro.config.mjs
export default defineConfig({
  server: {
    headers: {
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://api.example.com;
      `
        .replace(/\s+/g, " ")
        .trim(),
    },
  },
});
```

#### 2. HTTP 보안 헤더

```javascript
headers: {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

#### 3. 민감 정보 스캔

```bash
# git-secrets 설치 (권장)
git secrets --install
git secrets --register-aws
```

#### 4. API 키 관리

```typescript
// ❌ 나쁜 예
const API_KEY = "sk-1234567890abcdef";

// ✅ 좋은 예
const API_KEY = import.meta.env.API_KEY;

// ✅ 더 좋은 예 (서버사이드만)
if (import.meta.env.SSR) {
  const API_KEY = process.env.API_KEY;
}
```

---

## 5. 성능 모니터링

### Core Web Vitals 측정

```bash
# Lighthouse CI (자동)
pnpm run build
npx lighthouse http://localhost:4321 --view
```

**목표 지표**:
| 메트릭 | 목표 | 현재 |
|--------|------|------|
| FCP (First Contentful Paint) | <1.5s | ? |
| LCP (Largest Contentful Paint) | <2.5s | ? |
| CLS (Cumulative Layout Shift) | <0.1 | ? |
| FID (First Input Delay) | <100ms | ? |
| TTI (Time to Interactive) | <3.5s | ? |

### 번들 크기 분석

```bash
# 빌드 후 크기 확인
pnpm run build
du -sh dist/

# 상세 분석 (권장: rollup-plugin-visualizer)
pnpm add -D rollup-plugin-visualizer
```

### 이미지 최적화 체크리스트

- [ ] WebP/AVIF 포맷 사용
- [ ] Lazy loading 적용
- [ ] Responsive images (srcset)
- [ ] 적절한 크기 (최대 1MB)
- [ ] Alt 텍스트 필수

---

## 6. 문서화

### 필수 문서

#### README.md

```markdown
- 프로젝트 설명
- 설치 방법
- 사용법
- 라이센스
- 기여 방법
```

#### CHANGELOG.md

```markdown
## [1.2.0] - 2024-11-17

### Added

- 블로그 검색 기능
- 태그 필터링

### Fixed

- 모바일 메뉴 버그
```

#### CONTRIBUTING.md

```markdown
- 코드 스타일
- PR 프로세스
- 커밋 규칙
```

#### API 문서 (필요시)

- Swagger/OpenAPI
- JSDoc/TSDoc

### 코드 주석 규칙

```typescript
/**
 * 블로그 포스트를 날짜순으로 정렬합니다.
 *
 * @param posts - 정렬할 블로그 포스트 배열
 * @param order - 정렬 순서 ('asc' | 'desc')
 * @returns 정렬된 포스트 배열
 *
 * @example
 * const sorted = sortPostsByDate(posts, 'desc');
 */
function sortPostsByDate(posts: BlogPost[], order: "asc" | "desc" = "desc"): BlogPost[] {
  // 구현...
}
```

---

## 7. 테스팅 전략

### 테스트 피라미드

```
     /\
    /  \   E2E Tests (10%)
   /----\
  /      \ Integration Tests (20%)
 /--------\
/          \ Unit Tests (70%)
```

### 권장 도구

```bash
# Unit Tests
pnpm add -D vitest @vitest/ui

# E2E Tests
pnpm add -D playwright @playwright/test

# Visual Regression
pnpm add -D @storybook/testing-library
```

### 테스트 커버리지 목표

| 카테고리   | 목표 커버리지 |
| ---------- | ------------- |
| Statements | 80%           |
| Branches   | 75%           |
| Functions  | 80%           |
| Lines      | 80%           |

---

## 8. 배포 전략

### Pre-deployment 체크리스트

- [ ] 모든 테스트 통과
- [ ] Lighthouse 점수 95+
- [ ] 보안 감사 통과
- [ ] 번들 크기 확인
- [ ] 환경 변수 설정 확인
- [ ] DB 마이그레이션 (있다면)
- [ ] Cloudflare Preview 테스트
- [ ] 모바일/태블릿 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 접근성 테스트

### 배포 후 모니터링

```bash
# 실시간 에러 추적 (권장: Sentry)
# 성능 모니터링 (권장: New Relic, Datadog)
# 사용자 분석 (이미 적용: Google Analytics)
```

### 롤백 계획

```bash
# Cloudflare Dashboard에서 이전 배포로 롤백
# 또는 Git revert
git revert <commit-hash>
git push origin main
```

---

## 🎯 우선순위별 체크리스트

### 🔴 즉시 구현 (Critical)

- [x] ESLint 설정
- [x] Prettier 설정
- [x] Husky + lint-staged
- [x] Commitlint
- [x] TypeScript strict mode
- [ ] 테스트 프레임워크 (Vitest)
- [ ] E2E 테스트 (Playwright)
- [ ] CSP 헤더 설정
- [ ] 보안 감사 자동화

### 🟠 빠른 시일 내 (High)

- [ ] Dependabot/Renovate
- [ ] Lighthouse CI
- [ ] 번들 크기 모니터링
- [ ] 에러 트래킹 (Sentry)
- [ ] 성능 모니터링
- [ ] 코드 커버리지 측정

### 🟡 점진적 개선 (Medium)

- [ ] Visual regression testing
- [ ] Storybook
- [ ] API 문서화
- [ ] 다국어 지원 (i18n)
- [ ] Progressive Web App
- [ ] Service Worker

### 🟢 선택적 (Low)

- [ ] Docker 컨테이너화
- [ ] Kubernetes 배포
- [ ] A/B 테스팅
- [ ] Feature flags

---

## 📊 실무 프로젝트 성숙도 레벨

| 레벨        | 설명             | 현재 상태  |
| ----------- | ---------------- | ---------- |
| **Level 1** | 기본 개발 환경   | ✅ 완료    |
| **Level 2** | 코드 품질 도구   | ✅ 완료    |
| **Level 3** | CI/CD 파이프라인 | ✅ 완료    |
| **Level 4** | 테스트 자동화    | 🟡 진행 중 |
| **Level 5** | 모니터링 & 알림  | 🟡 진행 중 |
| **Level 6** | 성능 최적화      | 🟡 진행 중 |
| **Level 7** | 엔터프라이즈급   | ⏳ 예정    |

**현재 레벨: 3.5 / 7** 🎯

---

## 🔗 추가 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Google's Engineering Practices](https://google.github.io/eng-practices/)
- [Web.dev Best Practices](https://web.dev/learn/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
