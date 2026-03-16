---
theme: default
title: "2주차: 커스텀 훅과 책임 분리"
class: text-center
transition: slide-left
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
css: ../style.css
---

<div class="flex flex-col items-center justify-center h-full gap-6">

<div
  v-motion
  :initial="{ opacity: 0, y: -30 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
  class="badge badge-purple mb-2"
>
  React 중급 스터디 · 2주차
</div>

<h1
  v-motion
  :initial="{ opacity: 0, scale: 0.9 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 700, delay: 150 } }"
  style="font-size: 3rem; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em;"
>
  커스텀 훅과<br>책임 분리
</h1>

<div
  v-motion
  :initial="{ opacity: 0, y: 20 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 350 } }"
  class="text-gray-400 text-lg"
>
  로직은 훅이, 렌더링은 컴포넌트가
</div>

<div
  v-motion
  :initial="{ opacity: 0 }"
  :enter="{ opacity: 1, transition: { duration: 500, delay: 550 } }"
  class="flex gap-3 mt-2"
>
  <span class="badge badge-purple">실제 코드</span>
  <span class="badge badge-blue">Omechu 프로젝트</span>
  <span class="badge badge-green">리팩토링 3케이스</span>
</div>

</div>

---
transition: fade
---

# 오늘 다룰 것

<div class="section-divider mt-1 mb-6" />

<div class="grid grid-cols-1 gap-4 mt-4">

<div
  v-motion
  :initial="{ opacity: 0, x: -30 }"
  :enter="{ opacity: 1, x: 0, transition: { duration: 450, delay: 100 } }"
  class="dk-card flex items-center gap-5"
>
  <div class="case-number-sm" style="color: var(--dk-red); -webkit-text-fill-color: var(--dk-red); filter: none;">01</div>
  <div>
    <div class="font-bold text-lg" style="color: var(--dk-red);">Toast 로직이 10개 파일에서 복붙되고 있다</div>
    <div class="text-sm" style="color: var(--dk-text-muted);">중복 제거 + 타이머 메모리 누수 수정</div>
  </div>
</div>

<div
  v-motion
  :initial="{ opacity: 0, x: -30 }"
  :enter="{ opacity: 1, x: 0, transition: { duration: 450, delay: 250 } }"
  class="dk-card flex items-center gap-5"
>
  <div class="case-number-sm" style="color: var(--dk-yellow); -webkit-text-fill-color: var(--dk-yellow); filter: none;">02</div>
  <div>
    <div class="font-bold text-lg" style="color: var(--dk-yellow);">컴포넌트 하나가 상태 7개를 들고 있다</div>
    <div class="text-sm" style="color: var(--dk-text-muted);">상태와 핸들러를 전용 훅으로 추출</div>
  </div>
</div>

<div
  v-motion
  :initial="{ opacity: 0, x: -30 }"
  :enter="{ opacity: 1, x: 0, transition: { duration: 450, delay: 400 } }"
  class="dk-card flex items-center gap-5"
>
  <div class="case-number-sm" style="color: var(--dk-orange); -webkit-text-fill-color: var(--dk-orange); filter: none;">03</div>
  <div>
    <div class="font-bold text-lg" style="color: var(--dk-orange);">useEffect 2개가 서로 얽혀있다</div>
    <div class="text-sm" style="color: var(--dk-text-muted);">논리적으로 연결된 Effect를 하나의 훅으로</div>
  </div>
</div>

</div>

<div
  v-motion
  :initial="{ opacity: 0 }"
  :enter="{ opacity: 1, transition: { duration: 400, delay: 600 } }"
  class="mt-5"
>

