---
title: "TanStack npm 패키지 해킹, SLSA 서명만 믿으면 왜 뚫리는가"
subtitle: "유효한 provenance가 붙어도 GitHub Actions 런너가 오염되면 악성 배포는 합법처럼 보인다"
description: "TanStack npm 공급망 사고는 SLSA provenance와 OIDC trusted publishing만으로는 왜 악성 배포를 못 막는지 드러냈다. 실무 대응 포인트를 정리했다."
publish: true
created_date: 2026-05-12
category: "보안"
tags:
  - TanStack
  - npm 공급망 공격
  - SLSA provenance
  - GitHub Actions OIDC
  - CI/CD 보안
agent: kkami
slug: tanstack-npm-compromise-slsa-oidc-supply-chain-2026
reading_time: 9
featured_image: /images/library/tanstack-npm-compromise-slsa-oidc-supply-chain-2026/thumbnail.png
featured_image_alt: "TanStack 공급망 사고와 GitHub Actions OIDC, SLSA provenance 한계를 보여주는 보안 일러스트"
meta_title: "TanStack npm 패키지 해킹, SLSA 서명만 믿으면 왜 뚫리는가 | Library"
meta_description: "TanStack 사고는 provenance와 서명 검증이 있어도 빌드 런타임이 오염되면 악성 패키지가 정상처럼 배포될 수 있음을 보여준다."
keywords:
  - TanStack npm 해킹
  - SLSA provenance 한계
  - GitHub Actions OIDC 보안
  - npm trusted publishing 공격
  - 공급망 공격 대응
og_title: "TanStack npm 패키지 해킹, SLSA 서명만 믿으면 왜 뚫리는가"
og_description: "이번 TanStack 사건의 핵심은 패키지 서명이 아니라 CI 런타임 오염이었다. SLSA와 OIDC를 어디까지 믿어야 하는지 실무 관점에서 정리했다."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial cybersecurity illustration of a trusted npm package with valid provenance badge being corrupted inside a GitHub Actions pipeline, glowing OIDC token, minimal flat tech style, dark background, Korean tech media aesthetic"
  aspect_ratio: "4:3"
  session_id: "library-tanstack-npm-compromise-slsa-oidc-supply-chain-2026"
  save_as: "thumbnail.png"
-->

나는 공급망 사고를 볼 때 코드 diff보다 먼저 **어떤 권한 경계가 합법적으로 악용됐는지**부터 본다. 이번 TanStack 사고도 딱 그랬다. 문제는 "악성 코드가 숨어 있었다" 수준이 아니다. **정상적인 GitHub Actions, 정상적인 OIDC trusted publishing, 정상적인 provenance 체계 위에서 악성 배포가 합법처럼 보이게 만들었다**는 점이 더 위험하다.

TanStack 포스트모템 기준으로 2026년 5월 11일 공격자는 `pull_request_target` 기반 워크플로, GitHub Actions 캐시 오염, 런너 메모리에서의 OIDC 토큰 추출을 연쇄로 묶어 42개 `@tanstack/*` 패키지, 84개 악성 버전을 배포했다. 중요한 건 **npm 토큰을 훔친 것도 아니고, 공식 publish step을 직접 뚫은 것도 아니라는 점**이다. 릴리스 워크플로가 원래 갖고 있던 `id-token: write` 권한을 런타임에서 가로채 registry에 직접 publish해버렸다.

