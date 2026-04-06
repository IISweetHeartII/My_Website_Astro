---
description: 블로그 마크다운 파일의 이미지 프롬프트 주석을 파싱하여 이미지를 생성합니다
---

블로그 마크다운 파일을 읽어서 이미지 프롬프트 주석을 파싱하고, 각 이미지를 컨벤션에 맞게 생성합니다.

## Image Convention

```
public/images/blogs/[번호]/[번호]_[순번]_[description].png
```

- 번호: 3자리 (`050`)
- 순번: 2자리 (`01`, `02`...), 썸네일은 `00`
- 설명: 영문 소문자 + 하이픈 (`coding-start`, `business-fail`)
- 확장자: `.png` 고정

예시:
- `public/images/blogs/050/050_00_thumbnail.png`
- `public/images/blogs/050/050_01_coding-start.png`

## Steps

1. **파일 확인**: 현재 열린 파일 또는 인자로 받은 블로그 마크다운 파일을 읽는다
2. **글 번호 파악**: 파일명에서 번호 추출 (예: `051_제목.md` → `051`)
3. **프롬프트 파싱**: 아래 형식의 주석을 모두 찾는다:

```markdown
<!--
  📸 이미지 프롬프트:
  prompt: "이미지 설명 프롬프트"
  aspect_ratio: "16:9"
  session_id: "blog-051"
  save_as: "051_01_description.png"
-->
```

4. **출력 디렉토리 생성**: `public/images/blogs/[번호]/` 디렉토리가 없으면 생성한다

5. **이미지 생성**: 각 프롬프트에 대해 이미지를 생성한다:
   - 프롬프트: 주석에서 추출한 `prompt` 값 사용
   - 비율: `aspect_ratio` 값 사용 (기본값: 썸네일(`00`)은 `4:3`, 본문은 `16:9`)
   - 파일명: `save_as` 값 사용. 없으면 순서대로 `[번호]_01_image.png`, `[번호]_02_image.png` 자동 부여
   - 저장 경로: `public/images/blogs/[번호]/`
   - `session_id`가 같은 이미지들은 스타일 일관성을 유지한다

6. **스킵 규칙**: 해당 경로에 이미 파일이 존재하면 건너뛴다 (덮어쓰지 않음)

7. **결과 보고**: 아래 형식으로 결과를 출력한다:

```
✅ 생성 완료:
  - public/images/blogs/051/051_00_thumbnail.png (4:3)
  - public/images/blogs/051/051_01_coding-start.png (16:9)
  - public/images/blogs/051/051_02_result.png (16:9)

⏭️ 스킵 (이미 존재):
  - public/images/blogs/051/051_03_example.png

💡 생성 후 마크다운의 이미지 프롬프트 주석을 제거하세요.
```

## Usage

```
/blog-image src/content/blog/051_제목.md
```

특정 이미지만 재생성하려면:
```
/blog-image src/content/blog/051_제목.md --only 01,03
```

강제 덮어쓰기:
```
/blog-image src/content/blog/051_제목.md --force
```

## Image prompt comment format

blog-write 스킬이 생성하는 표준 형식:

```markdown
![이미지 설명](/images/blogs/051/051_01_coding-start.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A developer sitting at a desk late at night, surrounded by monitors with code, flat illustration, warm lighting, consistent character design"
  aspect_ratio: "16:9"
  session_id: "blog-051"
  save_as: "051_01_coding-start.png"
-->
```

## Notes

- `save_as` 키가 없으면 순서대로 자동 번호 부여
- PNG로 저장 → Cloudflare Polish(Lossless) 활성화 시 방문자에게 자동 WebP 변환 제공
- 프롬프트 주석은 자동 제거하지 않음 — 결과 확인 후 수동 제거
- 같은 `session_id`를 사용하면 글 내 이미지 스타일이 일관됨
