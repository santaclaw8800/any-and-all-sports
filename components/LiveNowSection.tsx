import { Game } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/sports-config';

interface LiveNowSectionProps {
  games: Game[];
}

export default function LiveNowSection({ games }: LiveNowSectionProps) {
  if (games.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-sm font-black uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
          On Now
        </span>
        <div className="flex-1 h-px bg-red-600/20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {games.map((game) => {
          const config = SPORT_CONFIG[game.sport];
          return (
            <div
              key={game.id}
              className="relative rounded-xl p-4 border border-red-600/30 bg-red-950/20 hover:bg-red-950/30 transition-all"
              style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
            >
              {/* Sport tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{config.emoji}</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: config.textColor }}
                >
                  {game.sport}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  LIVE {game.currentPeriod && `· ${game.currentPeriod}`}
                </span>
              </div>

              {/* Matchup */}
              {game.score ? (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-300 truncate">
                      {game.awayTeam.abbreviation || game.awayTeam.name}
                    </p>
                    <p className="text-sm font-bold text-white truncate">
                      {game.homeTeam.abbreviation || game.homeTeam.name}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className="text-xl font-black tabular-nums"
                      style={{
                        color:
                          game.score.away > game.score.home
                            ? config.textColor
                            : 'rgb(161,161,170)',
                      }}
                    >
                      {game.score.away}
                    </p>
                    <p
                      className="text-xl font-black tabular-nums"
                      style={{
                        color:
                          game.score.home >= game.score.away
                            ? config.textColor
                            : 'rgb(161,161,170)',
                      }}
                    >
                      {game.score.home}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-bold text-white mb-2 truncate">
                  {game.awayTeam.name} vs {game.homeTeam.name}
                </p>
              )}

              {/* Channels */}
              <div className="flex flex-wrap gap-1">
                {game.channels.map((ch) => (
                  <span
                    key={ch}
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
