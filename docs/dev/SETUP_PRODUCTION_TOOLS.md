# 실무급 개발 도구 설치 가이드

이 프로젝트를 **엔터프라이즈급**으로 만들기 위한 도구들이 설정되어 있습니다.

---

## 설치된 도구들

| 도구                  | 역할                          | 상태         |
| --------------------- | ----------------------------- | ------------ |
| **Biome**             | 코드 품질 검사 + 포맷팅       | ✅ 설정 완료 |
| **Husky**             | Git hooks (커밋 전 자동 검사) | ✅ 설정 완료 |
| **commitlint**        | 커밋 메시지 규칙              | ✅ 설정 완료 |
| **TypeScript Strict** | 엄격한 타입 검사              | ✅ 설정 완료 |

---

## 필수 패키지 설치

모든 개발 도구는 이미 `package.json`의 `devDependencies`에 포함되어 있습니다!

### 1단계: 의존성 설치

```bash
# 모든 의존성 자동 설치 (개발 도구 포함)
bun install
```

이 명령어 하나로 다음 패키지들이 자동 설치됩니다:

- **Biome** (ESLint + Prettier 대체)
- **Husky** (Git hooks)
- **commitlint** (커밋 메시지 규칙)
- **npm-check-updates** (의존성 업데이트 도구)

### 2단계: Husky 초기화

```bash
# Git hooks 설정 (최초 1회만)
bun run prepare
```

이 명령어로 `.husky/` 폴더의 Git hooks가 활성화됩니다.

---

## 설정 파일 목록

생성된 설정 파일들:

```
✅ biome.json                 # Biome 설정 (린트 + 포맷팅)
✅ commitlint.config.js       # 커밋 메시지 규칙
✅ .husky/pre-commit          # 커밋 전 훅 (biome check)
✅ .husky/commit-msg          # 커밋 메시지 훅
✅ tsconfig.json              # TypeScript strict 모드
✅ package.json               # 스크립트 및 의존성
```

---

## 사용법

### 일상적인 개발

```bash
# 개발 서버 시작
bun dev

# 코드 작성...

# 커밋 전 모든 검사 실행
bun run check

# 또는 자동 수정
bun run biome check --write .
```

### 커밋 (자동 검사 실행됨)

```bash
# 파일 추가
git add .

# 커밋 (자동으로 검사 실행)
git commit -m "feat: 새 기능 추가"

# 자동으로 실행되는 것들:
# 1. biome check --staged (변경된 파일만 린트 + 포맷)
# 2. commitlint (커밋 메시지 형식 검사)
```

### 수동 검사

```bash
# Biome 린트 체크
bun run lint

# Biome 포맷팅
bun run format

# Biome 체크 (린트 + 포맷 + 자동수정)
bun run biome check --write .

# TypeScript 타입 체크
bun run type-check

# 모든 검사 한 번에
bun run check
```

### 의존성 관리

```bash
# 업데이트 가능한 패키지 확인
bun run deps:check

# 자동 업데이트
bun run deps:update
```

---

## 커밋 메시지 규칙

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

## 트러블슈팅

### Husky hooks가 실행되지 않을 때

```bash
# Husky 재설치
rm -rf .husky/_
bun run prepare

# 실행 권한 확인
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Biome 오류가 너무 많을 때

```bash
# 자동 수정 적용
bun run biome check --write .

# 또는 biome.json에서 규칙 조정
```

### TypeScript 에러가 너무 많을 때

```bash
# tsconfig.json에서 일부 strict 옵션 임시 비활성화
# (하지만 장기적으로는 모두 수정하는 것이 좋습니다)
```

---

## 다음 단계

### 즉시 적용

1. ✅ 패키지 설치: `bun install`
2. ✅ Husky 초기화: `bun run prepare`
3. ✅ 모든 검사 실행: `bun run check`
4. ✅ 첫 커밋 테스트: `git commit -m "ci: 개발 도구 설정 업데이트"`

### 단계적 개선

1. **Week 1**: Biome 경고 모두 수정
2. **Week 2**: TypeScript strict 모드 적응
3. **Week 3**: 테스트 프레임워크 추가 (Vitest)
4. **Week 4**: E2E 테스트 추가 (Playwright)

---

## 관련 문서

- [실무 Best Practices](production-best-practices.md)
- [개발 가이드](development-guide.md)
- [디자인 시스템 가이드](design-system-guide.md)
- [발행 워크플로우 가이드](publishing-workflow-guide.md)

---

## FAQ

### Q: 커밋할 때마다 검사가 너무 오래 걸려요

A: Biome은 매우 빠릅니다 (Rust 기반). 만약 여전히 느리다면:

```bash
# --staged 옵션으로 변경된 파일만 검사
biome check --staged
```

### Q: 커밋 메시지 규칙을 꼭 따라야 하나요?

A: 실무에서는 **필수**입니다. 하지만 개인 프로젝트라면:

```bash
# commitlint 임시 비활성화
mv .husky/commit-msg .husky/commit-msg.bak
```

### Q: Biome이 너무 엄격해요

A: `biome.json`에서 규칙 조정:

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "warn" // error → warn
      }
    }
  }
}
```

---

## 완료!

이제 프로젝트가 **실무급** 품질 관리 시스템을 갖추었습니다!

**Before**:

- 코드 스타일 불일치
- 버그 발견 어려움
- 커밋 메시지 제멋대로
- 타입 에러 빈번

**After**:

- ✅ 일관된 코드 스타일 (Biome)
- ✅ 자동 버그 감지
- ✅ 표준화된 커밋 메시지
- ✅ 타입 안전성 보장

**다음 목표**: 테스트 자동화!
