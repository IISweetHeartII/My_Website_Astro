# Vercel 배포 우회 방법 문의
_Exported on 9/19/2025 at 21:26:47 GMT+9 from Cursor (1.6.27)_

---

**User**

이거 다른 프로젝트의 설정인데, 지금 여기 있는 shoppingmall 프로젝트가 organizaion에 있는 repo라서 바로 vercel에 무료로 배포를 못해... 그래서 옛날에 어떻게 했냐면, 이미지에 보이는 세 개의 토큰을 설정해서 어떻게 우회해서 배포했거든?! 그 방법 알려줄래!??

---

**Cursor**

### 요약
- GitHub Actions + Vercel CLI로, GitHub 연동 없이 토큰 3개만으로 배포합니다.
- 필요한 시크릿: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`.

### 준비 단계
1. Vercel에서 개인 계정(또는 접근 가능한 팀)으로 프로젝트를 먼저 만듭니다. GitHub 연결은 하지 않아도 됩니다.
2. ID 확인
   - 프로젝트 설정 → General → Project ID 복사 → `VERCEL_PROJECT_ID`
   - 팀(또는 개인) 설정 → General → Team ID(또는 User ID) 복사 → `VERCEL_ORG_ID`
     - 형태 예: `team_********` 또는 `user_********`
3. 액세스 토큰 생성
   - Vercel Dashboard → Settings → Tokens → “Create” → 값 복사 → `VERCEL_TOKEN`
4. GitHub 저장소 Settings → Secrets and variables → Actions에 위 3개 시크릿을 추가합니다.

### GitHub Actions 워크플로우
저장소에 `.github/workflows/vercel-deploy.yml` 파일을 추가합니다.

```yaml
name: Vercel Deploy (CLI)

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (preview)
        run: pnpm dlx vercel@latest pull --yes --environment=preview --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (preview)
        run: pnpm dlx vercel@latest deploy --prebuilt --token "$VERCEL_TOKEN" --yes

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (production)
        run: pnpm dlx vercel@latest pull --yes --environment=production --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (production)
        run: pnpm dlx vercel@latest deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

### 핵심 포인트
- GitHub ↔ Vercel 연결 없이도, 위 3개 값으로 CLI 배포가 가능합니다. 즉, 조직 레포여도 “Vercel 프로젝트에 접근 가능한 계정의 토큰”만 있으면 배포가 진행됩니다.
- `VERCEL_ORG_ID`는 팀이면 `team_*`, 개인이면 `user_*`입니다. 프로젝트가 속한 주체와 일치해야 합니다.
- 권한 오류(401/403) 시: 토큰이 해당 프로젝트에 접근 권한이 있는지, ORG/PROJECT ID가 정확한지 확인하세요.

원하면 지금 저장소에 위 워크플로우 파일을 바로 추가해드릴게요.

```yaml
name: Vercel Deploy (CLI)

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (preview)
        run: pnpm dlx vercel@latest pull --yes --environment=preview --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (preview)
        run: pnpm dlx vercel@latest deploy --prebuilt --token "$VERCEL_TOKEN" --yes

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (production)
        run: pnpm dlx vercel@latest pull --yes --environment=production --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (production)
        run: pnpm dlx vercel@latest deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

---

**User**

지금 너와 나눈 대화 내용을 가지고 기술 블로그 포스팅을 작성해줘! 아주 상세하고 자세한 설명으로!

---

**Cursor**

## GitHub 조직 레포지토리를 Vercel 무료 플랜으로 우회 배포하는 법
조직(Organization) 레포는 보안/정책상 Vercel의 Git 연동을 바로 켜기 어려운 경우가 많습니다. 이 글에서는 Git 연동 없이도 “Vercel CLI + GitHub Actions + 3개의 시크릿(토큰/ID)”만으로 안전하고 재현 가능한 배포 파이프라인을 만드는 실전 방법을 정리합니다. 실제로 저는 다음 세 가지 시크릿만으로 조직 레포를 Vercel에 무료로 배포해 왔고, 그 과정과 이유, 설정 포인트, 장애 대처 팁까지 자세히 공유합니다.

- 필요한 시크릿: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`
- 핵심 아이디어: GitHub ↔ Vercel “Git 연동”을 사용하지 않고, CI 안에서 Vercel CLI로 직접 인증/빌드/배포

