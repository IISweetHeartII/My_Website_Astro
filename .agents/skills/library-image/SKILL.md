---
name: library-image
description: Generate project library image assets from Astro library markdown image prompt comments. Use when the user asks to run or adapt /library-image, create images for src/content/library/*.md, parse "📸 이미지 프롬프트" comments, follow public/images/library/[slug]/ naming, skip existing images unless forced, or use Codex image generation for this library content convention.
---

# Library Image

Generate images for `src/content/library/*.md` from embedded image prompt comments and save them under the library image convention.

## Workflow

1. Run the parser from the repo root:

   ```bash
   python3 .agents/skills/library-image/scripts/parse_image_prompts.py <library-md-path>
   ```

   Use `--only thumbnail,01` to target specific slots and `--force` only when the user explicitly asks to overwrite existing images.

2. For each manifest item with `"action": "generate"`, use the existing `$imagegen` skill in its default built-in tool mode. Do not use CLI fallback unless the user explicitly asks for CLI/API/model controls.

3. Build the final prompt from the manifest `prompt`. If `aspect_ratio` is `16:9`, append:

   ```text
   wide cinematic landscape 16:9 aspect ratio --ar 16:9
   ```

4. Create the parent directory for `output_path` if needed. Save the generated image to `output_path`. Built-in image generation saves under `$CODEX_HOME/generated_images/...` first; move or copy the selected final PNG into the workspace path from the manifest. Never leave a library-referenced asset only under `$CODEX_HOME`.

5. Do not overwrite existing files unless `--force` was used and the user asked for replacement.

6. Report generated and skipped paths. Mention that prompt comments remain in markdown for review unless the user asks to remove them.

## Library Convention

```text
public/images/library/[slug]/thumbnail.png
public/images/library/[slug]/01_[description].png
public/images/library/[slug]/02_[description].png
```

- `slug`: frontmatter `slug`, or the markdown filename stem
- thumbnail: `thumbnail.png`
- body images: two-digit sequence plus underscore description
- extension: `.png`

## Prompt Comment Format

Parse comments containing `📸 이미지 프롬프트`:

```markdown
![이미지 설명](/images/library/example/01_diagram.png)

<!--
  📸 이미지 프롬프트:
  prompt: "A clean technical diagram, flat infographic style"
  aspect_ratio: "16:9"
  session_id: "library-example"
  save_as: "01_diagram.png"
-->
```

Inline comments using comma-separated `key: "value"` pairs are also valid.

If `save_as` is missing, assign `thumbnail.png` for the first thumbnail-like prompt only when clearly requested by adjacent markdown or prompt text; otherwise assign `01_image.png`, `02_image.png`, etc. Default aspect ratio is `4:3` for `thumbnail.png`, otherwise `16:9`.
