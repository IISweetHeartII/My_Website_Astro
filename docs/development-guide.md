# 개발 가이드

Obsidian Blogger 프로젝트의 개발 환경 설정과 가이드라인입니다.

## 📁 프로젝트 구조

```
obsidian-blogger/
├── src/
│   ├── components/    # 재사용 가능한 컴포넌트
│   ├── content/       # 블로그 포스트 및 콘텐츠
│   ├── layouts/       # 페이지 레이아웃
│   ├── pages/         # 라우트 컴포넌트
│   ├── styles/        # 글로벌 스타일
│   └── utils/         # 유틸리티 함수
├── public/           # 정적 자산
├── docs/             # 프로젝트 문서
├── tools/            # 개발 도구 및 스크립트
├── astro.config.mjs  # Astro 설정
└── package.json      # 프로젝트 의존성
```

## 🛠️ 개발 환경 설정

### 필수 요구사항
- **Node.js**: >=18.17.1
- **패키지 매니저**: pnpm (권장)
- **IDE**: VS Code 또는 Cursor IDE

### 설치 및 실행
```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 빌드 미리보기
pnpm run preview
```

## 🎯 핵심 가이드라인

### 코딩 스타일
- **들여쓰기**: 2 스페이스 (Prettier로 자동 적용)
- **포맷팅**: 파일 저장 시 자동 포맷팅 활성화
- **명명 규칙**: camelCase (JavaScript), kebab-case (파일명)

### 컴포넌트 개발
- `.astro` 파일에는 Astro 컴포넌트
- TypeScript 사용 권장
- Props 타입 정의 필수

### 스타일링
- **TailwindCSS v4** 사용
- **색상 시스템**: [디자인 시스템 가이드](design-system-guide.md) 참조
- **커스텀 CSS**: `src/styles/` 디렉토리 활용

## 📝 콘텐츠 관리

### 블로그 포스트
- 위치: `src/content/blog/`
- 형식: Markdown (.md)
- 프론트매터: 필수 속성 포함
- 자세한 내용: [발행 워크플로우 가이드](publishing-workflow-guide.md)

### 이미지 관리
- 위치: `public/images/`
- 형식: WebP 권장 (성능 최적화)
- 압축: 대용량 이미지는 최적화 후 사용

## 🔧 VS Code 설정

### 권장 확장 프로그램
```json
{
  "recommendations": [
    "astro-build.astro-vscode",      // Astro 언어 지원
    "esbenp.prettier-vscode",        // 코드 포맷팅
    "bradlc.vscode-tailwindcss",     // TailwindCSS 지원
    "ms-vscode.vscode-typescript-next" // TypeScript 지원
  ]
}
```

### 워크스페이스 설정
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "[astro]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#485E8E` (블루그레이)
- **Accent**: `#00FF6A` (형광 연두)
- **Background**: `#FFFFFF`, `#F9FAFB`
- **Text**: `#1F2937`, `#6B7280`

자세한 색상 시스템은 [디자인 시스템 가이드](design-system-guide.md)를 참고하세요.

### 폰트
- **기본**: Pretendard (한글 최적화)
- **웨이트**: 300, 400, 600, 700

## 📊 SEO 최적화

### 메타 데이터
- 모든 페이지에 적절한 title, description 설정
- Open Graph 태그 포함
- 구조화된 데이터 (Schema.org) 활용

### 성능 최적화
- 이미지 lazy loading
- CSS/JS 최소화
- 웹폰트 최적화

자세한 SEO 전략은 [SEO 최적화 가이드](seo-optimization-guide.md)를 참고하세요.

## 🚀 배포 가이드

### 지원 플랫폼
- **GitHub Pages**: 무료 정적 호스팅
- **Netlify**: 자동 배포 및 CDN
- **Vercel**: Edge 기반 배포
- **Custom Domain**: 개인 도메인 연결

### 환경 변수
```env
SITE_URL=https://your-domain.com
BASE_URL=/
```

자세한 배포 방법은 [배포 가이드](../DEPLOYMENT.md)를 참고하세요.

## 🧪 품질 관리

### 린트 및 포맷팅
```bash
# Prettier로 코드 포맷팅
pnpm run format

# 빌드 테스트
pnpm run build
```

### 테스트
- 빌드 성공 여부 확인
- 링크 및 이미지 로딩 테스트
- 모바일 반응형 확인

## 📚 관련 문서

### 콘텐츠 작성
- [마크다운 작성 가이드](markdown-writing-guide.md) - 마크다운 문법 참고
- [발행 워크플로우 가이드](publishing-workflow-guide.md) - 블로그 포스트 발행
- [SEO 최적화 가이드](seo-optimization-guide.md) - 검색 엔진 최적화

### 디자인 및 개발
- [디자인 시스템 가이드](design-system-guide.md) - 색상 및 스타일 가이드
- [배포 가이드](../DEPLOYMENT.md) - 플랫폼별 배포 방법

## 🔗 기술 스택

- **Framework**: Astro v5.15.8
- **Styling**: TailwindCSS v4.1.17 (with @tailwindcss/vite)
- **Package Manager**: pnpm
- **Font**: Pretendard (Korean optimized)
- **SEO**: Built-in SEO/AEO optimization

## 📞 지원

문제가 발생하거나 질문이 있으시면:
1. [GitHub Issues](https://github.com/yourusername/obsidian-blogger/issues)에서 기존 이슈 확인
2. 새로운 이슈 생성하여 문제 보고
3. [Discussions](https://github.com/yourusername/obsidian-blogger/discussions)에서 커뮤니티와 소통