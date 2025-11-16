#!/bin/bash

echo "🚀 실무급 개발 도구 설치 중..."

# ESLint 관련 패키지
echo "📦 ESLint 설치 중..."
pnpm add -D eslint @eslint/js \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-astro astro-eslint-parser

# Husky (Git hooks)
echo "🐶 Husky 설치 중..."
pnpm add -D husky

# lint-staged (커밋 전 린트)
echo "✨ lint-staged 설치 중..."
pnpm add -D lint-staged

# commitlint (커밋 메시지 규칙)
echo "📝 commitlint 설치 중..."
pnpm add -D @commitlint/cli @commitlint/config-conventional

# Dependency 업데이트 체크
echo "📊 npm-check-updates 설치 중..."
pnpm add -D npm-check-updates

echo ""
echo "✅ 모든 개발 도구 설치 완료!"
echo ""
echo "다음 단계:"
echo "1. pnpm run prepare  # Husky 초기화"
echo "2. pnpm run lint     # ESLint 실행"
echo "3. git add .         # 변경사항 추가"
echo "4. git commit        # 커밋 (자동 검사 실행)"
