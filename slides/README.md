# Slides

김덕환의 발표 자료 모음. [slides.log8.kr](https://slides.log8.kr) 에 배포됩니다.

## 구조

```
slides/
├── [발표명]/
│   └── slides.md     ← 슬라이드 내용 (Slidev Markdown)
├── build.mjs         ← 멀티 빌드 스크립트 (자동 감지)
└── package.json
```

## 개발

```bash
# 특정 발표 로컬 미리보기 (WSL2 터미널에서 직접 실행)
bun run dev           # react-week2 기본 실행
bun run dev:week2     # react-week2 명시적 실행

# 전체 빌드
bun run build
```

## 새 발표 추가

```bash
mkdir [발표명]
# [발표명]/slides.md 작성
bun run build   # 자동으로 새 폴더 감지해서 빌드
```

## 배포

```bash
bun run build
bunx wrangler pages deploy dist --project-name slides-log8kr
```

배포 후 URL: `slides.log8.kr/[발표명]`

## URL 구조

| URL | 내용 |
|-----|------|
| slides.log8.kr | 발표 목록 |
| slides.log8.kr/react-week2 | React 중급 스터디 2주차 |

## 주의사항

- `bun run dev`는 WSL2 터미널에서 직접 실행 (Claude Code에서는 TTY 없어서 실행 불가)
- Slidev는 독립 Cloudflare Pages 프로젝트 (slides-log8kr) 로 별도 배포
- Astro 블로그 빌드(log8.kr)와 완전히 분리됨 — CI/CD 영향 없음