> 모두 현재 운영 중인 [Omechu](https://github.com/Team-Omechu/Omechu-web) 코드베이스에서 가져왔습니다

</div>

---
layout: center
class: text-center
transition: slide-up
---

<div class="flex flex-col items-center justify-center gap-4">

<div
  v-motion
  :initial="{ opacity: 0, scale: 0.7 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 500 } }"
  class="case-number"
>01</div>

<div
  v-motion
  :initial="{ opacity: 0, y: 20 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }"
>
  <div class="text-3xl font-bold text-white mb-2">Toast가 복붙되고 있다</div>
  <div class="text-gray-400 text-lg">10개 파일 · 타이머 cleanup 누락</div>
</div>

<div
  v-motion
  :initial="{ opacity: 0 }"
  :enter="{ opacity: 1, transition: { duration: 400, delay: 400 } }"
  class="badge badge-red mt-2"
>
  메모리 누수 위험
</div>

</div>

---
transition: slide-up
---

# Case 1 — Before: Toast가 복붙되고 있다

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-red">BEFORE</span>
  <a class="gh-link" href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/widgets/auth/sign-up-form/ui/UserInfoFields.tsx#L22-L35" target="_blank">UserInfoFields.tsx:22-35</a>
  <span class="text-sm" style="color: var(--dk-text-muted);">동일 패턴이 <span class="font-bold" style="color: var(--dk-red);">10개 파일</span>에서 반복</span>
</div>

```tsx {all|2-3|5-9}
// 이 조합이 email-inquiry, signup, BasicAllergyForm 등에 모두 존재
const [toastMessage, setToastMessage] = useState("");
const [showToast, setShowToast] = useState(false);

const triggerToast = (msg: string) => {
  setToastMessage(msg);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2500); // ⚠️ timer cleanup 없음
};
```

<div v-click class="box-danger mt-4 text-sm">
  ⚠️ <strong style="color: var(--dk-red);">문제:</strong> 타이머 cleanup이 없어서 컴포넌트 언마운트 후에도 <code>setState</code> 호출 → 메모리 누수 + React 경고
</div>

---
transition: slide-up
---

# Case 1 — After: 이미 훅이 있다

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-green">AFTER</span>
  <a class="gh-link" href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/shared/lib/useToast.ts" target="_blank">shared/lib/useToast.ts</a>
  <span class="text-sm" style="color: var(--dk-text-muted);">누군가 이미 만들어뒀는데 안 쓰이고 있음</span>
</div>

```tsx {all|3-5|7-12|14-20}
export function useToast(options?: { duration?: number }) {
  const { duration = 2500 } = options ?? {};
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setMessage(msg);
    setShow(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShow(false), duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current); // ✅ cleanup
    };
  }, []);

  return { show, message, triggerToast };
}
```

<div v-click class="box-success mt-3 text-sm">
  ✅ <strong style="color: var(--dk-green);">해결:</strong> 10개 파일에서 <code>const &#123; show, message, triggerToast &#125; = useToast()</code> 한 줄로 교체
</div>

---
layout: center
class: text-center
transition: slide-up
---

<div class="case-intro">

<div
  v-motion
  :initial="{ opacity: 0, scale: 0.7 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 500 } }"
  class="case-number case-number-yellow"
>02</div>

<div
  v-motion
  :initial="{ opacity: 0, y: 20 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }"
>
  <div class="text-3xl font-bold text-white mb-2">상태 7개짜리 컴포넌트</div>
  <div class="text-gray-400 text-lg">UserInfoFields.tsx · 하나의 컴포넌트가 너무 많이 알고 있다</div>
</div>

<div
  v-motion
  :initial="{ opacity: 0 }"
  :enter="{ opacity: 1, transition: { duration: 400, delay: 400 } }"
  class="badge badge-yellow mt-2"
>단일 책임 원칙 위반</div>

</div>

---
transition: slide-up
---

# Case 2 — Before: 상태 7개짜리 컴포넌트

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-red">BEFORE</span>
  <a class="gh-link" href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/widgets/auth/sign-up-form/ui/UserInfoFields.tsx#L15-L91" target="_blank">UserInfoFields.tsx:15-91</a>
</div>

```tsx {all|2-8|10-18}
export default function UserInfoFields() {
  // 😵 상태 7개
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [passwordConfirmBlurred, setPasswordConfirmBlurred] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSendCode = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      triggerToast("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    sendCode(emailToSend, {
      onSuccess: (data) => { setIsCodeSent(true); triggerToast(data.message); },
      onError: (e: ApiClientError) => triggerToast(e?.message ?? "전송 실패"),
    });
  };
}
```

---
transition: slide-up
---

# Case 2 — After (1/2): 상태 + sendCode

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-green">AFTER</span>
  <span class="text-sm" style="color: var(--dk-text-muted);">useEmailVerification.ts</span>
</div>

```tsx {all|1-3|5-13}
export function useEmailVerification(email: string, onToast: (msg: string) => void) {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSendCode = useCallback(() => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onToast("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    sendCode(email, {
      onSuccess: (data) => { setIsCodeSent(true); onToast(data.message); },
      onError: (e: ApiClientError) => onToast(e?.message ?? "전송 실패"),
    });
  }, [email, onToast]);

  // ...
}
```

---
transition: slide-up
---

# Case 2 — After (2/2): verifyCode + 사용

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-green">AFTER</span>
  <span class="text-sm" style="color: var(--dk-text-muted);">useEmailVerification.ts</span>
</div>

```tsx {all|1-10|12-16}
  const handleVerifyCode = useCallback((code: string) => {
    const messages: Record<string, string> = {
      V001: "인증번호가 올바르지 않습니다.",
      V002: "인증번호가 만료되었어요.",
    };
    verifyCode({ email, code }, {
      onSuccess: (data) => { setIsVerified(true); onToast(data.message); },
      onError: (e: ApiClientError) =>
        onToast(messages[e?.code ?? ""] ?? "인증 실패"),
    });
  }, [email, onToast]);

  return { isCodeSent, isVerified, handleSendCode, handleVerifyCode };
}

// 컴포넌트에서
const { isCodeSent, isVerified, handleSendCode, handleVerifyCode } =
  useEmailVerification(email, triggerToast); // 상태 7개 → 1줄 ✅
```

<div v-click class="box-primary mt-3 text-sm">
  ✅ 컴포넌트는 <strong style="color: var(--dk-primary-light);">UI만</strong> — 이메일 인증 로직 전체가 훅 안으로
</div>

---
layout: center
class: text-center
transition: slide-up
---

<div class="flex flex-col items-center justify-center gap-4">

<div
  v-motion
  :initial="{ opacity: 0, scale: 0.7 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 500 } }"
  class="case-number case-number-orange"
>03</div>

<div
  v-motion
  :initial="{ opacity: 0, y: 20 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }"
>
  <div class="text-3xl font-bold text-white mb-2">useEffect 2개가 얽혀있다</div>
  <div class="text-gray-400 text-lg">mainpage/page.tsx · 논리적으로 같은 기능이 흩어져 있다</div>
</div>

<div
  v-motion
  :initial="{ opacity: 0 }"
  :enter="{ opacity: 1, transition: { duration: 400, delay: 400 } }"
  class="badge badge-orange mt-2"
>관심사 분리 필요</div>

</div>

---
transition: slide-up
---

# Case 3 — Before: useEffect 2개가 얽혀있다

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-red">BEFORE</span>
  <a class="gh-link" href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/app/(public)/mainpage/page.tsx#L51-L86" target="_blank">mainpage/page.tsx:51-86</a>
</div>

```tsx {all|1-12|14-22}
// Effect 1: 페이지 포커스 때마다 API 재요청
useEffect(() => {
  const onPageShow = () => void refetch();
  const onFocus = () => void refetch();
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("focus", onFocus);
  void refetch();
  return () => {
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("focus", onFocus);
  };
}, [refetch]);

// Effect 2: API 응답 → Store 동기화
useEffect(() => {
  const exceptedMenus = data?.exceptedMenus;
  if (!Array.isArray(exceptedMenus)) return;
  resetExceptions();
  exceptedMenus
    .filter((m) => m?.name?.trim())
    .forEach((m) => addException(m.name.trim()));
}, [data, addException, resetExceptions]);
```

<div v-click class="box-primary mt-3 text-sm">
  🤔 두 Effect가 논리적으로 연결돼 있는데 (같은 기능) 컴포넌트에 흩어져 있음
</div>

---
transition: slide-up
---

# Case 3 — After: 하나의 훅으로

<div class="flex items-center gap-3 mb-3">
  <span class="badge badge-green">AFTER</span>
  <span class="text-sm" style="color: var(--dk-text-muted);">useExceptionMenuSync.ts</span>
</div>

```tsx {all|1-3|5-14|16-21}
export function useExceptionMenuSync() {
  const { data, refetch } = useRecommendManagement();
  const { addException, resetExceptions } = useQuestionAnswerStore();

  useEffect(() => { // Effect 1: 포커스 시 재요청
    const handler = () => void refetch();
    window.addEventListener("pageshow", handler);
    window.addEventListener("focus", handler);
    void refetch();
    return () => {
      window.removeEventListener("pageshow", handler);
      window.removeEventListener("focus", handler);
    };
  }, [refetch]);

  useEffect(() => { // Effect 2: Store 동기화
    if (!Array.isArray(data?.exceptedMenus)) return;
    resetExceptions();
    data.exceptedMenus.forEach((m) => addException(m.name.trim()));
  }, [data, addException, resetExceptions]);
}
```

<div v-click class="box-success mt-3 text-sm">
  ✅ 컴포넌트에서는 <code>useExceptionMenuSync()</code> <strong style="color: var(--dk-green);">한 줄!</strong>
  — useEffect 2개가 훅 안으로 사라짐
</div>

---
transition: slide-up
---

# 세 가지 케이스 정리

<div class="section-divider mt-1 mb-5" />

<div class="grid-3">

<div
  v-motion
  :initial="{ opacity: 0, y: 25 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }"
  class="compare-card compare-card-1"
>
  <div class="compare-num" style="color: var(--dk-red);">01</div>
  <div class="font-bold mb-1" style="color: var(--dk-red);">Toast 중복</div>
  <div class="text-xs mb-2" style="color: var(--dk-text-muted);">10개 파일에서 복붙</div>
  <div class="label-before">before</div>
  <pre class="compare-code"><code>useState("")
useState(false)
setTimeout(...)</code></pre>
  <div class="label-after">after</div>
  <pre class="compare-code compare-code-after"><code>useToast()</code></pre>
</div>

<div
  v-motion
  :initial="{ opacity: 0, y: 25 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 250 } }"
  class="compare-card compare-card-2"
>
  <div class="compare-num" style="color: var(--dk-yellow);">02</div>
  <div class="font-bold mb-1" style="color: var(--dk-yellow);">상태 7개</div>
  <div class="text-xs mb-2" style="color: var(--dk-text-muted);">UserInfoFields.tsx</div>
  <div class="label-before">before</div>
  <pre class="compare-code"><code>useState(false) // x7
handleSendCode()
handleVerifyCode()</code></pre>
  <div class="label-after">after</div>
  <pre class="compare-code compare-code-after"><code>useEmailVerification(
  email, triggerToast
)</code></pre>
</div>

<div
  v-motion
  :initial="{ opacity: 0, y: 25 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 400 } }"
  class="compare-card compare-card-3"
>
  <div class="compare-num" style="color: var(--dk-orange);">03</div>
  <div class="font-bold mb-1" style="color: var(--dk-orange);">Effect 2개</div>
  <div class="text-xs mb-2" style="color: var(--dk-text-muted);">mainpage/page.tsx</div>
  <div class="label-before">before</div>
  <pre class="compare-code"><code>useEffect(() => {
  // 이벤트
}, [refetch])
useEffect(() => {
  // Store 동기화
}, [data])</code></pre>
  <div class="label-after">after</div>
  <pre class="compare-code compare-code-after"><code>useExceptionMenuSync()</code></pre>
</div>

</div>

---
transition: fade
---

# 핵심 원칙

<div class="section-divider mt-1 mb-6" />

<div class="grid grid-cols-1 gap-3">

<div v-click class="dk-card flex items-start gap-4">
  <span class="text-2xl mt-0.5">🎯</span>
  <div>
    <div class="font-bold" style="color: var(--dk-primary-light);">컴포넌트는 무엇을 보여줄지만</div>
    <div class="text-sm mt-1" style="color: var(--dk-text-muted);">로직, 상태, 사이드이펙트는 훅이 책임진다</div>
  </div>
</div>

<div v-click class="dk-card flex items-start gap-4">
  <span class="text-2xl mt-0.5">🔍</span>
  <div>
    <div class="font-bold" style="color: var(--dk-accent);">훅은 이미 만들어져 있을 수 있다</div>
    <div class="text-sm mt-1" style="color: var(--dk-text-muted);">복붙 전에 먼저 <code>shared/lib/</code> 를 확인할 것</div>
  </div>
</div>

<div v-click class="dk-card flex items-start gap-4">
  <span class="text-2xl mt-0.5">⚡</span>
  <div>
    <div class="font-bold" style="color: var(--dk-yellow);">useEffect가 2개 이상 엮이면</div>
    <div class="text-sm mt-1" style="color: var(--dk-text-muted);">같은 관심사를 다루면 → 훅으로 분리할 신호</div>
  </div>
</div>

<div v-click class="dk-card flex items-start gap-4">
  <span class="text-2xl mt-0.5">♻️</span>
  <div>
    <div class="font-bold" style="color: var(--dk-green);">같은 상태 조합이 반복되면</div>
    <div class="text-sm mt-1" style="color: var(--dk-text-muted);">복붙 말고 커스텀 훅을 만들어라</div>
  </div>
</div>

</div>

---
transition: slide-up
---

# 실습 미션

<div class="section-divider mt-1 mb-6" />

<div class="box-primary mb-5">
  <div class="font-bold text-base mb-1" style="color: var(--dk-primary-light);">미션</div>
  내 프로젝트(또는 Omechu)에서 커스텀 훅으로 분리할 수 있는 코드를 찾아 리팩토링하세요
</div>

<div v-clicks class="grid grid-cols-1 gap-3">

<div class="dk-card flex items-center gap-3">
  <span class="badge badge-purple">1</span>
  <span>분리 전 코드 <strong>(before)</strong> + 분리 후 코드 <strong>(after)</strong> PR로 제출</span>
</div>

<div class="dk-card flex items-center gap-3">
  <span class="badge badge-purple">2</span>
  <span>PR에 <strong>"왜 이걸 분리했는지"</strong> 한 문단 설명</span>
</div>

<div class="dk-card flex items-center gap-3">
  <span class="badge badge-purple">3</span>
  <span>팀원 PR에 코드리뷰 최소 <strong>2개</strong></span>
</div>

</div>

<div v-click class="mt-5">

> 💡 찾기 어려우면: 컴포넌트에서 `useState`가 **3개 이상**인 곳부터 보세요

</div>

---
transition: slide-up
---

# 토론 주제

<div class="section-divider mt-1 mb-6" />

<div v-clicks class="grid grid-cols-1 gap-4">

<div class="dk-card">
  <div class="flex items-start gap-3">
    <span class="case-number-sm" style="font-size: 1.5rem; -webkit-text-fill-color: var(--dk-primary-light); color: var(--dk-primary-light); filter: none; background: none;">Q1</span>
    <div>
      <div class="font-semibold mb-1"><code>useToast</code>가 이미 있었는데 왜 안 쓰였을까?</div>
      <div class="text-sm" style="color: var(--dk-text-muted);">팀에서 커스텀 훅을 어떻게 공유하고 문서화할까?</div>
    </div>
  </div>
</div>

<div class="dk-card">
  <div class="flex items-start gap-3">
    <span class="case-number-sm" style="font-size: 1.5rem; -webkit-text-fill-color: var(--dk-accent); color: var(--dk-accent); filter: none; background: none;">Q2</span>
    <div>
      <div class="font-semibold mb-1">훅으로 분리하면 항상 좋을까?</div>
      <div class="text-sm" style="color: var(--dk-text-muted);">오히려 복잡해지는 경우는 언제일까?</div>
    </div>
  </div>
</div>

<div class="dk-card">
  <div class="flex items-start gap-3">
    <span class="case-number-sm" style="font-size: 1.5rem; -webkit-text-fill-color: var(--dk-yellow); color: var(--dk-yellow); filter: none; background: none;">Q3</span>
    <div>
      <div class="font-semibold mb-1"><code>useExceptionMenuSync</code>처럼 이름이 너무 구체적인 훅</div>
      <div class="text-sm" style="color: var(--dk-text-muted);">재사용성 vs 명확성, 어떻게 균형을 잡을까?</div>
    </div>
  </div>
</div>

</div>

---
layout: center
class: text-center
transition: fade
---

<div class="flex flex-col items-center justify-center h-full gap-6">

<div
  v-motion
  :initial="{ opacity: 0, scale: 0.8 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 600 } }"
>
  <div style="font-size: 4rem; font-weight: 900; background: linear-gradient(135deg, #a78bfa, #89b4fa, #c4b5fd); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.5)); line-height: 1.1; letter-spacing: -0.03em;">
    수고하셨습니다!
  </div>
</div>

<div
  v-motion
  :initial="{ opacity: 0, y: 15 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 450, delay: 300 } }"
  class="text-gray-400 text-xl"
>
  다음 주: <span style="color: var(--dk-primary-light); font-weight: 600;">성능 최적화</span>
  <span class="text-gray-500 mx-2">·</span>
  <span class="text-gray-500">useMemo, useCallback, React.memo</span>
</div>

<div
  v-motion
  :initial="{ opacity: 0 }"
  :enter="{ opacity: 1, transition: { duration: 400, delay: 550 } }"
  class="flex gap-3 flex-wrap justify-center mt-2"
>
  <span class="badge badge-purple">PR 마감: 다음 스터디 전날 자정</span>
  <span class="badge badge-blue">코드리뷰 2개 필수</span>
</div>

</div>
