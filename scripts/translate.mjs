#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const COLLECTIONS = new Map([
  ["blog", "src/content/blog"],
  ["library", "src/content/library"],
]);
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const argValue = (flag, fallback = undefined) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

const collection = argValue("--collection", "library");
const slugArg = argValue("--slug");
const check = has("--check");
const publishForVerification = has("--publish-for-verification");
const providerOverride = argValue("--provider") ?? process.env.TRANSLATE_PROVIDER;

if (!COLLECTIONS.has(collection)) {
  console.error(`Unknown --collection ${collection}. Expected blog or library.`);
  process.exit(2);
}

const glossaryPath = path.join(ROOT, "scripts", "glossary.json");
const glossary = fs.existsSync(glossaryPath)
  ? JSON.parse(fs.readFileSync(glossaryPath, "utf8"))
  : {};

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const stripMarkdownExtension = (filePath) => filePath.replace(/\.(md|mdx)$/i, "");
const nowIso = () => new Date().toISOString();

function parseMarkdown(source) {
  const match = source.match(FRONTMATTER_RE);
  if (!match) throw new Error("Markdown file is missing YAML frontmatter");
  return {
    rawFrontmatter: match[1],
    body: source.slice(match[0].length),
  };
}

function parseScalarFrontmatter(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return out;
}

function upsertScalar(raw, key, value) {
  const rendered = typeof value === "boolean" ? String(value) : JSON.stringify(String(value));
  const line = `${key}: ${rendered}`;
  const re = new RegExp(`^${key}:.*$`, "m");
  if (re.test(raw)) return raw.replace(re, line);
  return `${raw.trimEnd()}\n${line}`;
}

function protectOpaque(text) {
  const placeholders = [];
  const put = (value) => {
    const token = `__LOG8_TRANSLATE_PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(value);
    return token;
  };

  const protectedText = text
    .replace(/```[\s\S]*?```/g, put)
    .replace(/`[^`\n]+`/g, put)
    .replace(/https?:\/\/[^\s)\]]+/g, put);

  return {
    text: protectedText,
    restore(value) {
      const restored = value.replace(
        /__LOG8_TRANSLATE_PLACEHOLDER_(\d+)__/g,
        (_match, index) => placeholders[Number(index)] ?? _match
      );
      const leftover = restored.match(/__LOG8_TRANSLATE_PLACEHOLDER_\d+__/);
      if (leftover) throw new Error(`Unrestored translation placeholder remained: ${leftover[0]}`);
      return restored;
    },
  };
}

function findSourceEntries() {
  const base = path.join(ROOT, COLLECTIONS.get(collection));
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
    .map((entry) => path.join(base, entry.name));
}

function findBySlug(slug) {
  for (const filePath of findSourceEntries()) {
    const parsed = parseMarkdown(fs.readFileSync(filePath, "utf8"));
    const data = parseScalarFrontmatter(parsed.rawFrontmatter);
    const entrySlug = data.slug || stripMarkdownExtension(path.basename(filePath));
    if (entrySlug === slug || stripMarkdownExtension(path.basename(filePath)) === slug)
      return { filePath, parsed, data };
  }
  throw new Error(`Could not find ${collection} entry for slug ${slug}`);
}

function listEnglishEntries() {
  const base = path.join(ROOT, COLLECTIONS.get(collection), "en");
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
    .map((entry) => path.join(base, entry.name));
}

