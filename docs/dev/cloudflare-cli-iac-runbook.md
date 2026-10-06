# Cloudflare 배포 가이드

## 배포 방식

- **자동 배포**: `main` 브랜치 push → GitHub Actions 검사·빌드 → 요청 제한 Worker → Pages 배포
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

## 채팅 요청 제한 Durable Object

`workers/chat-rate-limiter/wrangler.toml`의 SQLite Durable Object를 먼저 배포한 다음,
Pages의 `CHAT_RATE_LIMITER`를 `log8-chat-rate-limiter`의 `ChatRateLimiter`에 연결합니다.
공개 Worker URL은 비활성화되어 있으며 Pages 바인딩으로만 호출합니다.
IP별 10분 20회 제한을 영속 저장하고 만료 알람에서 상태를 정리합니다.
제한 서비스가 없거나 실패하면 채팅은 503을 반환하여 유료 호출을 차단합니다.

Actions는 현재 Dashboard 설정을 `wrangler pages download config`로 내려받은 뒤
`scripts/prepare-pages-config.mjs`로 운영 바인딩만 추가합니다. 기존 KV·환경 설정은
보존하고 시크릿 값은 파일로 내려받지 않습니다. 미리보기 배포를 별도로 운영할 때는
별도의 제한 Worker/바인딩을 구성해야 하며 운영 요청량과 공유하지 않습니다.
API 토큰에는 기존 Pages 권한 외에 Workers Scripts 편집 권한도 필요합니다.

로컬에서는 두 터미널에서 다음 순서로 실행합니다.

```bash
bunx wrangler dev --config workers/chat-rate-limiter/wrangler.toml
# 다른 터미널: 빌드된 정적 파일과 로컬 Durable Object 연결
bun run build
bunx wrangler pages dev dist/
```

동시성 검증은 Wrangler와 함께 설치된 Miniflare 5 모듈 경로를 사용합니다.

```bash
bunx wrangler deploy --config workers/chat-rate-limiter/wrangler.toml --dry-run --outdir "$PWD/.wrangler/security-test"
MINIFLARE_MODULE=/absolute/path/to/miniflare/dist/src/index.js node scripts/verify-chat-limiter.mjs
```

## CLI 수동 배포

```bash
# 인증 확인
bunx wrangler whoami

# 빌드 & 배포
bun run build
bunx wrangler deploy --config workers/chat-rate-limiter/wrangler.toml
# Pages Dashboard에서 CHAT_RATE_LIMITER 바인딩을 먼저 확인
bunx wrangler pages deploy dist --project-name "<project_name>" --branch main
```

## GitHub Actions 시크릿

자동 배포에 필요한 시크릿:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
