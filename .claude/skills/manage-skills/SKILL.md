---
name: manage-skills
description: 세션 변경사항을 분석하여 검증 스킬 누락을 탐지합니다. 기존 스킬을 동적으로 탐색하고, 새 스킬을 생성하거나 기존 스킬을 업데이트한 뒤 CLAUDE.md를 관리합니다.
disable-model-invocation: true
argument-hint: "[선택사항: 특정 스킬 이름 또는 집중할 영역]"
---

# 세션 기반 스킬 유지보수

## 목적

현재 세션에서 변경된 내용을 분석하여 검증 스킬의 드리프트를 탐지하고 수정합니다:

1. **커버리지 누락** — 어떤 verify 스킬에서도 참조하지 않는 변경된 파일
2. **유효하지 않은 참조** — 삭제되거나 이동된 파일을 참조하는 스킬
3. **누락된 검사** — 기존 검사에서 다루지 않는 새로운 패턴/규칙
4. **오래된 값** — 더 이상 일치하지 않는 설정값 또는 탐지 명령어

## 실행 시점

- 새로운 패턴이나 규칙을 도입하는 기능을 구현한 후
- 기존 verify 스킬을 수정하고 일관성을 점검하고 싶을 때
- PR 전에 verify 스킬이 변경된 영역을 커버하는지 확인할 때
- 검증 실행 시 예상했던 이슈를 놓쳤을 때
- 주기적으로 스킬을 코드베이스 변화에 맞춰 정렬할 때

## 등록된 검증 스킬

현재 프로젝트에 등록된 검증 스킬 목록입니다. 새 스킬 생성/삭제 시 이 목록을 업데이트합니다.

(아직 등록된 검증 스킬이 없습니다)

<!-- 스킬이 추가되면 아래 형식으로 등록:
| 스킬 | 설명 | 커버 파일 패턴 |
|------|------|---------------|
| `verify-example` | 예시 검증 | `src/example/**/*.ts` |
-->

## 워크플로우

### Step 1: 세션 변경사항 분석

현재 세션에서 변경된 모든 파일을 수집합니다:

```bash
# 커밋되지 않은 변경사항
git diff HEAD --name-only

# 현재 브랜치의 커밋 (main에서 분기된 경우)
git log --oneline main..HEAD 2>/dev/null

# main에서 분기된 이후의 모든 변경사항
git diff main...HEAD --name-only 2>/dev/null
```

중복을 제거한 목록으로 합칩니다. 선택적 인수로 스킬 이름이나 영역이 지정된 경우 관련 파일만 필터링합니다.

**표시:** 최상위 디렉토리(첫 1-2 경로 세그먼트) 기준으로 파일을 그룹화합니다:

```markdown
## 세션 변경사항 감지

**이 세션에서 N개 파일 변경됨:**

| 디렉토리 | 파일 |
|----------|------|
| src/components | `Button.tsx`, `Modal.tsx` |
| src/server | `router.ts`, `handler.ts` |
| tests | `api.test.ts` |
| (루트) | `package.json`, `.eslintrc.js` |
```

### Step 2 & 3: Agent Teams로 파일 매핑 + 갭 분석 (병렬)

등록된 스킬이 0개인 경우, Step 4 (CREATE vs UPDATE 결정)로 바로 이동합니다. 모든 변경 파일이 "UNCOVERED"로 처리됩니다.

등록된 스킬이 1개 이상인 경우, **Agent Teams**를 구성하여 매핑과 갭 분석을 동시에 수행합니다.

#### 왜 Agent Teams인가?

파일 하나가 여러 스킬 도메인에 걸칠 수 있습니다 (예: `auth-api-bridge.ts`). 팀원들이 서로 소통하여 "이 파일은 내가 담당"을 조율하면 중복/누락 없이 정확한 매핑이 가능합니다.

#### Agent Teams 구성

**팀장 (나, 메인 에이전트):**
- Step 1에서 수집한 변경 파일 목록을 각 팀원에게 전달
- 팀원들의 결과를 수집하여 최종 매핑 확정

