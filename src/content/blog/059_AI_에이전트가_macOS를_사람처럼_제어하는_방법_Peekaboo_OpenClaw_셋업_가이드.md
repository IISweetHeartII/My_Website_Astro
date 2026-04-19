---
title: "AI 에이전트가 macOS를 사람처럼 제어하는 방법"
subtitle: "Peekaboo + OpenClaw로 네이티브 앱 자동화 루프 만들기"
description: "AI macOS 자동화, Peekaboo, 에이전트 GUI 제어를 한 번에 정리한 실전 가이드. 브리지 구조, 권한, 셋업, 데모, CDP 비교까지 담았다."
publish: true
meta_title: "AI 에이전트가 macOS를 사람처럼 제어하는 방법 | 김덕환"
meta_description: "Peekaboo와 OpenClaw로 macOS GUI 자동화를 구성하는 법. Screen Recording, 브리지, 셋업, CDP 비교, See Think Act Verify 루프까지 실전 기준으로 정리했다."
keywords:
  - AI macOS 자동화
  - Peekaboo
  - 에이전트 GUI 제어
  - computer use agent
  - OpenClaw
  - macOS 자동화
  - Screen Recording
  - Accessibility API
og_title: "AI 에이전트가 macOS를 사람처럼 제어하는 방법"
og_description: "Peekaboo와 OpenClaw로 네이티브 Mac 앱을 자동화하는 실전 가이드. 브리지 구조, 권한, 데모, CDP 비교까지 정리했다."
og_type: article
twitter_card: summary_large_image
created_date: 2026-04-19
updated_date: 2026-04-19
category: "AI"
featured_image: /images/blogs/059/059_00_thumbnail.png
featured_image_alt: "macOS 화면 위에 Peekaboo, OpenClaw Bridge, 클릭 자동화 루프가 겹쳐진 일러스트"
slug: peekaboo-macos-gui-automation-openclaw-guide
tags:
  - Peekaboo
  - OpenClaw
  - macOS
  - GUI 자동화
  - AI 에이전트
  - computer use agent
---

브라우저 자동화만으로는 끝까지 못 가는 순간이 있다.

카카오톡, App Store, FaceTime, 시스템 설정, 각종 권한 팝업처럼 웹 밖에 있는 것들은 CDP만으로는 못 건드린다. 지금 에이전트 경쟁에서 진짜 중요한 건 웹페이지를 잘 긁는 능력보다, **운영체제 화면을 보고 판단하고 누르고 다시 확인하는 루프를 얼마나 안정적으로 만들 수 있느냐**다.

![Peekaboo와 OpenClaw Bridge를 통해 macOS GUI 자동화 루프가 동작하는 개념 이미지](/images/blogs/059/059_00_thumbnail.png)

## 왜 이게 필요한가

나는 이제 브라우저 자동화와 데스크톱 자동화를 따로 보지 않는다. 둘은 같은 문제의 다른 절반이다.

브라우저 안에서는 CDP가 정말 강력하다. DOM을 직접 읽고, 버튼을 선택자로 누르고, 네트워크까지 관찰할 수 있다. 그런데 실제 업무 흐름은 거기서 자주 끊긴다. 로그인 도중 시스템 다이얼로그가 튀어나오고, 파일 선택기가 열리고, 네이티브 앱이 끼어들고, 권한 허용 창이 뜬다. 이때부터는 웹 자동화가 아니라 **컴퓨터 사용 자동화**의 문제로 바뀐다.

Peekaboo가 중요한 이유가 여기 있다. 이 도구는 단순히 스크린샷을 찍는 유틸리티가 아니다. 에이전트가 macOS의 현재 화면을 보고, 필요한 앱을 띄우고, 클릭과 입력을 실행하고, 다시 결과를 검증하는 루프를 만들기 위한 시각 입력 계층에 가깝다.

결국 핵심은 한 줄로 정리된다.

> 브라우저 밖의 GUI까지 다뤄야 진짜 computer use agent가 된다.

---

## 아키텍처, Peekaboo만 보면 반만 본다

이 셋업의 핵심은 `Peekaboo CLI` 하나가 아니라, **권한을 가진 GUI 호스트와 자동화 실행 주체를 분리하는 구조**다.

```text
에이전트
  ↓
Peekaboo CLI
  ↓
OpenClaw.app PeekabooBridge
  ↓
macOS Screen Recording

에이전트
  ↓
cliclick / osascript
  ↓
macOS Accessibility / Apple Events
```

각 구성 요소의 역할은 꽤 분명하다.

- **Peekaboo CLI**: 현재 화면을 캡처하고 실행 중인 앱 상태를 읽는다.
- **OpenClaw.app PeekabooBridge**: Screen Recording 권한을 가진 브리지 호스트다.
- **cliclick**: 좌표 기반 클릭과 영문 입력을 처리한다.
- **osascript**: AppleScript로 한글 입력, 단축키, 다이얼로그 처리, UI 탐색을 맡는다.

