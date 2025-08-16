export default function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 py-10 mt-20">
      <div className="container-responsive text-sm text-black/60 dark:text-white/60 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} DH. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="hover:underline" href="/privacy">
            Privacy
          </a>
          <a className="hover:underline" href="/terms">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
