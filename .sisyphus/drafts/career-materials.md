# Draft: Career Materials System

## Requirements (confirmed)
- Wants Obsidian as source of truth for resume/portfolio/cover letters and experience tracking.
- Needs GitHub README cleanup with real projects (org repos + public repos).
- Needs LinkedIn profile updates and portfolio page improvements.
- Wants selective blog cleanup (keep only useful posts).
- Wants a system to manage company/industry analysis and map it to cover letters.
- Career materials should live in a new top-level folder (not inside existing My Knowledge).
- Migrate all materials from the 2025-하반기-이력서 folder into Obsidian.
- Store sensitive documents under a 00. Private folder in the vault.
- Prefer full markdown conversion of documents (including HWP/HWPX/PDF) for search/editing.
- New top-level folder name: 50. Career.
- Use pandoc for DOCX/PDF to Markdown conversion.
- Move all documents from 02_필수서류 모음 into 50. Career/00. Private.
- Prefer running the conversion workflow in the Linux environment.
- Blog pruning criteria: keep human-written + technically valuable posts only; archive/delete the rest.

## Technical Decisions
- Centralize materials in Obsidian vault; distribute to GitHub/LinkedIn/blog as outputs.

## Research Findings
- Obsidian config shows vault path: G:\내 드라이브\Vault.
- Google Drive for Desktop uses stream mode; only DriveFS path exists at /mnt/c/Users/SweetHeart/AppData/Local/Google/DriveFS.
- G: drive is not mounted in this Linux environment; only /mnt/c is available.
- Vault is accessible at /mnt/c/Users/SweetHeart/내 드라이브/Vault.
- Vault README shows current PKM structure (Inbox, CMDS Process, Literature Notes, My Knowledge, Developments, Collections, References, Settings).
- No files found with resume/portfolio/자소서/이력서/자기소개 in filenames.
- Resume materials exist under /mnt/c/Users/SweetHeart/Downloads/2025-하반기-이력서 with subfolders:
  - 01_최종 모음 (final PDFs)
  - 02_필수서류 모음 (certs, transcripts, IDs)
  - 03_AI역량검사 (HWPX scripts + PNGs)
  - company-specific folders (e.g., 20250903_삼성전자, 20250925_CJ푸드빌)
- Vault has career-related notes in 00. Inbox/08. Unlisted, including RESUME - 너디너리 행사.md.

## Notes
- Switching Google Drive for Desktop to “Mirror files” would create a local folder under C: that this environment can access via /mnt/c.

## Open Questions
- Can you enable Google Drive “Mirror files” (or provide a local mirror path) so the vault is accessible under /mnt/c?
- If not, should we copy/export the Obsidian vault into the repo (e.g., /home/sweetheart/projects/My_Website_Astro/_vault)?
- Where should the new career materials live in the vault: new top-level folder (recommended) or inside existing My Knowledge/Project?
  - Answered: new top-level folder.
- Do you want a single top-level folder name (e.g., 50. Career) or a Korean name (e.g., 50. 취업준비)?
- Should we migrate existing materials from Notion/HWP into Obsidian now, or just set up structure + templates first?
- For HWP/HWPX/PDF files, should we keep originals as attachments and create index notes, or convert key files to markdown?
- Which conversion toolchain is acceptable for HWP/HWPX/PDF (e.g., Hancom export to DOCX/PDF, pandoc, OCR)?
- Should we keep originals alongside markdown outputs for audit/format fidelity?
- Is Hancom batch export available/allowed, or should we plan for manual export per file?
  - Answered: manual export (no batch).
- Confirm environment for pandoc install (Windows local vs this Linux container). Homebrew isn't available here.
- Is CLI-only workflow acceptable for conversions (pandoc is CLI)?

## Scope Boundaries
- INCLUDE: Obsidian structure, GitHub README cleanup, LinkedIn updates, portfolio page revamp, selective blog pruning.
- EXCLUDE: Full rewrite of all blog posts unless explicitly requested.
