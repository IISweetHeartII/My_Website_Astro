---
title: "[홈서버 3편] 포트 포워딩 없이 HTTPS 열기 - Cloudflare Tunnel의 마법 🔒"
description: "공유기 설정 없이, 공인 IP 없이, 무료로 HTTPS 외부 접속 구현하기 - 그리고 새벽 2시의 plist 삽질기"
publish: true
created_date: 2025-09-15
category: DevOps
featured_image: /images/blogs/043/043_00_thumbnail.png
featured_image_alt: "Cloudflare Tunnel로 HTTPS 외부 접속 구현"
slug: cloudflare-tunnel
tags:
  - Cloudflare
  - Tunnel
  - HTTPS
  - SSL
  - 홈서버
  - 네트워크
  - DNS

# AEO (Answer Engine Optimization)
faq:
  - question: "Cloudflare Tunnel을 사용하면 포트 포워딩이 필요 없나요?"
    answer: "네, Cloudflare Tunnel은 맥미니에서 Cloudflare로 Outbound 연결만 하므로 포트 개방이 불필요합니다. 공유기 설정, 공인 IP, DDNS 모두 필요 없습니다."
  - question: "Cloudflare Tunnel로 HTTPS를 무료로 사용할 수 있나요?"
    answer: "네, SSL 인증서가 자동으로 발급되고 90일마다 자동 갱신됩니다. Let's Encrypt 수동 설정 없이 즉시 HTTPS를 사용할 수 있습니다."
  - question: "macOS LaunchDaemon plist 파일의 ProgramArguments는 어떻게 작성하나요?"
    answer: "각 인자를 별도 <string> 태그로 분리해야 합니다. /opt/homebrew/bin/cloudflared, --config, /etc/cloudflared/config.yml, tunnel, run, 터널이름을 각각 별도 태그로 작성합니다."
  - question: "Cloudflare Tunnel Status 1 에러는 어떻게 해결하나요?"
    answer: "plist 파일의 ProgramArguments를 확인하세요. 모든 인자가 별도 <string> 태그로 분리되어 있어야 합니다. 수동 실행이 되는데 서비스가 안 되면 plist 파일 문제입니다."
---

# 포트 포워딩 없이 HTTPS 열기 - Cloudflare Tunnel의 마법 🔒

<!-- 📸 이미지 프롬프트: prompt: "A magic tunnel connecting a home Mac Mini to the Cloudflare cloud network with HTTPS lock icons, orange Cloudflare logo, secure encrypted connection visualization, flat digital illustration, modern tech style", aspect_ratio: "16:9", session_id: "blog-043", save_as: "043_00_thumbnail.png" -->

## 문제: localhost에서 벗어나고 싶다

지난 편에서 우리는 `http://localhost:8080`에서 Spring Boot를 성공적으로 실행했습니다.

하지만 문제가 있죠:

```
❌ http://192.168.0.61:8080  ← 로컬 네트워크에서만 접속 가능
❌ HTTP (보안 취약)
❌ 외부 인터넷에서 접속 불가
```

**목표:**

```
✅ https://api.yourdomain.com  ← 전 세계 어디서나 접속
✅ HTTPS (SSL 암호화)
✅ 포트 포워딩 없이!
```

이걸 어떻게 할까요?

## 전통적인 방법: 포트 포워딩의 지옥 🔥

### 옛날 방식 (2010년대)

1. **공유기 설정 페이지 접속** (192.168.0.1)
   - 공유기 비밀번호 찾기 (보통 잊어버림)
   - DMZ 또는 포트 포워딩 설정
   - 8080 → 192.168.0.61:8080 매핑

2. **공인 IP 확인**
   - `curl ifconfig.me` → 123.456.789.12
   - 하지만! 유동 IP라서 재부팅하면 바뀜 😱

3. **DDNS 설정** (공인 IP 변경 추적)
   - No-IP, DuckDNS 등 가입
   - 스크립트로 IP 업데이트

4. **SSL 인증서 발급**
   - Let's Encrypt 설치
   - certbot 설정
   - 90일마다 갱신

5. **보안 설정**
   - 방화벽 규칙
   - fail2ban 설치 (무차별 대입 공격 방어)
   - 포트 변경 (8080 → 20443?)

**소요 시간: 반나절 이상** 😫

### 문제점

