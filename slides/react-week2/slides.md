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

컴포넌트는 **무엇을 보여줄지**만 알면 된다

---
transition: fade
---

# 오늘 배울 것

<br>

<v-clicks>

- 🧩 **로직 / UI 분리** — 커스텀 훅으로 책임을 명확히 나누기
- ⚡ **useReducer + Context** — 라이브러리 없이 전역 상태 관리하기
- 🔗 **훅 합성 전략** — 작은 훅을 조합해서 큰 훅 만들기
- 🛠️ **실습 미션** — 폼 관리 훅 직접 설계 + PR + 코드리뷰

</v-clicks>

---
transition: slide-up
---

# 왜 커스텀 훅이 필요한가?

<div class="text-gray-400 text-sm mb-3">이 컴포넌트의 문제가 뭘까요?</div>

```tsx {all|3-6|8-10|12-14}
function LoginForm() {
  // 😵 상태가 너무 많다
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 😵 유효성 검사 로직이 여기 있다
  const validate = () => {
    if (!email.includes('@')) setErrors({ email: '이메일 형식 오류' });
  };
  // 😵 API 호출도 여기 있다
  const handleSubmit = async (e) => {
    await fetch('/api/login', { method: 'POST' });
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---
transition: slide-up
---

# Before vs After

<div class="grid grid-cols-2 gap-4 mt-2">

<div>

**Before** — 컴포넌트가 모든 걸 앎

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validate = () => { /* ... */ };
  const handleSubmit = async () => { /* ... */ };

  return <form>...</form>;
}
```

</div>

<div v-click>

**After** — UI만 담당

```tsx
function LoginForm() {
  const {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <form onSubmit={handleSubmit}>...</form>
  );
}
```

</div>

</div>

<div v-click class="box-primary mt-3 text-sm">
  ✅ 컴포넌트는 <strong class="text-purple-300">무엇을 보여줄지</strong>만 — 나머지는 훅이 책임
</div>

---
transition: slide-up
---

# 커스텀 훅 구현

```tsx {all|2-4|6-8|10-16|18}
function useLoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setValues(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.email.includes('@')) next.email = '이메일 형식 오류';
    if (values.password.length < 8) next.password = '8자 이상';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) });
    setLoading(false);
  };

  return { values, errors, loading, handleChange, handleSubmit };
}
```

---
transition: slide-up
---

# 책임 분리 원칙

<div class="grid grid-cols-2 gap-6 mt-6">

<div class="dk-card">
  <div class="font-bold text-purple-300 mb-3">컴포넌트의 책임</div>
  <v-clicks>

  - JSX 렌더링
  - 이벤트 바인딩
  - 스타일 / 레이아웃
  - 조건부 표시

  </v-clicks>
</div>

<div class="dk-card">
  <div class="font-bold text-blue-300 mb-3">커스텀 훅의 책임</div>
  <v-clicks>

  - 상태 관리
  - 사이드 이펙트
  - API 호출
  - 비즈니스 로직
  - 유효성 검사

  </v-clicks>
</div>

</div>

---
transition: slide-up
---

# useReducer + Context 패턴

<div class="text-gray-400 text-sm mb-3">전역 상태 — 라이브러리 없이</div>

<div class="grid grid-cols-3 gap-3">

<div class="dk-card">

**1단계: Reducer**

```tsx
type Action =
  | { type: 'INCREMENT' }
  | { type: 'RESET' };

function reducer(state, action) {
  if (action.type === 'INCREMENT')
    return { count: state.count + 1 };
  return { count: 0 };
}
```

</div>

<div v-click class="dk-card">

**2단계: Provider**

```tsx
const Ctx = createContext(null);

export function Provider({ children }) {
  const [state, dispatch] =
    useReducer(reducer, { count: 0 });
  return (
    <Ctx.Provider value={{ state, dispatch }}>
      {children}
    </Ctx.Provider>
  );
}
```

</div>

<div v-click class="dk-card">

**3단계: 커스텀 훅**

```tsx
export function useCount() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(
    'Provider 밖에서 사용!'
  );
  return {
    count: ctx.state.count,
    increment: () =>
      ctx.dispatch({ type: 'INCREMENT' }),
  };
}
```

