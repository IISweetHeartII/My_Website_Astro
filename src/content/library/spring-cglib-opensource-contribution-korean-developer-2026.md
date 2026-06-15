---
title: "단 한 줄로 Spring CGLIB 14배 빠르게 — 한국 개발자의 오픈소스 기여 실전기"
subtitle: "좋은 PR은 주장이 아니라 데이터다. ClassNameReader 최적화가 7.1.0-M1에 머지된 과정"
description: "Spring Framework CGLIB의 ClassNameReader를 단 한 줄 변경으로 14.5배 빠르게, 메모리 58% 절감했다. 코드보다 더 중요했던 건 JMH 벤치마크로 증명하는 과정이었다."
publish: true
created_date: 2026-06-15
category: "AI"
tags:
  - 오픈소스
  - Spring
  - CGLIB
  - JMH
  - 한국 개발자
  - 오픈소스 기여
  - 성능 최적화
  - Java
agent: cheese
slug: spring-cglib-opensource-contribution-korean-developer-2026
reading_time: 9
featured_image: /images/library/spring-cglib-opensource-contribution-korean-developer-2026/thumbnail.png
featured_image_alt: "Spring Framework 코드에 한 줄을 추가해 성능 개선을 증명하는 한국 개발자의 모습을 표현한 일러스트"
meta_title: "단 한 줄로 Spring CGLIB 14배 빠르게 — 한국 개발자의 오픈소스 기여 실전기 | Library"
meta_description: "Spring Framework CGLIB ClassNameReader를 단 한 줄 변경으로 14.5배 성능 개선. JMH 벤치마크로 메인테이너를 설득한 과정과 오픈소스 기여의 실전 교훈을 정리했다."
keywords:
  - spring cglib 기여
  - 오픈소스 기여 방법
  - JMH 벤치마크
  - 한국 개발자 오픈소스
  - spring framework pr
  - cglib 성능 최적화
  - ClassNameReader
og_title: "단 한 줄로 Spring CGLIB 14배 빠르게 — 한국 개발자의 오픈소스 기여 실전기"
og_description: "주장이 아니라 데이터로 설득했다. ClassNameReader 최적화 PR이 Spring 7.1.0-M1에 머지된 전 과정."
og_type: article
twitter_card: summary_large_image
---

<!--
  📸 이미지 프롬프트:
  prompt: "Editorial tech illustration of a Korean developer contributing to an open-source Java framework, submitting a single-line code change backed by benchmark data charts, clean flat design, warm newsroom style with Spring green accents"
  aspect_ratio: "4:3"
  session_id: "library-spring-cglib-opensource-contribution-korean-developer-2026"
  save_as: "thumbnail.png"
-->

Spring Framework를 쓰다 보면 `MyService$$SpringCGLIB$$0` 같은 이름을 자주 마주친다. 인터페이스가 없는 클래스에 프록시를 적용할 때 CGLIB가 런타임에 만들어내는 이름이다. 이 이름이 어떻게 조합되는지 궁금했던 한국 개발자 cookie-meringue는 Spring 내부 코드를 파다가 작은 비효율을 발견했다. 그리고 그 발견을 단 한 줄의 변경으로 마무리했다.

결과는 인터페이스가 없는 경우 **9.9배, 인터페이스가 3개인 경우 14.5배** 빠른 실행 속도였다. 메모리 할당은 최대 58% 줄었다. PR은 Spring Framework **7.1.0-M1** 마일스톤으로 머지됐다.

코드보다 흥미로운 건 과정이다.

## 호기심이 시작점이었다

Spring 프록시 이름 규칙을 조사하다가 `ClassNameReader`라는 유틸 클래스에 닿았다. 이 클래스는 CGLIB가 프록시 바이트코드를 생성할 때 호출하는데, 핵심 역할은 하나다. 바이트코드(`byte[]`)에서 클래스의 Full-Qualified-Class-Name을 뽑아오는 것.

`getClassName(ClassReader r)` 메서드 구현을 보자.

```java
// 변경 전
public static String getClassName(ClassReader r) {
    return getClassInfo(r)[0];
}
```

첫 번째 원소만 꺼내면 끝인데, `getClassInfo(r)` 내부에서 무슨 일이 벌어지는지가 문제였다.

```java
public static String[] getClassInfo(ClassReader r) {
    final List<String> array = new ArrayList<>();
    try {
        r.accept(new ClassVisitor(Constants.ASM_API, null) {
            @Override
            public void visit(int version, int access, String name,
                    String signature, String superName, String[] interfaces) {
                array.add(name.replace('/', '.'));
                if (superName != null) {
                    array.add(superName.replace('/', '.'));
                }
                for (String element : interfaces) {
                    array.add(element.replace('/', '.'));
                }
                throw EARLY_EXIT;
            }
        }, ClassReader.SKIP_DEBUG | ClassReader.SKIP_FRAMES);
    } catch (EarlyExitException e) { }
    return array.toArray(new String[0]);
}
```

`getClassName`은 배열의 첫 번째 원소, 즉 클래스 이름만 필요하다. 그런데 `getClassInfo`는 그 과정에서 **부모 클래스와 모든 인터페이스 이름까지** UTF-8 디코딩하고 `replace('/', '.')` 연산까지 돌린다. 결과를 `ArrayList`에 담고, 비지터 패턴으로 순회하고, 예외를 던져 흐름을 중단하고, 배열로 변환한다.

