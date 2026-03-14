---
title: "ShareX Win+Shift+S 충돌 트러블슈팅 완벽 가이드 - 데스크탑은 되는데 노트북만 안 될 때"
description: "ShareX에서 Win+Shift+S 단축키가 등록되지 않거나 Windows 캡처가 먼저 뜨는 문제를 원인별로 해결하는 실전 가이드"
publish: true
created_date: 2026-02-25
category: DevOps
slug: sharex-win-shift-s-troubleshooting
tags:
  - ShareX
  - Windows11
  - 트러블슈팅
  - 단축키
  - 생산성
faq:
  - question: "왜 데스크탑에서는 Win+Shift+S가 되는데 노트북에서는 안 되나요?"
    answer: "가장 흔한 원인은 설치 타입 차이입니다. 데스크탑은 클래식 설치(ShareX.exe)인데 노트북은 Microsoft Store 버전이면 글로벌 단축키 등록이 실패하는 경우가 많습니다."
  - question: "Win+Shift+S 충돌을 없애려면 어떤 설정이 핵심인가요?"
    answer: "Explorer 레지스트리의 DisabledHotkeys에 S를 넣어 Windows의 Win+S/Win+Shift+S 선점을 비활성화하는 것이 핵심입니다."
  - question: "Snipping Tool을 꼭 삭제해야 하나요?"
    answer: "필수는 아닙니다. 하지만 충돌이 심하면 제거가 가장 확실한 방법입니다. 제거 후 ShareX 재실행과 로그아웃/로그인을 권장합니다."
---

# ShareX Win+Shift+S, 왜 내 PC에서는 안 될까?

`PrtSc`는 잘 되는데 `Win+Shift+S`만 Windows 캡처가 먼저 뜨는 경우가 있습니다.
저도 데스크탑/노트북을 동일하게 맞추는 과정에서 같은 문제를 겪었고, 원인을 끝까지 추적해서 해결했습니다.

결론부터 말하면, 이 문제는 보통 아래 3가지 조합에서 발생합니다.

1. **ShareX 설치 타입 차이** (클래식 설치 vs Microsoft Store 설치)
2. **Windows 단축키 선점** (`Win+Shift+S`를 시스템이 먼저 가져감)
3. **Snipping Tool과의 충돌 상태**

---

## 1) 가장 먼저 확인할 것: ShareX 설치 타입

같은 ShareX라도 설치 방식이 다르면 동작이 달라질 수 있습니다.

- **권장(안정적)**: 클래식 설치 (`C:\Program Files\ShareX\ShareX.exe`)
- **문제 발생 가능**: Microsoft Store 버전 (`19568ShareX.ShareX` 패키지)

저는 실제로 노트북이 Store 버전일 때 `Win+Shift+S` 등록 경고가 계속 떴고,
클래식 버전으로 재설치한 뒤 해결이 가능해졌습니다.

---

## 2) 핵심 설정: Windows 단축키 선점 해제

데스크탑에서 잘 되던 이유를 레지스트리로 비교해보니,
아래 값이 차이를 만들고 있었습니다.

```text
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
DisabledHotkeys = "S"
```

이 값이 있으면 Windows가 `Win+S`, `Win+Shift+S` 계열을 선점하지 않게 되어
ShareX가 단축키를 안정적으로 가져갈 수 있습니다.

PowerShell로 적용하려면:

```powershell
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name DisabledHotkeys -Type String -Value "S"
Stop-Process -Name explorer -Force
Start-Process explorer.exe
```

---

## 3) Snipping Tool 충돌 정리

`PrtSc` 충돌은 아래 옵션으로 끌 수 있습니다.

- 설정 → 접근성 → 키보드
- **"Print Screen 키를 사용하여 화면 캡처 열기" 끄기**

하지만 `Win+Shift+S`는 시스템 단축키이기 때문에, 이 옵션만으로는 부족할 수 있습니다.
충돌이 계속되면 Snipping Tool 제거를 권장합니다.

```powershell
Get-AppxPackage *ScreenSketch* | Remove-AppxPackage
```

---

## 4) ShareX 단축키를 정확히 맞추기

ShareX `Hotkey settings`에서 아래처럼 고정하세요.

- `PrintScreen` → 이미지 클립보드 + 파일 저장
- `Win+Shift+S` → 영역 캡처 + 파일 저장 + **파일 경로 클립보드 복사**

설정 파일 기준으로는 보통 다음 형태입니다.

```json
{
  "Hotkey": "S, Shift",
  "Win": true
}
```

---

## 5) 재현/검증 체크리스트

최종 검증은 반드시 3단계로 하세요.

1. ShareX 완전 종료 후 재실행
2. `Win+Shift+S` 캡처 수행
3. 붙여넣기 시 파일 경로가 클립보드에 들어오는지 확인

그래도 안 되면 로그아웃/로그인 1회를 추가하면 대부분 해결됩니다.

---

## 이번 트러블슈팅에서 얻은 핵심 교훈

"같은 앱인데 왜 한 PC만 안 되지?"의 답은 생각보다 자주 **설치 타입 + 시스템 단축키 선점**입니다.

특히 노트북/데스크탑을 동일 세팅으로 맞출 때는
앱 버전, 설치 소스, 레지스트리까지 함께 맞춰야 완전히 동일해집니다.

이 글이 저처럼 `Win+Shift+S` 때문에 시간 날린 분들께 도움이 되었으면 좋겠습니다.
