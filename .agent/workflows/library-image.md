---
description: library 마크다운 파일의 이미지 프롬프트 주석을 파싱하여 이미지를 생성합니다
---

library 마크다운 파일을 읽어서 이미지 프롬프트 주석을 파싱하고, 각 이미지를 컨벤션에 맞게 생성합니다.

## Image Convention

```
public/images/library/[slug]/thumbnail.png      ← 썸네일
public/images/library/[slug]/01-[description].png
public/images/library/[slug]/02-[description].png
```

- slug: 파일명 또는 frontmatter의 slug 값
- 썸네일: `thumbnail.png`
- 본문: `01-`, `02-` 순번 + 영문 하이픈 설명
- 확장자: `.png` 고정

## Steps

1. **파일 확인**: 인자로 받은 library 마크다운 파일을 읽는다
2. **slug 파악**: frontmatter의 `slug` 필드 또는 파일명에서 slug 추출
3. **프롬프트 파싱**: 아래 형식의 주석을 모두 찾는다:

```markdown
<!--
  📸 이미지 프롬프트:
  prompt: "이미지 설명 프롬프트"
  aspect_ratio: "16:9"
  session_id: "library-[slug]"
  save_as: "01-description.png"
-->
```

4. **출력 디렉토리 생성**: `public/images/library/[slug]/` 디렉토리가 없으면 생성한다

5. **이미지 생성**: 각 프롬프트에 대해 이미지를 생성한다:
   - 프롬프트: 주석에서 추출한 `prompt` 값 사용
   - **기법 (중요)**: `16:9` 비율 시 프롬프트 끝에 `wide cinematic landscape 16:9 aspect ratio --ar 16:9`를 명시적으로 추가
   - 비율: `aspect_ratio` 값 사용 (기본값: 썸네일은 `4:3`, 본문은 `16:9`)
   - 파일명: `save_as` 값 사용
   - 저장 경로: `public/images/library/[slug]/`
   - `session_id`가 같은 이미지들은 스타일 일관성을 유지한다

6. **스킵 규칙**: 해당 경로에 이미 파일이 존재하면 건너뛴다 (덮어쓰지 않음)

7. **결과 보고**:

```
✅ 생성 완료:
  - public/images/library/claude-code-quota-crisis/thumbnail.png (4:3)
  - public/images/library/claude-code-quota-crisis/01-cache-structure.png (16:9)

⏭️ 스킵 (이미 존재):
  - public/images/library/claude-code-quota-crisis/02-pricing.png

💡 생성 후 마크다운의 이미지 프롬프트 주석을 제거하세요.
```

## Usage

```
/library-image src/content/library/claude-code-quota-crisis.md
```

특정 이미지만 재생성:
```
/library-image src/content/library/claude-code-quota-crisis.md --only thumbnail,01
```

강제 덮어쓰기:
```
/library-image src/content/library/claude-code-quota-crisis.md --force
```

## Image prompt comment format

library-write 스킬이 생성하는 표준 형식:

```markdown
![이미지 설명](/images/library/claude-code-quota-crisis/01-cache-structure.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A diagram showing token cache structure with billing layers, flat tech illustration, blue and white color scheme"
  aspect_ratio: "16:9"
  session_id: "library-claude-code-quota-crisis"
  save_as: "01-cache-structure.png"
-->
```

## Notes

- blog-image와 동일한 프롬프트 형식 사용 — 워크플로우 일관성 유지
- PNG 저장 → Cloudflare Polish(Lossless) 활성화 시 방문자에게 자동 WebP 변환
- 프롬프트 주석은 자동 제거하지 않음 — 확인 후 수동 제거