---

## 왜 이 방법이 필요한가
- **조직 레포 제약**: 조직 정책이나 Vercel 팀 권한 문제로 Git 연동을 켜기 어렵습니다.
- **무료 요금제 제약**: Git 연동 없이도 CLI만으로 배포하면 무료 플랜에서도 충분히 운영할 수 있습니다.
- **권한 최소화**: GitHub에는 “프로젝트 접근만 가능한 Vercel API 토큰”을 시크릿으로 저장하고, 실제 배포는 CI가 수행합니다.

---

## 전체 흐름 한눈에 보기
1) Vercel 프로젝트를 “개인” 또는 “접근 가능한 팀” 아래에 만들어 둡니다  
2) 해당 프로젝트와 조직/개인 ID를 확인하여 `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`를 확보합니다  
3) Vercel 대시보드에서 API 토큰(`VERCEL_TOKEN`)을 생성합니다  
4) GitHub 저장소의 Actions Secrets에 3개 값을 추가합니다  
5) `.github/workflows/vercel-deploy.yml`에서 Vercel CLI로 pull/build/deploy 파이프라인을 구성합니다

---

## 준비물 상세

### 1) Vercel에서 프로젝트 생성
- Git 연동 없이 “New Project” → “Import” 또는 빈 프로젝트를 만듭니다.
- 프로젝트 프레임워크가 Next.js라면 기본 설정 그대로도 충분합니다.

### 2) ID 확인하기
- `VERCEL_PROJECT_ID`: 프로젝트 설정 → General → Project ID
- `VERCEL_ORG_ID`: 팀(또는 개인) 설정 → General → Team ID 또는 User ID  
  - 팀이면 `team_********`, 개인이면 `user_********` 형식입니다.
- 둘 다 문자열 그대로 복사하여 사용합니다. 오타가 가장 잦은 장애 원인입니다.

### 3) API 토큰 만들기
- Vercel Dashboard → Settings → Tokens → “Create”
- 생성 후 화면을 벗어나면 다시 볼 수 없으니 즉시 복사해서 GitHub Secrets에 넣습니다.
- 권한 범위: 기본 발급 토큰이면 충분하며, 해당 프로젝트에 접근 가능한 계정/팀 소속이어야 합니다.

### 4) GitHub에 시크릿 등록
GitHub 저장소 → Settings → Secrets and variables → Actions → “New repository secret”로 등록:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

조직 레포라도 저장소 관리 권한이 있다면 레포 레벨 시크릿을 설정할 수 있습니다. 권한이 없다면 조직 관리자에게 “레포 시크릿” 또는 “환경 시크릿(Organization Environment)” 등록을 요청하세요.

---

## GitHub Actions 워크플로우 예시

아래 예시는 pnpm, Node.js 20 기반 Next.js 프로젝트를 기준으로 합니다. push(main) 시 프로덕션, PR 시 프리뷰를 자동 배포합니다.

```yaml
name: Vercel Deploy (CLI)

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (preview)
        run: pnpm dlx vercel@latest pull --yes --environment=preview --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (preview)
        run: pnpm dlx vercel@latest deploy --prebuilt --token "$VERCEL_TOKEN" --yes

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (production)
        run: pnpm dlx vercel@latest pull --yes --environment=production --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (production)
        run: pnpm dlx vercel@latest deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

### 각 단계 설명
- `vercel pull`: Vercel에 저장된 환경변수(Preview/Production)를 로컬 `.vercel` 메타와 `.env`에 동기화합니다. CI에서도 동일하게 동작합니다.
- `vercel build`: Vercel 빌드러너(Next Build, 이미지 최적화 등)를 CI에서 실행해 “프리빌트 아티팩트(.vercel/output)”를 생성합니다.
- `vercel deploy --prebuilt`: 이미 빌드된 아티팩트만 업로드하므로 빠르고 재현 가능한 배포가 가능합니다.
- `--prod`: 프로덕션 도메인에 연결되는 릴리스 배포. 생략 시 프리뷰 배포.

---

## 로컬에서 수동 배포가 필요할 때
토큰과 ID만 있으면 로컬에서도 즉시 배포가 가능합니다.

```bash
# 최초 1회
pnpm dlx vercel login
# 또는 토큰을 직접 지정해서 비대화형 로그인 없이:
# export VERCEL_TOKEN=xxx