- 🔴 **복잡함**: 5단계나 되는 설정
- 🔴 **보안 위험**: 홈 네트워크 포트 개방
- 🔴 **유지보수**: 인증서 갱신, IP 변경 추적
- 🔴 **공유기 의존**: 공유기 지원 필요
- 🔴 **DDoS 취약**: 공인 IP 노출

<!-- 📸 이미지 프롬프트: prompt: "Old router configuration nightmare versus simple Cloudflare Tunnel setup, left side shows messy port forwarding diagrams with red warning signs, right side shows clean simple tunnel diagram with green checkmarks, before-and-after comparison, flat illustration", aspect_ratio: "16:9", session_id: "blog-043", save_as: "043_01_tunnel-vs-traditional.png" -->

## 현대적인 방법: Cloudflare Tunnel ✨

### Cloudflare Tunnel이란?

Cloudflare가 제공하는 **무료** 터널 서비스입니다.

```
┌─────────────────────────────────────────────┐
│  사용자 (전 세계 어디든)                     │
│  https://api.yourdomain.com                 │
└─────────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────────┐
│        Cloudflare Edge Network              │
│   - SSL 인증서 자동 발급                    │
│   - DDoS 보호                               │
│   - CDN 캐싱                                │
└─────────────────────────────────────────────┘
                    ↓ 암호화된 터널
┌─────────────────────────────────────────────┐
│  맥미니 (192.168.0.61, 로컬 네트워크)        │
│  cloudflared (Outbound 연결만)              │
│  http://localhost:8080                      │
└─────────────────────────────────────────────┘
```

### 핵심 원리

1. **맥미니에서 Cloudflare로 연결** (Outbound)
   - 방화벽 통과 가능 (나가는 연결이니까!)
   - 포트 개방 불필요

2. **Cloudflare가 중간에서 HTTPS 처리**
   - SSL 인증서 자동 발급
   - 사용자 요청을 터널로 전달

3. **터널을 통해 맥미니로 전달**
   - 암호화된 연결
   - localhost:8080으로 프록시

### 장점

- ✅ **무료!** (개인 사용)
- ✅ **포트 포워딩 불필요**
- ✅ **자동 HTTPS** (인증서 관리 없음)
- ✅ **DDoS 보호** (Cloudflare가 처리)
- ✅ **공인 IP 불필요**
- ✅ **5분이면 설정 완료**

너무 좋은데요? 🤩

## Cloudflare 계정 & 도메인 준비

### 필요한 것

1. **Cloudflare 계정** (무료 가입)
   - https://dash.cloudflare.com

2. **도메인** (Cloudflare에 등록된)
   - 저는 `log8.kr` 사용 중
   - 도메인 구매: Namecheap, GoDaddy 등
   - Cloudflare에 네임서버 변경

⚠️ **도메인이 없다면?**

- DuckDNS 같은 무료 DDNS는 Cloudflare Tunnel과 호환 안 됨
- 도메인 구매 추천 (연 ₩10,000~₩15,000)

## cloudflared 설치

### Homebrew로 설치

```bash
ssh sweetheart@192.168.0.61
```

맥미니에 접속 후:

```bash
brew install cloudflare/cloudflare/cloudflared
```

설치 진행...

```
==> Downloading https://github.com/cloudflare/cloudflared/releases/...
==> Installing cloudflared
🍺  /opt/homebrew/Cellar/cloudflared/2024.11.0: 5 files, 50MB
```

### 설치 확인

```bash
cloudflared --version
```

출력:

```
cloudflared version 2024.11.0 (built 2024-11-15-1234)
```

완료! ✅

## Cloudflare 로그인

### 터미널에서 로그인

```bash
cloudflared tunnel login
```

명령어 실행 시:

```
Please open the following URL in a browser:
https://dash.cloudflare.com/argotunnel?callback=https://...
```

자동으로 브라우저가 열립니다! (안 열리면 URL 복사해서 열기)

### 브라우저에서

1. Cloudflare 로그인
2. 도메인 선택 (`log8.kr`)
3. **Authorize** 클릭

### 터미널 확인

```
You have successfully logged in.
If you wish to copy your credentials to a server, they have been saved to:
/Users/sweetheart/.cloudflared/cert.pem
```

인증 완료! 🎉

## 터널 생성

### 터널 생성 명령어

```bash
cloudflared tunnel create mac-mini-umc
```

출력:

```
Tunnel credentials written to /Users/sweetheart/.cloudflared/c8020eea-444c-41eb-85c8-302e025fe1cd.json
Created tunnel mac-mini-umc with id c8020eea-444c-41eb-85c8-302e025fe1cd
```

**터널 ID**: `c8020eea-444c-41eb-85c8-302e025fe1cd` (저장해두세요!)

### 터널 목록 확인

```bash
cloudflared tunnel list
```

출력:

```
ID                                   NAME           CREATED
c8020eea-444c-41eb-85c8-302e025fe1cd mac-mini-umc   2025-01-17T14:30:00Z
```

완벽! ✅

## 설정 파일 작성

### 시스템 레벨 디렉토리 생성

나중에 서비스로 실행할 거라서 `/etc`에 설정 파일을 둡니다.

```bash
sudo mkdir -p /etc/cloudflared
```

### credentials 파일 복사

```bash
sudo cp ~/.cloudflared/c8020eea-444c-41eb-85c8-302e025fe1cd.json \
  /etc/cloudflared/
```

### config.yml 생성

```bash
sudo nano /etc/cloudflared/config.yml
```

내용 입력:

```yaml
tunnel: mac-mini-umc
credentials-file: /etc/cloudflared/c8020eea-444c-41eb-85c8-302e025fe1cd.json

ingress:
  - hostname: spring-swagger-api.log8.kr
    service: http://localhost:8080
  - service: http_status:404
```

저장: `Ctrl + O` → `Enter` → `Ctrl + X`

### 설정 파일 설명

- `tunnel`: 터널 이름
- `credentials-file`: 인증 정보 파일 경로
- `ingress`: 라우팅 규칙
  - `spring-swagger-api.log8.kr` → `localhost:8080` 연결
  - 나머지는 404 반환

## DNS 라우팅 설정

### CNAME 레코드 자동 생성

```bash
cloudflared tunnel route dns mac-mini-umc spring-swagger-api.log8.kr
```

출력:

```
Added CNAME spring-swagger-api.log8.kr which will route to this tunnel.
```

### Cloudflare 대시보드 확인

https://dash.cloudflare.com → 도메인 선택 → **DNS**

새 레코드 확인:

| Type  | Name               | Content                                               | Proxy status |
| ----- | ------------------ | ----------------------------------------------------- | ------------ |
| CNAME | spring-swagger-api | c8020eea-444c-41eb-85c8-302e025fe1cd.cfargotunnel.com | Proxied 🟠   |

**Proxied (오렌지 구름)** 상태여야 합니다! ✅

## 터널 테스트 실행

### 포그라운드 모드로 실행

```bash
cloudflared tunnel --config /etc/cloudflared/config.yml run mac-mini-umc
```

출력:

```
2025-01-17T14:35:00Z INF Starting tunnel tunnelID=c8020eea-444c-41eb-85c8-302e025fe1cd
2025-01-17T14:35:01Z INF Connection 0 registered
2025-01-17T14:35:01Z INF Connection 1 registered
2025-01-17T14:35:01Z INF Connection 2 registered
2025-01-17T14:35:01Z INF Connection 3 registered
```

**4개의 연결**이 생성되었네요! (로드 밸런싱)

### 새 터미널에서 테스트

Windows PC에서:

```bash
curl https://spring-swagger-api.log8.kr/actuator/health
```

응답:

```json
{
  "status": "UP"
}
```

**HTTPS로 접속됩니다!** 🎉🎉🎉

### 브라우저 테스트

Chrome에서:

```
https://spring-swagger-api.log8.kr/swagger-ui.html
```

**Swagger UI가 보입니다!** 🌐✨

인증서 확인 (자물쇠 아이콘 클릭):

```
발급자: Cloudflare Inc
유효 기간: 2025-01-17 ~ 2025-04-17
```

**SSL 인증서 자동 발급!** 🔒

## 자동 시작 설정 (macOS LaunchDaemon)

터미널 끄면 터널도 종료되니까, 백그라운드 서비스로 등록해야겠죠?

### plist 파일 생성

```bash
sudo nano /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

**전체 내용 입력:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.cloudflared</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>--config</string>
        <string>/etc/cloudflared/config.yml</string>
        <string>tunnel</string>
        <string>run</string>
        <string>mac-mini-umc</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/cloudflared.out.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/cloudflared.err.log</string>
</dict>
</plist>
```