**팀원 (등록된 스킬마다 1명):**
각 팀원에게 다음을 전달합니다:

```
당신은 [verify-<name>] 스킬 담당입니다.

1. `.claude/skills/verify-<name>/SKILL.md`를 읽고 도메인(커버 파일 패턴, Related Files, Workflow의 grep 경로)을 파악하세요.

2. 아래 변경 파일 목록에서 당신의 도메인에 해당하는 파일을 찾으세요:
   [변경 파일 목록]

3. 다른 팀원이 "이 파일은 내 도메인"이라고 메시지를 보내면, 겹치는 경우 조율하여 주도권을 결정하세요.
   - 파일이 두 도메인 모두와 관련 있으면 양쪽 모두 SHARED로 표시하세요.

4. 담당 파일이 확정되면, 각 파일에 대해 갭을 분석하세요:
   - 누락된 파일 참조 (Related Files에 없는 경우)
   - 오래된 탐지 명령어 (샘플 실행하여 검증)
   - 커버되지 않은 새 패턴 (새 타입/등록/규칙)
   - 삭제된 파일의 잔여 참조
   - 변경된 특정 값 (식별자, 설정 키, 타입 이름)

5. 결과를 아래 형식으로 팀장에게 반환하세요:

skill: verify-<name>
owned_files: [파일 목록]
shared_files: [다른 스킬과 공유하는 파일 목록]
unclaimed_files: [내 도메인 아닌 파일 목록]
gaps:
- type: [파일누락|오래된명령어|새패턴|잔여참조|변경된값]
  detail: 상세 설명
```

#### 결과 수집 및 매핑 표시

모든 팀원 완료 후 팀장이 결과를 통합합니다:

```markdown
### 파일 → 스킬 매핑

| 스킬 | 트리거 파일 (변경된 파일) | 액션 |
|------|--------------------------|------|
| verify-api | `router.ts`, `handler.ts` | CHECK |
| verify-ui | `Button.tsx` | CHECK |
| verify-api, verify-auth | `auth-api-bridge.ts` | CHECK (SHARED) |
| (스킬 없음) | `package.json`, `.eslintrc.js` | UNCOVERED |
```

```markdown
| 스킬 | 갭 유형 | 상세 |
|------|---------|------|
| verify-api | 파일 누락 | `src/server/newHandler.ts`가 Related Files에 없음 |
| verify-ui | 새 패턴 | 새 컴포넌트가 검사되지 않는 규칙을 사용 |
| verify-test | 오래된 값 | 설정 파일의 테스트 러너 패턴이 변경됨 |
```

### Step 4: CREATE vs UPDATE 결정

다음 결정 트리를 적용합니다:

```
커버되지 않은 각 파일 그룹에 대해:
    IF 기존 스킬의 도메인과 관련된 파일인 경우:
        → 결정: 기존 스킬 UPDATE (커버리지 확장)
    ELSE IF 3개 이상의 관련 파일이 공통 규칙/패턴을 공유하는 경우:
        → 결정: 새 verify 스킬 CREATE
    ELSE:
        → "면제"로 표시 (스킬 불필요)
```

결과를 사용자에게 제시합니다:

```markdown
### 제안 액션

**결정: 기존 스킬 UPDATE** (N개)
- `verify-api` — 누락된 파일 참조 2개 추가, 탐지 패턴 업데이트
- `verify-test` — 새 설정 패턴에 대한 탐지 명령어 업데이트

**결정: 새 스킬 CREATE** (M개)
- 새 스킬 필요 — <패턴 설명> 커버 (X개 미커버 파일)

**액션 불필요:**
- `package.json` — 설정 파일, 면제
- `README.md` — 문서, 면제
```

`AskUserQuestion`을 사용하여 확인합니다:
- 어떤 기존 스킬을 업데이트할지
- 제안된 새 스킬을 생성할지
- 전체 건너뛰기 옵션

### Step 5: 기존 스킬 업데이트

사용자가 업데이트를 승인한 각 스킬에 대해, 현재 SKILL.md를 읽고 대상 편집을 적용합니다:

