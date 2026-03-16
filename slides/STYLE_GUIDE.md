# Slides 스타일 가이드

김덕환의 발표 자료 디자인 일관성 기준입니다.
모든 슬라이드는 이 가이드를 따릅니다.

---

## 1. 테마 & 색상

### 기본 설정 (모든 슬라이드 공통)

```yaml
---
theme: default
transition: slide-left
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
css: ../style.css   ← 반드시 포함
---
```

### 브랜드 컬러 (log8.kr 동일)

| 변수 | 값 | 용도 |
|------|-----|------|
| `--dk-primary` | `#8b5cf6` | 메인 보라 |
| `--dk-primary-light` | `#a78bfa` | 밝은 보라 (h1 그라디언트) |
| `--dk-accent` | `#89b4fa` | 포인트 파랑 |
| `--dk-bg` | `#0f0f1a` | 슬라이드 배경 |
| `--dk-surface` | `#1a1a2e` | 카드 배경 |

### CSS 클래스 (style.css 정의)

| 클래스 | 용도 |
|--------|------|
| `dk-card` | 카드 컨테이너 (보라 보더) |
| `box-primary` | 보라 강조 박스 |
| `box-accent` | 파랑 강조 박스 |

### 다크 테마 기준

모든 슬라이드는 **다크 배경** 기준. 밝은 배경 슬라이드 금지.
h1은 자동으로 보라→파랑 그라디언트 적용됨.

---

## 2. 레이아웃 패턴

### 타이틀 슬라이드

```md
---
layout: center
class: text-center
transition: fade
---

# 발표 제목

**컨텍스트 — 날짜 또는 이벤트명**

<br>

핵심 메시지 한 줄 (선택)
```

### 목차 슬라이드

```md
---
transition: fade
layout: center
---

# 오늘 배울 것

<br>

<v-clicks>

- 🔹 항목 1 — 부연 설명
- 🔹 항목 2 — 부연 설명
- 🔹 항목 3 — 부연 설명

</v-clicks>
```

### 일반 내용 슬라이드

```md
---
transition: slide-up
---

# 슬라이드 제목

<div class="text-gray-400 text-sm mb-4">서브 설명 (선택)</div>

내용
```

### 두 컬럼 비교 슬라이드

```md
---
layout: two-cols
transition: slide-up
---

# Before

내용 왼쪽

::right::

# After

내용 오른쪽
```

### 카드 그리드 슬라이드

```md
<div class="grid grid-cols-2 gap-6 mt-6">

<div v-click class="border border-blue-400 rounded-xl p-5 bg-blue-950/30">
  <div class="font-bold text-blue-300 mb-1">카드 제목</div>
  <div class="text-sm text-gray-400">카드 내용</div>
</div>

<div v-click class="border border-green-400 rounded-xl p-5 bg-green-950/30">
  <div class="font-bold text-green-300 mb-1">카드 제목</div>
  <div class="text-sm text-gray-400">카드 내용</div>
</div>

</div>
```

### 강조 박스

```md
<div class="mt-4 p-4 bg-blue-950/40 border border-blue-500 rounded-xl text-sm">
  💡 <strong class="text-blue-300">핵심:</strong> 강조할 내용
</div>
```

---

## 3. 코드 슬라이드

### 코드 길이 제한 (핵심 규칙)

- 슬라이드 1장에 코드 **최대 20~22줄**
- 그 이상이면 슬라이드 나누거나 주석으로 생략: `// ...`
- `style.css`에서 `max-height: 380px` 자동 적용 (초과 시 스크롤)

### 라인별 하이라이트 (필수 패턴)

```md
```tsx {all|1-3|5-10}
// 코드 내용
```
```

- `all` → 전체 표시
- `1-3` → 1~3번 라인 강조
- 반드시 `all`로 시작할 것

### Before → After 패턴

````md magic-move 대신 두 개의 코드 블록으로 분리:

```md
**Before** — 문제 상황

```tsx
// 나쁜 코드
```

<v-click>

**After** — 개선된 코드

```tsx
// 좋은 코드
```

</v-click>
````

> ⚠️ `magic-move`는 플러그인 없으면 에러남 — 사용 금지

### 코드 언어 기준

- TypeScript 기준으로 작성 (`tsx`, `ts`)
- 간단한 예시도 `tsx` 사용 (일관성)
- 쉘 명령어는 `bash`

---

## 4. 애니메이션 패턴

### v-clicks (순차 등장)

```md
<v-clicks>

- 항목 1
- 항목 2
- 항목 3

</v-clicks>
```

리스트 항목 순차 등장 시 사용. 4개 이상은 지양 (발표 흐름 끊김).

### v-click (단일 요소)

```md
<v-click>

표시할 내용

</v-click>
```

### 슬라이드 전환 효과

| 전환 | 사용처 |
|------|--------|
| `slide-left` (기본) | 일반 슬라이드 |
| `slide-up` | 심화 내용, 연속 설명 |
| `fade` | 타이틀, 섹션 전환, 마무리 |

---

## 5. 텍스트 규칙

### 크기 계층

| 요소 | 사용처 |
|------|--------|
| `# 제목` | 슬라이드 메인 제목 (1개만) |
| `## 소제목` | 섹션 내 분류 |
| `**굵게**` | 강조 단어 |
| `text-sm text-gray-400` | 보조 설명, 캡션 |
| `text-xs text-gray-500` | 최소 단위 부연 |

### 금지 패턴

- 슬라이드 1장에 글자 너무 많이 — 핵심 1개만
- 이모지 남발 — 섹션 구분, 강조 포인트에만 (슬라이드당 1~2개)
- 영어/한국어 혼용 — 한국어 발표면 한국어로 통일

---

## 6. 슬라이드 구성 원칙

### 장수 기준

| 발표 시간 | 슬라이드 수 |
|----------|------------|
| 15분 | 8~10장 |
| 30분 | 12~18장 |
| 60분 | 20~30장 |

### 필수 슬라이드

1. **타이틀** — 제목, 컨텍스트, 핵심 메시지
2. **목차** — 오늘 배울 것 (3~4개 항목)
3. **본론** — 각 주제별
4. **실습/토론** — 있으면 포함
5. **마무리** — 핵심 요약 or 다음 예고

### 1슬라이드 1메시지

슬라이드 제목만 봐도 "이 슬라이드가 뭘 말하는지" 알아야 함.
내용이 많으면 슬라이드를 나눌 것.

---

## 7. 마무리 슬라이드 (고정 형식)

```md
---
layout: center
class: text-center
transition: fade
---

# 수고하셨습니다! 🎉

다음 주: [다음 주제]

<br>

<span class="text-sm text-gray-500">미션 마감: [날짜] · 코드리뷰 [N]개 필수</span>
```

---

## 8. 파일 명명 규칙

```
slides/[영문-소문자-하이픈]/slides.md
```

| 발표 종류 | 예시 |
|----------|------|
| 스터디 주차 | `react-week2`, `react-week3` |
| 강연/세미나 | `aws-intro`, `ai-tools-2025` |
| 사내 발표 | `onboarding-guide`, `quarterly-review` |

- 날짜 붙이지 않음 (폴더명에)
- 짧고 명확하게
- 한국어 금지

---

## 9. 체크리스트 (발표 전)

```
□ 슬라이드 수가 발표 시간에 맞는가
□ 타이틀 슬라이드에 핵심 메시지가 있는가
□ 코드 슬라이드에 라인 하이라이트가 설정되어 있는가
□ magic-move 사용하지 않았는가
□ 마지막 슬라이드가 마무리 형식을 따르는가
□ bun run build 오류 없이 통과하는가
```
