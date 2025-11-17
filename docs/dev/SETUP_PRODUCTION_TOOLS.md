# 🚀 실무급 개발 도구 설치 가이드

이 프로젝트를 **엔터프라이즈급**으로 만들기 위한 도구들이 설정되어 있습니다.

---

## 📦 설치된 도구들

| 도구                  | 역할                          | 상태         |
| --------------------- | ----------------------------- | ------------ |
| **ESLint**            | 코드 품질 검사 (버그 방지)    | ✅ 설정 완료 |
| **Prettier**          | 코드 포맷팅 (스타일 통일)     | ✅ 설정 완료 |
| **Husky**             | Git hooks (커밋 전 자동 검사) | ✅ 설정 완료 |
| **lint-staged**       | 변경된 파일만 린트            | ✅ 설정 완료 |
| **commitlint**        | 커밋 메시지 규칙              | ✅ 설정 완료 |
| **TypeScript Strict** | 엄격한 타입 검사              | ✅ 설정 완료 |

---

## 🔧 필수 패키지 설치

### 1단계: 개발 도구 설치

```bash
# 실행 권한 부여 (Git Bash/WSL에서)
chmod +x install-dev-tools.sh

# 스크립트 실행
./install-dev-tools.sh
```

**또는 수동 설치**:

```bash
# ESLint
pnpm add -D eslint @eslint/js \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-astro astro-eslint-parser

# Husky (Git hooks)
pnpm add -D husky

# lint-staged
pnpm add -D lint-staged

# commitlint
pnpm add -D @commitlint/cli @commitlint/config-conventional

# 의존성 업데이트 도구
pnpm add -D npm-check-updates
```

### 2단계: Husky 초기화

```bash
# Husky 설정 (최초 1회만)
pnpm run prepare
```

---

## ✅ 설정 파일 목록

생성된 설정 파일들:

```
✅ eslint.config.js           # ESLint 설정
✅ .eslintignore              # ESLint 무시 파일
✅ .prettierrc                # Prettier 설정 (기존)
✅ .lintstagedrc.json         # lint-staged 설정
✅ commitlint.config.js       # 커밋 메시지 규칙
✅ .husky/pre-commit          # 커밋 전 훅
✅ .husky/commit-msg          # 커밋 메시지 훅
✅ tsconfig.json (업데이트)   # TypeScript strict 모드
✅ package.json (업데이트)    # 새 스크립트 추가
```

---

## 🎮 사용법

### 일상적인 개발

```bash
# 개발 서버 시작
pnpm dev

# 코드 작성...

# 커밋 전 모든 검사 실행
pnpm run check

# 또는 자동 수정
pnpm run fix
```

### 커밋 (자동 검사 실행됨)

```bash
# 파일 추가
git add .

# 커밋 (자동으로 검사 실행)
git commit -m "feat: 새 기능 추가"

# 자동으로 실행되는 것들:
# 1. lint-staged (변경된 파일만 ESLint + Prettier)
# 2. commitlint (커밋 메시지 형식 검사)
```

### 수동 검사

```bash
# Prettier 체크
pnpm run format:check

# Prettier 자동 수정
pnpm run format

# ESLint 체크
pnpm run lint

# ESLint 자동 수정
pnpm run lint:fix

# TypeScript 타입 체크
pnpm run type-check

# 모든 검사 한 번에
pnpm run check

# 모든 문제 자동 수정
pnpm run fix
```

### 의존성 관리

```bash
# 업데이트 가능한 패키지 확인
pnpm run deps:check

# 자동 업데이트
pnpm run deps:update

# 보안 감사
pnpm audit
```

---

## 📝 커밋 메시지 규칙

### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입 (필수)

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트
- `build`: 빌드/의존성
- `ci`: CI 설정
- `chore`: 기타

### 예시

```bash
# ✅ 좋은 커밋 메시지
git commit -m "feat: 블로그 검색 기능 추가"
git commit -m "fix: 모바일 메뉴 버그 수정"
git commit -m "docs: README 업데이트"

# ❌ 나쁜 커밋 메시지 (자동으로 거부됨)
git commit -m "작업함"
git commit -m "수정"
git commit -m "버그 고침"
```

---

## 🐛 트러블슈팅

### Husky hooks가 실행되지 않을 때

```bash
# Husky 재설치
rm -rf .husky/_
pnpm run prepare

# 실행 권한 확인
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### ESLint 오류가 너무 많을 때

```bash
# 일단 경고만 하도록 (임시)
# eslint.config.js에서 rules를 'error' → 'warn'으로 변경

# 또는 자동 수정
pnpm run lint:fix
```

### Prettier와 ESLint 충돌

```bash
# 이미 설정되어 있지만, 확인:
# .prettierrc가 ESLint보다 우선됩니다.
```

### TypeScript 에러가 너무 많을 때

```bash
# tsconfig.json에서 일부 strict 옵션 임시 비활성화
# (하지만 장기적으로는 모두 수정하는 것이 좋습니다)
```

---

## 🎯 다음 단계

### 즉시 적용

1. ✅ 패키지 설치: `./install-dev-tools.sh`
2. ✅ Husky 초기화: `pnpm run prepare`
3. ✅ 첫 커밋 테스트: `git commit -m "ci: 실무급 개발 도구 추가"`

### 단계적 개선

1. **Week 1**: ESLint 경고 모두 수정
2. **Week 2**: TypeScript strict 모드 적응
3. **Week 3**: 테스트 프레임워크 추가 (Vitest)
4. **Week 4**: E2E 테스트 추가 (Playwright)

---

## 📚 관련 문서

- [실무 Best Practices](docs/production-best-practices.md)
- [CI/CD 가이드](docs/ci-cd-guide.md)
- [개발 가이드](docs/development-guide.md)

---

## ❓ FAQ

### Q: 커밋할 때마다 검사가 너무 오래 걸려요

A: lint-staged는 **변경된 파일만** 검사합니다. 만약 너무 느리다면:

```json
// .lintstagedrc.json
{
  "*.{js,ts,astro}": "eslint --fix --max-warnings 10"
}
```

### Q: 커밋 메시지 규칙을 꼭 따라야 하나요?

A: 실무에서는 **필수**입니다. 하지만 개인 프로젝트라면:

```bash
# commitlint 임시 비활성화
mv .husky/commit-msg .husky/commit-msg.bak
```

### Q: ESLint가 너무 엄격해요

A: `eslint.config.js`에서 규칙 조정:

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'warn',  // error → warn
  'no-console': 'off',  // 완전 비활성화
}
```

---

## 🎊 완료!

이제 프로젝트가 **실무급** 품질 관리 시스템을 갖추었습니다!

**Before**:

- 코드 스타일 불일치
- 버그 발견 어려움
- 커밋 메시지 제멋대로
- 타입 에러 빈번

**After**:

- ✅ 일관된 코드 스타일
- ✅ 자동 버그 감지
- ✅ 표준화된 커밋 메시지
- ✅ 타입 안전성 보장

**다음 목표**: 테스트 자동화! 🚀
