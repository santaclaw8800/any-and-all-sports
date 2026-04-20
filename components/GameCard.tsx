'use client';

import { Game } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/sports-config';
import { getAffiliateConfig } from '@/lib/affiliates';
import AffiliateButton from './AffiliateButton';
import WatchDropdown from './WatchDropdown';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const config = SPORT_CONFIG[game.sport];

  const statusBadge = () => {
    switch (game.status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            LIVE {game.currentPeriod && `· ${game.currentPeriod}`}
          </span>
        );
      case 'final':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300">
            FINAL
          </span>
        );
      case 'delayed':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-600 text-yellow-100">
            DELAYED
          </span>
        );
      case 'postponed':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-700 text-orange-100">
            POSTPONED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
            {game.timeET}
          </span>
        );
    }
  };

  const isVsFormat =
    game.sport === 'Tennis' ||
    game.sport === 'MMA/UFC' ||
    game.sport === 'Boxing' ||
    game.sport === 'Golf' ||
    game.sport === 'NASCAR';

  return (
    <div
      className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-all duration-200 hover:bg-zinc-800/80"
      style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
    >
      {/* Tournament/Description badge */}
      {(game.tournament || game.description) && (
        <div className="mb-2 flex items-center gap-2">
          {game.tournament && (
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ backgroundColor: config.bgColor, color: config.textColor }}
            >
              {game.tournament}
            </span>
          )}
          {game.description && (
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              {game.description}
            </span>
          )}
        </div>
      )}

      {/* Teams */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          {isVsFormat ? (
            <div className="space-y-1">
              <p className="font-bold text-white text-sm leading-tight truncate">
                {game.awayTeam.name}
                {game.awayTeam.seed && (
                  <span className="ml-1 text-zinc-500 text-xs font-normal">
                    (#{game.awayTeam.seed})
                  </span>
                )}
              </p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">vs</p>
              <p className="font-bold text-white text-sm leading-tight truncate">
                {game.homeTeam.name}
                {game.homeTeam.seed && (
                  <span className="ml-1 text-zinc-500 text-xs font-normal">
                    (#{game.homeTeam.seed})
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-zinc-300 text-sm leading-tight truncate flex-1">
                  {game.awayTeam.abbreviation || game.awayTeam.name}
                  {game.awayTeam.seed && (
                    <span className="ml-1 text-zinc-500 text-xs font-normal">
                      #{game.awayTeam.seed}
                    </span>
                  )}
                  {game.awayTeam.record && (
                    <span className="ml-1.5 text-zinc-600 text-xs font-normal">
                      {game.awayTeam.record}
                    </span>
                  )}
                </p>
                {game.score && (
                  <span
                    className="text-lg font-black ml-2 tabular-nums"
                    style={{
                      color:
                        game.score.away > game.score.home
                          ? config.textColor
                          : 'rgb(161, 161, 170)',
                    }}
                  >
                    {game.score.away}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm leading-tight truncate flex-1">
                  {game.homeTeam.abbreviation || game.homeTeam.name}
                  {game.homeTeam.seed && (
                    <span className="ml-1 text-zinc-500 text-xs font-normal">
                      #{game.homeTeam.seed}
                    </span>
                  )}
                  {game.homeTeam.record && (
                    <span className="ml-1.5 text-zinc-600 text-xs font-normal">
                      {game.homeTeam.record}
                    </span>
                  )}
                </p>
                {game.score && (
                  <span
                    className="text-lg font-black ml-2 tabular-nums"
                    style={{
                      color:
                        game.score.home >= game.score.away
                          ? config.textColor
                          : 'rgb(161, 161, 170)',
                    }}
                  >
                    {game.score.home}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status + Channels */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {statusBadge()}
        <div className="flex flex-wrap gap-1.5 items-start">
          {game.channels.map((ch) => (
            <AffiliateButton key={ch} channel={ch} gameId={game.id} />
          ))}
          {game.channels.filter((ch) => getAffiliateConfig(ch)).length > 1 && (
            <WatchDropdown channels={game.channels} gameId={game.id} />
          )}
        </div>
      </div>

      {/* Venue */}
      {game.venue && (
        <p className="mt-2 text-[10px] text-zinc-600 truncate">{game.venue}</p>
      )}

      {/* National broadcast indicator */}
      {game.isNational && (
        <div
          className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.color }}
          title="National broadcast"
        />
      )}
    </div>
  );
}
