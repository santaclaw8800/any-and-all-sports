import { Metadata } from 'next';
import Link from 'next/link';
import { SPORT_CONFIG, SPORT_ORDER } from '@/lib/sports-config';

export const metadata: Metadata = {
  title: 'About Any & All Sports',
  description: 'Learn about Any & All Sports — your daily guide to every sports game on TV and streaming.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="text-6xl mb-4">📺</div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
          Any & All Sports
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed max-w-xl mx-auto">
          Your daily guide to every sports game on TV and streaming. Never miss a moment of the action.
        </p>
      </div>

      {/* What we do */}
      <section className="mb-10">
        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-widest">
          What We Do
        </h2>
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4 text-zinc-400 leading-relaxed">
          <p>
            Any & All Sports is a daily sports TV and streaming schedule blog. Each day, we publish a
            complete guide to every major sporting event happening on television and streaming
            platforms — from national broadcasts to regional coverage.
          </p>
          <p>
            Whether you&apos;re looking for tonight&apos;s NBA game on ESPN, the big UFC main event on ESPN+,
            or that Premier League match on Peacock, we have you covered. All times are displayed in
            Eastern Time (ET) for easy reference.
          </p>
        </div>
      </section>

      {/* Sports covered */}
      <section className="mb-10">
        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-widest">
          Sports We Cover
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SPORT_ORDER.filter((s) => s !== 'Other').map((sport) => {
            const config = SPORT_CONFIG[sport];
            return (
              <div
                key={sport}
                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900"
                style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
              >
                <span className="text-xl">{config.emoji}</span>
                <span className="text-sm font-semibold text-zinc-300">{sport}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-10">
        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-widest">
          How It Works
        </h2>
        <div className="space-y-4">
          {[
            {
              icon: '📅',
              title: 'Daily Updates',
              desc: 'Schedule data is updated daily with the latest game times and channel information.',
            },
            {
              icon: '🔴',
              title: 'Live Indicators',
              desc: 'Games currently in progress are highlighted with a live badge and current period/score.',
            },
            {
              icon: '🔍',
              title: 'Search & Filter',
              desc: 'Quickly find your sport, team, or channel using the search bar and sport filters.',
            },
            {
              icon: '📱',
              title: 'Mobile-First',
              desc: 'Designed for phones first — check the schedule from anywhere, any device.',
            },
            {
              icon: '🕐',
              title: 'Eastern Time',
              desc: 'All game times are displayed in ET for consistent, easy scheduling.',
            },
            {
              icon: '📺',
              title: 'All Platforms',
              desc: 'Covers broadcast TV, cable, and all major streaming services including ESPN+, Peacock, Apple TV+, Amazon Prime, and DAZN.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Ready to see what&apos;s on today?
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-lg transition-all"
          >
            View Today&apos;s Schedule →
          </Link>
        </div>
      </section>
    </div>
  );
}
