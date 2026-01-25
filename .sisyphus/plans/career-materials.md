# Career Materials System Plan

## Context

### Original Request
Organize resume/portfolio/LinkedIn/GitHub materials, migrate all existing application files into Obsidian, clean GitHub README, update LinkedIn, improve the portfolio page, and selectively prune blog posts before the hiring season.

### Interview Summary
**Key Discussions**:
- Obsidian is the source of truth; new top-level folder name is `50. Career`.
- Migrate everything from `C:\Users\SweetHeart\Downloads\2025-하반기-이력서` into Obsidian.
- Sensitive docs live under `50. Career/00. Private`.
- Convert HWP/HWPX/PDF to Markdown for search/editing; keep originals.
- Manual export from Hancom (no batch). Use pandoc CLI in Linux for conversion.
- GitHub README uses placeholder projects; replace with real org/public projects.
- Canonical GitHub README project list:
  - Omechu (repo: https://github.com/Team-Omechu/Omechu-web, demo: https://omechu.log8.kr)
  - Finders (repo: https://github.com/Finders-Official/BE)
  - UMC Hackathon (repo: https://github.com/umc-hackaton-4team/FE)
  - log8 (repo: https://github.com/IISweetHeartII/My_Website_Astro, demo: https://log8.kr)
- LinkedIn updates and portfolio page improvements are in scope.
- Blog pruning is selective (keep only valuable posts).
- Blog pruning criteria: keep posts that feel human-written and have technical value; archive/delete the rest.

**Research Findings**:
- Vault path: `/mnt/c/Users/SweetHeart/내 드라이브/Vault`.
- Vault structure in `README.md` describes current PKM layout; career items scattered in `00. Inbox/08. Unlisted`.
- Resume folder contains final PDFs, required docs, AI assessments, and company-specific folders.
- Existing career note: `00. Inbox/08. Unlisted/RESUME - 너디너리 행사.md`.

### Metis Review
**Identified Gaps (addressed in plan)**:
- Add guardrails for sensitive docs and no deletions without approval.
- Define scope boundaries for blog pruning, LinkedIn edits, and portfolio changes.
- Validate pandoc conversion of HWPX before bulk conversion.
- Keep originals alongside Markdown conversions.

---

## Working Locations / Repos

- Obsidian Vault (git-tracked): `/mnt/c/Users/SweetHeart/내 드라이브/Vault`
- Resume source folder: `/mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서`
- GitHub profile repo: `/home/sweetheart/projects/IISweetHeartII`
- Blog/portfolio repo: `/home/sweetheart/projects/My_Website_Astro`

## Work Objectives

### Core Objective
Create a unified, searchable career materials system inside Obsidian, migrate and normalize all existing application files, and align public profiles (GitHub, LinkedIn, portfolio) with real projects and accurate information.

### Concrete Deliverables
- `50. Career` folder structure inside the Obsidian vault.
- Migrated application materials with sensitive documents separated into `00. Private`.
- Markdown conversions for HWP/HWPX/PDF with originals preserved.
- Updated GitHub profile README with real projects.
- LinkedIn update draft (no direct edits without review).
- Updated portfolio page content on `log8.kr` (project list/links).
- Blog pruning list and execution after approval.

### Definition of Done
- [ ] `50. Career` exists with agreed subfolders.
- [ ] All files from `2025-하반기-이력서` are present in the new structure.
- [ ] Each HWP/HWPX/PDF has a corresponding `.md` conversion.
- [ ] `50. Career` is ignored by git by default (opt-in required to track).
- [ ] `IISweetHeartII/README.md` references real projects only.
- [ ] LinkedIn changes documented in a markdown draft.
- [ ] Portfolio page shows real projects and working links.
- [ ] Blog pruning actions only after explicit user approval.

### Must Have
- Preserve all originals while generating Markdown copies.
- Separate sensitive files into `00. Private`.
- Validate pandoc conversion before full migration.
- Blog pruning keeps human-written + technically valuable posts only; others archived.
- Use explicit conversion commands and failure logging for document conversion.

### Must NOT Have (Guardrails)
- Do not delete any source files without explicit approval.
- Do not commit sensitive documents to git.
- Do not reorganize existing vault structure beyond adding `50. Career`.
- Do not rewrite blog posts during pruning (keep/delete only).
- Do not modify org repositories; only update references.
- Do not perform LinkedIn changes without user review.

---

## Verification Strategy (Manual QA)

### Manual Checks
- File presence and counts after migration.
- Sample conversions open correctly in Obsidian.
- GitHub README links resolve to live repos.
- Portfolio page renders with updated projects.

### Evidence Required
- Command outputs for key file operations.
- List of migrated files with counts.
- Screenshot or text proof of portfolio page changes.

---

## Task Flow

```
Structure + Templates → Migration Staging → Conversion + Indexing → Public Profiles → Blog Pruning
```

## Parallelization

| Group | Tasks | Reason |
|------|-------|--------|
| A | 1, 2 | Independent structure setup vs export staging |
| B | 3, 5 | GitHub + LinkedIn drafts can be done after migration | 

| Task | Depends On | Reason |
|------|------------|--------|
| 3 | 1, 2 | Migration requires structure + exports |
| 4 | 3 | Conversion happens after classification |
| 6 | 5 | Blog pruning references portfolio alignment | 

---

## TODOs

- [ ] 1. Create `50. Career` structure and safety guardrails

  **What to do**:
  - Create folder tree under `/mnt/c/Users/SweetHeart/내 드라이브/Vault/50. Career`:
    - `00. Private` (sensitive docs)
    - `01. Resume`
    - `02. Portfolio`
    - `03. Cover Letters`
    - `04. Applications`
    - `05. Company Research`
    - `06. AI Assessments`
    - `07. Supporting Docs`
    - `90. Templates`
  - Add a `README.md` inside `50. Career` describing the structure and usage.
  - Determine git tracking:
    - If `/mnt/c/Users/SweetHeart/내 드라이브/Vault/.git` exists and `git status` works, update `/mnt/c/Users/SweetHeart/내 드라이브/Vault/.gitignore` with:
      - `50. Career/`
    - If vault is not git-tracked, create `50. Career/.gitignore` with `*` to prevent accidental sharing.
  - Policy (default): do NOT commit any `50. Career` materials unless the user explicitly opts in.
  - Opt-in procedure (if needed later): remove `50. Career/` from `.gitignore` and re-add a narrower rule for `50. Career/00. Private/` only.

  **Must NOT do**:
  - Do not move/delete existing vault folders.
  - Do not commit sensitive files.

  **Parallelizable**: YES (with task 2)

  **References**:
  - `/mnt/c/Users/SweetHeart/내 드라이브/Vault/README.md` - Follow existing PKM folder naming conventions.
  - `/mnt/c/Users/SweetHeart/내 드라이브/Vault/00. Inbox/08. Unlisted/RESUME - 너디너리 행사.md` - Existing resume content to link or migrate.

  **Acceptance Criteria**:
  - [ ] `50. Career` and subfolders exist.
  - [ ] `50. Career` is gitignored by default (if vault is git-tracked).
  - [ ] `50. Career/README.md` documents the structure.

  **Manual Verification**:
  - [ ] `ls "/mnt/c/Users/SweetHeart/내 드라이브/Vault/50. Career"` shows all subfolders.

- [ ] 2. Stage exports from Hancom (manual)

  **What to do**:
  - From Windows Hancom Office, manually export each HWP/HWPX to DOCX (required) and PDF (optional).
  - Exported files must keep the same base name as the original (e.g., `삼성전자-최종.hwpx` → `삼성전자-최종.docx`).
  - Place exports into a staging folder: `C:\Users\SweetHeart\Downloads\2025-하반기-이력서\_exports`.
  - Keep originals untouched in place.

  **Must NOT do**:
  - Do not overwrite originals.
  - Do not delete any HWP/HWPX files.

  **Parallelizable**: YES (with task 1)

  **References**:
  - `/mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서` - Source folder for all materials.

  **Acceptance Criteria**:
  - [ ] `_exports` folder exists with DOCX/PDF copies.

  **Manual Verification**:
  - [ ] `ls "/mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서/_exports"` shows exported files.

- [ ] 3. Migrate and classify materials from the resume folder

  **What to do**:
  - Copy-then-verify ONLY. Do not delete or move anything from the source folder without approval.
  - Name collision rule: if destination file exists, append `-dup{n}` and log the collision in `Migration-Report.md`.
  - Sensitive document criteria (copy to `00. Private`):
    - 주민등록증, 여권, 학생증/신분증, 성적증명서, 졸업증명서, 자격증, 서명 이미지, 사업자등록증.
  - File-type rules:
    - `.pdf/.docx/.hwp/.hwpx` → keep with converted `.md` in target folder.
    - `.png/.jpg` company analysis images → `05. Company Research/{company}`.
    - `.png/.jpg` personal IDs → `00. Private`.
    - `.xlsx` course lists → `07. Supporting Docs/{company}`.
  - Map folders:
    - `02_필수서류 모음` → copy into `50. Career/00. Private`
    - `01_최종 모음` → copy into `50. Career/01. Resume` by default; if filename contains `포트폴리오`, place in `50. Career/02. Portfolio` instead.
    - `03_AI역량검사` → copy into `50. Career/06. AI Assessments`
    - `2025*_*` company folders → copy into `50. Career/04. Applications/{company}`
    - `기업분석` inside company folders → copy into `50. Career/05. Company Research/{company}`
    - `아카이브/` → copy into `50. Career/07. Supporting Docs/_archive`
    - Root-level loose files → copy into `50. Career/07. Supporting Docs/_unclassified`
  - Company folder naming:
    - Use the raw folder name as `{company}` (e.g., `20250925_CJ푸드빌`).
  - Export copy rule (for conversion):
    - For each HWP/HWPX in destination, copy its matching DOCX/PDF from `_exports` into the same destination folder (same basename).
    - If an export is missing, log it in `Migration-Report.md` under “Missing exports”.
  - Create `index.md` per company using this template:
    - `# {Company} - {Role}`
    - `## Status` (지원/서류/면접/결과)
    - `## Dates` (지원일, 마감일)
    - `## Files` (links to resume/portfolio/analysis)
    - `## Notes` (핵심 요약)
    - `## Next Actions`
  - Generate a migration report at `50. Career/90. Templates/Migration-Report.md` with:
    - Source counts per folder (01_최종 모음, 02_필수서류 모음, 03_AI역량검사, each company folder)
    - Destination counts per folder (01. Resume, 02. Portfolio, 00. Private, 06. AI Assessments, 04. Applications/*, 05. Company Research/*)
    - A list of files routed to `00. Private`
    - A migration map file at `50. Career/90. Templates/Migration-Map.csv` with columns:
      - `src_rel,dest_rel,action,collision_note`
    - A list of missing or unmatched files (by relative path)
    - Source manifest (relative paths)
    - Destination manifest (relative paths)
    - Recommended script (writes the report file; adjust paths if needed):
      - `python3 - <<'PY'`
      - `import pathlib, json`
      - `src = pathlib.Path('/mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서')`
      - `dest = pathlib.Path('/mnt/c/Users/SweetHeart/내 드라이브/Vault/50. Career')`
      - `def files(p): return [x for x in p.rglob('*') if x.is_file()]`
      - `src_counts = {p.name: len(files(p)) for p in src.iterdir() if p.is_dir() and p.name != '_exports'}`
      - `dest_counts = {p.name: len(files(p)) for p in dest.iterdir() if p.is_dir()}`
      - `private_files = [str(x) for x in (dest/'00. Private').rglob('*') if x.is_file()]`
      - `src_manifest = [str(x.relative_to(src)) for x in files(src) if '_exports' not in str(x)]`
      - `dest_manifest = [str(x.relative_to(dest)) for x in files(dest)]`
      - `map_file = dest/'90. Templates'/'Migration-Map.csv'`
      - `mapped = []`
      - `if map_file.exists():
            mapped = [line.split(',')[0] for line in map_file.read_text(encoding='utf-8').splitlines()[1:] if line]`
      - `missing = sorted([p for p in src_manifest if p not in mapped])`
      - `exports = {x.stem for x in (src/'_exports').rglob('*') if x.is_file()}`
      - `dest_hwps = {x.stem for x in dest.rglob('*') if x.suffix.lower() in {'.hwp','.hwpx'}}`
      - `missing_exports = sorted(list(dest_hwps - exports))`
      - `out = dest/'90. Templates'/'Migration-Report.md'`
      - `out.write_text(
            '# Migration Report\n\n'
            '## Source Counts\n' + '\n'.join([f'- {k}: {v}' for k,v in src_counts.items()]) + '\n\n'
            '## Destination Counts\n' + '\n'.join([f'- {k}: {v}' for k,v in dest_counts.items()]) + '\n\n'
            '## Private Files\n' + '\n'.join([f'- {p}' for p in private_files]) + '\n\n'
            '## Missing Exports\n' + '\n'.join([f'- {p}' for p in missing_exports]) + '\n\n'
            '## Missing (No Mapping Record)\n' + '\n'.join([f'- {p}' for p in missing]) + '\n\n'
            '## Source Manifest\n' + '\n'.join([f'- {p}' for p in src_manifest]) + '\n\n'
            '## Destination Manifest\n' + '\n'.join([f'- {p}' for p in dest_manifest]) + '\n',
            encoding='utf-8')`
      - `PY`

  **Must NOT do**:
  - Do not delete the original source folder without user approval.

  **Parallelizable**: NO (depends on tasks 1, 2)

  **References**:
  - `/mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서` - Source materials.
  - `/mnt/c/Users/SweetHeart/내 드라이브/Vault/50. Career` - Destination.

  **Acceptance Criteria**:
  - [ ] All source files have mapping records in `Migration-Map.csv` (excluding `_exports`).
  - [ ] `00. Private` contains sensitive docs only.
  - [ ] Each company folder has an `index.md` note.
  - [ ] `50. Career/90. Templates/Migration-Report.md` exists with counts and missing list.
  - [ ] `Missing (No Mapping Record)` is empty (excluding `_exports`).

  **Manual Verification**:
  - [ ] Compare counts and manifests between source and destination in `Migration-Report.md`.

- [ ] 4. Convert DOCX/PDF to Markdown using pandoc

  **What to do**:
  - Preflight checks:
    - `pandoc --version` (install if missing)
    - `pdftotext -v` (install if missing)
  - Install tools (if missing and sudo available):
    - `sudo apt-get update`
    - `sudo apt-get install -y pandoc poppler-utils`
  - If sudo is unavailable, stop and log a prerequisite failure in `50. Career/90. Templates/Conversion-Failures.md`.
  - Test conversion on a single DOCX:
    - Pick the first DOCX in `_exports`:
      - `ls "/mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서/_exports" | grep -i '\.docx$' | head -n 1`
    - Convert that file to `/tmp/sample.md` and verify readability.
  - Conversion mapping (in-place):
    - For each DOCX/PDF copied into `50. Career`, create `.md` in the same folder with the same base name.
    - Example: `.../01. Resume/삼성전자-최종.docx` → `.../01. Resume/삼성전자-최종.md`.
  - HWP/HWPX contract:
    - Every HWP/HWPX must have a matching DOCX export in `_exports` with the same base name.
    - The `.md` output uses that base name and is placed alongside the original in `50. Career`.
    - DOCX/PDF exports remain in `_exports`; copies live next to originals for conversion.
  - Convert DOCX exports:
    - `pandoc "$FILE" -f docx -t markdown -o "${FILE%.*}.md"`
  - Convert PDF exports (best effort):
    - `pandoc "$FILE" -f pdf -t markdown -o "${FILE%.*}.md"`
  - If PDF conversion fails, fallback:
    - `pdftotext "$FILE" - | tee "${FILE%.*}.txt"`
    - Create a markdown wrapper with this exact template:
      - `---`
      - `title: "{base name}"`
      - `source_file: "{base name}.pdf"`
      - `conversion: "pdftotext fallback"`
      - `---`
      - ``
      - `See extracted text in {base name}.txt`
  - Write conversion failures to `50. Career/90. Templates/Conversion-Failures.md` with:
    - Source file, error output, fallback used, manual steps needed.

  **Must NOT do**:
  - Do not delete or replace original files.
  - Do not skip conversion failures; log them for manual copy.

  **Parallelizable**: NO (depends on tasks 1–3)

  **References**:
  - `/mnt/c/Users/SweetHeart/내 드라이브/Vault/50. Career` - Destination folders for conversion.

  **Acceptance Criteria**:
  - [ ] Each converted document has a matching `.md` file.
  - [ ] Sample `.md` opens in Obsidian with readable structure.
  - [ ] Conversion failures are logged in `50. Career/90. Templates/Conversion-Failures.md`.
  - [ ] Fallback conversions include `.txt` + wrapper `.md` in the same folder.

  **Manual Verification**:
  - [ ] Open 3 converted `.md` files in Obsidian to confirm readability.

- [ ] 5. Update GitHub profile README with real projects

  **What to do**:
  - Replace placeholder rows (Smart Habit Tracker, Issue Radar, Dev Portal, GenAI Playground) with the canonical list:
    - Omechu: https://github.com/Team-Omechu/Omechu-web (demo: https://omechu.log8.kr)
    - Finders: https://github.com/Finders-Official/BE
    - UMC Hackathon: https://github.com/umc-hackaton-4team/FE (award note)
    - log8: https://github.com/IISweetHeartII/My_Website_Astro (demo: https://log8.kr)
  - Remove the placeholder template block if it remains in README.
  - Order projects: 최신/대표성 기준 (Omechu → Finders → UMC Hackathon → log8).
  - Populate table columns with verified sources only:
    - Omechu: Role/stack/highlights from `src/pages/portfolio.astro`.
    - log8: Stack/features from `README.md` in `My_Website_Astro`.
    - Finders/UMC Hackathon: extract role/stack/highlights from each repo README; if absent, use `TBD` and add a note in `50. Career/01. Resume/Project-Index.md` to fill later.
  - Create `50. Career/01. Resume/Project-Index.md` to record sources per project (link to repo README or portfolio lines).

  **Must NOT do**:
  - Do not edit org repos themselves.

  **Parallelizable**: YES (after task 4)

  **References**:
  - `/home/sweetheart/projects/IISweetHeartII/README.md` - GitHub profile README to update.

  **Acceptance Criteria**:
  - [ ] Project table references real repos only.
  - [ ] All links resolve.
  - [ ] Each table cell is sourced from README or portfolio content; no invented values.
  - [ ] Table formatting rules:
    - Role: single short phrase.
    - Stack: top 5 tech keywords.
    - Highlight: 1 award/metric + 1 feature (or `TBD`).

  **Manual Verification**:
  - [ ] Open each link to confirm 200 OK.

- [ ] 6. Draft LinkedIn updates and portfolio page changes

  **What to do**:
  - Create a LinkedIn update draft in `50. Career/01. Resume/LinkedIn-Draft.md` with:
    - Headline, About, Experience bullets, Featured links (Omechu, Finders, UMC Hackathon, log8).
    - Language: Korean.
    - Scope: Headline + About + Experience + Featured only.
    - Target role phrasing: AI 네이티브 프론트엔드 개발자.
  - Update `src/pages/portfolio.astro`:
    - Keep Omechu, update its repo link if missing.
    - Replace Starterm section with Finders (repo link).
    - Replace 윷놀이 게임 section with UMC Hackathon (repo link).
    - Add log8 project block (repo + demo link) if not present.
  - Ensure the project list matches GitHub README ordering and links.
  - Sourcing rule (no invention):
    - For Finders/UMC/log8, copy facts only from repo README or existing Obsidian notes; if missing, use `TBD` and omit metrics/awards.
  - Minimum fields per project block:
    - Role, dates (if known), 1–2 highlights, links.

  **Must NOT do**:
  - Do not apply LinkedIn edits without user approval.

  **Parallelizable**: YES (after task 5)

  **References**:
  - `src/pages/portfolio.astro` - Portfolio page to edit.
  - `/home/sweetheart/projects/IISweetHeartII/README.md` - Project list alignment.

  **Acceptance Criteria**:
  - [ ] LinkedIn draft exists.
  - [ ] Portfolio page shows real project links.

  **Manual Verification**:
  - [ ] Run `pnpm dev` and view `http://localhost:4321/portfolio`.

- [ ] 7. Build a blog pruning list and execute after approval

  **What to do**:
  - Scan `src/content/blog` and list posts to keep/remove.
  - Record rationale for each decision in `50. Career/05. Company Research/Blog-Pruning.md` (keep if human-written + technical value).
  - Archive mechanism:
    - Create folder: `src/content/blog/_archive`.
    - KEEP: leave in place with `publish: true` (add if missing).
    - ARCHIVE: move to `src/content/blog/_archive` and set `publish: false` (add if missing).
    - DELETE: only after explicit user approval; otherwise use ARCHIVE.
    - Preserve `slug` frontmatter to avoid URL changes for KEEP posts.
    - If `slug` is missing, set `slug` to the original filename (without extension) before moving.
  - Route filtering (to prevent archived posts from being served directly):
    - Canonical rule: only posts with `publish === true` are public.
    - Update `getStaticPaths()` in `src/pages/blog/[...slug].astro` to filter by `publish === true`.
    - Update `src/pages/category/[category].astro` to use the same rule (`publish === true`).
    - Keep `src/pages/blog.astro` as the source of truth via `getSortedPublishedPosts()`.
  - Human-written + technical value checklist:
    - First-person narrative or clear personal insight.
    - Concrete technical content (code, architecture, or build notes).
    - Not generic or AI-like boilerplate.
  - Approval gate: first produce the pruning list only. No moves/edits until approval is recorded.

  **Must NOT do**:
  - Do not rewrite post bodies; only adjust frontmatter fields (publish/slug).

  **Parallelizable**: NO (depends on task 6)

  **References**:
  - `src/content/blog` - Blog posts to assess.

  **Acceptance Criteria**:
  - [ ] Pruning list created with keep/remove decisions.
  - [ ] User approval recorded before any archive/delete (add `## Approval` section with date + explicit statement).
  - [ ] `pnpm build` succeeds after pruning.
  - [ ] Archived posts are excluded from route generation.
  - [ ] Confirm a known archived slug returns 404 in preview.

  **Manual Verification**:
  - [ ] After approval, confirm remaining posts build correctly.

---

## Commit Strategy

| After Task | Repo | Message | Files | Verification |
|------------|------|---------|-------|--------------|
| 5 | `/home/sweetheart/projects/IISweetHeartII` | `docs(github): refresh featured projects` | `README.md` | Manual link check |
| 6 | `/home/sweetheart/projects/My_Website_Astro` | `feat(portfolio): align projects with README` | `src/pages/portfolio.astro` | `pnpm dev` |
| 7 | `/home/sweetheart/projects/My_Website_Astro` | `content(blog): prune low-value posts` | `src/content/blog/*` | `pnpm build` |

---

## Success Criteria

### Verification Commands
```bash
ls "/mnt/c/Users/SweetHeart/내 드라이브/Vault/50. Career"
pnpm dev
```

### Final Checklist
- [ ] `50. Career` structure exists and is documented.
- [ ] All materials migrated and converted with originals preserved.
- [ ] Sensitive docs isolated under `00. Private` and not tracked.
- [ ] GitHub README reflects real projects only.
- [ ] LinkedIn draft prepared for user review.
- [ ] Portfolio page updated with real projects and links.
- [ ] Blog pruning executed only after approval.
