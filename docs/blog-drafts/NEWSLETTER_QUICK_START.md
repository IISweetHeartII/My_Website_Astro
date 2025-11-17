# 📧 뉴스레터 빠른 시작 가이드 (Resend)

**5분이면 완료!** 블로그에 이메일 구독 기능을 추가하세요.

---

## ✅ 이미 완료된 것

- ✅ Resend SDK 설치됨 (`resend` 패키지)
- ✅ API 엔드포인트 생성됨 (`/api/newsletter/subscribe`)
- ✅ 구독 폼 컴포넌트 생성됨
- ✅ 블로그 포스트에 자동 표시됨

**이제 Resend 계정만 만들면 바로 사용 가능합니다!**

---

## 🚀 5분 설정

### 1단계: Resend 계정 생성 (2분)

1. https://resend.com 접속
2. **Start Building** 클릭
3. GitHub 계정으로 가입 (무료)

### 2단계: API 키 발급 (1분)

1. Dashboard → **API Keys** 메뉴
2. **Create API Key** 클릭
3. Name: `Newsletter`, Permission: **Full Access**
4. API 키 복사 (⚠️ 한 번만 표시됩니다!)

```
예시: re_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6
```

### 3단계: Audience 생성 (1분)

1. Dashboard → **Audiences** 메뉴
2. **Create Audience** 클릭
3. Name: `Blog Subscribers` 입력
4. Audience ID 복사

```
예시: aud_A1b2C3d4E5f6G7h8I9j0K1l2
```

### 4단계: Cloudflare 환경 변수 설정 (1분)

1. Cloudflare Dashboard → Workers & Pages → `My_Website_Nextjs`
2. **Settings** → **Environment variables**
3. 다음 3개 변수 추가:

| Name                 | Value                     | Environment          |
| -------------------- | ------------------------- | -------------------- |
| `RESEND_API_KEY`     | `re_your_api_key...`      | Production + Preview |
| `RESEND_AUDIENCE_ID` | `aud_your_audience_id...` | Production + Preview |
| `FROM_EMAIL`         | `onboarding@resend.dev`   | Production + Preview |

**FROM_EMAIL 옵션**:

- 테스트용: `onboarding@resend.dev` (지금 바로 사용 가능)
- 프로덕션용: `newsletter@log8.kr` (도메인 인증 후)

---

## 🎉 완료! 이제 테스트해보세요

### 로컬 테스트 (선택)

```bash
# .env 파일 생성
cat > .env << 'EOF'
RESEND_API_KEY=re_your_api_key_here
RESEND_AUDIENCE_ID=aud_your_audience_id_here
FROM_EMAIL=onboarding@resend.dev
EOF

# 개발 서버 시작
pnpm dev

# http://localhost:4321/blog/any-post 방문
# 뉴스레터 폼에서 이메일 입력 → 구독 클릭
```

### Production 테스트

```bash
# Cloudflare에 배포
git add .
git commit -m "feat: Resend 뉴스레터 기능 추가"
git push origin main

# 2-3분 후 https://log8.kr/blog/any-post 방문
# 실제 이메일로 구독 테스트!
```

---

## 📊 구독자 확인

### Resend Dashboard

1. **Audiences** → `Blog Subscribers` 클릭
2. 구독자 목록 확인
3. 이메일 통계 확인 (오픈율, 클릭률)

### 새 포스트 이메일 발송 (선택)

**수동 발송 (당분간 사용)**:

1. Resend Dashboard → **Broadcasts** 클릭
2. **Create Broadcast** 클릭
3. Audience 선택: `Blog Subscribers`
4. 이메일 작성 후 발송

**자동 발송 (나중에 구현)**:

- GitHub Actions 워크플로우
- RSS to Email 자동화

---

## 🎨 커스터마이징

### 환영 이메일 수정

`src/pages/api/newsletter/subscribe.ts` 파일에서:

```typescript
subject: '🎉 김덕환의 블로그 구독을 환영합니다!',
html: `
  <!-- 여기를 수정하세요 -->
  <h1>구독해주셔서 감사합니다!</h1>
  <p>당신의 메시지를 입력하세요...</p>
`,
```

### 구독 폼 디자인 수정

`src/components/newsletter/NewsletterForm.astro` 파일 수정

---

## 🔐 보안 체크리스트

- [ ] API 키를 `.env`에만 저장 (절대 커밋 금지!)
- [ ] Cloudflare 환경 변수 설정 완료
- [ ] `.gitignore`에 `.env` 포함 확인
- [ ] FROM_EMAIL 도메인 인증 (프로덕션)

---

## 💰 비용

**Resend 무료 플랜**:

- ✅ 3,000 이메일/월
- ✅ 100 구독자
- ✅ 모든 기능 사용 가능
- ✅ 신용카드 불필요

**충분히 시작하기에 넉넉합니다!**

구독자가 늘어나면:

- **Pro**: $20/월 (50,000 이메일, 무제한 구독자)

---

## 🐛 트러블슈팅

### "API key is invalid" 에러

```bash
# Cloudflare 환경 변수 확인
# Settings → Environment variables

# API 키 재발급
# Resend Dashboard → API Keys → Create new
```

### 이메일이 안 와요

- 스팸 폴더 확인
- Resend Dashboard → Emails 탭에서 발송 상태 확인
- `FROM_EMAIL`이 `onboarding@resend.dev`인지 확인 (테스트용)

### 구독 버튼이 작동 안 해요

```bash
# 브라우저 콘솔 확인 (F12)
# API 엔드포인트 확인: /api/newsletter/subscribe
```

---

## 📚 다음 단계

1. **도메인 인증** - `newsletter@log8.kr`로 발송
2. **자동 발송** - 새 포스트 자동 이메일
3. **예쁜 템플릿** - React Email 컴포넌트
4. **분석** - 오픈율, 클릭률 추적

자세한 가이드: [Newsletter Setup Guide](docs/newsletter-setup-guide.md)

---

## 🎊 축하합니다!

이제 블로그가 **프로페셔널한 뉴스레터** 기능을 갖추었습니다!

- ✅ 이메일 구독 기능
- ✅ 자동 환영 이메일
- ✅ 구독자 관리
- ✅ 무료 3,000 이메일/월

**테스트하고 구독자를 모아보세요!** 🚀
