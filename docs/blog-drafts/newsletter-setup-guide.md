# 📧 Resend 뉴스레터 설정 가이드

이 가이드는 **Resend**를 사용하여 블로그에 뉴스레터 구독 기능을 추가하는 방법을 설명합니다.

---

## 🎯 구현할 기능

1. ✅ **구독 폼** - 블로그에 이메일 구독 위젯
2. ✅ **환영 이메일** - 구독 시 자동 발송
3. ✅ **새 포스트 알림** - 새 글 발행 시 이메일 발송
4. ✅ **구독 취소** - 원클릭 구독 해지

---

## 📦 1단계: Resend 계정 생성

### 1.1 가입

1. https://resend.com 접속
2. **Start Building** 클릭
3. GitHub 계정으로 가입 (무료)

### 1.2 API 키 발급

1. Dashboard → **API Keys** 메뉴
2. **Create API Key** 클릭
3. Name: `Newsletter` 입력
4. Permission: **Full Access** 선택
5. API Key 복사 (한 번만 표시됨!)

```
예시: re_123abc456def789ghi...
```

### 1.3 도메인 인증 (선택적, 권장)

1. Dashboard → **Domains** 메뉴
2. **Add Domain** 클릭
3. 도메인 입력: `log8.kr`
4. DNS 레코드 추가 (Cloudflare DNS에서)

**또는 테스트용 이메일 사용**:

- `onboarding@resend.dev`에서 발송 가능 (무료 플랜)

---

## 🔐 2단계: 환경 변수 설정

### 2.1 로컬 환경

`.env` 파일 생성:

```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=newsletter@log8.kr
# 또는 테스트용: onboarding@resend.dev
```

### 2.2 Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → `My_Website_Nextjs`
2. **Settings** → **Environment variables**
3. **Add variable** 클릭

| Name             | Value                | Environment          |
| ---------------- | -------------------- | -------------------- |
| `RESEND_API_KEY` | `re_your_key...`     | Production + Preview |
| `FROM_EMAIL`     | `newsletter@log8.kr` | Production + Preview |

---

## 💻 3단계: 패키지 설치

```bash
# Resend SDK
pnpm add resend

# (선택) React Email 템플릿
pnpm add @react-email/components
```

---

## 🔧 4단계: API 엔드포인트 구현

### 4.1 구독 API

`src/pages/api/newsletter/subscribe.ts`:

```typescript
import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    // 이메일 유효성 검사
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
      });
    }

    // Resend Audience에 구독자 추가
    const { data, error } = await resend.contacts.create({
      email: email,
      audienceId: import.meta.env.RESEND_AUDIENCE_ID, // Resend에서 생성
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // 환영 이메일 발송
    await resend.emails.send({
      from: import.meta.env.FROM_EMAIL,
      to: email,
      subject: "🎉 김덕환의 블로그 구독을 환영합니다!",
      html: `
        <h1>구독해주셔서 감사합니다!</h1>
        <p>새로운 블로그 포스트가 발행되면 이메일로 알려드리겠습니다.</p>
        <p>- 김덕환</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
```

### 4.2 구독 취소 API

`src/pages/api/newsletter/unsubscribe.ts`:

```typescript
import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    const { error } = await resend.contacts.remove({
      email: email,
      audienceId: import.meta.env.RESEND_AUDIENCE_ID,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
```

---

## 🎨 5단계: 구독 폼 컴포넌트

### 5.1 NewsletterForm 컴포넌트

`src/components/newsletter/NewsletterForm.astro`:

```astro
---
// No server-side props needed
---

<div
  class="newsletter-widget bg-gradient-to-r from-primary to-accent p-8 rounded-xl shadow-lg my-12"
>
  <div class="max-w-2xl mx-auto text-center">
    <h3 class="text-2xl font-bold text-white mb-2">📧 새 글 알림 받기</h3>
    <p class="text-white/90 mb-6">새로운 블로그 포스트가 발행되면 이메일로 알려드립니다.</p>

    <form id="newsletter-form" class="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        id="email-input"
        placeholder="your@email.com"
        required
        class="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 outline-none"
      />
      <button
        type="submit"
        class="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        구독하기
      </button>
    </form>

    <p id="message" class="mt-4 text-sm text-white"></p>
  </div>
</div>

<script>
  const form = document.getElementById("newsletter-form") as HTMLFormElement;
  const input = document.getElementById("email-input") as HTMLInputElement;
  const message = document.getElementById("message") as HTMLParagraphElement;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = input.value;
    const button = form.querySelector("button") as HTMLButtonElement;
    const originalText = button.textContent;

    button.textContent = "처리 중...";
    button.disabled = true;

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = "✅ 구독되었습니다! 환영 이메일을 확인해주세요.";
        message.className = "mt-4 text-sm text-green-200 font-semibold";
        input.value = "";
      } else {
        message.textContent = `❌ 오류: ${data.error}`;
        message.className = "mt-4 text-sm text-red-200";
      }
    } catch (error) {
      message.textContent = "❌ 네트워크 오류가 발생했습니다.";
      message.className = "mt-4 text-sm text-red-200";
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  });
</script>