⚠️ **중요!** `ProgramArguments`가 완전해야 합니다:

- `/opt/homebrew/bin/cloudflared`
- `--config`
- `/etc/cloudflared/config.yml`
- `tunnel`
- `run`
- `mac-mini-umc`

이 중 하나라도 빠지면 Status 1 에러! (제가 겪은 삽질... 😭)

### 권한 설정

```bash
sudo chown root:wheel /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo chmod 644 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

### 서비스 로드 및 시작

```bash
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

### 상태 확인

```bash
sudo launchctl list | grep cloudflare
```

출력:

```
-    0    com.cloudflare.cloudflared
```

**Status: 0** (성공!) ✅

만약 Status가 **1**이면? → 다음 섹션으로!

<!-- 📸 이미지 프롬프트: prompt: "Developer at 2am staring at a terminal showing Status 1 error, empty log file, frustrated expression with coffee cup and dark room, blue screen glow, flat cartoon style illustration", aspect_ratio: "16:9", session_id: "blog-043", save_as: "043_02_status1-debug.png" -->

## 🔧 삽질 기록: Status 1 에러와의 전쟁

### 새벽 2시의 악몽

서비스를 시작했는데...

```bash
sudo launchctl list | grep cloudflare
```

출력:

```
-    1    com.cloudflare.cloudflared
```

**Status: 1** (실패!) ❌

로그를 확인했습니다:

```bash
sudo tail /var/log/cloudflared.err.log
```

...아무것도 없음. 😱

### 첫 번째 시도: 수동 실행

혹시 명령어가 틀렸나?

```bash
/opt/homebrew/bin/cloudflared --config /etc/cloudflared/config.yml tunnel run mac-mini-umc
```

이건 잘 됨! 그럼 plist 파일 문제?

### 두 번째 시도: plist 파일 확인

```bash
cat /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

발견!

```xml
<key>ProgramArguments</key>
<array>
    <string>/opt/homebrew/bin/cloudflared</string>
</array>
```

**헐... `tunnel run mac-mini-umc` 부분이 없었어요!** 😭

즉, `cloudflared`만 실행되고 끝난 거죠.

### 세 번째 시도: 완전한 ProgramArguments

```xml
<key>ProgramArguments</key>
<array>
    <string>/opt/homebrew/bin/cloudflared</string>
    <string>--config</string>
    <string>/etc/cloudflared/config.yml</string>
    <string>tunnel</string>
    <string>run</string>
    <string>mac-mini-umc</string>
</array>
```

각 인자를 별도 `<string>` 태그로!

### 재시작

```bash
sudo launchctl unload /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

### 상태 확인

```bash
sudo launchctl list | grep cloudflare
```

출력:

```
73421    0    com.cloudflare.cloudflared
```

**PID 출현! Status 0!** 🎉🎉🎉

### 로그 확인

```bash
sudo tail -f /var/log/cloudflared.out.log
```

```
2025-01-17T18:45:23Z INF Starting tunnel tunnelID=c8020eea...
2025-01-17T18:45:24Z INF Connection 0 registered
2025-01-17T18:45:24Z INF Connection 1 registered
...
```

**드디어 성공!** 😭✨

새벽 2시에 해결했습니다... (그날 밤 3시간 삽질)

## 최종 테스트

### 외부 접속

스마트폰 (LTE, Wi-Fi 끄고):

```
https://spring-swagger-api.log8.kr/swagger-ui.html
```

**접속됩니다!** 📱✅

### HTTPS 확인

```bash
curl -I https://spring-swagger-api.log8.kr
```

출력:

```
HTTP/2 200
date: Thu, 17 Jan 2025 10:00:00 GMT
content-type: text/html
server: cloudflare
cf-ray: 85e3f2a1b8c4d5e6-ICN
```

**HTTP/2 + Cloudflare!** 🚀

### 응답 시간 측정

```bash
time curl https://spring-swagger-api.log8.kr/actuator/health
```

출력:

```
{"status":"UP"}
real    0m0.234s
```

**234ms** - Cloudflare 경유치고 빠른 편이네요!

## 보안 체크리스트 🔒

### ✅ 완료된 보안 설정

- [x] **HTTPS 암호화** (TLS 1.3)
- [x] **포트 개방 없음** (Outbound만)
- [x] **공인 IP 숨김** (Cloudflare가 앞단)
- [x] **DDoS 보호** (Cloudflare가 처리)
- [x] **자동 인증서 갱신**

