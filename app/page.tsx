import { Metadata } from 'next';
import { getSchedule, getTodayET, formatDateDisplay } from '@/lib/schedule';
import DateNav from '@/components/DateNav';
import PersonalizedSchedule from '@/components/PersonalizedSchedule';
import Link from 'next/link';
import { SportsEventsSchema, BreadcrumbSchema } from '@/components/StructuredData';
import SEOContentBlock from '@/components/SEOContentBlock';
import UpcomingHorseRaces from '@/components/UpcomingHorseRaces';
import horseRacingEvents from '@/data/horse-racing-events.json';

export const metadata: Metadata = {
  title: "What Sports Are On Tonight? | Today's Complete TV & Streaming Schedule",
  description:
    "What sports are on TV tonight? Find every NBA, NFL, MLB, NHL, Soccer, Golf and MMA game on tonight with channels and streaming info. Updated daily.",
  alternates: {
    canonical: 'https://anyandallsports.com',
  },
};

export const revalidate = 300; // revalidate every 5 minutes

export default function HomePage() {
  const today = getTodayET();
  const schedule = getSchedule(today);

  const displayDate = formatDateDisplay(today);

  if (!schedule) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DateNav date={today} />
        <div className="text-center py-24">
          <p className="text-6xl mb-6">📅</p>
          <h2 className="text-2xl font-black text-white mb-3">No Schedule Available</h2>
          <p className="text-zinc-500 mb-8">
            No games have been scheduled for {displayDate} yet.
          </p>
          <Link
            href="/archive"
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all"
          >
            Browse Archive
          </Link>
        </div>
        <UpcomingHorseRaces events={horseRacingEvents} today={today} />
      </div>
    );
  }

  const totalGames = schedule.games.length;
  const liveCount = schedule.games.filter((g) => g.status === 'live').length;

  return (
    <>
      <SportsEventsSchema games={schedule.games} date={today} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://anyandallsports.com' },
          { name: "Today's Schedule", url: 'https://anyandallsports.com' },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Date navigation */}
        <DateNav date={today} />

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-sm text-zinc-400">
              <span className="font-bold text-white">{totalGames}</span> events today
            </span>
          </div>
          {liveCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              <span className="text-sm text-red-400 font-semibold">
                {liveCount} game{liveCount !== 1 ? 's' : ''} in progress
              </span>
            </div>
          )}
          <div className="text-xs text-zinc-700 ml-auto hidden sm:block">
            Updated: {new Date(schedule.lastUpdated).toLocaleTimeString('en-US', {
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short',
            })}
          </div>
        </div>

        {/* Schedule */}
        <PersonalizedSchedule schedule={schedule} />
        <UpcomingHorseRaces events={horseRacingEvents} today={today} />
      </div>

      {/* SEO Content Block */}
      <SEOContentBlock />
    </>
  );
}
