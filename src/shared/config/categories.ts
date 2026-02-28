/**
 * 카테고리 설정
 * 블로그 전체에서 사용되는 카테고리 정의 및 매핑
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
}

/**
 * 전체 카테고리 목록
 */
export const categories: Category[] = [
  {
    id: "daily",
    name: "일상",
    icon: "✨",
    description: "일상, 회고, 경험 이야기",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "dev",
    name: "개발",
    icon: "💻",
    description: "웹개발, 프로그래밍, 코딩 이야기",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "ai",
    name: "AI",
    icon: "🤖",
    description: "ChatGPT, AI 도구, 프롬프트 엔지니어링 이야기",
    color: "from-green-500 to-teal-500",
  },
  {
    id: "security",
    name: "보안",
    icon: "🔒",
    description: "웹 보안, 인증, 보안 기술 이야기",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "education",
    name: "교육",
    icon: "📖",
    description: "강연, 수업, 교육 실습 이야기",
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "devops",
    name: "DevOps",
    icon: "⚙️",
    description: "인프라, 서버, 배포, CI/CD 이야기",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "productivity",
    name: "생산성",
    icon: "⚡",
    description: "Obsidian, 워크플로우, 자동화 도구 이야기",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "blog",
    name: "블로그운영",
    icon: "📝",
    description: "블로그 설정, 최적화, 운영 이야기",
    color: "from-pink-500 to-rose-500",
  },
];

/**
 * 카테고리 한글 이름 -> 영문 ID 매핑
 */
export const categoryMap: Record<string, string> = {
  일상: "daily",
  개발: "dev",
  AI: "ai",
  보안: "security",
  교육: "education",
  DevOps: "devops",
  생산성: "productivity",
  블로그운영: "blog",
};

/**
 * 카테고리 영문 ID -> 한글 이름 매핑 (역매핑)
 */
export const reverseCategoryMap: Record<string, string> = {
  daily: "일상",
  dev: "개발",
  ai: "AI",
  security: "보안",
  education: "교육",
  devops: "DevOps",
  productivity: "생산성",
  blog: "블로그운영",
};
