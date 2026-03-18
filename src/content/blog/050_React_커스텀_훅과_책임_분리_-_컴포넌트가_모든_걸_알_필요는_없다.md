---
title: "React 커스텀 훅과 책임 분리 — 컴포넌트가 모든 걸 알 필요는 없다"
subtitle: "React 중급 스터디 2주차 발표 자료"
description: "실제 운영 중인 Omechu 프로젝트 코드로 살펴보는 커스텀 훅 리팩토링 3케이스 — Toast 중복, 상태 7개짜리 컴포넌트, 얽힌 useEffect."
publish: true
meta_title: "React 커스텀 훅과 책임 분리 | 김덕환"
meta_description: "실제 Omechu 프로젝트 코드에서 추출한 커스텀 훅 리팩토링 3케이스. Toast 중복 제거, 상태 7개 컴포넌트 분리, useEffect 2개 얽힘 해결까지."
keywords:
  - 커스텀 훅
  - React
  - useEffect
  - 리팩토링
  - 책임 분리
  - 메모리 누수
  - React 중급
og_title: "React 커스텀 훅과 책임 분리"
og_description: "컴포넌트가 모든 걸 알 필요는 없다. 실제 코드에서 뽑은 커스텀 훅 리팩토링 3케이스."
og_type: article
twitter_card: summary_large_image
created_date: 2026-03-16
updated_date: 2026-03-18
category: "개발"
featured_image: /images/blogs/050/050_00_thumbnail_v2.png
featured_image_alt: "React 커스텀 훅 책임 분리 개념 일러스트"
slug: react-custom-hook-separation-of-concerns
tags:
  - React
  - 커스텀훅
  - 리팩토링
  - 중급
---

> 📎 **발표 자료**: [슬라이드 보기 →](/slides/react-week2)

