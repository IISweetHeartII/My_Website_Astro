export interface ProjectLink {
  label: string;
  url: string;
  icon: "github" | "external" | "lock";
}

export interface Project {
  title: string;
  role: string;
  highlight: string;
  description: string;
  tags: string[];
  links: ProjectLink[];
  gradient: string;
  borderColor: string;
  featured?: boolean;
  screenshot?: string;
}

export const projects: Project[] = [
  {
    title: "agentgram",
    role: "Core Contributor (ongoing)",
    highlight: "Open-Source AI Agent Social Network",
    description:
      "AI 에이전트들이 소통하는 오픈소스 소셜 네트워크. 멀티 레포 에코시스템으로 활발히 개발 중입니다.",
    tags: ["Open Source", "AI Agent", "Multi-Repo"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/agentgram/agentgram",
        icon: "github",
      },
      {
        label: "Live",
        url: "https://agentgram.co",
        icon: "external",
      },
    ],
    gradient: "from-indigo-500 to-blue-500",
    borderColor: "border-indigo-200",
    featured: true,
  },
  {
    title: "Finders",
    role: "Backend Lead (11-person team)",
    highlight: "GCP Infra + Code Review Culture",
    description:
      "필름 현상소 연결 플랫폼의 백엔드 리드. GCP 인프라 구축, 코드 리뷰 문화 정착, AI 기반 필름 복원 기능을 개발했습니다.",
    tags: ["Java 21", "Spring Boot", "GCP", "Docker", "QueryDSL"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/Finders-Official/BE",
        icon: "github",
      },
      {
        label: "Live",
        url: "https://finders.it.kr",
        icon: "external",
      },
    ],
    gradient: "from-sky-500 to-cyan-600",
    borderColor: "border-sky-200",
    featured: true,
  },
  {
    title: "UMC Hackathon Team4",
    role: "BE + FE Contributor",
    highlight: "Grand Prize Winner",
    description:
      "촉박한 일정 속에서 End-to-End MVP를 완성해 해커톤 대상을 수상했습니다. 기획부터 배포까지 전 과정에 참여했습니다.",
    tags: ["Hackathon", "Spring Boot", "Next.js", "Full-Stack"],
    links: [
      {
        label: "BE",
        url: "https://github.com/umc9-hackathon-team4/BE",
        icon: "github",
      },
      {
        label: "FE",
        url: "https://github.com/umc9-hackathon-team4/FE",
        icon: "github",
      },
    ],
    gradient: "from-amber-500 to-orange-600",
    borderColor: "border-amber-200",
  },
  {
    title: "119-ai",
    role: "Founder / Owner",
    highlight: "Personal Product + Patent Prep",
    description: "개인 제품으로 전환 중이며, 특허 출원을 준비하고 있습니다. 코드는 비공개입니다.",
    tags: ["AI", "Product", "Patent"],
    links: [
      {
        label: "Live",
        url: "https://emergency-ai-call.log8.kr",
        icon: "external",
      },
    ],
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-200",
  },
  {
    title: "iCan Labs",
    role: "Founder / Owner",
    highlight: "AI Math Education Platform",
    description: "AI 기반 수학 교육 플랫폼. 학습자 맞춤형 문제 풀이와 시각화를 제공합니다.",
    tags: ["AI", "Education", "Math"],
    links: [
      {
        label: "Live",
        url: "https://mathfigure.log8.kr",
        icon: "external",
      },
    ],
    gradient: "from-sky-500 to-indigo-600",
    borderColor: "border-sky-200",
  },
  {
    title: "log8",
    role: "1-person Dev & Ops",
    highlight: "AI-Paired Tech Blog (This Site)",
    description:
      "지금 보고 계신 이 사이트. Astro + TailwindCSS v4로 구축하고, CI/CD 파이프라인과 AI 페어 프로그래밍으로 운영 중입니다.",
    tags: ["Astro", "TailwindCSS v4", "Cloudflare", "CI/CD"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/IISweetHeartII/My_Website_Astro",
        icon: "github",
      },
      {
        label: "Live",
        url: "https://log8.kr",
        icon: "external",
      },
    ],
    gradient: "from-indigo-500 to-sky-600",
    borderColor: "border-indigo-200",
  },
];

export function getOrderedLinks(links: ProjectLink[]): ProjectLink[] {
  const priority = {
    external: 0,
    github: 1,
    lock: 2,
  } as const;

  return [...links].sort((a, b) => priority[a.icon] - priority[b.icon]);
}
