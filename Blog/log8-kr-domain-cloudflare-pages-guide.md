---
title: log8.kr 도메인 설정 및 Cloudflare Pages 연결 가이드
publish: true
subtitle: 나만의 블로그를 위한 첫 걸음: 가비아 도메인 구매부터 Cloudflare Pages 연동까지
description: 블로그 운영을 위한 핵심 인프라 구축! 가비아에서 도메인을 구입하고 Cloudflare Pages를 통해 손쉽게 웹사이트를 연결하는 상세 가이드를 제공합니다.
meta_title: log8.kr 도메인 설정 가이드 - Cloudflare Pages 연결
meta_description: 초보자를 위한 log8.kr 도메인 설정 및 Cloudflare Pages 연결 단계별 안내. SEO 친화적인 블로그 구축의 시작!
keywords:
  - 도메인
  - 가비아
  - Cloudflare
  - Cloudflare Pages
  - 웹사이트
  - 블로그
  - SEO
  - 개발 블로그
  - 웹호스팅
  - 도메인 연결
og_title: log8.kr 도메인 설정 및 Cloudflare Pages 연결 가이드
og_description: 나만의 블로그를 위한 첫 걸음: 가비아 도메인 구매부터 Cloudflare Pages 연동까지
og_type: article
twitter_card: summary_large_image
created_date: 2025-05-13 10:00
featured_image: 
featured_image_alt: 
slug: log8-kr-domain-cloudflare-pages-guide
tags:
  - 웹개발
  - 도메인
  - Cloudflare
  - 블로그
---

# log8.kr 도메인 설정 및 Cloudflare Pages 연결 가이드

안녕하세요! 나만의 블로그를 운영하려는 분들을 위해 **log8.kr** 도메인 설정 과정을 상세하게 공유하고자 합니다. 이 가이드를 통해 가비아에서 도메인을 구입하고, Cloudflare Pages를 사용하여 블로그를 손쉽게 연결하는 방법을 배우실 수 있습니다.

## 1단계: 도메인 구입 (가비아)

가장 먼저, 사용할 도메인을 구입해야 합니다. 저는 **가비아(gabia.co.kr)**에서 `log8.kr` 도메인을 구입했습니다.

- **도메인**: `log8.kr`
- **구입처**: 가비아 (gabia.co.kr)
- **구입일**: 2025-05-09
- **비용**: 16,500원 (이벤트가 적용된 1년 등록)

## 2단계: Cloudflare 연결 절차

도메인 구입 후, Cloudflare를 통해 도메인을 관리하고 웹사이트를 연결할 준비를 합니다. Cloudflare는 CDN, 보안, DNS 관리 등 다양한 기능을 제공하여 웹사이트 성능과 안정성을 높여줍니다.

### 1. Cloudflare에 도메인 추가

Cloudflare 대시보드에 접속하여 구입한 도메인을 추가합니다.

- [Cloudflare 등록](https://dash.cloudflare.com/)
- 도메인: `log8.kr` 추가

### 2. DNS 레코드 미리 등록

Cloudflare에서 도메인을 추가한 후, DNS 설정으로 이동하여 아래 CNAME 레코드를 미리 등록해줍니다. 이는 나중에 Cloudflare Pages와 연결될 때 필요합니다.

```
CNAME  @     log8.pages.dev       Proxied
CNAME  www   log8.pages.dev       Proxied
```

### 3. Cloudflare가 제공한 네임서버 확인

Cloudflare에서 도메인을 추가하는 과정에서 Cloudflare 고유의 네임서버 주소를 제공합니다. 이 주소를 기록해둡니다.

- `langston.ns.cloudflare.com`
- `virginia.ns.cloudflare.com`

### 4. 가비아에서 네임서버 변경

이제 가비아 도메인 관리 페이지로 돌아가, `log8.kr` 도메인의 네임서버를 Cloudflare에서 제공한 주소로 변경합니다. 기존 가비아 네임서버는 삭제 후 새로운 네임서버를 등록합니다.

- [가비아 도메인 관리](https://www.gabia.com/) 접속
- `log8.kr` > 네임서버 설정
- 기존 NS (gabia.co.kr) 삭제 후 위 두 개 NS 등록

### 5. 기다림

네임서버 변경은 전 세계 DNS 서버에 반영되기까지 시간이 소요됩니다. 보통 30분 이내에 완료되지만, 최대 24시간이 걸릴 수도 있습니다. Cloudflare 대시보드에서 도메인 상태가 "Active"로 변경되었는지 확인합니다.

## 3단계: Cloudflare Pages 연결 완료 후 확인

Cloudflare Pages에 웹사이트를 배포했다면, 이제 `log8.kr` 도메인을 통해 웹사이트에 접속할 수 있게 됩니다.

- `https://log8.kr` 접속 시 `https://log8.pages.dev`로 정상적으로 연결되는지 확인합니다.
- Cloudflare는 기본적으로 HTTPS를 자동으로 적용해주므로, 보안 연결로 접속되는지 확인합니다.

## 4단계: 서브 경로 리디렉션 설정 (Vercel 앱 연결)

추가적으로, 특정 서브 경로를 다른 Vercel 앱으로 리디렉션해야 하는 경우, Cloudflare의 Redirect Rules 기능을 활용할 수 있습니다. 저는 `/ai1`과 `/ai2` 경로를 각각 다른 Vercel 앱으로 연결했습니다.

Cloudflare > Rules > Redirect Rules 에서 다음 설정을 추가합니다.

### 리디렉션 1: `/ai1` → ai-syllable-showdown

```
Source URL: log8.kr/ai1*
Target URL: https://ai-syllable-showdown.vercel.app/$1
Status Code: 302 Temporary Redirect
```

### 리디렉션 2: `/ai2` → ai-battle

```
Source URL: log8.kr/ai2*
Target URL: https://ai-battle-5soxib779-iisweetheartiis-projects.vercel.app/$1
Status Code: 302 Temporary Redirect
```

---

이 가이드가 여러분의 블로그 운영에 도움이 되기를 바랍니다! 다음 글에서는 블로그 수익화에 대한 이야기를 더 자세히 다루겠습니다.
