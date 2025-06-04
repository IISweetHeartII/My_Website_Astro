---
title: 마크다운 스타일 가이드
description: "여기 Astro에서 마크다운 콘텐츠를 작성할 때 사용할 수 있는 몇 가지 기본적인 마크다운 문법 예시가 있습니다."
pubDate:
slug: markdown-style
publish: false
---

여기 Astro에서 마크다운 콘텐츠를 작성할 때 사용할 수 있는 몇 가지 기본적인 마크다운 문법 예시가 있습니다.

## 제목

다음 HTML `<h1>`—`<h6>` 요소는 6단계의 섹션 제목을 나타냅니다. `<h1>`는 가장 높은 섹션 수준이며 `<h6>`는 가장 낮은 수준입니다.

# H1

## H2

### H3

#### H4

##### H5

###### H6

## 문단

Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.

Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.

## 이미지

### 문법

```markdown
![Alt text](./full/or/relative/path/of/image)
```

### 결과

![블로그 플레이스홀더](/images/design/ready.png)

## 인용구

인용구 요소는 다른 출처에서 인용된 내용을 나타내며, 선택적으로 `footer` 또는 `cite` 요소 내에 있어야 하는 출처와 선택적으로 주석 및 약어와 같은 인라인 변경 사항을 포함할 수 있습니다.

### 출처 없는 인용구

#### 문법

```markdown
> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  
> **Note** that you can use _Markdown syntax_ within a blockquote.
```

#### 결과

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  
> **참고** 인용구 내에서 *마크다운 문법*을 사용할 수 있습니다.

### 출처 있는 인용구

#### 문법

```markdown
> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>
```

#### 결과

> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: 위 인용구는 2015년 11월 18일 Gopherfest에서 Rob Pike의 [강연](https://www.youtube.com/watch?v=PAAkCSZUG1c)에서 발췌되었습니다.

## 표

### 문법

```markdown
| 이탤릭체   | 굵게     | 코드   |
| ---------- | -------- | ------ |
| _이탤릭체_ | **굵게** | `코드` |
```

### 결과

| 이탤릭체   | 굵게     | 코드   |
| ---------- | -------- | ------ |
| _이탤릭체_ | **굵게** | `코드` |

## 코드 블록

### 문법

새 줄에 백틱 3개 ```를 사용하여 스니펫을 작성하고 새 줄에 백틱 3개로 닫을 수 있으며, 언어별 구문 강조를 위해 첫 3개의 백틱 뒤에 언어 이름을 한 단어로 작성할 수 있습니다. 예: html, javascript, css, markdown, typescript, txt, bash

````markdown
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```
````

### 결과

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```

## 목록 유형

### 순서 있는 목록

#### 문법

```markdown
1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목
```

#### 결과

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

### 순서 없는 목록

#### 문법

```markdown
- 목록 항목
- 다른 항목
- 또 다른 항목
```

#### 결과

- 목록 항목
- 다른 항목
- 또 다른 항목

### 중첩 목록

#### 문법

```markdown
- 과일
  - 사과
  - 오렌지
  - 바나나
- 유제품
  - 우유
  - 치즈
```

#### 결과

- 과일
  - 사과
  - 오렌지
  - 바나나
- 유제품
  - 우유
  - 치즈

## 기타 요소 — abbr, sub, sup, kbd, mark

### 문법

```markdown
<abbr title="Graphics Interchange Format">GIF</abbr>는 비트맵 이미지 형식입니다.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

세션을 종료하려면 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd>를 누르세요.

대부분의 <mark>도롱뇽</mark>은 야행성이며, 곤충, 벌레 및 기타 작은 생물을 사냥합니다.
```

### 결과

<abbr title="Graphics Interchange Format">GIF</abbr>는 비트맵 이미지 형식입니다.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

세션을 종료하려면 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd>를 누르세요.

대부분의 <mark>도롱뇽</mark>은 야행성이며, 곤충, 벌레 및 기타 작은 생물을 사냥합니다.