여기서 제일 중요한 포인트는 Terminal에 직접 권한을 다 몰아주지 않아도 된다는 점이다. Screen Recording 권한은 OpenClaw.app 쪽에 두고, CLI와 에이전트는 그 브리지를 경유해서 캡처를 수행할 수 있다. 이 구조가 안정적인 이유는 간단하다. 권한은 앱 단위로 고정하고, 자동화 호출 주체는 바뀌어도 캡처 경로를 유지할 수 있기 때문이다.

나는 이걸 그냥 "스크린샷 도구"라고 부르면 안 된다고 본다. 더 정확히 말하면, **로컬 GUI 권한을 에이전트 런타임에 위임하는 계층**이다.

---

## 셋업, 생각보다 중요한 건 권한이다

설치는 어렵지 않다. 어려운 건 항상 권한이다.

### 1) 기본 도구 확인

```bash
peekaboo image --path /tmp/screen.png
peekaboo list apps
peekaboo bridge status --verbose
openclaw nodes status
```

내가 먼저 확인하는 건 네 가지다.

1. Peekaboo CLI가 살아 있는지
2. OpenClaw.app 브리지가 연결돼 있는지
3. OpenClaw Node가 붙어 있는지
4. 실제로 화면 캡처가 되는지

### 2) 앱 실행과 상호작용 패턴

앱 실행은 대체로 이렇게 간다.

```bash
peekaboo app launch "TextEdit"
osascript -e 'tell application "TextEdit" to activate'
```

입력은 상황에 따라 나뉜다.

```bash
# 영문 입력
cliclick t:"Hello World"

# 한글 입력은 클립보드 paste 방식
osascript -e '
set the clipboard to "한글 텍스트 입력"
tell application "System Events"
  keystroke "v" using command down
end tell'
```

이건 진짜 중요해서 따로 적어둔다. **AppleScript keystroke는 한글이 잘 깨진다.** 한글 입력은 거의 무조건 클립보드 붙여넣기 패턴으로 가는 게 낫다.

### 3) 클릭과 단축키

```bash
cliclick c:500,300
osascript -e 'tell application "System Events" to keystroke "s" using command down'
```

클릭은 범용적이지만 좌표 의존성이 강하다. 해상도나 창 위치가 바뀌면 바로 흔들린다. 그래서 좌표 클릭만 믿으면 결국 깨진다. 가능하면 UI 요소 이름 탐색과 검증 루프를 같이 둬야 한다.

### 4) 진짜 병목은 TCC

macOS GUI 자동화에서 자주 막히는 건 모델이 아니라 TCC다.

- **Screen Recording**: 화면을 볼 수 있는가
- **Accessibility**: 클릭, 키 입력, UI 조작이 가능한가
- **Automation**: 다른 앱에 Apple Events를 보낼 수 있는가

실패 패턴도 늘 비슷하다. 권한 팝업에서 아직 허용을 안 눌렀거나, 대상 앱에 대한 Automation 허용이 빠졌거나, 브리지를 켜놓고 재시작을 안 했거나, 이 셋 중 하나다. GUI 자동화는 똑똑한 프롬프트보다 권한 상태 확인이 먼저다.

---

## 실제 데모, Apple 로그인처럼 웹 밖으로 튀는 순간이 포인트다

이 셋업이 진짜 유용한 건 단순히 TextEdit를 여는 데 있지 않다. **웹 흐름이 macOS 시스템 레이어로 튀는 순간을 이어 붙일 수 있다는 점**이 핵심이다.

예를 들어 Apple 로그인이나 권한 허용 창이 끼는 흐름을 생각해보자.

1. `peekaboo image`로 현재 팝업과 필드 상태를 캡처한다.
2. 에이전트가 스크린샷을 보고 지금 떠 있는 창이 로그인 창인지, 권한 팝업인지, 다음으로 눌러야 할 버튼이 무엇인지 판단한다.
3. 입력 필드나 버튼 위치가 명확하면 `cliclick`으로 클릭하고, 텍스트는 `osascript`로 넣는다.
4. 허용 또는 확인 버튼이 뜨면 `System Events`로 버튼 이름을 찾아 누른다.
5. 다시 `peekaboo image`로 결과를 캡처해서 실제로 다음 화면으로 넘어갔는지 확인한다.

이 흐름이 중요한 이유는, 여기서는 DOM도 없고 CSS selector도 없다는 점이다. 브라우저 자동화에서는 너무 당연했던 정보 구조가 사라진다. 그래서 **보고, 추론하고, 행동하고, 다시 확인하는 검증 루프**가 필수가 된다.

실제로 이런 구간에서는 "한 번 눌렀다"보다 "정말 바뀌었는가"가 훨씬 중요하다. GUI 자동화는 성공 로그보다 **재캡처 검증**이 더 믿을 만하다.