function runCommand(command, commandArgs, input) {
  const result = spawnSync(command, commandArgs, {
    input,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited ${result.status}: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function commandExists(command) {
  try {
    execFileSync("/usr/bin/env", ["bash", "-lc", `command -v ${command}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function translateWithLlm(payload) {
  const prompt = `You are translating selected Korean markdown from log8.kr into natural English.\n\nRules:\n- Return only JSON with keys: title, subtitle, description, meta_title, meta_description, og_title, og_description, featured_image_alt, body.\n- Rewrite title and descriptions for English search intent, not literal word-for-word translation.\n- Preserve every placeholder token exactly.\n- Preserve markdown structure and headings.\n- Keep glossary terms exactly as specified.\n- Do not invent facts or add sections.\n\nGlossary JSON:\n${JSON.stringify(glossary, null, 2)}\n\nInput JSON:\n${JSON.stringify(payload, null, 2)}`;

  const provider =
    providerOverride ||
    (commandExists("claude") ? "claude" : commandExists("codex") ? "codex" : "");
  if (provider === "claude") {
    return runCommand("claude", ["-p", prompt], "");
  }
  if (provider === "codex") {
    return runCommand("codex", ["exec", "--sandbox", "read-only", prompt], "");
  }
  throw new Error(
    "No headless LLM CLI found. Install/authenticate claude or codex, or set TRANSLATE_PROVIDER=claude|codex."
  );
}

function parseLlmJson(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start)
    throw new Error(`LLM response did not contain JSON: ${text.slice(0, 300)}`);
  return JSON.parse(cleaned.slice(start, end + 1));
}

function renderFrontmatter(sourceData, translated, translationKey, sourceHash, draft) {
  const lines = [
    `title: ${JSON.stringify(translated.title || sourceData.title || "Untitled")}`,
    translated.subtitle ? `subtitle: ${JSON.stringify(translated.subtitle)}` : null,
    `description: ${JSON.stringify(translated.description || sourceData.description || "")}`,
    "publish: true",
    `draft: ${draft ? "true" : "false"}`,
    'lang: "en"',
    `translationKey: ${JSON.stringify(translationKey)}`,
    `source_hash: ${JSON.stringify(sourceHash)}`,
    `translated_at: ${JSON.stringify(nowIso())}`,
    sourceData.created_date ? `created_date: ${sourceData.created_date}` : null,
    sourceData.updated_date ? `updated_date: ${sourceData.updated_date}` : null,
    sourceData.category ? `category: ${JSON.stringify(sourceData.category)}` : null,
    sourceData.agent ? `agent: ${JSON.stringify(sourceData.agent)}` : null,
    `slug: ${JSON.stringify(sourceData.slug || "")}`,
    sourceData.reading_time ? `reading_time: ${sourceData.reading_time}` : null,
    sourceData.featured_image ? `featured_image: ${sourceData.featured_image}` : null,
    translated.featured_image_alt || sourceData.featured_image_alt
      ? `featured_image_alt: ${JSON.stringify(translated.featured_image_alt || sourceData.featured_image_alt)}`
      : null,
    `meta_title: ${JSON.stringify(translated.meta_title || translated.title || sourceData.title || "")}`,
    `meta_description: ${JSON.stringify(translated.meta_description || translated.description || sourceData.description || "")}`,
    translated.og_title || sourceData.og_title
      ? `og_title: ${JSON.stringify(translated.og_title || translated.title || sourceData.og_title)}`
      : null,
    translated.og_description || sourceData.og_description
      ? `og_description: ${JSON.stringify(translated.og_description || translated.description || sourceData.og_description)}`
      : null,
    sourceData.og_type ? `og_type: ${sourceData.og_type}` : "og_type: article",
    sourceData.twitter_card
      ? `twitter_card: ${sourceData.twitter_card}`
      : "twitter_card: summary_large_image",
  ].filter(Boolean);

  return `---\n${lines.join("\n")}\n---\n`;
}

function doCheck() {
  const stale = [];
  const invalid = [];
  for (const enPath of listEnglishEntries()) {
    const parsed = parseMarkdown(fs.readFileSync(enPath, "utf8"));
    const data = parseScalarFrontmatter(parsed.rawFrontmatter);
    const relativeFile = path.relative(ROOT, enPath);
    if (/__LOG8_TRANSLATE_PLACEHOLDER_\d+__/.test(parsed.body)) {
      invalid.push({ file: relativeFile, reason: "unrestored_placeholder" });
    }
    if (data.created_date && data.updated_date) {
      const created = new Date(data.created_date);
      const updated = new Date(data.updated_date);
      if (
        !Number.isNaN(created.getTime()) &&
        !Number.isNaN(updated.getTime()) &&
        created.getTime() > updated.getTime()
      ) {
        invalid.push({ file: relativeFile, reason: "date_published_after_modified" });
      }
    }
    if (!data.translationKey || !data.source_hash) continue;
    const source = findBySlug(data.slug || stripMarkdownExtension(path.basename(enPath)));
    const currentHash = sha256(source.parsed.body);
    if (currentHash !== data.source_hash) {
      stale.push({
        file: relativeFile,
        slug: data.slug,
        source_hash: data.source_hash,
        current_hash: currentHash,
      });
    }
  }
  if (stale.length > 0 || invalid.length > 0) {
    console.log(JSON.stringify({ stale, invalid }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ stale: [], invalid: [] }, null, 2));
}

if (check) {
  doCheck();
  process.exit(0);
}
if (!slugArg) {
  console.error("Missing --slug for translation generation.");
  process.exit(2);
}

const source = findBySlug(slugArg);
const sourceHash = sha256(source.parsed.body);
const slug = source.data.slug || stripMarkdownExtension(path.basename(source.filePath));
const translationKey = source.data.translationKey || `${collection}:${slug}`;
const protectedBody = protectOpaque(source.parsed.body);
const payload = {
  title: source.data.title,
  subtitle: source.data.subtitle,
  description: source.data.description,
  meta_title: source.data.meta_title,
  meta_description: source.data.meta_description,
  og_title: source.data.og_title,
  og_description: source.data.og_description,
  featured_image_alt: source.data.featured_image_alt,
  body: protectedBody.text,
};

const translated = parseLlmJson(translateWithLlm(payload));
translated.body = protectedBody.restore(translated.body || "");
const destinationDir = path.join(ROOT, COLLECTIONS.get(collection), "en");
fs.mkdirSync(destinationDir, { recursive: true });
const destinationPath = path.join(destinationDir, `${slug}.md`);
const frontmatter = renderFrontmatter(
  source.data,
  translated,
  translationKey,
  sourceHash,
  !publishForVerification
);
fs.writeFileSync(destinationPath, `${frontmatter}\n${translated.body.trim()}\n`, "utf8");

if (!source.data.translationKey) {
  const updatedSource = `---\n${upsertScalar(source.parsed.rawFrontmatter, "translationKey", translationKey)}\n---\n${source.parsed.body}`;
  fs.writeFileSync(source.filePath, updatedSource, "utf8");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      source: path.relative(ROOT, source.filePath),
      output: path.relative(ROOT, destinationPath),
      source_hash: sourceHash,
      draft: !publishForVerification,
    },
    null,
    2
  )
);
