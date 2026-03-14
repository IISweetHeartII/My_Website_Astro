---
name: verify-blog-post
description: 발행된 블로그 포스트 전체를 일괄 검증합니다. 슬러그 중복, 이미지 프롬프트 잔여, 필수 frontmatter 누락, blog-index 동기화 등을 확인합니다. PR 전 또는 정기 점검 시 사용.
---

# verify-blog-post

## Purpose

1. **Frontmatter 완성도** — 발행된 글에 필수 필드(title, description, slug, created_date, category, tags)가 모두 있는지 확인
2. **슬러그 중복** — 동일한 slug를 가진 글이 없는지 확인
3. **미완성 이미지** — 이미지 생성 프롬프트 주석(`📸 이미지 프롬프트`)이 발행된 글에 남아있는지 확인
4. **blog-index 동기화** — `blog-index.json.ts`가 created_date를 포함하고 있는지 확인

## When to Run

- PR 생성 전 블로그 포스트를 포함하는 경우
- 새 블로그 글을 `publish: true`로 설정한 후
- 정기적인 콘텐츠 품질 점검 시
- `/verify-implementation` 스킬 실행 시 (자동 포함)

## Related Files

| File | Purpose |
|------|---------|
| `src/content/blog/` | 블로그 포스트 디렉토리 |
| `src/pages/blog-index.json.ts` | AI 챗봇용 블로그 인덱스 API (created_date 포함 여부 검증) |
| `src/content.config.ts` | Content Collections 스키마 (필수 필드 정의) |
| `src/content/chat-context.md` | AI 챗봇 컨텍스트 (직접 검증 대상 아님) |

## Workflow

### Step 1: 발행된 글 목록 수집

**파일:** `src/content/blog/`

**검사:** `publish: true`인 글을 모두 수집합니다.

```bash
grep -rl "^publish: true" src/content/blog/
```

**PASS:** 명령어가 실행되고 파일 목록이 반환됨
**FAIL:** 디렉토리가 없거나 접근 불가

---

### Step 2: 필수 frontmatter 누락 검사

발행된 글(publish: true) 중에서 아래 필수 필드가 없는 글을 찾습니다.

**검사할 필수 필드:** `title`, `description`, `slug`, `created_date`, `category`, `tags`

```bash
# 파일명에 공백이 있으므로 while read 패턴 사용
grep -rl "^publish: true" src/content/blog/ | while read -r f; do
  grep -q "^slug:" "$f"         || echo "MISSING slug: $f"
  grep -q "^created_date:" "$f" || echo "MISSING created_date: $f"
  grep -q "^category:" "$f"     || echo "MISSING category: $f"
  grep -q "^title:" "$f"        || echo "MISSING title: $f"
  grep -q "^description:" "$f"  || echo "MISSING description: $f"
done
```

**PASS:** 출력이 비어 있음 (모든 발행 글에 필수 필드가 있음)
**FAIL:** 파일 경로가 출력됨 — 해당 파일에 누락된 frontmatter 필드 추가 필요

---

### Step 3: 슬러그 중복 검사

**파일:** `src/content/blog/`

**검사:** 동일한 slug 값을 가진 글이 있는지 확인합니다.

```bash
# 파일명에 공백이 있어 -a 플래그로 바이너리 오탐 방지
grep -rha "^slug:" src/content/blog/ | sort | uniq -d
```

**PASS:** 출력이 비어 있음 (중복 slug 없음)
**FAIL:** 중복된 slug가 출력됨 — 충돌하는 파일을 찾아 하나의 slug를 변경해야 함

중복 파일 확인:
```bash
# 중복된 slug 값이 "my-slug"일 때
grep -rl "^slug: my-slug" src/content/blog/
```

---

### Step 4: 이미지 프롬프트 주석 잔여 검사

**파일:** `src/content/blog/`

**검사:** 발행된 글에 이미지 생성 프롬프트 주석이 남아있는지 확인합니다. 이는 이미지가 아직 생성·저장되지 않았음을 의미합니다.