스터디 2주차 주제는 커스텀 훅이었다. 이론 말고, 실제로 운영 중인 [Omechu](https://github.com/Team-Omechu/Omechu-web) 코드베이스를 직접 뜯어서 문제가 되는 패턴을 찾아 발표했다.

총 세 케이스다. 전부 "이건 왜 이렇게 돼 있지?" 싶었던 것들이다.

---

![Omechu 프로젝트 코드에서 발견한 커스텀 훅 리팩토링 3케이스](/images/blogs/050/050_01_tangled-component_v2.png)

## Case 1 — Toast가 10개 파일에서 복붙되고 있다

`UserInfoFields.tsx`를 열었더니 이런 코드가 있었다.

```tsx
const [toastMessage, setToastMessage] = useState("");
const [showToast, setShowToast] = useState(false);

const triggerToast = (msg: string) => {
  setToastMessage(msg);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2500); // ⚠️ timer cleanup 없음
};
```

문제는 이 패턴이 `email-inquiry`, `signup`, `BasicAllergyForm` 등 **10개 파일에 그대로 복붙**되어 있다는 거다.

그리고 `setTimeout`에 cleanup이 없다. 컴포넌트가 언마운트된 후에도 타이머가 살아있어서 `setState`가 호출된다 — 메모리 누수에 React 경고까지.

### 해결 — 근데 훅이 이미 있었다

`shared/lib/useToast.ts`를 보니 누군가 이미 만들어뒀다. 그냥 안 쓰이고 있었을 뿐이다.

```tsx
export function useToast({ duration = 2500 } = {}) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setMessage(msg);
    setShow(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShow(false), duration);
  }, [duration]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current); // ✅ cleanup
  }, []);

  return { show, message, triggerToast };
}
```

`useRef`로 타이머를 추적하고, `useEffect` cleanup에서 확실히 정리한다. 10개 파일에서 복붙하던 코드가 `useToast()` 한 줄로 바뀐다.

발표하면서 이 케이스가 제일 재미있었다. "왜 안 쓰이고 있었을까?"가 토론 주제 중 하나였는데 — 팀에서 공유 훅을 어떻게 문서화하고 알릴 건지 생각해보게 됐다.

---

## Case 2 — 컴포넌트 하나가 상태 7개를 들고 있다

`UserInfoFields.tsx`에는 Toast 문제 말고도 또 있었다.

```tsx
export default function UserInfoFields() {
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [passwordConfirmBlurred, setPasswordConfirmBlurred] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // 😵 상태 6개
  const [showToast, setShowToast] = useState(false);    // 😵 + 1개 더

  const handleSendCode = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSend)) {
      triggerToast("올바른 이메일 형식을 입력해 주세요."); return;
    }
    sendCode(emailToSend, {
      onSuccess: (data) => { setIsCodeSent(true); triggerToast(data.message); },
      onError: (e: ApiClientError) => triggerToast(e?.message ?? "전송 실패"),
    });
  };
}
```

상태 7개에 핸들러까지. 이 컴포넌트는 이메일 인증 로직을 직접 다 알고 있다.

### 해결 — `useEmailVerification`으로 추출

이메일 인증에 관련된 상태와 핸들러를 전용 훅으로 뺐다.

```tsx
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
```

Toast 콜백은 `onToast` 파라미터로 주입받는다. 훅이 Toast를 직접 알 필요가 없다.

컴포넌트에서는 이렇게 된다.

```tsx
const { isCodeSent, isVerified, handleSendCode, handleVerifyCode } =
  useEmailVerification(email, triggerToast); // 상태 7개 → 1줄 ✅
```

컴포넌트는 UI만 그린다. 이메일 인증이 어떻게 동작하는지는 훅이 책임진다.

---

![커스텀 훅으로 로직과 UI가 분리된 구조](/images/blogs/050/050_02_separated-structure_v2.png)

## Case 3 — useEffect 2개가 서로 얽혀있다

`mainpage/page.tsx`에 이런 코드가 있었다.

```tsx
// Effect 1: 포커스 때마다 API 재요청
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

// Effect 2: API 응답 → Store 동기화
useEffect(() => {
  if (!Array.isArray(data?.exceptedMenus)) return;
  resetExceptions();
  data.exceptedMenus.forEach((m) => addException(m.name.trim()));
}, [data, addException, resetExceptions]);
```

두 Effect가 **논리적으로 같은 기능** — "예외 메뉴를 가져와서 Store에 동기화한다" — 를 하고 있는데 컴포넌트 안에 흩어져 있다.

### 해결 — `useExceptionMenuSync`로 묶기

```tsx
export function useExceptionMenuSync() {
  const { data, refetch } = useRecommendManagement();
  const { addException, resetExceptions } = useQuestionAnswerStore();

  useEffect(() => {
    const h = () => void refetch();
    window.addEventListener("pageshow", h);
    window.addEventListener("focus", h);
    void refetch();
    return () => {
      window.removeEventListener("pageshow", h);
      window.removeEventListener("focus", h);
    };
  }, [refetch]);

  useEffect(() => {
    if (!Array.isArray(data?.exceptedMenus)) return;
    resetExceptions();
    data.exceptedMenus.forEach((m) => addException(m.name.trim()));
  }, [data, addException, resetExceptions]);
}
```

컴포넌트에서는 `useExceptionMenuSync()` 한 줄. `useEffect` 2개가 훅 안으로 사라진다.

이 케이스의 핵심은 **이름**이다. `useExceptionMenuSync`라는 이름을 붙이는 순간 "이 두 Effect는 같은 일을 하고 있다"는 게 명확해진다.

---

![훅 이름으로 관심사가 명확해지는 구조](/images/blogs/050/050_03_hook-composition_v2.png)

## 정리 — 훅을 분리하는 신호 4가지

세 케이스를 돌아보면 패턴이 보인다.

| 신호 | 해결 |
|------|------|
| 같은 상태 조합이 여러 파일에서 반복된다 | 커스텀 훅으로 추출 |
| 컴포넌트에 `useState`가 3개 이상 몰려있다 | 관련 상태 + 핸들러를 훅으로 분리 |
| `useEffect` 2개가 논리적으로 같은 기능을 한다 | 하나의 훅으로 묶기 |
| 분리하기 전에 `shared/lib/`를 먼저 확인한다 | 이미 만들어진 훅이 있을 수 있다 |

---

커스텀 훅이 "로직을 묶는 도구"라고만 생각했는데, 이름을 붙이는 순간 **관심사를 명확히 선언하는 행위**가 된다는 걸 느꼈다. `useExceptionMenuSync`라는 이름이 있고 없고의 차이가 컸다.

발표 준비하면서 제일 많이 한 생각: "이건 내가 짠 코드였어도 똑같이 짰겠다." — 그래서 더 와닿았다.

---

*2026년 3월 · React 중급 스터디 2주차*
