---
title: "React 커스텀 훅과 책임 분리 — 컴포넌트가 모든 걸 알 필요는 없다"
subtitle: "React 중급 스터디 2주차 발표 자료"
description: "커스텀 훅으로 로직과 UI를 분리하는 방법, useReducer + Context 조합 패턴, 훅 합성 전략까지 실전 코드로 정리했습니다."
publish: true
meta_title: "React 커스텀 훅과 책임 분리 | 김덕환"
meta_description: "컴포넌트가 상태, 검증, API 호출까지 다 들고 있으면 어떤 문제가 생기는지, 커스텀 훅으로 어떻게 해결하는지 실전 코드로 설명합니다."
keywords:
  - 커스텀 훅
  - React
  - useReducer
  - Context API
  - 훅 합성
  - 책임 분리
  - 리팩토링
  - React 중급
og_title: "React 커스텀 훅과 책임 분리"
og_description: "컴포넌트가 모든 걸 알 필요는 없다. 커스텀 훅으로 책임을 나누는 방법을 실전 코드로 정리했습니다."
og_type: article
twitter_card: summary_large_image
created_date: 2026-03-16
updated_date: 2026-03-18
category: "개발"
featured_image: /images/blogs/050/050_00_thumbnail.png
featured_image_alt: "React 커스텀 훅 책임 분리 개념 일러스트"
slug: react-custom-hook-separation-of-concerns
tags:
  - React
  - 커스텀훅
  - 리팩토링
  - 중급
---

> 📎 **발표 자료**: [슬라이드 보기 →](/slides/react-week2)

컴포넌트 하나가 상태도 들고, 유효성 검사도 하고, API도 직접 호출한다면 — 그건 이미 컴포넌트가 아니라 그냥 뭉텅이다.

스터디 2주차 발표를 준비하면서 커스텀 훅에 대해 다시 제대로 정리해봤다. 아는 것 같았는데 설명하려고 하니 생각보다 모호한 부분이 많았다.

---

![컴포넌트에 모든 로직이 뭉쳐있는 상황](/images/blogs/050/050_01_tangled-component.png)


## 문제: 컴포넌트가 너무 많이 알고 있다

아래 코드를 보면 뭔가 불편하다.

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.includes('@')) setErrors({ email: '이메일 형식 오류' });
    if (password.length < 8) setErrors({ password: '8자 이상 입력' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validate();
    setLoading(true);
    await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
      {errors.email && <span>{errors.email}</span>}
      <button disabled={loading}>로그인</button>
    </form>
  );
}
```

이 컴포넌트는 동시에 네 가지 일을 한다.

- 상태를 들고 있고
- 유효성 검사를 직접 하고
- API를 직접 호출하고
- 화면을 그린다

하나씩 보면 당연해 보이는데, 모아놓으면 테스트도 어렵고 재사용도 안 된다. `validate` 함수를 다른 곳에서 쓰고 싶어도 컴포넌트 안에 묶여 있으니 꺼낼 수가 없다.

---

## 해결: 커스텀 훅으로 로직을 꺼낸다

커스텀 훅은 그냥 `use`로 시작하는 함수다. 안에 다른 훅을 쓸 수 있다는 게 전부다.

```tsx
function useLoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.email.includes('@')) next.email = '이메일 형식 오류';
    if (values.password.length < 8) next.password = '8자 이상 입력';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) });
    setLoading(false);
  };

  return { values, errors, loading, handleChange, handleSubmit };
}
```

그러면 컴포넌트는 이렇게 된다.

```tsx
function LoginForm() {
  const { values, errors, loading, handleChange, handleSubmit } = useLoginForm();

  return (
    <form onSubmit={handleSubmit}>
      <input value={values.email} onChange={handleChange('email')} />
      <input value={values.password} onChange={handleChange('password')} type="password" />
      {errors.email && <span>{errors.email}</span>}
      <button disabled={loading}>로그인</button>
    </form>
  );
}
```

컴포넌트는 이제 **무엇을 보여줄지**만 안다. 어떻게 동작할지는 훅이 책임진다.

---

![로직과 UI가 분리된 구조](/images/blogs/050/050_02_separated-structure.png)


## useReducer + Context — 라이브러리 없이 전역 상태 다루기

커스텀 훅 얘기를 하다 보면 자연스럽게 전역 상태로 이어진다. Zustand나 Redux 없이도 `useReducer + Context` 조합으로 꽤 많은 걸 할 수 있다.

패턴은 세 단계다.

**1. Reducer 정의**

```tsx
type State = { count: number };
type Action = { type: 'INCREMENT' } | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 };
    case 'RESET': return { count: 0 };
    default: return state;
  }
}
```

**2. Context + Provider**

```tsx
const CountContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function CountProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <CountContext.Provider value={{ state, dispatch }}>
      {children}
    </CountContext.Provider>
  );
}
```

**3. 커스텀 훅으로 감싸기**

```tsx
export function useCount() {
  const ctx = useContext(CountContext);
  if (!ctx) throw new Error('CountProvider 밖에서 사용됨');

  return {
    count: ctx.state.count,
    increment: () => ctx.dispatch({ type: 'INCREMENT' }),
    reset: () => ctx.dispatch({ type: 'RESET' }),
  };
}
```

3단계가 핵심이다. Context를 직접 노출하지 않고 커스텀 훅 뒤에 숨겨두면, 나중에 내부 구현을 Zustand로 바꾸든 뭘 바꾸든 사용하는 쪽 코드는 그대로 둘 수 있다.

---

## 훅 합성 — 작은 훅을 레고처럼 조합한다

![훅 합성 구조](/images/blogs/050/050_03_hook-composition.png)


훅을 작은 단위로 쪼개두면 조합해서 쓸 수 있다.

```tsx
// 입력 하나를 담당하는 훅
function useInput(initial: string) {
  const [value, setValue] = useState(initial);
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
  };
}

