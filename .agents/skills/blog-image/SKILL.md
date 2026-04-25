---
name: blog-image
description: Generate project blog image assets from Korean Astro blog markdown image prompt comments. Use when the user asks to run or adapt /blog-image, create images for src/content/blog/*.md, parse "📸 이미지 프롬프트" comments, follow public/images/blogs/[number]/ naming, skip existing images unless forced, or use Codex image generation for this blog's markdown image convention.
---

# Blog Image

Generate images for `src/content/blog/*.md` from embedded image prompt comments and save them under the blog image convention.

## Workflow

1. Run the parser from the repo root:

   ```bash
   python3 .agents/skills/blog-image/scripts/parse_image_prompts.py <blog-md-path>
   ```

   Use `--only 00,01` to target specific slots and `--force` only when the user explicitly asks to overwrite existing images.

2. For each manifest item with `"action": "generate"`, use the existing `$imagegen` skill in its default built-in tool mode. Do not use CLI fallback unless the user explicitly asks for CLI/API/model controls.

3. Build the final prompt from the manifest `prompt`. If `aspect_ratio` is `16:9`, append:

   ```text
   wide cinematic landscape 16:9 aspect ratio --ar 16:9
   ```

4. Create the parent directory for `output_path` if needed. Save the generated image to `output_path`. Built-in image generation saves under `$CODEX_HOME/generated_images/...` first; move or copy the selected final PNG into the workspace path from the manifest. Never leave a blog-referenced asset only under `$CODEX_HOME`.

5. Do not overwrite existing files unless `--force` was used and the user asked for replacement.

6. Report generated and skipped paths. Mention that prompt comments remain in markdown for review unless the user asks to remove them.

## Blog Convention

```text
public/images/blogs/[number]/[number]_[slot]_[description].png
```

- `number`: three digits from the markdown filename, for example `051_제목.md` -> `051`
- `slot`: two digits; thumbnail is `00`
- `description`: lowercase English words with hyphens or underscores from `save_as`
- extension: `.png`

Examples:

```text
public/images/blogs/050/050_00_thumbnail.png
public/images/blogs/050/050_01_coding-start.png
```

## Prompt Comment Format

Parse comments containing `📸 이미지 프롬프트`:

```markdown
<!--
  📸 이미지 프롬프트:
  prompt: "A developer sitting at a desk late at night, flat illustration, warm lighting"
  aspect_ratio: "16:9"
  session_id: "blog-051"
  save_as: "051_01_coding-start.png"
-->
```

Inline comments using comma-separated `key: "value"` pairs are also valid.

If `save_as` is missing, assign names as `[number]_01_image.png`, `[number]_02_image.png`, etc. Default aspect ratio is `4:3` for thumbnail slot `00`, otherwise `16:9`.
