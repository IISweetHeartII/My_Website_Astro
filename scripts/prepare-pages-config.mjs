import { readFile, unlink, writeFile } from "node:fs/promises";

/** @param {Record<string, any>} config @returns {Record<string, any>} */
export function withChatLimiter(config) {
  if (!config.name || !config.env?.production) {
    throw new Error("Expected freshly downloaded Pages production configuration");
  }
  const result = structuredClone(config);
  result.pages_build_output_dir = "./dist";
  const production = result.env.production;
  const bindings = production.durable_objects?.bindings ?? result.durable_objects?.bindings ?? [];
  production.durable_objects = {
    bindings: [
      ...bindings.filter((binding) => binding.name !== "CHAT_RATE_LIMITER"),
      {
        name: "CHAT_RATE_LIMITER",
        class_name: "ChatRateLimiter",
        script_name: "log8-chat-rate-limiter",
      },
    ],
  };
  return result;
}

if (import.meta.main) {
  // CI downloads the current dashboard configuration first, preserving existing bindings/vars.
  // Secret values are managed by Pages and are not present in the downloaded file.
  if (process.env.CI !== "true") throw new Error("Run this preparation only in the deployment job");
  const config = withChatLimiter(Bun.TOML.parse(await readFile("wrangler.toml", "utf8")));
  await writeFile("wrangler.json", `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  await unlink("wrangler.toml");
}
