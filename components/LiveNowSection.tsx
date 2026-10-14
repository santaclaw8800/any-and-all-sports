'use client';

import { useState, useCallback } from 'react';
import { Game } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/sports-config';
import { generateGameAnchorId, shareGame } from '@/lib/game-share';
import Toast from './Toast';

interface LiveNowSectionProps {
  games: Game[];
  date: string;
  highlightedGameId?: string | null;
}

export default function LiveNowSection({ games, date, highlightedGameId }: LiveNowSectionProps) {
  const [toastVisible, setToastVisible] = useState(false);

  const handleShare = useCallback(async (game: Game) => {
    const result = await shareGame(game, date);
    if (result === 'copied') {
      setToastVisible(true);
    }
  }, [date]);

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
          const anchorId = generateGameAnchorId(game);
          const isHighlighted = highlightedGameId === anchorId;
          return (
            <div
              key={game.id}
              id={anchorId}
              className={`group relative rounded-xl p-4 border border-red-600/30 bg-red-950/20 hover:bg-red-950/30 transition-all ${
                isHighlighted ? 'ring-2 ring-emerald-500 animate-highlight' : ''
              }`}
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

              {/* Share button */}
              <button
                onClick={() => handleShare(game)}
                className="absolute top-2.5 right-3 p-2.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all"
                title="Share this game"
                aria-label="Share this game"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <Toast
        message="Link copied!"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </section>
  );
}
