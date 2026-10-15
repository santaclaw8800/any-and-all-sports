import Link from 'next/link';
import { getPartyStore, getDemoParties, getTodayET, PartyWithCount } from '@/lib/parties';
import { SPORT_CONFIG } from '@/lib/sports-config';

export default async function PartiesStrip() {
  const today = getTodayET();

  const store = getPartyStore();
  const dbParties = await store.getPartiesByDate(today);

  const demoParties = getDemoParties().filter(p => p.gameDate === today);
  const demoWithCounts: PartyWithCount[] = demoParties.map((p, i) => ({
    ...p,
    id: `demo-${i}`,
    createdAt: new Date().toISOString(),
    attendeeCount: Math.floor(Math.random() * 20) + 5,
  }));

  const allParties = [...demoWithCounts, ...dbParties]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  if (allParties.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎉</span>
          Watch with fans tonight
        </h2>
        <Link
          href="/parties"
          className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {allParties.map(party => {
          const config = SPORT_CONFIG[party.sport] || { color: '#22c55e' };

          return (
            <Link
              key={party.id}
              href="/parties"
              className="group rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
              style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
            >
              {party.sponsorName && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-orange-600/20 text-orange-400 mb-1.5">
                  {party.sponsorLogo && <span>{party.sponsorLogo}</span>}
                  {party.sponsorName}
                </span>
              )}
              <p className="text-xs text-zinc-500 mb-0.5">{party.league}</p>
              <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                {party.awayTeam} @ {party.homeTeam}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {party.venueName}, {party.venueCity}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                {party.attendeeCount} going
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