```bash
grep -rl "📸 이미지 프롬프트" src/content/blog/
```

그 중 발행된 글인지 확인:
```bash
for f in $(grep -rl "📸 이미지 프롬프트" src/content/blog/); do
  grep -q "^publish: true" "$f" && echo "UNPUBLISHED IMAGE: $f"
done
```

**PASS:** 발행된 글 중에 이미지 프롬프트 주석이 없음
**FAIL (경고):** 발행된 글에 이미지 프롬프트 주석이 남아있음 — 이미지를 생성하고 `public/images/blogs/`에 저장한 뒤 주석을 제거해야 함

---

### Step 5: blog-index.json.ts created_date 포함 여부 확인

**파일:** `src/pages/blog-index.json.ts`

**검사:** AI 챗봇이 날짜 기반 질문에 올바르게 답하려면 `created_date`가 blog-index에 포함되어야 합니다.

```bash
grep -n "created_date" src/pages/blog-index.json.ts
```

**PASS:** `created_date`가 `.map()` 내부에 포함되어 있음
**FAIL:** `created_date`가 없음 — `src/pages/blog-index.json.ts`의 `.map()` 블록에 아래를 추가해야 함:
```typescript
created_date: post.data.created_date?.toISOString().split("T")[0] ?? null,
```

---

### Step 6: 최신 포스트 번호 확인

**파일:** `.claude/skills/blog-write/SKILL.md`

**검사:** blog-write 스킬의 "현재 최신: NNN" 숫자가 실제 최신 포스트 번호와 일치하는지 확인합니다.
파일명 패턴은 `[번호]_[제목].md` 이어야 합니다.

```bash
# 실제 최신 번호 (새 패턴: [번호]_[제목].md)
ls src/content/blog/ | grep "^[0-9]" | sort -n | tail -1 | grep -oE "^[0-9]+"

# 구 패턴(". ") 잔여 확인
ls src/content/blog/ | grep "\. " && echo "구 패턴 파일 있음" || echo "OK - 모두 언더바 패턴"

# blog-write 스킬의 현재 번호
grep "현재 최신" .claude/skills/blog-write/SKILL.md
```

**PASS:** 두 값이 일치, 구 패턴 파일 없음
**FAIL:** 불일치 — `.claude/skills/blog-write/SKILL.md`의 실행 순서 Step 1에서 번호를 업데이트해야 함
**FAIL (구 패턴):** `[번호]. [제목].md` 형식 파일이 남아있음 — `[번호]_[제목].md` 로 rename 필요

## Output Format

```markdown
## verify-blog-post 검증 결과

| 검사 | 상태 | 상세 |
|------|------|------|
| 발행 글 목록 수집 | PASS | 44개 발행 글 확인 |
| 필수 frontmatter | PASS / FAIL | (누락 파일 목록) |
| 슬러그 중복 | PASS / FAIL | (중복 slug 목록) |
| 이미지 프롬프트 잔여 | PASS / WARN | (해당 파일 목록) |
| blog-index created_date | PASS / FAIL | (포함/미포함) |
| blog-write 포스트 번호 | PASS / FAIL | (스킬: NNN, 실제: NNN) |

**총 이슈: N개**
```

## Exceptions

다음은 **문제가 아닙니다**:

1. **`publish: false` 글의 누락 필드** — 초안은 frontmatter가 불완전해도 됩니다. 발행된 글만 검사 대상입니다.
2. **개발/테스트용 이미지 프롬프트 주석** — `publish: false`인 글의 이미지 프롬프트 주석은 경고 대상이 아닙니다.
3. **slug 없는 글** — Astro는 slug가 없으면 파일명에서 자동 생성합니다. 단, 발행된 글에는 명시적 slug를 권장합니다.
4. **category 대소문자** — `개발`, `회고`, `교육`, `생산성`, `일상` 이외의 값도 빌드는 되지만 필터링이 안 될 수 있습니다.
