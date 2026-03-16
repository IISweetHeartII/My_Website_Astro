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

# 커스텀 훅과 책임 분리

**React 중급 스터디 — 2주차**

<br>

<span class="text-purple-300 font-bold">실제 코드</span>에서 뽑은 리팩토링 케이스 3가지

---
transition: fade
---

# 오늘 다룰 것

<br>

<v-clicks>

- 🔴 **Case 1** — Toast 로직이 10개 파일에서 복붙되고 있다
- 🟡 **Case 2** — 컴포넌트 하나가 상태 7개를 들고 있다
- 🟠 **Case 3** — useEffect 2개가 서로 얽혀있다

</v-clicks>

<br>

<v-click>

> 모두 현재 운영 중인 [Omechu](https://github.com/Team-Omechu/Omechu-web) 코드베이스에서 가져왔습니다

</v-click>

---
transition: slide-up
---

# Case 1 — Toast가 복붙되고 있다

<div class="text-gray-400 text-sm mb-3">
  <a href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/widgets/auth/sign-up-form/ui/UserInfoFields.tsx#L22-L35" target="_blank">UserInfoFields.tsx:22-35</a>
  · 동일 패턴이 <span class="text-red-400 font-bold">10개 파일</span>에서 반복
</div>

```tsx {all|2-3|5-9}
// 이 조합이 email-inquiry, signup, BasicAllergyForm 등에 모두 존재
const [toastMessage, setToastMessage] = useState("");
const [showToast, setShowToast] = useState(false);

const triggerToast = (msg: string) => {
  setToastMessage(msg);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2500); // timer cleanup 없음 ⚠️
};
```

<div v-click class="box-primary mt-4 text-sm">
  ⚠️ <strong class="text-purple-300">문제:</strong> 타이머 cleanup이 없어서 컴포넌트 언마운트 후 setState 호출 가능
</div>

---
transition: slide-up
---

# Case 1 — 이미 훅이 있다

<div class="text-gray-400 text-sm mb-3">
  <a href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/shared/lib/useToast.ts" target="_blank">shared/lib/useToast.ts</a>
  — 누군가 이미 만들어뒀는데 안 쓰이고 있음
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
      if (timerRef.current) window.clearTimeout(timerRef.current); // cleanup ✅
    };
  }, []);

  return { show, message, triggerToast };
}
```

<div v-click class="box-accent mt-3 text-sm">
  ✅ <strong class="text-blue-300">해결:</strong> 10개 파일에서 <code>const &#123; show, message, triggerToast &#125; = useToast()</code> 한 줄로 교체
</div>

---
transition: slide-up
---

# Case 2 — 상태 7개짜리 컴포넌트

<div class="text-gray-400 text-sm mb-3">
  <a href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/widgets/auth/sign-up-form/ui/UserInfoFields.tsx#L15-L91" target="_blank">UserInfoFields.tsx:15-91</a>
</div>

```tsx {all|2-8|10-25}
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
      onError: (error: unknown) => {
        const e = error as ApiClientError;
        triggerToast(e?.message ?? "인증번호 전송에 실패했습니다.");
      },
    });
  };
  // handleVerifyCode도 비슷한 길이...
}
```

---
transition: slide-up
---

# Case 2 — 훅으로 분리하면

```tsx {all|1-3|5-18|20-24}
// useEmailVerification.ts (새로 만들 훅)
export function useEmailVerification(email: string, onToast: (msg: string) => void) {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSendCode = useCallback(() => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onToast("올바른 이메일 형식을 입력해 주세요."); return;
    }
    sendCode(email, {
      onSuccess: (data) => { setIsCodeSent(true); onToast(data.message); },
      onError: (e: ApiClientError) => onToast(e?.message ?? "전송 실패"),
    });
  }, [email, onToast]);

  const handleVerifyCode = useCallback((code: string) => {
    const messages: Record<string, string> = {
      V001: "인증번호가 올바르지 않습니다.",
      V002: "인증번호가 만료되었어요.",
    };
    verifyCode({ email, code }, {
      onSuccess: (data) => { setIsVerified(true); onToast(data.message); },
      onError: (e: ApiClientError) => onToast(messages[e?.code ?? ""] ?? "인증 실패"),
    });
  }, [email, onToast]);

  return { isCodeSent, isVerified, handleSendCode, handleVerifyCode };
}
```

<div v-click class="box-primary mt-3 text-sm">
  ✅ 컴포넌트에서 <strong class="text-purple-300">상태 7개 → 1줄</strong>로: <code>const &#123; isCodeSent, isVerified, ... &#125; = useEmailVerification(email, triggerToast)</code>
</div>

---
transition: slide-up
---

# Case 3 — useEffect 2개가 얽혀있다

<div class="text-gray-400 text-sm mb-3">
  <a href="https://github.com/Team-Omechu/Omechu-web/blob/main/omechu-app/src/app/(public)/mainpage/page.tsx#L51-L86" target="_blank">mainpage/page.tsx:51-86</a>
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

# Case 3 — 하나의 훅으로

```tsx {all|1-12|14-21|23-25}
// useExceptionMenuSync.ts
export function useExceptionMenuSync() {
  const { data, refetch } = useRecommendManagement();
  const { addException, resetExceptions } = useQuestionAnswerStore();

  // Effect 1: 포커스 시 재요청
  useEffect(() => {
    const handler = () => void refetch();
    window.addEventListener("pageshow", handler);
    window.addEventListener("focus", handler);
    void refetch();
    return () => {
      window.removeEventListener("pageshow", handler);
      window.removeEventListener("focus", handler);
    };
  }, [refetch]);

  // Effect 2: Store 동기화
  useEffect(() => {
    if (!Array.isArray(data?.exceptedMenus)) return;
    resetExceptions();
    data.exceptedMenus
      .filter((m) => m?.name?.trim())
      .forEach((m) => addException(m.name.trim()));
  }, [data, addException, resetExceptions]);
}