# .vercel 세팅과 env 동기화
pnpm dlx vercel pull --yes --environment=production --token "$VERCEL_TOKEN"

# 빌드
pnpm dlx vercel build --token "$VERCEL_TOKEN"

# 배포
pnpm dlx vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

---

## 환경변수 전략
- 민감한 값은 가급적 Vercel 대시보드의 `Environment Variables`에 저장하고, `vercel pull`로 동기화합니다.
- CI에서만 필요한 값이라면 GitHub Secrets → `env` 파일 생성 스텝을 별도로 추가할 수도 있습니다.
- 프리뷰/프로덕션 값을 분리해 운영하면 안전합니다.

---

## 보안과 권한 모범사례
- **최소 권한 토큰**: 배포 대상 프로젝트에만 접근 가능한 계정의 토큰을 사용합니다.
- **토큰 범위 노출 금지**: 토큰은 오직 GitHub Secrets에 저장하고, 로그에 찍히지 않도록 주의합니다.
- **ID 불일치 주의**: `VERCEL_ORG_ID`와 실제 프로젝트 소유 주체(팀/개인)가 반드시 일치해야 합니다.
- **권한 위임**: 조직 정책에 따라 “환경 시크릿(Organization/Environment secrets)”를 사용하면 중앙 통제도 가능합니다.

---

## 장애 대처 FAQ

- **401/403 Unauthorized/Forbidden**
  - 토큰이 해당 프로젝트/팀에 권한이 없거나 만료됨
  - `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` 오타 또는 프로젝트 소유 주체 불일치
- **404 Not Found**
  - `VERCEL_PROJECT_ID`가 잘못되었거나 프로젝트가 삭제됨
- **빌드 실패**
  - Node/Pnpm 버전 불일치 → Actions에서 `node-version`/`pnpm version`을 프로젝트와 맞춤
  - Next 이미지 최적화/기능 플래그 불일치 → 로컬 빌드와 동일하게 `vercel build`
- **프리뷰만 성공, 프로덕션 실패**
  - 프로덕션 env 누락 → `vercel pull --environment=production` 확인
  - `--prod` 권한 또는 금지 정책 확인
- **Monorepo에서 하위 디렉터리 빌드**
  - `working-directory` 또는 `--cwd`를 사용
  - Vercel 프로젝트의 루트를 하위 폴더로 설정하거나, Actions에서 해당 폴더로 이동해 명령 실행

예시(모노레포 폴더 `apps/web`):
```yaml
defaults:
  run:
    working-directory: apps/web
```

---

## Git 연동 vs CLI 배포 비교

- **Git 연동**
  - 장점: 클릭 몇 번으로 간단, 프리뷰 링크 자동 코멘트
  - 단점: 조직 정책/권한 이슈가 잦음, 무료 플랜 제약
- **CLI 배포(본 글)**
  - 장점: GitHub와 완전 분리, 어디서든 동일 파이프라인, 권한 최소화
  - 단점: 초기 설정 필요, 빌드/캐시 최적화를 직접 챙겨야 함

---

