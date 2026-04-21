---
title: "Axios가 흔들자 OpenAI는 인증서를 갈았다"
subtitle: "npm 공급망 사고가 GitHub Actions와 macOS 앱 서명 체인까지 번질 때, 개발팀은 무엇을 바꿔야 하나"
description: "Axios 공급망 공격 뒤 OpenAI가 macOS 앱 서명 인증서를 교체한 이유를 통해, 배포 파이프라인 보안의 새로운 기본값을 정리했다."
publish: true
created_date: 2026-04-21
category: "보안"
tags:
  - Axios
  - 공급망 보안
  - GitHub Actions
  - macOS 배포
  - OpenAI
agent: cheese
slug: axios-npm-supply-chain-openai-macos-signing
reading_time: 8
featured_image: /images/library/axios-npm-supply-chain-openai-macos-signing/thumbnail.png
featured_image_alt: "Axios 공급망 공격이 macOS 앱 서명 체인으로 번지는 장면을 그린 보안 일러스트"
meta_title: "Axios 공급망 사고 뒤 OpenAI가 인증서를 교체한 이유 | Library"
meta_description: "Axios 사건으로 본 GitHub Actions, 코드 서명, 릴리스 파이프라인 보안의 새로운 기본값을 정리했다."
keywords:
  - axios npm supply chain attack
  - openai macos signing certificate
  - github actions floating tag security
  - npm package compromise 2026
  - software release pipeline security
og_title: "Axios 공급망 사고 뒤 OpenAI가 인증서를 교체한 이유"
og_description: "npm 의존성 사고가 앱 서명 체인까지 번질 때, 개발팀이 바꿔야 할 보안 운영 원칙을 정리했다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "A clean editorial tech illustration of a software supply chain incident spreading from an npm package to a macOS app signing pipeline, certificate icons, CI workflow nodes, dark navy and electric blue palette, minimal security magazine style, flat illustration"
  aspect_ratio: "4:3"
  session_id: "library-axios-npm-supply-chain-openai-macos-signing"
  save_as: "thumbnail.png"
-->

이번 사건의 포인트는 단순히 **axios가 오염됐다**가 아니다. 더 불편한 진실은, 작은 npm 의존성 사고가 **배포 신뢰 체인 전체를 흔들 수 있다**는 점이다.

Google Threat Intelligence Group은 2026년 3월 말 axios 패키지 공급망 공격을 공개했고, OpenAI는 4월 10일 별도 공지를 통해 자사 macOS 앱 서명 워크플로가 그 영향권에 있었다고 밝혔다. 사용자 데이터 유출은 없었다. 그런데도 OpenAI는 인증서를 폐기하고 새 빌드를 다시 배포했다. 나는 이 대응이 과잉이 아니라, 오히려 2026년식 정상 대응에 가깝다고 본다.

한국 개발팀 입장에서 이건 남의 회사 사고 정리가 아니다. npm, GitHub Actions, 데스크톱 앱 배포, CLI 배포, 내부 서명 자재를 하나라도 쓰고 있다면 같은 질문이 바로 돌아온다. **우리는 코드만 지키고 있나, 아니면 릴리스 신뢰까지 지키고 있나.**

## 왜 OpenAI는 데이터 유출이 없어도 인증서를 갈아엎었나

OpenAI 공식 공지에 따르면, 문제는 GitHub Actions 기반 macOS 앱 서명 프로세스였다. 이 워크플로는 악성 axios 버전을 내려받아 실행했고, 해당 잡은 macOS 앱 서명 및 notarization 자재에 접근할 수 있었다. 영향 범위에는 ChatGPT Desktop, Codex App, Codex CLI, Atlas가 포함됐다.

여기서 중요한 건 두 가지다.

1. **실제 악용 증거가 없었다**
2. **그래도 최악의 경우를 기준으로 대응했다**

이 판단이 왜 중요하냐면, 코드 서명 인증서는 단순 비밀번호가 아니기 때문이다. 이게 잘못되면 공격자가 악성 앱을 정상 앱처럼 보이게 만들 수 있다. 즉 피해는 데이터베이스에서 바로 드러나지 않고, 사용자 설치 경로에서 뒤늦게 터질 수 있다.

OpenAI는 그래서 이렇게 움직였다.

- 기존 서명 인증서 회전
- 관련 macOS 앱 재빌드 및 재배포
- 이전 인증서 기반 앱의 지원 종료 시점 공지
- Apple과 협력해 이전 인증서 기반 신규 notarization 차단

이건 “털린 게 확인되면 바꾼다”가 아니라, **릴리스 신뢰가 의심되면 먼저 갈아엎는다**는 접근이다. 개인적으로 지금 개발팀들이 가장 빨리 배워야 할 운영 감각도 이 부분이라고 본다.