// 컴포넌트에서는
export default function MainPage() {
  useExceptionMenuSync(); // 한 줄!
  // ...
}
```

---
transition: slide-up
---

# 세 가지 케이스 정리

<div class="grid grid-cols-3 gap-3 mt-4">

<div class="dk-card">
  <div class="text-red-400 font-bold text-sm mb-2">Case 1 · Toast 중복</div>
  <div class="text-xs text-gray-400 mb-3">10개 파일에서 복붙</div>

  **before**
  ```tsx
  const [msg, setMsg] = useState("")
  const [show, setShow] = useState(false)
  const trigger = (m) => { ... }
  ```
  **after**
  ```tsx
  const { triggerToast } = useToast()
  ```
</div>

<div class="dk-card">
  <div class="text-yellow-400 font-bold text-sm mb-2">Case 2 · 상태 7개</div>
  <div class="text-xs text-gray-400 mb-3">UserInfoFields.tsx</div>

  **before**
  ```tsx
  const [isCodeSent] = useState(false)
  const [isVerified] = useState(false)
  // + 5개 더...
  const handleSendCode = () => { ... }
  const handleVerifyCode = () => { ... }
  ```
  **after**
  ```tsx
  const { isCodeSent, isVerified,
    handleSendCode, handleVerifyCode
  } = useEmailVerification(email, triggerToast)
  ```
</div>

<div class="dk-card">
  <div class="text-orange-400 font-bold text-sm mb-2">Case 3 · Effect 2개</div>
  <div class="text-xs text-gray-400 mb-3">mainpage/page.tsx</div>

  **before**
  ```tsx
  useEffect(() => {
    // 포커스 이벤트 리스너
  }, [refetch])

  useEffect(() => {
    // Store 동기화
  }, [data])
  ```
  **after**
  ```tsx
  useExceptionMenuSync()
  ```
</div>

</div>

---
transition: fade
---

# 핵심 원칙

<br>

<v-clicks>

- **컴포넌트는 무엇을 보여줄지만** — 로직은 훅이 책임진다
- **훅은 이미 만들어져 있을 수 있다** — 먼저 찾아볼 것 (`shared/lib/`)
- **useEffect가 2개 이상 엮이면** — 훅으로 분리할 신호
- **같은 상태 조합이 반복되면** — 복붙 말고 훅을 만들어라

</v-clicks>

---
transition: slide-up
---

# 📋 실습 미션

<br>

**미션:** 내 프로젝트(또는 Omechu)에서 커스텀 훅으로 분리할 수 있는 코드를 찾아 리팩토링하세요

<v-clicks>

- ✅ 분리 전 코드 (before) + 분리 후 코드 (after) PR로 제출
- ✅ PR에 "왜 이걸 분리했는지" 한 문단 설명
- ✅ 팀원 PR에 코드리뷰 최소 2개

</v-clicks>

<v-click>

> 💡 찾기 어려우면: 컴포넌트에서 `useState`가 3개 이상인 곳부터 보세요

</v-click>

---
transition: slide-up
---

# 토론 주제

<br>

<v-clicks>

1. `useToast`가 이미 있었는데 왜 안 쓰였을까? — 팀에서 훅 공유는 어떻게?

2. 훅으로 분리하면 항상 좋을까? — 오히려 복잡해지는 경우는?

3. `useExceptionMenuSync`처럼 이름이 너무 구체적인 훅, 어떻게 생각해?

</v-clicks>

---
layout: center
class: text-center
transition: fade
---

# 수고하셨습니다! 🎉

다음 주: 성능 최적화 (useMemo, useCallback, React.memo)

<br>

<span class="text-sm text-gray-500">PR 마감: 다음 스터디 전날 자정 · 코드리뷰 2개 필수</span>
