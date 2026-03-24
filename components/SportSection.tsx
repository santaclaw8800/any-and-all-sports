import { Game, SportCategory } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/sports-config';
import GameCard from './GameCard';

interface SportSectionProps {
  sport: SportCategory;
  games: Game[];
}

export default function SportSection({ sport, games }: SportSectionProps) {
  const config = SPORT_CONFIG[sport];
  const liveCount = games.filter((g) => g.status === 'live').length;

  return (
    <section id={sport.toLowerCase().replace(/[^a-z]/g, '-')}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" role="img" aria-label={sport}>
          {config.emoji}
        </span>
        <h2
          className="text-xl font-black uppercase tracking-widest"
          style={{ color: config.textColor }}
        >
          {sport}
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          {games.length} {games.length === 1 ? 'game' : 'games'}
        </span>
        {liveCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
            {liveCount} LIVE
          </span>
        )}
        <div className="flex-1 h-px" style={{ backgroundColor: config.bgColor }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
