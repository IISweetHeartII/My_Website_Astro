import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true, // 0.0.0.0 바인딩 → WSL2에서 Windows로 포워딩 됨
  },
});
