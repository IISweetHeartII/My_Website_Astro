"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "bg-white/70 dark:bg-black/30 backdrop-blur border-black/10 dark:border-white/10"
          : "bg-transparent border-transparent"
      }`}>
      <div className="container-responsive h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          My Website
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/who-is-dh" className="btn btn-ghost h-9">
            About
          </a>
          <Link href="/blog" className="btn btn-primary h-9">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
