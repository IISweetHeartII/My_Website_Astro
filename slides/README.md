# Slides

김덕환의 발표 자료 모음. [slides.log8.kr](https://slides.log8.kr) 에 배포됩니다.

> 디자인 일관성 규칙 → **[STYLE_GUIDE.md](./STYLE_GUIDE.md)**

---

## 구조

```
slides/
├── [발표명]/
│   └── slides.md        ← 슬라이드 (Slidev Markdown)
├── build.mjs            ← 멀티 빌드 스크립트 (서브폴더 자동 감지)
├── package.json
├── vite.config.ts       ← host: true (WSL2 → Windows 포워딩)
├── README.md            ← 이 파일
└── STYLE_GUIDE.md       ← 디자인 가이드
```

---

## 새 발표 추가

```bash
# 1. 폴더 + 파일 생성
mkdir slides/[발표명]
# slides/[발표명]/slides.md 작성 (STYLE_GUIDE.md 참고)

# 2. package.json scripts에 dev 명령어 추가
# "dev:[발표명]": "slidev [발표명]/slides.md --open"

# 또는 /slides-write 스킬로 자동 생성
```

---

## 로컬 개발

> ⚠️ **WSL2 터미널에서 직접 실행** (Claude Code 세션 불가 — TTY 없음)

```bash
cd ~/projects/My_Website_Astro/slides

# 특정 발표 미리보기
bun run dev           # 기본 (react-week2)
bun run dev:week2     # 명시적

# 브라우저에서 열기
# localhost:3030          ← 슬라이드
# localhost:3030/presenter ← 발표자 모드 (노트 + 다음 슬라이드 미리보기)
# localhost:3030/overview  ← 전체 보기
```

### 발표자 단축키

| 키 | 동작 |
|----|------|
| `Space` / `→` | 다음 |
| `←` | 이전 |
| `F` | 전체화면 |
| `P` | 발표자 모드 |
| `O` | 전체 슬라이드 보기 |
| `D` | 화면 드로잉 |

---

## 빌드 & 배포

```bash
# 전체 빌드 (모든 발표 자동 감지)
bun run build

# Cloudflare Pages 배포
bunx wrangler pages deploy dist --project-name slides-log8kr
```

배포 후 URL: `slides.log8.kr/[발표명]`

---

## URL 구조

| URL | 내용 |
|-----|------|
| slides.log8.kr | 발표 목록 페이지 |
| slides.log8.kr/react-week2 | React 중급 스터디 2주차 |

---

## 배포 구조

| 도메인 | 프로젝트 | 빌드 명령 |
|--------|---------|----------|
| log8.kr | My_Website_Astro | `astro build` |
| slides.log8.kr | slides-log8kr (별도) | `bun run build` |

→ Astro CI/CD와 **완전히 독립**. 서로 영향 없음.

---

## 발표 목록

| 폴더 | 제목 | URL |
|------|------|-----|
| react-week2 | React 커스텀 훅과 책임 분리 | slides.log8.kr/react-week2 |
