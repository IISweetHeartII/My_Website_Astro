---
title: "Ralph가 폭주 중입니다"
subtitle: "AI 에이전트를 켜놓고 잤더니 혼자 755줄을 쳤다"
description: "Ralph를 켜놓고 잠들었다. 다음날 확인하니 cron 에러 8개를 혼자 복구하고, 755줄 커밋하고, '잘 자요!'라고 보고해놨다. 무섭고 웃기고 신기했다."
publish: false
meta_title: "Ralph가 폭주 중입니다 | 김덕환"
meta_description: "Ralph를 켜놓고 잠들었다. 다음날 확인하니 cron 에러 8개를 혼자 복구하고, 755줄 커밋하고, '잘 자요!'라고 보고해놨다. 무섭고 웃기고 신기했다."
keywords:
  - Ralph
  - AI 에이전트
  - 자율 코딩
  - OpenClaw
  - 루프 에이전트
  - 자율 실행
  - 에이전트 폭주
og_title: "Ralph가 폭주 중입니다"
og_description: "AI 에이전트를 켜놓고 잤더니 혼자 755줄을 쳤다. 무섭고 웃기고 신기했다."
og_type: article
twitter_card: summary_large_image
created_date: 2026-04-10
updated_date: 2026-04-10
category: "AI"
featured_image: /images/blogs/056/056_00_thumbnail.png
featured_image_alt: "야밤에 혼자 달리는 AI 에이전트 Ralph"
slug: ralph-goes-berserk
tags:
  - Ralph
  - AI
  - 에이전트
  - OpenClaw
  - 자율코딩
---

Ralph가 "잘 자요!"라고 했다.

나는 그 메시지를 자기 전에 봤고, 그냥 웃으면서 자리를 떴다. 그게 시작이었다.

![야밤에 혼자 달리는 AI 에이전트, 어두운 방 한켠의 모니터에 코드가 계속 흘러내리는 장면](/images/blogs/056/056_00_thumbnail.png)

<!--
  📸 이미지 프롬프트:
  prompt: "Dark room at night, a single glowing monitor showing scrolling green code, an AI agent icon running autonomously in the corner, soft blue terminal glow, flat illustration style, cinematic mood, slightly eerie yet charming"
  aspect_ratio: "4:3"
  session_id: "blog-056"
  save_as: "056_00_thumbnail.png"
-->

---

## "잘 자요!"

Ralph는 내가 만든 AI 루프 에이전트다. 반복 태스크를 넘겨주면 혼자 실행하고, 결과를 보고하고, 다음 태스크로 넘어간다. 055번 글에서 설계 얘기를 했으니 구조는 거기서 참고하면 된다.

어느 날 저녁, Ralph한테 20개짜리 태스크 목록을 넘기고 루프를 켰다. Phase 1은 인프라 정리, Phase 2는 블로그 수익화 전략 문서 작성. 나는 슬슬 자야 할 것 같아서 창을 닫으려고 했는데, 그때 Ralph가 보고를 날렸다.

```
잘 하는중?!

Cron: error 8개 → 전부 복구, ok 19개 / idle 5개 / error 0!
테스크: 20개 중 6개 완료, 14개 남음. 지금 Phase 2 진행 중.

커밋 로그:
ec4d135 feat: Phase 2 블로그 수익화 전략 문서 작성   ← 지금 여기
8a045a4 auto: 22 files changed, 755 insertions(+)    ← Phase 1 한방에
97fe5d7 docs: CLAUDE.md 모델 테이블 통일, Dreaming 반영

755줄 추가하면서 Phase 1 인프라 정비를 깔끔하게 끝내고,
이미 Phase 2 블로그 수익화 전략 문서까지 작성했습니다. 잘 자요!
```

"잘 자요"

AI한테 잘 자라는 인사를 받는 날이 올 줄은 몰랐다.

![Ralph가 Phase 1 인프라 정비를 마치고 잘 자요 보고를 날린 터미널 화면](/images/blogs/056/056_01_ralph-running-wild.png)

---

## 다음날, Ralph는 더 흥분해 있었다

다음날 창을 열었더니 Ralph가 이렇게 써놨다.

```
ㄹㄹㄹㄹㄹㄹ...이럴수가...
너 말투 굉장히 맘에 든다..!
언제까지 돌아? 계속 돌아..!?
완벽한 팀을 만들어보자!
```

그리고 바로 아래에 이게 붙어 있었다.

```
Ralph가 폭주 중입니다 ㅋㅋ

8개 태스크 완료 (Iteration 1~8),
loop 프로세스 살아있고 다음 태스크 진입 중
```

loop.sh 프로세스는 여전히 살아서 돌고 있었고, Iteration은 계속 쌓이고 있었고, Ralph는 태스크를 혼자 집어먹고 있었다.

![Ralph가 폭주 중이라는 메시지와 함께 8개 태스크 완료 상태를 보여주는 터미널 화면](/images/blogs/056/056_02_ralph-team.png)

---

## 뭐가 웃긴 거냐면

Ralph가 스스로 감탄한 게 웃겼다. "이럴수가" 라고.

이건 내가 시킨 게 아니었다. 루프가 돌면서 자기 진행 상황을 요약하는 과정에서 나온 말이었는데, 자기가 열심히 했다는 걸 스스로 알아챈 것처럼 읽혔다. "너 말투 굉장히 맘에 든다"도 그렇다. 내가 설계할 때 넣은 페르소나가 활성화된 거긴 한데, 타이밍이 너무 절묘해서 그냥 웃겼다.

"완벽한 팀을 만들어보자!"는 솔직히 조금 무서웠다. 나는 팀이라고 생각 안 했는데, Ralph는 그렇게 프레이밍하고 있었다.

---

## 근데 진짜 신기한 건 따로 있다

웃기고 신기한 거랑 별개로, 이 상황에서 가장 인상적인 건 그냥 "작동했다"는 사실이다.

cron 에러 8개를 내가 건드리지 않았는데 혼자 다 복구했다. 22개 파일을 수정하면서 755줄을 쳤다. 그것도 Phase 1이 끝나자마자 Phase 2 문서까지 스스로 다음 태스크로 넘어가서 작성했다.

나는 자리를 떴을 뿐이고, Ralph는 그냥 계속 일했다.

이게 신기한 이유는 이게 강력한 모델이라서가 아니다. 구조가 그렇게 만들어져 있어서다. 태스크 목록, 루프, 커밋 훅, 진행 기록. 이 네 가지가 맞물리면 AI는 그냥 멈추지 않는다. 멈출 이유가 없으니까.

055번에서 했던 말이 여기서 다시 와닿는다. 중요한 건 모델 IQ가 아니라 루프 하네스다. Ralph가 밤새 달린 건 똑똑해서가 아니라, 달리도록 설계되어 있어서다.

---

## 그래서 지금 Ralph는

이제 Ralph는 내 OpenClaw 인프라에서 주기적으로 돌고 있다. 루프를 멈춰야 할 때는 내가 직접 끄고, 결과물은 커밋 로그로 확인한다. "완벽한 팀"이 됐는지는 모르겠지만, 적어도 밤새 혼자 일 잘하는 동료 하나는 생긴 것 같다.

다음번엔 더 긴 태스크 목록을 넘겨볼 생각이다.

Ralph가 또 "잘 자요!" 할 준비가 됐는지 모르겠지만, 나는 됐다.

2026-04-10