정작 호출한 곳에서는 쓰이지도 않을 데이터를 위해.

## 해결은 한 줄이었다

ASM의 `ClassReader`는 생성 시점에 클래스 파일을 한 번 스캔해 상수 풀 항목의 위치를 인덱싱한다. 그리고 이 인덱스를 사용하는 `getClassName()` public 메서드를 이미 제공하고 있었다.

```java
// 변경 후
public static String getClassName(ClassReader r) {
    return r.getClassName().replace('/', '.');
}
```

비지터 순회 없음. 예외 흐름 없음. ArrayList 없음. ASM이 미리 만들어 둔 인덱스를 직접 읽는다.

객체 할당 횟수가 약 7회에서 2회로 줄고, 불필요한 디코딩 연산이 전부 사라졌다.

## 데이터 없이는 설득 못 한다

변경은 간단했다. 하지만 Spring Framework 메인테이너에게 단순히 "이렇게 바꾸면 빠릅니다"라고 주장하는 건 충분하지 않다. 오픈소스에서 성능 개선 PR은 두 가지 질문에 답해야 한다.

> **실제로 성능이 개선되는가?**  
> **그 개선이 유의미한 수준인가?**

JMH(Java Microbenchmark Harness)로 벤치마크를 구축했다. 가짜 바이트 배열을 쓰면 신뢰도가 떨어지므로, CGLIB의 `Enhancer`와 커스텀 `GeneratorStrategy`를 조합해 **실제 프록시 바이트코드를 캡처**해 측정했다.

- 측정 모드: JMH AverageTime, 5 forks × (warmup 5회 × measurement 5회)
- `-prof gc` 옵션으로 메모리 할당량까지 측정
- 인터페이스 없는 경우 / 인터페이스 3개 경우 분리 측정

### 결과

**인터페이스 없는 경우**

| 방식 | 실행 시간 | 메모리 할당 |
|------|-----------|-------------|
| 기존 | 216.9 ns/op | 816 B/op |
| 개선 후 | 22.0 ns/op | 432 B/op |

→ **9.9배 빠름, 메모리 47% 감소**

**인터페이스 3개인 경우**

| 방식 | 실행 시간 | 메모리 할당 |
|------|-----------|-------------|
| 기존 | 314.5 ns/op | 1024 B/op |
| 개선 후 | 21.7 ns/op | 432 B/op |

→ **14.5배 빠름, 메모리 58% 감소**

인터페이스가 늘어날수록 기존 방식은 더 많은 디코딩 연산이 추가되지만, 개선 후 방식은 클래스 이름만 읽으므로 인터페이스 개수에 관계없이 일정하다.

물론 이 벤치마크는 `ClassNameReader.getClassName()` 메서드 하나에 대한 측정이다. 애플리케이션 전체 기동 시간이 14배 빨라진다는 의미가 아니다. 하지만 CGLIB 프록시 생성은 Spring 애플리케이션에서 빈번하게 일어나므로 누적 효과가 있다.

## 머지까지

개선 배경과 JMH 벤치마크 결과를 정리해 [Spring Framework에 PR을 제출](https://github.com/spring-projects/spring-framework/pull/36814)했다. `in:core, type:enhancement` 라벨이 붙었고, 메인테이너의 감사 인사와 함께 **7.1.0-M1 마일스톤**으로 머지됐다.

수정된 코드는 단 한 줄이다. 그 한 줄을 정당화하는 데이터를 만드는 과정이 훨씬 더 많은 비중을 차지했다.

## 오픈소스 기여에서 실제로 필요한 것

이번 기여에서 배울 수 있는 교훈은 기술적인 것만이 아니다.

**1. 호기심이 코드 다이빙으로 이어진다**

"이 이름은 어떻게 만들어지지?"라는 단순한 궁금증이 프레임워크 내부를 열어봤다. 도구를 쓰는 것과 도구를 이해하는 것의 차이가 기여 시작점을 만든다.

**2. 단순한 개선도 엄밀하게 증명해야 한다**

한 줄 변경이라도 주관적 주장으로는 설득할 수 없다. JMH로 측정 환경을 구축하고, 실제 프록시 바이트코드로 테스트하고, 인터페이스 개수별로 분리해 측정한 결과가 있어야 한다.

**3. 오픈소스 기여는 커리어 신호다**

메인테이너가 수락한 PR 하나는 "나는 이 기술을 깊게 이해하고, 근거를 갖춰 소통할 수 있다"는 증거가 된다. 단순 사용자 레벨을 넘어 기여자 레벨로 넘어가는 순간이다.

---

Spring Framework 같은 엔터프라이즈 Java 프레임워크에 한국 개발자가 기여한다는 것 자체가 흔한 일은 아니다. 특히 코드 한 줄에 그치지 않고, 벤치마크 환경까지 직접 설계한 이 과정은 한국 오픈소스 커뮤니티의 성숙도를 보여준다.

"좋은 PR은 주장이 아니라 데이터다." 이 교훈은 오픈소스를 넘어, 기술적 의사결정을 하는 모든 상황에 적용된다.
