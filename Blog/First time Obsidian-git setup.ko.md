---
title: "Obsidian Git 첫 설정: 완벽 가이드"
description: "초보자를 위한 Obsidian Git 설정 단계별 가이드, 저장소 생성 및 플러그인 구성을 포함합니다."
publish: false
created_date: 2024-01-20
slug: git-setup-for-obsidian
tags:
  - obsidian
  - git
  - tutorial
---

# Obsidian Git 첫 설정 가이드

이 가이드는 처음부터 Obsidian Git을 설정하는 방법을 안내하며, Obsidian 볼트의 버전 관리를 막 시작하는 초보자에게 완벽합니다.

## 준비물

- 컴퓨터에 [Git](https://git-scm.com/downloads) 설치
- [GitHub](https://github.com) 계정
- 볼트가 생성된 [Obsidian](https://obsidian.md) 설치

## 단계별 설정

### 1단계: GitHub 저장소 생성

1. [GitHub.com](https://github.com)으로 이동하여 로그인합니다.
2. 오른쪽 상단의 "+" 아이콘을 클릭하고 "New repository"를 선택합니다.
3. 저장소 이름을 지정합니다 (예: "obsidian-vault").
4. 노트를 비공개로 유지하고 싶다면 비공개로 설정합니다.
5. README로 초기화하지 마십시오.
6. "Create repository"를 클릭합니다.

### 2단계: Git으로 Obsidian 볼트 초기화

터미널을 열고 다음 명령어를 실행합니다:

```bash
# Obsidian 볼트 디렉토리로 이동
cd path/to/your/obsidian/vault

# git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋 생성
git commit -m "Initial commit"

# GitHub 저장소를 원격으로 추가
git remote add origin https://github.com/your-username/your-repository.git

# GitHub에 푸시
git branch -M main
git push -u origin main
```

### 3단계: Obsidian Git 플러그인 설치 및 구성

1. Obsidian을 엽니다.
2. 설정(톱니바퀴 아이콘)으로 이동합니다.
3. "Community plugins"를 선택합니다.
4. "Browse"를 클릭하고 "Obsidian Git"을 검색합니다.
5. 플러그인을 설치하고 활성화합니다.

### 4단계: 플러그인 설정 구성

Obsidian 설정에서 "Community plugins" → "Obsidian Git" 항목에서:

1. 기본 설정을 구성합니다:

   - 백업 간격: 10 (또는 선호하는 분)
   - 커밋 메시지: "vault backup: {{date}}"
   - 시작 시 업데이트 풀: 활성화됨
   - 백업 시 푸시: 활성화됨

2. 선택 사항이지만 권장되는 설정:
   - 상태 표시줄 표시: 활성화됨
   - 자동 풀 간격: 10분
   - 알림 비활성화: 선호도에 따라 설정

## Obsidian Git 사용하기

### 기본 작업

1. **수동 백업**

   - 왼쪽 리본에서 Git 아이콘을 클릭합니다.
   - "Commit and push all changes"를 선택합니다.

2. **변경 사항 보기**

   - Git 메뉴에서 "View changes"를 클릭합니다.
   - 수정된 파일을 검토합니다.

3. **변경 사항 풀**
   - Git 메뉴에서 "Pull"을 사용하여 업데이트를 가져옵니다.
   - 여러 장치에서 작업할 때 유용합니다.

### 일반적인 문제 및 해결 방법

1. **인증 문제**

   ```bash
   # 자격 증명을 요청받으면 SSH를 설정하거나 다음을 사용합니다:
   git config --global credential.helper cache
   ```

2. **병합 충돌**

   - 수정하기 전에 변경 사항을 풀합니다.
   - 내장된 병합 충돌 해결 도구를 사용합니다.
   - 확실하지 않을 때는 해결하기 전에 백업을 만듭니다.

3. **대용량 파일**
   ```bash
   # 필요한 경우 .gitignore에 추가
   echo "large-file.pdf" >> .gitignore
   ```

## 모범 사례

1. **정기적인 커밋**

   - 자동 백업이 정기적인 저장을 처리하도록 합니다.
   - 중요한 변경 사항은 의미 있는 메시지와 함께 수동으로 커밋합니다.

2. **볼트 구성**

   - 깔끔한 구조를 유지합니다.
   - 비공개 또는 대용량 파일에는 .gitignore를 사용합니다.

3. **백업 전략**
   - 자동 백업을 활성화합니다.
   - 주기적으로 원격 저장소를 확인합니다.

## 결론

이 설정을 완료하면 Obsidian 볼트가 이제 버전 관리되고 GitHub에 백업됩니다. 플러그인이 대부분의 작업을 자동으로 처리하지만, 필요할 때 언제든지 수동 작업을 수행할 수 있습니다.

다음 사항을 기억하세요:

- 다른 장치에서 작업을 시작할 때 변경 사항을 풀합니다.
- 상태 표시줄에서 동기화 상태를 확인합니다.
- Git 플러그인을 최신 상태로 유지합니다.

이제 Obsidian 볼트를 안전하게 버전 관리하고 장치 간에 동기화할 준비가 되었습니다!
