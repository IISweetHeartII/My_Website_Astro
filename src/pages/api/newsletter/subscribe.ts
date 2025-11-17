import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY || "dummy_key_for_build");

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    // 이메일 유효성 검사
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Resend Audience에 구독자 추가
    const { data: contactData, error: contactError } = await resend.contacts.create({
      email: email,
      audienceId: import.meta.env.RESEND_AUDIENCE_ID,
    });

    if (contactError) {
      console.error("Resend contact error:", contactError);
      return new Response(JSON.stringify({ error: contactError.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 환영 이메일 발송
    const { error: emailError } = await resend.emails.send({
      from: import.meta.env.FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "🎉 김덕환의 블로그 구독을 환영합니다!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { background: linear-gradient(135deg, #485E8E 0%, #00FF6A 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
              .content { padding: 30px 0; }
              .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
              a { color: #485E8E; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🎉 구독해주셔서 감사합니다!</h1>
              </div>
              <div class="content">
                <p>안녕하세요,</p>
                <p><strong>김덕환의 블로그</strong>를 구독해주셔서 감사합니다!</p>
                <p>새로운 블로그 포스트가 발행되면 이메일로 알려드리겠습니다.</p>
                <p>다음과 같은 주제의 글을 다룹니다:</p>
                <ul>
                  <li>개발 및 기술 블로그</li>
                  <li>AI 활용 및 실습</li>
                  <li>사이드 프로젝트</li>
                  <li>퍼스널 브랜딩</li>
                </ul>
                <p>앞으로 좋은 콘텐츠로 찾아뵙겠습니다!</p>
                <p>감사합니다,<br><strong>김덕환</strong></p>
              </div>
              <div class="footer">
                <p>이 이메일을 더 이상 받고 싶지 않으신가요? <a href="https://log8.kr/unsubscribe">구독 취소</a></p>
                <p>© 2024 김덕환의 WebSite. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend email error:", emailError);
      // 구독은 성공했지만 환영 이메일 실패
      return new Response(
        JSON.stringify({
          success: true,
          warning: "Subscribed but welcome email failed",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, data: contactData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
