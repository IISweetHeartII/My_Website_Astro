import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "now.json");

interface ExpertiseItem {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface NowData {
  expertise: ExpertiseItem[];
  activities: ActivityItem[];
}

// 데이터 파일 읽기
async function readData(): Promise<NowData> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // 파일이 없으면 기본 데이터 반환
    return getDefaultData();
  }
}

// 데이터 파일 쓰기
async function writeData(data: NowData): Promise<void> {
  // data 디렉토리가 없으면 생성
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// 기본 데이터
function getDefaultData(): NowData {
  return {
    expertise: [
      {
        id: "1",
        title: "Astro 블로그 플랫폼 개발",
        description:
          "Astro와 TailwindCSS를 활용한 개인 블로그 플랫폼 개발 및 최적화 작업을 진행하고 있습니다.",
        status: "진행중",
      },
      {
        id: "2",
        title: "AI/ML 모델 연구",
        description:
          "최신 LLM들의 아키텍처와 성능을 비교 분석하며, 프롬프트 엔지니어링에 대해 연구하고 있습니다.",
        status: "진행중",
      },
      {
        id: "3",
        title: "시스템 설계 학습",
        description:
          "대규모 시스템 설계와 마이크로서비스 아키텍처에 대해 학습하고 있습니다.",
        status: "진행중",
      },
    ],
    activities: [
      {
        id: "1",
        title: "Showcase 페이지 리뉴얼",
        description:
          "프로젝트 소개 페이지를 사용자 중심으로 완전히 재설계했습니다.",
        date: "2024-12-15",
      },
      {
        id: "2",
        title: "Now 페이지 정적 데이터 구조 개선",
        description:
          "더 나은 사용자 경험을 위한 정적 데이터 구조로 개선했습니다.",
        date: "2024-12-15",
      },
      {
        id: "3",
        title: "블로그 AdSense 최적화",
        description:
          "광고 가시성과 사용자 경험을 고려한 AdSense 배치를 완료했습니다.",
        date: "2024-12-10",
      },
    ],
  };
}

// GET - 모든 데이터 조회
export const GET: APIRoute = async () => {
  try {
    const data = await readData();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to read data" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

// POST 기능 제거됨 - 읽기 전용 API