### 🔐 추가 보안 옵션 (선택)

#### Cloudflare Access Policy

API를 공개하고 싶지 않다면 인증 추가 가능:

1. Cloudflare Zero Trust → **Access** → **Applications**
2. **Add an application** → Self-hosted
3. Policy 설정:
   - 이메일 인증
   - Google OAuth
   - GitHub OAuth

접속 시 로그인 페이지가 나타남!

#### Rate Limiting

DDoS 방지:

- Cloudflare Dashboard → **Security** → **WAF**
- Rate Limiting Rules 추가
- 예: 1분에 100 요청 제한

## 비용 총정리 💰

### Cloudflare Tunnel

```
┌────────────────────────────────────┐
│  Cloudflare Tunnel (개인 사용)      │
│  월 비용: ₩0 (무료!)               │
└────────────────────────────────────┘
```

무료 플랜 제한:

- 무제한 터널
- 무제한 트래픽
- 무제한 도메인

⚠️ **유료 전환 조건:**

- 월 방문자 100만 명 초과
- 엔터프라이즈 기능 필요 (Zero Trust 고급 기능)

개인 프로젝트는 **평생 무료!** 🎉

### 전체 비용 (vs AWS)

```
┌────────────────────────────────────────────┐
│  AWS ALB + ACM (HTTPS)                     │
│  월 ₩20,000 + ₩35,000 = ₩55,000          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  맥미니 + Cloudflare Tunnel                │
│  전기세 ₩1,300 + ₩0 = ₩1,300             │
└────────────────────────────────────────────┘

💰 월 절감액: ₩53,700
💰 연 절감액: ₩644,400 (64만 원!)
```

## 성능 비교

### 응답 시간

| 항목              | 지연 시간 |
| ----------------- | --------- |
| localhost         | 2ms       |
| 로컬 네트워크     | 5ms       |
| Cloudflare Tunnel | 230ms     |
| AWS Seoul         | 180ms     |

Cloudflare가 약간 느리지만, **토이 프로젝트에는 충분**합니다!

### 트래픽 제한

- AWS: 데이터 전송 비용 (GB당 ₩130)
- Cloudflare: **무제한** ✨

## 다음 편 예고

이제 외부에서 HTTPS로 접속 가능해졌습니다! 🌐🔒

하지만 배포는 여전히 수동:

```bash
ssh sweetheart@192.168.0.61
cd ~/projects/umc-9th-springboot-sweetheart
git pull
docker compose up --build -d
```

이걸 **자동화**하고 싶어요!

다음 편에서는:

- 🚀 **git push만으로 자동 배포**
- 🤖 **GitHub Actions CI/CD**
- 🏠 **Self-Hosted Runner** (SSH 타임아웃 해결)
- ✅ **테스트 → 빌드 → 배포 자동화**

> **4편: git push만으로 자동 배포 - Self-Hosted Runner 🚀** (Coming Soon)

---

## 마치며

포트 포워딩 없이 HTTPS를 5분 만에 구현했습니다!

Cloudflare Tunnel은 정말 마법 같아요. AWS ELB/ALB 없이도 프로덕션 수준의 HTTPS를 무료로 쓸 수 있다니! 🤩

plist 파일 삽질은 아팠지만, 그 덕분에 macOS LaunchDaemon을 제대로 이해하게 되었네요. 😅

다음 편도 기대해주세요!

댓글로 여러분의 경험을 공유해주세요! 💬

---

## 이전 글 / 다음 글← [이전: 맥미니 개봉부터 첫 배포까지 🖥️](/mac-mini-setup) | [다음: git push만으로 자동 배포 - Self-Hosted Runner 🚀](/github-actions-cicd) →---

## 시리즈 목차

1. AWS 요금 폭탄 💸에서 맥미니 홈서버로 탈출하기
2. 맥미니 개봉부터 첫 배포까지 🖥️
3. **포트 포워딩 없이 HTTPS 열기 - Cloudflare Tunnel 🔒** ← 현재
4. git push만으로 자동 배포 - Self-Hosted Runner 🚀
5. 삽질 기록 - 트러블슈팅 모음집 🔧
6. 맥미니 홈서버 1개월 후기 & 최종 정산 💰

---

**Tags:** #Cloudflare #Tunnel #HTTPS #SSL #홈서버 #네트워크 #DNS #보안