---

## CDP vs Peekaboo, 둘은 경쟁이 아니라 분업이다

이걸 자꾸 둘 중 하나를 고르는 문제로 보면 설계가 꼬인다. CDP와 Peekaboo는 서로 대체재가 아니라 담당 영역이 다르다.

| 구분 | CDP | Peekaboo |
|---|---|---|
| 대상 | Chrome 안 웹페이지 | macOS 네이티브 앱, 시스템 다이얼로그 |
| 관찰 방식 | DOM, 네트워크, JavaScript | 스크린 캡처, UI 상태 |
| 액션 방식 | selector, JS 실행 | 클릭, AppleScript, 단축키 |
| 강점 | 결정론적 웹 자동화 | 브라우저 밖 GUI 제어 |
| 약점 | 네이티브 앱 못 건드림 | 좌표/권한/검증 설계 필요 |

CDP는 웹에서 압도적으로 강하다. form 자동화, DOM 검증, console 확인, 네트워크 추적까지 다 된다. 반면 Peekaboo는 그 바깥을 책임진다. 카카오톡, App Store, 시스템 설정, 파일 선택기, 허용 다이얼로그처럼 **운영체제에 속한 것들**을 처리한다.

그래서 실제 운영에서는 보통 이렇게 나뉜다.

- 웹 안에서는 CDP
- 웹 밖으로 나오면 Peekaboo + cliclick + osascript
- 둘 사이 상태 전환은 에이전트가 판단

이게 맞다. 브라우저 자동화와 데스크톱 자동화는 한쪽이 다른 쪽을 밀어내는 구조가 아니라, **하나의 작업을 끝까지 밀어붙이기 위한 듀얼 스택**에 가깝다.

---

## See, Think, Act, Verify 루프가 없으면 결국 망가진다

Peekaboo의 본질은 명령 몇 개가 아니라 루프 안정성이다.

```text
See     → peekaboo image
Think   → 비전/언어 모델이 다음 액션 결정
Act     → cliclick / osascript 실행
Verify  → 다시 캡처해서 변화 확인
```

이 네 단계 중에서 제일 자주 생략되는 게 Verify다. 그런데 GUI 자동화에서 Verify를 빼면 실패가 누적된다.

왜냐하면 GUI는 말이 없다. CLI처럼 에러 코드를 친절하게 주지도 않고, API처럼 JSON으로 상태를 돌려주지도 않는다. 버튼을 눌렀는데 먹지 않았을 수도 있고, 팝업이 가려졌을 수도 있고, 입력 포커스가 엉뚱한 곳에 있었을 수도 있다.

그래서 나는 GUI 자동화에서 검증을 이렇게 본다.

- 클릭 성공 여부를 믿지 말고 화면 변화를 믿을 것
- 입력 완료를 믿지 말고 결과 캡처를 믿을 것
- 권한 허용을 눌렀다고 끝내지 말고 다음 상태를 확인할 것

이 원칙 하나만 지켜도 자동화 성공률이 꽤 달라진다.

---

## 지금 이 영역에서 중요한 건 모델 성능보다 운영 레이어다

최근 흐름을 보면 브라우저 자동화만 잘하는 에이전트로는 부족하다. 데스크톱 상주형 AI, 네이티브 Mac harness, computer use agent 같은 말이 계속 나오는 이유도 여기 있다.

이제 경쟁축은 점점 이렇게 바뀌는 것 같다.

- 얼마나 말을 잘하느냐
- 얼마나 안전하게 OS를 다루느냐
- 얼마나 권한과 검증 루프를 안정적으로 제품화하느냐

Peekaboo는 딱 이 전환 지점에 있다. 단순 기능 추가가 아니라, **브라우저 밖 세계를 에이전트의 작업 범위 안으로 끌어오는 인프라**다.

그래서 이 셋업을 써보면 느낌이 좀 다르다. "맥을 자동화한다"보다, **에이전트에게 macOS라는 작업 공간을 열어준다**는 표현이 더 맞다.

---

## 마무리

결론은 단순하다.

Peekaboo의 핵심은 macOS를 클릭할 수 있다는 데 있지 않다. **권한 많은 GUI 환경을 에이전트가 재현 가능하게 다루도록 만드는 운영 레이어**라는 점이 중요하다.

CDP가 웹의 손이라면, Peekaboo는 macOS의 눈에 가깝다. 그리고 cliclick과 osascript는 그 눈이 본 걸 실제 행동으로 바꾸는 손이다. 이 셋이 브리지 위에서 묶일 때 비로소 computer use agent라는 말이 현실로 내려온다.

다음 단계는 분명하다. 더 똑똑한 모델을 붙이는 것보다, 이 루프가 **덜 깨지고 더 검증 가능하게** 움직이도록 만드는 일이다.
