#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path


COMMENT_RE = re.compile(r"<!--(?P<body>.*?)-->", re.DOTALL)
KV_RE = re.compile(r"(?P<key>[a-zA-Z_]+)\s*:\s*(['\"])(?P<value>.*?)(?<!\\)\2", re.DOTALL)


def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    data = {}
    for line in text[3:end].splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip("'\"")
    return data


def parse_comments(text):
    items = []
    for match in COMMENT_RE.finditer(text):
        body = match.group("body")
        if "이미지 프롬프트" not in body:
            continue
        data = {m.group("key"): m.group("value").strip() for m in KV_RE.finditer(body)}
        if data.get("prompt"):
            items.append(data)
    return items


def blog_number(path):
    match = re.match(r"^(\d{3})", path.name)
    if not match:
        raise SystemExit(f"Cannot infer three-digit blog number from filename: {path.name}")
    return match.group(1)


def slot_from_name(name):
    match = re.match(r"^\d{3}_(\d{2})_", name)
    return match.group(1) if match else None


def selected(item, only):
    if not only:
        return True
    tokens = {token.strip() for token in only.split(",") if token.strip()}
    return bool(tokens & {item["slot"], item["save_as"], item["output_path"], "thumbnail" if item["slot"] == "00" else ""})


def build_manifest(path, force=False, only=None):
    text = path.read_text(encoding="utf-8")
    parse_frontmatter(text)
    number = blog_number(path)
    out_dir = Path("public") / "images" / "blogs" / number
    comments = parse_comments(text)
    manifest = []
    auto_index = 1

    for comment in comments:
        save_as = comment.get("save_as")
        if not save_as:
            save_as = f"{number}_{auto_index:02d}_image.png"
        auto_index += 1

        slot = slot_from_name(save_as) or f"{auto_index - 1:02d}"
        aspect = comment.get("aspect_ratio") or ("4:3" if slot == "00" else "16:9")
        output = out_dir / save_as
        exists = output.exists()
        action = "generate" if force or not exists else "skip"
        item = {
            "source": str(path),
            "number": number,
            "slot": slot,
            "prompt": comment["prompt"],
            "aspect_ratio": aspect,
            "session_id": comment.get("session_id") or f"blog-{number}",
            "save_as": save_as,
            "output_path": str(output),
            "exists": exists,
            "action": action,
        }
        if selected(item, only):
            manifest.append(item)
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Parse blog image prompt comments.")
    parser.add_argument("markdown")
    parser.add_argument("--only", help="Comma-separated slots or filenames, for example 00,01")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    path = Path(args.markdown)
    manifest = build_manifest(path, force=args.force, only=args.only)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
