import { expect, test } from "bun:test";
import { withChatLimiter } from "../scripts/prepare-pages-config.mjs";

test("production binding preserves existing configuration and does not bind previews to production", () => {
  const config = {
    name: "site",
    compatibility_date: "2024-09-23",
    kv_namespaces: [{ binding: "CHAT_KV", id: "existing" }],
    vars: { PUBLIC_GA_ID: "existing" },
    durable_objects: { bindings: [{ name: "OTHER", class_name: "Other", script_name: "other" }] },
    env: {
      production: { vars: { OTHER_SETTING: "value" } },
      preview: { vars: { PREVIEW: "value" } },
    },
  };
  const updated = withChatLimiter(config);
  expect(updated.env.production.durable_objects.bindings).toHaveLength(2);
  expect(updated.env.production.durable_objects.bindings[1].name).toBe("CHAT_RATE_LIMITER");
  expect(updated.env.production.vars).toEqual(config.env.production.vars);
  expect(updated.env.preview).toEqual(config.env.preview);
  expect(updated.kv_namespaces).toEqual(config.kv_namespaces);
  expect(updated.durable_objects).toEqual(config.durable_objects);
  expect(config.env.production.durable_objects).toBeUndefined();
});

test("missing downloaded configuration fails before deployment", () => {
  expect(() => withChatLimiter({ name: "site" })).toThrow("freshly downloaded");
});
