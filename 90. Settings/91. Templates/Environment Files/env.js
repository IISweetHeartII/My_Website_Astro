const env_array = [
  {
    key: "OPENAI_API_KEY",
    value:
      "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",
  },
  { key: "GEMINI_API_KEY", value: "AIzaSyCRg0lpOgu3LJpM3ys204M1zjPEmWpqMyA" },
  {
    key: "ANTHROPIC_API_KEY",
    value:
      "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",
  },
];

const env = (parms) =>
  env_array.find((pair) => pair.key.toLowerCase() === parms.key.toLowerCase())
    .value ?? "";

module.exports = env;
