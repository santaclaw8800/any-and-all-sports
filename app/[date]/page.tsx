import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchedule, getTodayET, formatDateDisplay, getAvailableDates } from '@/lib/schedule';
import DateNav from '@/components/DateNav';
import ScheduleView from '@/components/ScheduleView';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SportsEventsSchema, BreadcrumbSchema } from '@/components/StructuredData';

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const displayDate = formatDateDisplay(date);
  return {
    title: `Sports on TV Tonight - ${displayDate}`,
    description: `What games are on ${displayDate}? Complete sports TV and streaming schedule with every NBA, NFL, MLB, NHL, Soccer, Golf and MMA game - with channels and streaming info.`,
    alternates: {
      canonical: `https://anyandallsports.com/${date}`,
    },
  };
}

export async function generateStaticParams() {
  const dates = getAvailableDates();
  return dates.map((date) => ({ date }));
}

export const revalidate = 300;

export default async function DatePage({ params }: PageProps) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  // Redirect today's date to homepage
  const today = getTodayET();
  if (date === today) {
    redirect('/');
  }

  const schedule = getSchedule(date);
  const displayDate = formatDateDisplay(date);
  const totalGames = schedule?.games.length ?? 0;
  const liveCount = schedule?.games.filter((g) => g.status === 'live').length ?? 0;

  return (
    <>
      {schedule && <SportsEventsSchema games={schedule.games} date={date} />}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://anyandallsports.com' },
          { name: displayDate, url: `https://anyandallsports.com/${date}` },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <DateNav date={date} />

      {!schedule ? (
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
      ) : (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm text-zinc-400">
                <span className="font-bold text-white">{totalGames}</span> events
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
              Updated:{' '}
              {new Date(schedule.lastUpdated).toLocaleTimeString('en-US', {
                timeZone: 'America/New_York',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
              })}
            </div>
          </div>

          <ScheduleView schedule={schedule} />
        </>
      )}
      </div>
    </>
  );
}