## 체크리스트
- **시크릿 3종**: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`
- **Node/Pnpm 버전 고정**: 로컬과 CI 일치
- **env 분리**: Preview/Production 각각 점검
- **브랜치 전략**: PR → 프리뷰, main → 프로덕션
- **로그 검토**: 토큰 노출 금지, 실패 시 에러코드로 원인 파악

---

## 실제 프로젝트(Next.js 쇼핑몰) 적용 팁
- 저장소에 `pnpm-lock.yaml`이 있으므로 Actions에서 pnpm 캐시를 켜면 빌드가 빨라집니다.
- 이미지 리소스가 많다면 `vercel build` + `--prebuilt`가 배포 시간을 확 줄여줍니다.
- 프리뷰 배포를 QA에 적극 활용하고, main 브랜치 병합만 프로덕션으로 흘려보내면 운영이 깔끔합니다.

---

## 마무리
조직 레포라고 해서 Vercel 무료 플랜 배포가 막히는 것은 아닙니다. Git 연동을 우회하고, **Vercel CLI + 3개의 시크릿**만으로도 충분히 견고한 CI/CD를 구축할 수 있습니다. 토큰 권한과 ID 매핑만 정확하다면, 프리뷰/프로덕션 자동 배포까지 매끄럽게 운영할 수 있습니다.

---

### 부록: npm/yarn 사용하는 경우
```yaml
# npm
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: 'npm' }
- run: npm ci
- run: npx vercel pull --yes --environment=preview --token "$VERCEL_TOKEN"
- run: npx vercel build --token "$VERCEL_TOKEN"
- run: npx vercel deploy --prebuilt --token "$VERCEL_TOKEN" --yes
```

```yaml
# yarn
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: 'yarn' }
- run: yarn --frozen-lockfile
- run: yarn dlx vercel pull --yes --environment=preview --token "$VERCEL_TOKEN"
- run: yarn dlx vercel build --token "$VERCEL_TOKEN"
- run: yarn dlx vercel deploy --prebuilt --token "$VERCEL_TOKEN" --yes
```

---

- 핵심 포인트 요약
  - **3개 시크릿만으로 Vercel CLI 배포**: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`
  - **Git 연동 불필요**: 조직 정책에 구애받지 않고 무료 플랜에서 동작
  - **프리뷰/프로덕션 자동화**: PR과 main에 맞춘 2단계 워크플로우
  - **장애 대처 가이드**: 401/403/404, 빌드 실패, 모노레포 케이스 대응

```yaml
name: Vercel Deploy (CLI)

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (preview)
        run: pnpm dlx vercel@latest pull --yes --environment=preview --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (preview)
        run: pnpm dlx vercel@latest deploy --prebuilt --token "$VERCEL_TOKEN" --yes

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: true

      - name: Pull Vercel env (production)
        run: pnpm dlx vercel@latest pull --yes --environment=production --token "$VERCEL_TOKEN"

      - name: Build (Vercel build)
        run: pnpm dlx vercel@latest build --token "$VERCEL_TOKEN"

      - name: Deploy (production)
        run: pnpm dlx vercel@latest deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

```shellscript
# 최초 1회
pnpm dlx vercel login
# 또는 토큰을 직접 지정해서 비대화형 로그인 없이:
# export VERCEL_TOKEN=xxx

# .vercel 세팅과 env 동기화
pnpm dlx vercel pull --yes --environment=production --token "$VERCEL_TOKEN"

# 빌드
pnpm dlx vercel build --token "$VERCEL_TOKEN"

# 배포
pnpm dlx vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

```yaml
defaults:
  run:
    working-directory: apps/web
```

```yaml
# npm
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: 'npm' }
- run: npm ci
- run: npx vercel pull --yes --environment=preview --token "$VERCEL_TOKEN"
- run: npx vercel build --token "$VERCEL_TOKEN"
- run: npx vercel deploy --prebuilt --token "$VERCEL_TOKEN" --yes
```

```yaml
# yarn
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: 'yarn' }
- run: yarn --frozen-lockfile
- run: yarn dlx vercel pull --yes --environment=preview --token "$VERCEL_TOKEN"
- run: yarn dlx vercel build --token "$VERCEL_TOKEN"
- run: yarn dlx vercel deploy --prebuilt --token "$VERCEL_TOKEN" --yes
```