</div>

</div>

<div v-click class="box-accent mt-3 text-sm">
  💡 커스텀 훅이 Context를 <strong class="text-blue-300">캡슐화</strong> — 나중에 내부 구현 바꿔도 호출부 코드는 그대로
</div>

---
transition: slide-up
---

# 훅 합성 (Composition) 전략

<div class="grid grid-cols-2 gap-4">

<div>

**작은 단위 훅 3개**

```tsx {all|1-4|6-8|10-14}
function useInput(initial: string) {
  const [value, setValue] = useState(initial);
  return { value, onChange: (e) => setValue(e.target.value) };
}

function useValidation(value: string, rule) {
  return { error: rule(value) };
}

function useSubmit(fn: () => Promise<void>) {
  const [loading, setLoading] = useState(false);
  return {
    loading,
    submit: async () => { setLoading(true); await fn(); setLoading(false); },
  };
}
```

</div>

<div v-click>

**조합해서 큰 훅 만들기**

```tsx
function useSignupForm() {
  const email = useInput('');

  const { error: emailError } = useValidation(
    email.value,
    v => v.includes('@') ? null : '이메일 형식 오류'
  );

  const { loading, submit } = useSubmit(
    () => api.signup(email.value)
  );

  return { email, emailError, loading, submit };
}
```

<div class="box-primary mt-3 text-sm">
  🔗 각 훅이 자기 역할만 — 변경해도 서로 영향 없음
</div>

</div>

</div>

---
transition: slide-up
---

# 같은 기능, 다른 설계

<div class="grid grid-cols-3 gap-3 mt-4">

<div class="dk-card border-yellow-600">

**방식 A: 플랫 훅**

```tsx
function useCounter(init = 0) {
  const [n, setN] = useState(init);
  return {
    n,
    up: () => setN(n + 1),
    down: () => setN(n - 1),
    reset: () => setN(init),
  };
}
```

<div class="text-xs text-gray-500 mt-2">간단 · 기능 늘수록 비대해짐</div>

</div>

<div class="dk-card border-blue-600">

**방식 B: Reducer 훅**

```tsx
function useCounter(init = 0) {
  const [n, dispatch] =
    useReducer((s, a) => {
      if (a === 'UP') return s + 1;
      if (a === 'DOWN') return s - 1;
      return init;
    }, init);
  return { n, dispatch };
}
```

<div class="text-xs text-gray-500 mt-2">액션 추적 · 테스트 쉬움</div>

</div>

<div class="dk-card border-green-600">

**방식 C: 합성 훅**

```tsx
function useCounter(init = 0) {
  const state = useInput(init);
  const { submit } = useSubmit(
    () => api.save(state.value)
  );
  return { ...state, submit };
}
```

<div class="text-xs text-gray-500 mt-2">재사용 최고 · 학습 비용 있음</div>

</div>

</div>

<v-click>

> 🤔 **토론:** 이 팀에서는 어떤 방식을 선택할건가요? 왜?

</v-click>

---
transition: fade
---

# 📋 실습 미션

<br>

**미션:** 회원가입 폼의 상태 관리 로직을 커스텀 훅으로 분리하세요

<v-clicks>

- ✅ 최소 조건: 이름, 이메일, 비밀번호 필드
- ✅ 유효성 검사 포함 (이메일 형식, 비밀번호 8자 이상)
- ✅ 제출 시 로딩 상태 처리

</v-clicks>

<br>

<v-click>

**제출 방법**

- GitHub PR 제목: `[2주차] 이름 - 폼 훅 설계`
- 팀원 PR에 코드리뷰 최소 2개
- 블로그: 커스텀 훅 설계 패턴 정리

</v-click>

<v-click>

> 💡 훅 설계가 다 다를수록 코드리뷰가 풍성해져요!

</v-click>

---
transition: slide-up
---

# 토론 주제

<br>

<v-clicks>

1. `useEffect`를 커스텀 훅 안으로 숨기는 게 항상 좋을까?

2. 훅 이름이 `use`로 시작해야 하는 이유가 단순한 컨벤션일까?

3. 같은 폼 기능인데 팀원마다 훅 구조가 다르면 어떻게 통일할까?

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
