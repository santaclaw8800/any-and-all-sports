import Link from 'next/link';
import { formatDateDisplay, getPrevDate, getNextDate, getTodayET } from '@/lib/schedule-utils';

interface DateNavProps {
  date: string;
}

export default function DateNav({ date }: DateNavProps) {
  const today = getTodayET();
  const isToday = date === today;
  const prevDate = getPrevDate(date);
  const nextDate = getNextDate(date);

  return (
    <div className="flex items-center justify-between gap-4 py-4 px-4 sm:px-0">
      <Link
        href={`/${prevDate}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-sm font-semibold"
      >
        ← Prev
      </Link>

      <div className="text-center flex-1">
        <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
          {isToday && (
            <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
              Today
            </span>
          )}
          {formatDateDisplay(date)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {!isToday && (
          <Link
            href="/"
            className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold transition-all"
          >
            Today
          </Link>
        )}
        <Link
          href={`/${nextDate}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-sm font-semibold"
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
