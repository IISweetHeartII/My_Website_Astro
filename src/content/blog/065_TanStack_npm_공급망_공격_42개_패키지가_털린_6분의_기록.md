---
title: "TanStack npm 공급망 공격 — 42개 패키지가 털린 6분의 기록"
subtitle: "GitHub Actions의 pull_request_target, 캐시 포이즈닝, OIDC 토큰 탈취가 만나면"
description: "2026년 5월 11일, TanStack의 42개 npm 패키지가 6분 만에 털렸다. 세 가지 취약점이 체이닝된 공격의 흐름과 우리가 배워야 할 것."
publish: true
meta_title: "TanStack npm 공급망 공격 — 42개 패키지가 털린 6분의 기록 | 김덕환"
meta_description: "pull_request_target, 캐시 포이즈닝, OIDC 토큰 탈취 — 세 가지 GitHub Actions 취약점이 만나 84개 악성 버전이 발행된 사건 정리."
keywords:
  - npm 공급망 공격
  - TanStack
  - GitHub Actions
  - pull_request_target
  - OIDC
  - 캐시 포이즈닝
  - 공급망 보안
  - supply chain attack
og_title: "TanStack npm 공급망 공격 — 42개 패키지가 털린 6분의 기록"
og_description: "세 가지 취약점이 체이닝되어 84개 악성 버전이 발행된 사건 분석."
og_type: article
twitter_card: summary_large_image
created_date: 2026-05-12
updated_date: 2026-05-12
category: "보안"
featured_image: /images/blogs/065/065_00_thumbnail.png
featured_image_alt: "npm 공급망 공격 일러스트 — 무너지는 패키지 더미"
slug: tanstack-npm-supply-chain-postmortem-korean
tags:
  - 보안
  - npm
  - GitHub Actions
  - 공급망
  - DevOps
---

> **핵심 요약**
>
> - **2026년 5월 11일 19:20–19:26 UTC (단 6분)**, TanStack의 **42개 패키지에 84개 악성 버전**이 발행됨
> - 공격은 세 취약점의 **체이닝**: `pull_request_target` Pwn Request + GitHub Actions 캐시 포이즈닝 + 러너 메모리에서 **OIDC 토큰 탈취**
> - 외부 연구자 **carlini가 20분 만에 발견**, Socket.dev가 곧이어 확인
> - 악성 코드는 AWS/GCP/K8s/Vault/GitHub/SSH 자격증명을 긁어 **Session 메신저 네트워크로 유출**
> - 원문(영문): [TanStack 공식 포스트모템](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem)

![무너지는 npm 패키지 더미 일러스트](/images/blogs/065/065_00_thumbnail.png)

<!--
  📸 이미지 프롬프트:
  prompt: "flat illustration of npm packages as colorful boxes tumbling down, with a red corrupted package at the top labeled '@tanstack', tiny shocked developer character watching helplessly, dark gradient background with red warning glow, modern flat style, soft pastel with red accents"
  aspect_ratio: "4:3"
  session_id: "blog-065"
  save_as: "065_00_thumbnail.png"
-->

---

어제 자고 일어났더니 타임라인이 빨갰다.

TanStack — React Query, TanStack Router, TanStack Table — 우리가 매일 쓰는 그 라이브러리들이 한 시간 사이 42개 패키지에 악성 코드를 뿌렸다. 5월 11일, 한국 시간으로는 자정쯤이었다.

OIDC 트러스티드 퍼블리셔(trusted publisher)라는, **API 토큰 없이 GitHub Actions가 직접 npm에 publish하는 가장 안전하다고 여겨졌던 방식**이 정확히 그 신뢰 때문에 뚫렸다.

---

## 한 줄로 요약하면

> "각각은 평범한 위험이지만, **셋이 합쳐지면 치명적**이었다."

TanStack 팀이 포스트모템에서 한 말이다. 어느 하나만 막혔어도 공격은 실패했을 거다. 셋이 동시에 열려 있었다.

---

## 공격은 세 단계로 체이닝됐다

![세 취약점 체이닝 다이어그램](/images/blogs/065/065_01_attack-chain.png)

<!--
  📸 이미지 프롬프트:
  prompt: "horizontal flow diagram showing three connected attack stages as red rectangles with arrows: 1) 'pull_request_target — fork code runs with secrets' 2) 'Cache Poisoning — malicious pnpm-store saved' 3) 'OIDC Token Theft — stolen from /proc memory' arriving at a final orange box 'npm publish — 84 malicious versions'. Flat illustration, dark background with red glow connectors, technical infographic style"
  aspect_ratio: "16:9"
  session_id: "blog-065"
  save_as: "065_01_attack-chain.png"
-->

### 1️⃣ pull_request_target — 포크 코드가 시크릿을 보는 마법

`bundle-size.yml` 워크플로우가 `pull_request_target` 트리거를 쓰면서 **PR이 가리키는 fork 브랜치의 코드를 체크아웃했다.** 이 패턴이 그 유명한 "Pwn Request"다.

GitHub의 `pull_request_target`는 fork PR에서도 **메인 레포의 시크릿에 접근 가능한 상태로** 워크플로우가 돈다. 안전하게 쓰려면 PR 코드를 절대 실행하면 안 되는데, TanStack은 빌드를 위해 실행했다. 이 순간 공격자의 코드가 TanStack의 권한으로 실행됐다.

### 2️⃣ 캐시 포이즈닝 — 신뢰 경계가 없었다

