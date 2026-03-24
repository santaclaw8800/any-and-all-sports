import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">📺</span>
            <div>
              <span className="text-lg font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                Any & All Sports
              </span>
              <span className="hidden sm:block text-[10px] text-zinc-500 font-medium uppercase tracking-widest -mt-0.5">
                Daily TV & Streaming Schedule
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Schedule
            </Link>
            <Link
              href="/archive"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Archive
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
