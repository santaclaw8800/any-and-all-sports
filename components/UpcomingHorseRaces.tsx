interface HorseRacingEvent {
  id: string;
  name: string;
  venue: string;
  date: string;
  timeEt: string;
  networks: string[];
  grade?: string;
  verified: boolean;
}

function formatRaceDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  if (!day) {
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UpcomingHorseRaces({
  events,
  today,
}: {
  events: HorseRacingEvent[];
  today: string;
}) {
  const upcoming = events.filter((event) => event.date >= today);
  if (upcoming.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" role="img" aria-label="Horse Racing">🏇</span>
        <h2 className="text-xl font-black uppercase tracking-widest text-amber-400">
          Upcoming Horse Races
        </h2>
        <div className="flex-1 h-px bg-amber-900/40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {upcoming.map((event) => (
          <article key={event.id} className="rounded-xl border border-zinc-800 border-l-amber-700 border-l-[3px] bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-white text-sm leading-tight">{event.name}</h3>
              {event.grade && <span className="text-[10px] font-bold text-amber-400">{event.grade}</span>}
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {formatRaceDate(event.date)} · {event.timeEt}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{event.venue}</p>
            <p className="mt-3 text-xs font-semibold text-zinc-300">{event.networks.join(' / ')}</p>
            {!event.verified && (
              <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600">Date to be confirmed</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