**규칙:**
- **추가/수정만** — 아직 작동하는 기존 검사는 절대 제거하지 않음
- **Related Files** 테이블에 새 파일 경로 추가
- 변경된 파일에서 발견된 패턴에 대한 새 탐지 명령어 추가
- 커버되지 않은 규칙에 대한 새 워크플로우 단계 또는 하위 단계 추가
- 코드베이스에서 삭제가 확인된 파일의 참조 제거
- 변경된 특정 값(식별자, 설정 키, 타입 이름) 업데이트

**예시 — Related Files에 파일 추가:**

```markdown
## Related Files

| File | Purpose |
|------|---------|
| ... 기존 항목 ... |
| `src/server/newHandler.ts` | 유효성 검사가 포함된 새 요청 핸들러 |
```

**예시 — 탐지 명령어 추가:**

````markdown
### Step N: 새 패턴 검증

**파일:** `path/to/file.ts`

**검사:** 검증할 내용에 대한 설명.

```bash
grep -n "pattern" path/to/file.ts
```

**위반:** 잘못된 경우의 모습.
````

### Step 6: 새 스킬 생성

**중요:** 새 스킬을 생성할 때, 반드시 사용자에게 스킬 이름을 확인받아야 합니다.

새로 생성할 각 스킬에 대해:

1. **탐색** — 관련 변경 파일을 읽어 패턴을 깊이 이해합니다

2. **사용자에게 스킬 이름 확인** — `AskUserQuestion`을 사용합니다:

   스킬이 커버할 패턴/도메인을 제시하고, 사용자에게 이름을 제공하거나 확인하도록 요청합니다.

   **이름 규칙:**
   - 이름은 반드시 `verify-`로 시작해야 합니다 (예: `verify-auth`, `verify-api`, `verify-caching`)
   - 사용자가 `verify-` 접두사 없이 이름을 제공하면 자동으로 앞에 추가하고 사용자에게 알립니다
   - kebab-case를 사용합니다 (예: `verify-error-handling`, `verify_error_handling` 아님)

3. **생성** — `references/verify-template.md`를 읽어 템플릿을 참조한 뒤, `.claude/skills/verify-<name>/SKILL.md`를 생성합니다:

```bash
# 템플릿 파일 위치 (글로벌 또는 프로젝트)
~/.claude/skills/manage-skills/references/verify-template.md
.claude/skills/manage-skills/references/verify-template.md
```

템플릿의 **생성 체크리스트**를 모두 충족해야 합니다.

4. **연관 스킬 파일 업데이트** — 새 스킬 생성 후 반드시 아래 3개 파일을 업데이트합니다:

   **4a. 이 파일 자체 (`manage-skills/SKILL.md`) 업데이트:**
   - **등록된 검증 스킬** 섹션의 테이블에 새 스킬 행을 추가합니다
   - 첫 번째 스킬 추가 시 "(아직 등록된 검증 스킬이 없습니다)" 텍스트와 HTML 주석을 제거하고 테이블로 교체합니다
   - 형식: `| verify-<name> | <설명> | <커버 파일 패턴> |`

   **4b. `verify-implementation/SKILL.md` 업데이트:**
   - **실행 대상 스킬** 섹션의 테이블에 새 스킬 행을 추가합니다
   - 첫 번째 스킬 추가 시 "(아직 등록된 검증 스킬이 없습니다)" 텍스트와 HTML 주석을 제거하고 테이블로 교체합니다
   - 형식: `| <번호> | verify-<name> | <설명> |`

   **4c. `CLAUDE.md` 업데이트:**
   - `## Skills` 테이블에 새 스킬 행을 추가합니다
   - 형식: `| verify-<name> | <한 줄 설명> |`

### Step 7: 검증

모든 편집 후:

1. 수정된 모든 SKILL.md 파일을 다시 읽기
2. 마크다운 형식이 올바른지 확인 (닫히지 않은 코드 블록, 일관된 테이블 열)
3. 깨진 파일 참조가 없는지 확인 — Related Files의 각 경로에 대해 파일 존재 확인:

