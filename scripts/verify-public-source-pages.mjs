import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const output = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

test("the home page explains the marketing automation focus and links real examples", async () => {
  const home = await output("index.html");
  assert.ok(home.includes("<title>김덕환 · AI 에이전트와 마케팅 자동화 | Log8</title>"));
  assert.ok(home.includes("AI 에이전트로"));
  assert.ok(home.includes("마케팅을 자동화합니다"));
  assert.ok(home.includes('href="https://salemorning.com/"'));
});

test("the channel's experiment has a canonical HTML page linked from Log8", async () => {
  const page = await output("ai-how-duck/index.html");
  const home = await output("index.html");

  assert.match(page, /rel="canonical" href="https:\/\/log8\.kr\/ai-how-duck\//);
  assert.match(page, /김덕환/);
  assert.match(page, /https:\/\/www\.youtube\.com\/@ai\.howduck/);
  assert.match(page, /https:\/\/www\.youtube\.com\/watch\?v=w0ucWL4mFTc/);
  assert.match(home, /href="\/ai-how-duck\//);
});

test("the existing Black Friday article links the current calendar and marks the old forecast", async () => {
  const article = await output("blog/black-friday-2026-korea-sale-calendar/index.html");

  assert.match(article, /11월 26일 업데이트/);
  assert.match(article, /https:\/\/salemorning\.com\/blackfriday/);
  assert.match(article, /https:\/\/www\.musinsa\.com\/content\/1569521073297955688/);
  assert.match(article, /11월 5일 발행 당시/);
});