GitHub Actions의 캐시는 기본적으로 **PR과 main 브랜치 사이에 공유된다.** 공격자는 `pnpm-store` 캐시에 악성 의존성을 심었다. 캐시 키는 평범했다:

```
Linux-pnpm-store-6f9233a50def742c09fde54f56553d6b449a535adf87d4083690539f49ae4da11
```

이게 며칠 뒤 main 브랜치의 `release.yml`이 돌 때 그대로 복원됐다. **공격자 코드가 빌드 의존성에 섞여 들어가는 순간이다.**

### 3️⃣ OIDC 토큰 탈취 — /proc에서 메모리 긁기

npm의 OIDC 트러스티드 퍼블리셔는 단기 토큰을 메모리에 띄운다. 악성 코드는 러너 컨테이너의 `/proc/` 파일시스템을 뒤져 **이 토큰을 통째로 빼냈다.** 그리고 그 토큰으로 직접 npm에 publish 요청을 쐈다.

API 토큰을 안 쓴다고 안전한 게 아니었다. **러너 메모리가 보호되지 않으면 OIDC도 똑같이 털린다.**

---

## 타임라인 — 23시간의 잠복, 6분의 폭발

| UTC 시각             | 사건                                            |
| -------------------- | ----------------------------------------------- |
| 2026-05-10 17:16     | 공격자 fork 생성 (`zblgg/configuration`)        |
| 2026-05-10 23:29     | 악성 커밋 추가 (vite_setup.mjs 페이로드)        |
| 2026-05-11 ~10:49    | PR #7378 오픈 → `pull_request_target` 자동 실행 |
| 2026-05-11 11:29     | **포이즈닝된 pnpm 캐시 저장**                   |
| 2026-05-11 19:15     | `release.yml` 트리거, 캐시 복원                 |
| **2026-05-11 19:20** | **1차 publish: @tanstack/history 외 41개**      |
| **2026-05-11 19:26** | **2차 publish: 같은 패키지들 패치 버전**        |
| 2026-05-11 ~19:50    | carlini가 발견, 이슈 #7383 작성                 |
| 2026-05-11 ~20:10    | 메인테이너 권한 회수                            |
| 2026-05-11 21:30     | 캐시 퍼지, 하드닝 PR 머지                       |

23시간 동안 잠복해 있다가 6분 만에 84개 버전을 쏟아냈다. 그리고 **20분 뒤에 외부 연구자가 발견**했다는 게 이 사건에서 그나마 다행인 부분이다.

---

## 뭘 털어 가려고 했나

악성 페이로드는 클라우드 자격증명 사냥꾼이었다:

- **AWS** IMDS, Secrets Manager 토큰
- **GCP** 메타데이터 토큰
- **Kubernetes** 서비스 계정 토큰
- **HashiCorp Vault** 토큰
- `~/.npmrc`, `~/.git-credentials`
- 환경변수 / `gh` CLI의 GitHub 토큰
- SSH 개인키

유출 경로는 **Session/Oxen 메신저 네트워크**였다. 종단간 암호화 메신저라 C2 서버가 따로 없다. **차단하려면 도메인/IP 차단밖에 없다.** 침착하고 영리한 설계다.

만약 CI에서 이 패키지들이 한 번이라도 설치돼서 위 자격증명에 접근했다면, 그 환경은 이미 손상된 거다. 키 로테이션이 필수다.

---

## 우리가 배워야 할 것

이 사건을 보면서 정리한 체크리스트:

**워크플로우 레벨**

- [ ] `pull_request_target` 쓰는 워크플로우 전부 감사하기. **PR 코드를 절대 실행하지 말 것**
- [ ] 실행해야 한다면 `repository_owner` 가드 추가
- [ ] 서드파티 액션은 **commit SHA로 핀**, floating tag(`@v3`) 금지

**캐시 / 시크릿 레벨**

- [ ] PR과 main 사이에 **캐시를 공유하지 않는 정책** 검토
- [ ] OIDC 트러스티드 퍼블리셔를 쓰더라도 **러너 환경을 신뢰할 수 있는지** 다시 생각하기
- [ ] 시크릿 접근 가능한 잡(job)은 코드 실행 잡과 **분리**

**대응 레벨**

- [ ] npm 의존성 lock 파일에 `optionalDependencies` 같은 비정상 필드 모니터링 (carlini가 이걸로 잡았다)
- [ ] Socket.dev, Snyk, Dependabot 같은 공급망 모니터링 도구 도입
- [ ] 자격증명 짧은 TTL 운영. 24시간 이상 가는 토큰 줄이기

---

## 마무리

OIDC를 "그래도 API 토큰보다는 안전하지" 하고 쓰던 사람으로서, 이 사건은 한 대 얻어맞은 느낌이었다.

안전한 메커니즘이 안전하지 않은 환경 위에 올라가면 결국 같이 무너진다. **메커니즘이 아니라 환경 전체를 봐야 한다.** 워크플로우 한 줄이 시크릿 전부를 노출시킬 수 있다는 걸 잊지 말자.

TanStack 팀이 공개한 포스트모템은 모든 디테일을 다 까 보여준 모범 사례다. 같은 입장이었으면 나는 이렇게 투명하게 못 했을 거 같다. 존경.

원문 전문은 여기서 읽을 수 있다 → [TanStack: npm Supply-Chain Compromise Postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem)

— 2026.05.12
