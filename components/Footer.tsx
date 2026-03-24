export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📺</span>
              <span className="font-black text-white tracking-tight">Any & All Sports</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Your daily guide to every sports game on TV and streaming. Never miss a moment.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Sports
            </h3>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              {['🏀 NBA', '🏈 NFL', '⚾ MLB', '🏒 NHL', '⚽ Soccer', '🎾 Tennis', '⛳ Golf', '🥊 MMA/UFC'].map(
                (s) => (
                  <li key={s}>{s}</li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Info
            </h3>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              <li>All times displayed in ET</li>
              <li>Schedule data updated daily</li>
              <li>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                  Live badges update in real time
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Any & All Sports. All rights reserved.
          </p>
          <p className="text-zinc-700 text-xs">
            Built with Next.js · Tailwind CSS · Hosted on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
