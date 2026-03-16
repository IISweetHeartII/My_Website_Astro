# slides-write 스킬

Slidev 발표 자료 초안을 작성하고 `slides/[발표명]/slides.md` 파일로 저장합니다.

## 실행 순서

1. `slides/STYLE_GUIDE.md` 를 읽어 디자인 규칙 + 4대 금지 규칙 숙지
2. `slides/` 폴더의 기존 발표 목록 확인
3. 인자가 없으면 AskUserQuestion으로 발표 주제, 대상 청중, 슬라이드 수 질문
4. STYLE_GUIDE.md 규칙에 따라 슬라이드 작성 후 파일 저장
5. **작성 후 4대 금지 규칙 자가 검사** (아래 참조)
6. `slides/package.json` scripts에 `dev:[발표명]` 추가
7. `slides/README.md` 발표 목록 테이블에 새 항목 추가
8. 완성 후 파일 경로, 로컬 실행 명령어, 배포 명령어 출력

## 폴더명 규칙

```
slides/[영문-소문자-하이픈]/slides.md
```

예시: `slides/react-week3/slides.md`, `slides/aws-intro/slides.md`

## Slidev 슬라이드 구조 템플릿

```md
---
theme: default
title: "발표 제목"
class: text-center
transition: slide-left
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
---

# 제목

**부제목 또는 컨텍스트**

<br>

핵심 메시지 한 줄

---

# 목차 / 오늘 배울 것

<v-clicks>

- 항목 1
- 항목 2
- 항목 3

</v-clicks>

---
(... 내용 슬라이드들 ...)

---
layout: center
class: text-center
---

# 마무리 슬라이드
```

## 슬라이드 작성 원칙

### 구조
- 타이틀 → 목차 → 문제 제기 → 본론 → 실습/토론 → 마무리
- 슬라이드당 하나의 메시지만
- 슬라이드 수: 발표 시간 × 1.5 (30분 발표 = 약 10~15장)

### 코드 슬라이드 (개발 발표 시)

```md
# 슬라이드 제목

```tsx {all|1-3|5-10|all}   ← 라인별 하이라이트 애니메이션
코드 내용
```
```

### 애니메이션 패턴

| 패턴 | 사용처 |
|------|--------|
| `<v-clicks>` + 리스트 | 항목 순차 등장 |
| `{all\|1-3\|5-8}` | 코드 라인별 강조 |
| `v-click` | 특정 요소 클릭 시 등장 |
| `transition: fade` | 슬라이드 전환 효과 |

### 레이아웃

| 레이아웃 | 사용처 |
|---------|--------|
| (기본) | 일반 내용 |
| `layout: center` | 타이틀, 마무리 |
| `layout: two-cols` | 비교, Before/After |

### 디자인 원칙
- 배경: 다크 톤 (`bg-gray-900`, `bg-blue-950/30`)
- 강조색: 파란 계열 (`text-blue-300`), 초록 (`text-green-300`)
- 코드: 항상 TypeScript 기준으로 작성
- 이모지는 최소화, 섹션 구분용으로만

## 4대 금지 규칙 자가 검사 (작성 후 반드시 확인)

슬라이드 작성 후 아래 4가지를 직접 확인해야 한다. 어기면 렌더링이 깨진다.

### 1. HTML div 안에 마크다운 코드블록 없는지 확인

```
# 검사 방법: <div> 태그가 열린 상태에서 ``` 가 나오는지 확인
```

```md
<!-- ❌ 깨짐 -->
<div class="card">
  ```tsx
  const x = 1
  ```
</div>

<!-- ✅ 정상 -->
<div class="card">
  <pre><code>const x = 1</code></pre>
</div>
```

### 2. v-motion이 grid 직접 자식인지 확인

```md
<!-- ❌ 깨짐: grid 자식에 v-motion 직접 -->
<div style="display:grid; grid-template-columns:1fr 1fr">
  <div v-motion :initial="{opacity:0}">내용</div>
</div>

<!-- ✅ 정상: v-motion을 grid 바깥에 -->
<div v-motion :initial="{opacity:0}">
  <div style="display:grid; grid-template-columns:1fr 1fr">
    <div>내용</div>
  </div>
</div>
```

### 3. 중요 레이아웃에 inline style 사용 확인

grid, 카드 배경 등 구조적으로 중요한 스타일은 외부 CSS 클래스만 믿지 말고 **inline style 병행**:

```md
<!-- ✅ 안전한 패턴 -->
<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
```

### 4. 코드블록 18줄 이하 확인

헤더(뱃지, 링크)와 하단 설명 박스 포함하면 공간이 부족하다. **코드만 18줄 이하**.
초과 시 슬라이드 분리 또는 `// ...` 생략 처리.

---

## package.json dev 스크립트 업데이트

새 발표 추가 시 `slides/package.json`의 scripts에 dev 명령어 추가:

```json
"dev:[발표명]": "slidev [발표명]/slides.md --open"
```

## 완성 후 출력 예시

```
✅ 파일 생성: slides/react-week3/slides.md
   슬라이드 수: 12장

🖥️  로컬 실행 (WSL2 터미널에서):
   cd ~/projects/My_Website_Astro/slides
   bun run dev:week3

🚀 배포:
   bun run build
   bunx wrangler pages deploy dist --project-name slides-log8kr

🔗 배포 후 URL: slides.log8.kr/react-week3
```