```bash
ls <file-path> 2>/dev/null || echo "MISSING: <file-path>"
```

4. 업데이트된 각 스킬에서 탐지 명령어 하나를 드라이런하여 문법 유효성 검증
5. **등록된 검증 스킬** 테이블과 **실행 대상 스킬** 테이블이 동기화되어 있는지 확인

### Step 8: 요약 보고서

최종 보고서를 표시합니다:

```markdown
## 세션 스킬 유지보수 보고서

### 분석된 변경 파일: N개

### 업데이트된 스킬: X개
- `verify-<name>`: N개의 새 검사 추가, Related Files 업데이트
- `verify-<name>`: 새 패턴에 대한 탐지 명령어 업데이트

### 생성된 스킬: Y개
- `verify-<name>`: <패턴> 커버

### 업데이트된 연관 파일:
- `manage-skills/SKILL.md`: 등록된 검증 스킬 테이블 업데이트
- `verify-implementation/SKILL.md`: 실행 대상 스킬 테이블 업데이트
- `CLAUDE.md`: Skills 테이블 업데이트

### 영향없는 스킬: Z개
- (관련 변경사항 없음)

### 미커버 변경사항 (적용 스킬 없음):
- `path/to/file` — 면제 (사유)
```

---

## 생성/업데이트된 스킬의 품질 기준

생성되거나 업데이트된 모든 스킬은 다음을 갖추어야 합니다:

- **코드베이스의 실제 파일 경로** (`ls`로 검증), 플레이스홀더가 아닌 것
- **작동하는 탐지 명령어** — 현재 파일과 매칭되는 실제 grep/glob 패턴 사용
- **PASS/FAIL 기준** — 각 검사에 대해 통과와 실패의 명확한 조건
- **최소 2-3개의 현실적인 예외** — 위반이 아닌 것에 대한 설명
- **일관된 형식** — 기존 스킬과 동일 (frontmatter, 섹션 헤더, 테이블 구조)

---

## Related Files

| File | Purpose |
|------|---------|
| `.claude/skills/verify-implementation/SKILL.md` | 통합 검증 스킬 (이 스킬이 실행 대상 목록을 관리) |
| `.claude/skills/manage-skills/SKILL.md` | 이 파일 자체 (등록된 검증 스킬 목록을 관리) |
| `.claude/skills/manage-skills/references/verify-template.md` | 새 verify 스킬 생성 시 참조하는 템플릿 |
| `CLAUDE.md` | 프로젝트 지침 (이 스킬이 Skills 섹션을 관리) |

## 예외사항

다음은 **문제가 아닙니다**:

1. **Lock 파일 및 생성된 파일** — `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Cargo.lock`, 자동 생성된 마이그레이션 파일, 빌드 출력물은 스킬 커버리지가 불필요
2. **일회성 설정 변경** — `package.json`/`Cargo.toml`의 버전 범프, 린터/포매터 설정의 사소한 변경은 새 스킬이 불필요
3. **문서 파일** — `README.md`, `CHANGELOG.md`, `LICENSE` 등은 검증이 필요한 코드 패턴이 아님
4. **테스트 픽스처 파일** — 테스트 픽스처로 사용되는 디렉토리의 파일(예: `fixtures/`, `__fixtures__/`, `test-data/`)은 프로덕션 코드가 아님
5. **영향받지 않은 스킬** — UNAFFECTED로 표시된 스킬은 검토 불필요; 대부분의 세션에서 대부분의 스킬이 이에 해당
6. **CLAUDE.md 자체** — CLAUDE.md의 변경은 문서 업데이트이며, 검증이 필요한 코드 패턴이 아님
7. **벤더/서드파티 코드** — `vendor/`, `node_modules/` 또는 복사된 라이브러리 디렉토리의 파일은 외부 규칙을 따름
8. **CI/CD 설정** — `.github/`, `.gitlab-ci.yml`, `Dockerfile` 등은 인프라이며, 검증 스킬이 필요한 애플리케이션 패턴이 아님
