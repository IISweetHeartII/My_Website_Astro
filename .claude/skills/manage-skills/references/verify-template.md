# verify 스킬 생성 템플릿

새 `verify-<name>` 스킬을 생성할 때 이 템플릿을 기반으로 작성합니다.

## YAML Frontmatter

```yaml
---
name: verify-<name>
description: <한 줄 설명>. <트리거 조건> 후 사용.
---
```

## 필수 섹션 구조

```markdown
# <스킬 제목>

## Purpose

1. **<검증 카테고리 1>** — 설명
2. **<검증 카테고리 2>** — 설명
3. **<검증 카테고리 3>** — 설명

## When to Run

- <트리거 조건 1>
- <트리거 조건 2>
- <트리거 조건 3>

## Related Files

| File | Purpose |
|------|---------|
| `path/to/file.ts` | 파일 역할 설명 |
| `path/to/another.ts` | 파일 역할 설명 |

## Workflow

### Step 1: <검사 단계 제목>

**파일:** `path/to/file.ts`

**검사:** 검증할 내용에 대한 설명.

\```bash
grep -n "pattern" path/to/file.ts
\```

**PASS:** 결과가 비어 있거나 예상 패턴과 일치
**FAIL:** 예상치 못한 패턴 발견 시 — `path/to/fix.ts`에서 수정

### Step 2: <검사 단계 제목>

...

## Output Format

\```markdown
## verify-<name> 검증 결과

| 검사 | 상태 | 상세 |
|------|------|------|
| <검사 1> | PASS / FAIL | 설명 |
| <검사 2> | PASS / FAIL | 설명 |

**총 이슈: N개**
\```

## Exceptions

다음은 **문제가 아닙니다**:

1. **<예외 케이스 1>** — 이유 설명
2. **<예외 케이스 2>** — 이유 설명
3. **<예외 케이스 3>** — 이유 설명
```

## 생성 체크리스트

- [ ] 코드베이스의 실제 파일 경로 사용 (`ls`로 검증, 플레이스홀더 금지)
- [ ] 작동하는 탐지 명령어 (현재 파일과 매칭되는 실제 grep/glob 패턴)
- [ ] 각 검사에 PASS/FAIL 기준 명시
- [ ] 최소 2-3개의 현실적인 예외 케이스
- [ ] 기존 스킬과 동일한 형식 유지
