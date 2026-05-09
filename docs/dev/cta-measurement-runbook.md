# CTA 측정 런북

## 목적

CTA 전환 실험에서 **campaign/page 단위 집계**를 바로 읽는 경로를 고정한다.

핵심 규칙:
- `summary` 401은 장애가 아니라 **admin-only 경계**다.
- campaign/page KPI는 `public_summary`를 우선 사용한다.
- `public_summary`가 200이면 `remote KV token missing`과 `access-log fallback absent`는 **즉시 blocker가 아니다**.

## 빠른 판정

### 1) campaign/page 단위 KPI 확인

```bash
node scripts/cta-summary.mjs \
  --page-path /library/ai-coding-agent-guardrails-5-checklist-2026 \
  --campaign ai-coding-agent-guardrails-5-checklist-2026
```

이 경로는:
- `ADMIN_SECRET` 불필요
- Cloudflare API token 불필요
- aggregate-only 응답만 반환

### 2) 전체 누적량 / recent 이벤트 확인

```bash
ADMIN_SECRET=*** node scripts/cta-summary.mjs --full
ADMIN_SECRET=*** node scripts/cta-summary.mjs --recent
```

이건 여전히 admin 전용이다.

## 복구 규칙

### case A — `https://log8.kr/api/cta?action=summary`가 401
정상이다. `public_summary` 또는 `action=summary&public=1`로 전환한다.

### case B — local `wrangler kv ... --remote`가 token 없음으로 실패
campaign/page 집계 목적이면 우회하지 말고 `public_summary`를 사용한다.
remote KV read는 전체 raw store inspection이 꼭 필요할 때만 쓴다.

### case C — access log 경로가 없다
`public_summary`가 200이면 access log는 primary fallback이 아니다.
측정 close는 아래 우선순위를 따른다:

1. `public_summary` (campaign/page aggregate)
2. admin summary / recent (`ADMIN_SECRET` 있을 때)
3. access log / manual

## 실험 close 템플릿

- measurement preflight: `public_summary 200` 여부 확인
- fallback source: `public_summary -> admin summary -> access log -> manual`
- 24h ledger owner: 담당자 명시

예시 verdict:
- `matched_events=0` → **blocked 아님**, 해당 필터 기준 이벤트 0건
- `public_summary 200 + rows 존재` → 집계 가능 상태
- `public_summary 자체 실패` → 그때만 `blocked-by-measurement-access`