![npm 패키지 사고가 앱 서명 체인으로 번지는 구조](/images/library/axios-npm-supply-chain-openai-macos-signing/01_supply-chain-to-signing.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Security infographic showing a compromised npm package flowing into CI, then into macOS signing certificates and app releases, trust chain visualization, minimal flat vector, dark background with cyan accents, editorial style"
  aspect_ratio: "16:9"
  session_id: "library-axios-npm-supply-chain-openai-macos-signing"
  save_as: "01_supply-chain-to-signing.png"
-->

사고를 요약하면 이런 구조다.

```txt
악성 axios 릴리즈 유입
→ GitHub Actions 워크플로 실행
→ 서명 자재 접근 가능한 잡 노출
→ 인증서 신뢰성 의심
→ 앱 재서명 + 인증서 회전 + 구버전 종료
```

이 체인은 Node 프로젝트를 넘어서, Electron 앱, 내부 CLI, SaaS용 에이전트 배포 체계에도 거의 그대로 적용된다.

## 진짜 원인은 axios보다 CI 기본값이었다

OpenAI가 공지에서 직접 짚은 근본 원인은 더 흥미롭다. 문제의 워크플로는 **floating tag를 사용했고**, 새 패키지에 대한 **minimumReleaseAge가 설정돼 있지 않았다**.

이건 개발팀이 자주 놓치는 지점이다. 보통 공급망 사고를 이야기하면 “악성 패키지를 막아야 한다”에만 집중한다. 그런데 실제 운영에서는 악성 패키지가 들어오는 순간보다, **우리 파이프라인이 그걸 얼마나 쉽게 실행하게 두는가**가 더 중요하다.

예를 들어 이런 식의 패턴은 너무 흔하다.

```yaml
# 좋지 않은 예시
- uses: some/action@v3
- run: npm install
- run: npm run release
```

겉으로는 평범하다. 하지만 여기엔 문제가 많다.

- `@v3` 같은 floating tag는 실제 실행 커밋이 변할 수 있다
- 새 릴리즈가 올라오자마자 받아 쓰면 악성 버전도 바로 흡수한다
- 릴리스 잡에 서명 자재나 notarization 자재가 붙어 있으면 반경이 커진다

조금만 더 보수적으로 바꾸면 사고 확률이 확 줄어든다.

```yaml
# 더 안전한 예시
- uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608
- run: npm ci --ignore-scripts
- run: npm audit signatures
```

물론 현실은 이보다 복잡하다. `--ignore-scripts`를 바로 못 쓰는 프로젝트도 많고, 모든 배포를 완전 격리하기도 어렵다. 그래도 최소한의 원칙은 분명하다.

- Action은 태그보다 커밋 SHA로 고정
- 패키지는 즉시 승격 대신 지연 반영 창 적용
- 릴리스 잡과 일반 빌드 잡 분리
- 서명 자재는 마지막 단계에서만 주입
- 서명 이후 산출물 검증 절차 추가

이 변화가 의미하는 건, 이제 CI는 단순 자동화 도구가 아니라 **가장 큰 신뢰 증폭기**라는 사실이다. 잘못 붙이면 작은 오염을 글로벌 배포로 증폭시킨다.

![Floating tag와 즉시 설치가 만드는 CI 위험](/images/library/axios-npm-supply-chain-openai-macos-signing/02_ci-defaults-risk.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial diagram of insecure CI defaults, floating tags, instant dependency install, secrets entering build jobs, warning symbols, clean flat infographic style, navy and red-orange accents"
  aspect_ratio: "16:9"
  session_id: "library-axios-npm-supply-chain-openai-macos-signing"
  save_as: "02_ci-defaults-risk.png"
-->

Google Threat Intelligence Group이 공개한 분석도 이 문제를 뒷받침한다. 공격자는 axios maintainer 계정을 손상시킨 뒤 1.14.1과 0.30.4에 악성 의존성 `plain-crypto-js`를 추가했고, 그 드로퍼는 Windows, macOS, Linux를 가리지 않고 후속 페이로드를 설치했다. 즉 “Node 패키지 사고니까 백엔드 몇 대만 보면 된다”는 감각은 완전히 틀렸다.

## 이번 사건이 한국 개발팀에 특히 불편한 이유

한국 팀은 생각보다 배포 자동화 밀도가 높다. 스타트업은 GitHub Actions와 npm 생태계 의존도가 높고, 에이전시나 제품 조직은 macOS 앱이나 사내용 CLI를 종종 배포한다. 문제는 이런 팀일수록 속도를 위해 기본값을 느슨하게 두기 쉽다는 점이다.

특히 아래 조합은 위험하다.

- GitHub-hosted runner에서 바로 release 수행
- npm install 직후 서명/배포까지 한 번에 실행
- build, signing, notarization, upload가 한 잡에 몰림
- third-party action 버전을 태그로만 고정
- 서명 키와 배포 토큰이 동일 파이프라인에 동시에 존재

이 구조에서는 패키지 하나가 오염되면 피해가 이렇게 커진다.

```txt
의존성 오염
→ 빌드 잡 실행
→ 시크릿 접근
→ 서명 또는 배포 자재 접근
→ 악성 산출물 서명 가능성
→ 사용자 신뢰 경로 훼손
```

그리고 이건 보안팀만의 일도 아니다. 릴리스 매니저, 플랫폼 엔지니어, 데스크톱 앱 개발자, DevOps 담당자가 같이 봐야 한다.

실제로 지금 점검해야 할 질문은 이런 쪽이다.

### 1. 릴리스 잡이 일반 빌드 잡과 분리돼 있나
서명 자재는 가능한 한 마지막 단계, 별도 승인된 컨텍스트에서만 열어야 한다. 빌드부터 배포까지 한 번에 처리하는 잡은 편하지만 사고 반경이 너무 크다.

### 2. 패키지와 액션 버전을 얼마나 강하게 고정하고 있나
`latest`, `v3`, 범위 버전, 자동 승격은 모두 편의 기능이지만, 공급망 사고 때는 공격자의 지름길이 된다.

### 3. 구버전 무효화 시나리오가 준비돼 있나
OpenAI는 구버전 종료 일정을 미리 공지했다. 많은 팀은 새 빌드를 내는 건 가능해도, **이전 신뢰를 회수하는 절차**는 준비돼 있지 않다.

### 4. 사용자 안내 문구까지 사고 대응 계획에 포함돼 있나
이번 케이스처럼 "공식 링크로만 업데이트하라"는 메시지는 기술 조치만큼 중요하다. 인증서 사고는 피싱형 악성 설치로 2차 확산될 수 있기 때문이다.

## 지금 바로 가져갈 운영 체크리스트

이 사건을 보고 한국 팀이 바로 바꿀 수 있는 건 꽤 많다. 거창한 플랫폼 개편보다 먼저, 릴리스 체인에서 위험 증폭 구간을 끊는 게 우선이다.

```yaml
release_security_baseline:
  github_actions:
    pin_by_commit_sha: true
    separate_release_job: true
    restrict_secret_scope: true
  dependencies:
    block_floating_ranges: true
    delay_new_release_adoption: true
    require_lockfile_review: true
  signing:
    inject_signing_material_last_step: true
    rotate_on_suspicion: true
    publish_version_cutoff_notice: true
  incident_response:
    verify_existing_notarizations: true
    monitor_fake_download_paths: true
    prepare_user_update_message: true
```

실무적으로는 이 순서가 좋다.

1. 최근 30일 내 릴리스 워크플로 전체 목록화
2. 태그 기반 Action 참조를 커밋 SHA로 교체
3. 서명 자재가 들어가는 잡과 단계 분리
4. npm 신규 릴리스 즉시 반영 관행 제거
5. 사고 시 구버전 차단, 공지, 재서명 절차 문서화

간단한 셀프 점검 커맨드도 유용하다.

```bash
# GitHub Actions에서 태그 기반 action 사용 여부 점검
rg "uses: .*@v|uses: .*@main|uses: .*@master" .github/workflows

# npm install 기반 배포 잡 찾기
rg "npm install|pnpm install|yarn install" .github/workflows

# signing, notarize, certificate 같은 키워드가 같은 잡에 섞이는지 확인
rg "sign|notar|certificate|codesign|productsign" .github/workflows
```

![릴리스 보안 체크리스트와 인증서 회전 플레이북](/images/library/axios-npm-supply-chain-openai-macos-signing/03_release-security-playbook.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A premium editorial checklist illustration for release pipeline security, GitHub Actions hardening, signing key isolation, certificate rotation playbook, modern cyber operations dashboard look, flat vector, 16:9"
  aspect_ratio: "16:9"
  session_id: "library-axios-npm-supply-chain-openai-macos-signing"
  save_as: "03_release-security-playbook.png"
-->

## 결론, 이제는 앱 보안보다 배포 보안을 먼저 봐야 한다

나는 이번 이슈를 axios 뉴스로만 소비하면 아깝다고 본다. 진짜 교훈은 더 아래층에 있다.

- 오픈소스 패키지 사고는 곧 릴리스 신뢰 사고가 될 수 있다
- 사용자 데이터 유출이 없어도 인증서 회전은 정당한 대응이다
- CI 기본값 하나가 공급망 사고의 반경을 결정한다
- 사고 대응은 코드 복구보다 **신뢰 복구**가 더 어렵다

OpenAI가 보여준 대응은 꽤 명확했다. 증거가 완전히 확정되기 전에도, 서명 체인이 의심되면 인증서를 교체하고 구버전 종료 계획까지 같이 내놨다. 개발팀 입장에서 이건 과민 반응이 아니라, 앞으로 표준에 가까워질 가능성이 높다.

한국 개발자에게 남는 질문도 하나다.

**우리는 아직도 앱을 빌드하는 팀인가, 아니면 신뢰를 배포하는 팀인가.**

2026년의 공급망 보안은 패키지 이름을 외우는 게임이 아니다. 릴리스 체인의 어느 단계가 신뢰를 증폭하고, 어느 단계가 사고를 확대하는지 구조적으로 보는 팀이 결국 덜 다친다.
