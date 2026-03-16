import { execSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// slides.md가 있는 서브폴더를 자동 감지
const entries = readdirSync(".", { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(d.name, "slides.md")))
  .map((d) => d.name);

console.log(`🎯 빌드 대상: ${entries.join(", ")}`);

// 각 슬라이드 빌드
for (const entry of entries) {
  console.log(`\n📦 빌드 중: ${entry}`);
  execSync(`npx slidev build ${entry}/slides.md --base /${entry}/ --out dist/${entry}`, {
    stdio: "inherit",
  });
}

// 인덱스 페이지 생성
const cards = entries
  .map((entry) => {
    const label = entry.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `
    <a href="/${entry}/" class="card">
      <div class="icon">📊</div>
      <div class="title">${label}</div>
    </a>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>발표 자료 | 김덕환</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Pretendard', -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; margin-bottom: 3rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      width: 100%;
      max-width: 800px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      text-align: center;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }
    .card:hover {
      border-color: #60a5fa;
      background: #1e3a5f;
      transform: translateY(-2px);
    }
    .icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .title { font-size: 0.95rem; font-weight: 600; color: #e2e8f0; }
  </style>
</head>
<body>
  <h1>발표 자료</h1>
  <p>김덕환의 스터디 및 강연 슬라이드</p>
  <div class="grid">${cards}
  </div>
</body>
</html>`;

writeFileSync("dist/index.html", html);
console.log("\n✅ 인덱스 페이지 생성 완료");
console.log("🚀 빌드 완료!");