// 단일 규칙 유효성 검사 훅
function useValidation(value: string, rule: (v: string) => string | null) {
  return { error: rule(value) };
}

// 비동기 제출 + 로딩 상태 훅
function useSubmit(fn: () => Promise<void>) {
  const [loading, setLoading] = useState(false);
  return {
    loading,
    submit: async () => {
      setLoading(true);
      await fn();
      setLoading(false);
    },
  };
}
```

이 세 개를 조합하면 회원가입 폼 훅이 된다.

```tsx
function useSignupForm() {
  const email = useInput('');
  const { error: emailError } = useValidation(
    email.value,
    v => v.includes('@') ? null : '이메일 형식 오류'
  );
  const { loading, submit } = useSubmit(() => api.signup(email.value));

  return { email, emailError, loading, submit };
}
```

`useInput`이 바뀌어도 `useSignupForm`은 영향 안 받는다. 각자 자기 역할만 한다.

---

## 같은 기능, 다른 설계

스터디에서 팀원들끼리 같은 기능을 다른 방식으로 구현해보는 실습을 했다. 카운터 하나를 세 가지 방식으로 만들면 이렇게 된다.

| 방식 | 특징 | 적합한 상황 |
|------|------|------------|
| 플랫 훅 | 단순, 직관적 | 상태가 간단할 때 |
| Reducer 훅 | 액션 추적 가능, 테스트 쉬움 | 상태 변경 이유가 중요할 때 |
| 합성 훅 | 재사용성 최고 | 팀 프로젝트, 공통 로직이 많을 때 |

정답은 없다. 팀마다, 상황마다 다르다. 중요한 건 **왜 이 구조를 선택했는지** 설명할 수 있어야 한다는 거다.

---

## 정리

커스텀 훅이 단순히 로직을 묶는 도구라고 생각했는데, 제대로 쓰면 인터페이스 설계에 가깝다.

- 컴포넌트 → 무엇을 보여줄지
- 커스텀 훅 → 어떻게 동작할지
- Reducer → 상태가 어떤 규칙으로 바뀌는지

이 세 층을 의식적으로 구분하기 시작하면 코드가 달라진다.

발표 준비하면서 "나는 이걸 알고 있다"와 "이걸 남에게 설명할 수 있다"가 다르다는 걸 또 느꼈다.

---

*2026년 3월 · React 중급 스터디 2주차*