<style>
  .newsletter-widget {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  }
</style>
```

### 5.2 블로그 포스트에 삽입

`src/layouts/BlogPost.astro`에 추가:

```astro
---
import NewsletterForm from "@/components/newsletter/NewsletterForm.astro";
---

<!-- 기존 포스트 내용 -->
<slot />

<!-- 포스트 끝에 뉴스레터 폼 추가 -->
<NewsletterForm />

<!-- 댓글 섹션 -->
<GiscusComments />
```

---

## 📨 6단계: 새 포스트 이메일 발송

### 6.1 수동 발송 스크립트

`scripts/send-newsletter.ts`:

```typescript
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewPostEmail(postTitle: string, postUrl: string) {
  const { data, error } = await resend.broadcasts.create({
    audienceId: process.env.RESEND_AUDIENCE_ID!,
    from: process.env.FROM_EMAIL!,
    subject: `📝 새 글: ${postTitle}`,
    html: `
      <h1>${postTitle}</h1>
      <p>새로운 블로그 포스트가 발행되었습니다!</p>
      <a href="${postUrl}" style="display: inline-block; padding: 12px 24px; background: #485E8E; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        글 읽으러 가기 →
      </a>
      <hr style="margin: 32px 0;" />
      <p style="font-size: 12px; color: #666;">
        이 이메일을 더 이상 받고 싶지 않으신가요?
        <a href="https://log8.kr/unsubscribe">구독 취소</a>
      </p>
    `,
  });

  if (error) {
    console.error("Error sending newsletter:", error);
  } else {
    console.log("Newsletter sent!", data);
  }
}

// 사용법:
// pnpm tsx scripts/send-newsletter.ts
sendNewPostEmail("블로그 포스트 제목", "https://log8.kr/blog/post-slug");
```

### 6.2 자동화 (GitHub Actions)

`.github/workflows/newsletter.yml`:

```yaml
name: Send Newsletter on New Post

on:
  push:
    branches: [main]
    paths:
      - "src/content/blog/**"

jobs:
  send-newsletter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Send newsletter
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          RESEND_AUDIENCE_ID: ${{ secrets.RESEND_AUDIENCE_ID }}
          FROM_EMAIL: ${{ secrets.FROM_EMAIL }}
        run: pnpm tsx scripts/send-newsletter.ts
```

---

## 🎨 7단계: React Email 템플릿 (선택)

예쁜 이메일 템플릿:

`emails/new-post.tsx`:

```tsx
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

interface NewPostEmailProps {
  postTitle: string;
  postUrl: string;
  excerpt: string;
}

export default function NewPostEmail({ postTitle, postUrl, excerpt }: NewPostEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{postTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📝 {postTitle}</Heading>
          <Text style={text}>{excerpt}</Text>
          <Link href={postUrl} style={button}>
            글 읽으러 가기 →
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Pretendard, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#485E8E",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  marginTop: "16px",
};
```

---

## ✅ 완료 체크리스트

- [ ] Resend 계정 생성
- [ ] API 키 발급
- [ ] 환경 변수 설정 (로컬 + Cloudflare)
- [ ] Audience 생성 (Resend Dashboard)
- [ ] `resend` 패키지 설치
- [ ] API 엔드포인트 구현
- [ ] 구독 폼 컴포넌트 생성
- [ ] 블로그 포스트에 폼 추가
- [ ] 테스트 구독
- [ ] 환영 이메일 확인
- [ ] (선택) 자동 발송 스크립트 설정

---

## 🧪 테스트

### 로컬 테스트

```bash
pnpm dev
# http://localhost:4321/blog/any-post 방문
# 이메일 입력 → 구독 클릭
```

### Production 테스트

```bash
# main 브랜치에 push → Cloudflare 배포
# https://log8.kr/blog/any-post 방문
# 실제 구독 테스트
```

---

## 📊 모니터링

### Resend Dashboard

- **Emails** 탭: 발송 이메일 확인
- **Contacts** 탭: 구독자 목록
- **Analytics**: 오픈율, 클릭률

---

## 🔧 트러블슈팅

### API 키 오류

```bash
# 환경 변수 확인
echo $RESEND_API_KEY
```

### 이메일 발송 안 됨

- Resend Dashboard → Emails 탭에서 상태 확인
- 도메인 인증 완료 여부 확인
- API 키 권한 확인

### CORS 오류

```typescript
// API에 CORS 헤더 추가
return new Response(JSON.stringify({ success: true }), {
  status: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});
```

---

## 🎯 다음 단계

1. **분석 추가** - 오픈율, 클릭률 추적
2. **세그먼트** - 관심사별 구독자 분류
3. **A/B 테스팅** - 제목, 내용 최적화
4. **자동화** - RSS to Email 완전 자동화

축하합니다! 이제 프로페셔널한 뉴스레터 시스템을 갖추었습니다! 🎊
