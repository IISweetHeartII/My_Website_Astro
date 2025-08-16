import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="section bg-gradient-to-b from-white to-indigo-50 dark:from-black dark:to-indigo-950/30">
        <div className="container-responsive grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              꾸준함이 만드는 변화
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-prose">
              Astro에서 Next.js로 마이그레이션한 새로운 홈. Tailwind v4 기반의
              깔끔한 UI로 다시 시작합니다.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/blog" className="btn btn-primary">
                블로그 보러가기
              </Link>
              <a href="/who-is-dh" className="btn btn-ghost">
                소개
              </a>
            </div>
          </div>
          <div className="card">
            <p className="text-sm opacity-80">
              기존 자산은 <code>astro_legacy/</code>로 보존했습니다. 점진적으로
              피처 단위로 이전합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
