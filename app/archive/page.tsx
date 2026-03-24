import { Metadata } from 'next';
import Link from 'next/link';
import { getAvailableDates, formatDateDisplay, getTodayET } from '@/lib/schedule';
import { getSchedule } from '@/lib/schedule';

export const metadata: Metadata = {
  title: 'Archive — Past Sports Schedules',
  description: 'Browse past sports TV and streaming schedules by date.',
};

export const revalidate = 3600;

export default function ArchivePage() {
  const dates = getAvailableDates();
  const today = getTodayET();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Schedule Archive</h1>
        <p className="text-zinc-500">Browse sports TV & streaming schedules by date.</p>
      </div>

      {dates.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-lg font-semibold">No archived schedules found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map((date) => {
            const isToday = date === today;
            const schedule = getSchedule(date);
            const gameCount = schedule?.games.length ?? 0;
            const liveCount = schedule?.games.filter((g) => g.status === 'live').length ?? 0;
            const sports = schedule
              ? [...new Set(schedule.games.map((g) => g.sport))].slice(0, 6)
              : [];

            return (
              <Link
                key={date}
                href={isToday ? '/' : `/${date}`}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {formatDateDisplay(date)}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                          Today
                        </span>
                      )}
                      {liveCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-600/30">
                          <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse inline-block" />
                          {liveCount} LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {sports.map((sport) => (
                        <span key={sport} className="text-xs text-zinc-600">
                          {sport}
                          {sports.indexOf(sport) < sports.length - 1 && (
                            <span className="mx-1 text-zinc-800">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500">
                    <span className="font-bold text-zinc-300">{gameCount}</span> events
                  </span>
                  <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