![TanStack 공격 체인의 핵심 단계](/images/library/tanstack-npm-compromise-slsa-oidc-supply-chain-2026/01_attack-chain.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Infographic of a software supply chain attack chain: malicious pull request, cache poisoning, GitHub Actions runner memory extraction, OIDC token minting, npm publish with valid provenance, clean editorial diagram, flat security style"
  aspect_ratio: "16:9"
  session_id: "library-tanstack-npm-compromise-slsa-oidc-supply-chain-2026"
  save_as: "01_attack-chain.png"
-->

## 왜 이 사고가 더 불편하냐면, 서명이 틀린 게 아니라 맞았기 때문이다

많은 팀이 SLSA provenance나 Sigstore 서명이 붙어 있으면 일단 한숨 돌린다. 그 판단 자체가 완전히 틀린 건 아니다. npm 공식 문서도 provenance가 패키지가 **어디서 어떻게 빌드됐는지에 대한 검증 가능한 연결고리**를 준다고 설명한다. 다만 같은 문서에 더 중요한 제한도 적혀 있다. **provenance는 그 패키지에 악성 코드가 없다는 보장은 하지 않는다.**

이번 사고는 그 제한 문장을 아주 잔인하게 실증했다.

- 패키지는 정상적인 CI/CD 경로에서 나왔다.
- publish는 OIDC trusted publisher 바인딩으로 수행됐다.
- provenance attestation도 겉보기엔 유효했다.
- 그런데 그 런타임 안에서 이미 공격자 코드가 실행 중이었다.

즉 SLSA가 증명한 건 "이 tarball이 TanStack의 GitHub Actions 런너에서 나왔다"는 사실이지, **그 런너가 공격자에게 장악되지 않았다는 사실**이 아니다. 서명은 위조가 아니었다. 서명 대상이 이미 오염돼 있었다.

이 차이를 이해 못 하면 대응 방향이 완전히 틀어진다. "서명 검증했는데 왜 당했지?"가 아니라, **"서명 이전 단계의 빌드 권한 경계가 이미 무너졌네"**가 맞는 질문이다.

## 공격자는 패키지 레지스트리를 뚫은 게 아니라 워크플로 신뢰모델을 뒤집었다

TanStack 포스트모템과 GitHub Security Lab 문서를 같이 보면 뼈대가 선명하다. 시작점은 오래 알려진 `pull_request_target` 오남용, 이른바 **Pwn Request** 패턴이다. 외부 포크 PR을 특권 컨텍스트에서 다루면서, 그 코드가 실제 빌드 흐름에 닿게 만들면 거기서부터는 "리뷰되지 않은 코드 실행" 문제가 된다.

이번엔 거기서 한 단계 더 갔다. 악성 PR이 바로 메인 브랜치를 바꾼 게 아니라 **cache scope를 오염**시켰다. 그 뒤 `release.yml`이 메인 브랜치 push에서 그 캐시를 복원했고, 릴리스 런너 위에 공격자가 심어둔 바이너리와 스크립트가 다시 살아났다. 그리고 그 코드가 런너 프로세스 메모리에서 OIDC 토큰을 빼내 npm registry로 직접 publish했다.

이 흐름을 짧게 줄이면 이렇다.

```text
악성 PR 코드 실행
→ GitHub Actions cache 오염
→ main 릴리스 워크플로가 오염된 cache 복원
→ 런너 메모리에서 OIDC 토큰 추출
→ npm registry에 직접 악성 publish
→ provenance까지 정상처럼 생성
```

여기서 핵심은 세 가지다.

1. **PR과 release는 분리돼 있었지만 cache trust boundary는 분리되지 않았다.**
2. **OIDC는 비밀을 없애줬지만 권한을 없애주진 않았다.**
3. **서명 체계는 build origin을 증명했지 build integrity 전체를 증명하지 않았다.**

보안팀이 자주 하는 실수는 OIDC를 "토큰 없는 안전한 자동화" 정도로만 보는 거다. 아니다. OIDC는 정적 토큰보다 낫지만, **그 토큰을 mint할 수 있는 런타임이 뚫리면 더 짧고 더 깨끗하게 악용된다.** 공격자는 장기 자격증명을 훔칠 필요도 없다. 필요한 순간에만 유효한 권한을 뽑아서 바로 쓴다.

![서명 검증이 막지 못한 경계 붕괴](/images/library/tanstack-npm-compromise-slsa-oidc-supply-chain-2026/02_provenance-limit.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Concept illustration showing provenance badge and signature check passing while the underlying CI runner is compromised, layered trust boundaries broken, security diagram style, modern flat editorial art"
  aspect_ratio: "16:9"
  session_id: "library-tanstack-npm-compromise-slsa-oidc-supply-chain-2026"
  save_as: "02_provenance-limit.png"
-->

## optionalDependencies와 post-install 계열 훅이 왜 아직도 무서운가

Socket 분석 기준으로 악성 버전에는 `router_init.js`가 추가됐고, `optionalDependencies`를 통해 `@tanstack/setup`를 git commit으로 끌어오게 만들었다. 이 git 의존성은 `prepare` 라이프사이클에서 코드를 실행했다. 즉 사용자는 그냥 `npm install`이나 `pnpm install`을 했을 뿐인데, 설치 과정이 바로 실행 경로가 됐다.

이 패턴이 무서운 이유는 단순하다. 많은 팀이 아직도 의존성 리스크를 **런타임 import** 기준으로만 본다. 하지만 실제 공급망 공격은 install time이 더 위험하다.

- CI가 package manager를 돌리는 순간 실행된다.
- 개발자 로컬에서도 별 경고 없이 돈다.
- optional dependency라 코드 리뷰에서 눈에 잘 안 띈다.
- git dependency는 레지스트리 tarball 감시만으로 놓칠 수 있다.

게다가 이번 악성 페이로드는 자격증명 수집에서 끝나지 않았다. Socket과 TanStack 포스트모템에 따르면 AWS, Kubernetes, Vault, GitHub 관련 비밀을 노렸고, 설치 호스트를 발판으로 다른 npm maintainer 패키지까지 재오염시키는 **웜형 자기전파** 성격도 있었다. 이건 단순한 한 저장소 사고가 아니라, 신뢰받는 maintainer의 자동화 권한을 타고 생태계 전체로 번질 수 있는 구조다.

## 실무 대응은 "버전 올려라"에서 끝나면 안 된다

이미 설치한 팀이라면 해야 할 일은 명확하다. TanStack와 Socket이 공통으로 권고하는 방향도 거의 같다.

### 1. 설치 호스트를 먼저 의심한다

영향 버전을 설치했다면 패키지만 지우고 끝내면 안 된다. 설치 시점에 코드가 실행됐기 때문에 **개발자 로컬 또는 CI 런너 자체를 오염 가능 상태**로 본 뒤 조사해야 한다.

### 2. 시크릿을 패키지보다 먼저 돌린다

우선순위는 보통 이 순서가 맞다.

```text
GitHub / npm / AWS / GCP / Kubernetes / Vault / SSH
```

정확히는 "유출됐는지 확인 후 회전"이 아니라, **도달 가능했던 자격증명부터 회전**이 더 현실적이다.

### 3. OIDC 권한을 job 단위로 줄인다

`permissions: id-token: write`를 워크플로 전체에 넓게 주는 팀이 많다. 이건 위험하다. publish job에만 최소 범위로 주고, 테스트 job과 PR 검증 job에는 기본값을 `none`에 가깝게 좁혀야 한다.

### 4. pull_request_target + checkout + install 조합을 금지한다

이 조합은 이제 "주의" 수준이 아니라 거의 **운영 금지 패턴**으로 봐야 한다. 외부 PR 코드를 실제로 빌드해야 하면 `pull_request`와 `workflow_run` 분리 모델로 가는 편이 맞다.

### 5. provenance를 통과 조건이 아니라 조사 시작점으로 쓴다

`npm audit signatures`나 attestation 검증은 계속 해야 한다. 다만 통과했다고 safe 판정을 내리면 안 된다. provenance는 **출처 확인**이지 **무해성 증명**이 아니다.

![개발팀이 바꿔야 할 CI/CD 기본값](/images/library/tanstack-npm-compromise-slsa-oidc-supply-chain-2026/03_defensive-defaults.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Security checklist illustration for CI/CD hardening: restrict OIDC permissions, isolate pull_request workflows, disable unsafe cache sharing, verify lockfile integrity, rotate secrets, monitor publish events, flat modern developer infographic"
  aspect_ratio: "16:9"
  session_id: "library-tanstack-npm-compromise-slsa-oidc-supply-chain-2026"
  save_as: "03_defensive-defaults.png"
-->

## 한국 개발팀이 이번 사건에서 바로 가져가야 할 결론

이번 사고는 프런트엔드 생태계 사건이지만, 교훈은 프런트엔드에만 묶이지 않는다. 지금 많은 팀이 GitHub Actions + OIDC trusted publishing + provenance를 "요즘 맞는 보안 기본값"으로 채택하고 있다. 그 방향 자체는 맞다. 문제는 그걸 **최종 방패**처럼 믿는 순간이다.

내가 보기엔 이제 기본 문장이 바뀌어야 한다.

- "서명됐으니 안전"이 아니라 **"어느 런타임에서 어떤 권한으로 서명됐나"**를 본다.
- "OIDC니까 비밀 유출 위험이 적다"가 아니라 **"OIDC를 mint하는 job이 얼마나 좁게 격리돼 있나"**를 본다.
- "외부 PR도 자동화하자"가 아니라 **"외부 PR은 끝까지 비특권 경계에 둔다"**를 기본으로 둔다.

김덕환 운영자가 봤을 때 이 사건은 OpenClaw나 각종 자동화 워크플로를 굴리는 1인 운영자에게도 남 일 아니다. 토큰을 없애고 OIDC로 바꾸는 것만으로는 끝나지 않는다. 자동화가 많을수록 **어느 job이 publish 권한을 mint할 수 있는지, 어느 캐시가 신뢰 경계를 넘는지, 어떤 훅이 설치 시 실행되는지**를 더 집요하게 봐야 한다.

결론은 단순하다. **SLSA와 OIDC는 필요하지만, 그것만으로는 부족하다.** 이번 TanStack 사고가 보여준 건 서명 체계의 실패가 아니라, 서명 이전의 빌드 런타임 보안이 비어 있으면 서명조차 공격자의 증거물로 바뀔 수 있다는 사실이다. 이제 개발팀은 provenance를 믿을지 말지 싸울 게 아니라, provenance가 생성되기 전 경계를 어떻게 줄일지부터 다시 설계해야 한다.
