# Cloudflare 배포 가이드

## 배포 방식

- **자동 배포**: `main` 브랜치 push → Cloudflare Pages 자동 빌드 & 배포
- **수동 배포**: CLI로 직접 배포 (아래 참고)

## 환경변수 설정

Cloudflare Dashboard → Pages → Settings → Environment variables:

| 변수 | 용도 | 타입 |
|------|------|------|
| `NODE_VERSION` | Node.js 빌드 버전 (`22`) | 빌드 |
| `PUBLIC_GA_ID` | Google Analytics 4 측정 ID | 빌드 |
| `GEMINI_API_KEY` | AI 챗봇 메인 모델 | 런타임 |
| `OPENAI_API_KEY` | AI 챗봇 fallback | 런타임 |
| `ADMIN_SECRET` | 챗봇 관리 API 인증 | 런타임 |

## KV Namespace 바인딩

Pages → Settings → Functions → KV namespace bindings:

- Variable name: `CHAT_KV`
- Namespace: 생성한 KV namespace 선택

## DNS

Cloudflare Dashboard에서 직접 관리:

- `@` → CNAME → Pages 프로젝트 호스트명
- `www` → CNAME → Pages 프로젝트 호스트명

## CLI 수동 배포

```bash
# 인증 확인
bunx wrangler whoami

# 빌드 & 배포
bun run build
bunx wrangler pages deploy dist --project-name "<project_name>" --branch main
```

## GitHub Actions 시크릿

자동 배포에 필요한 시크릿:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
