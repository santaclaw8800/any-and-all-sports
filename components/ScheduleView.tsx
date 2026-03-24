'use client';

import { useCallback, useMemo, useState } from 'react';
import { DaySchedule, Game, SportCategory } from '@/lib/types';
import { groupGamesBySport, getSportOrder, getLiveGames } from '@/lib/schedule-utils';
import LiveNowSection from './LiveNowSection';
import SportSection from './SportSection';
import SportFilter from './SportFilter';

interface ScheduleViewProps {
  schedule: DaySchedule;
}

export default function ScheduleView({ schedule }: ScheduleViewProps) {
  const [activeSport, setActiveSport] = useState<SportCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilter = useCallback((sport: SportCategory | null) => {
    setActiveSport(sport);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredGames = useMemo(() => {
    let games = schedule.games;

    if (activeSport) {
      games = games.filter((g) => g.sport === activeSport);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      games = games.filter((g: Game) => {
        return (
          g.homeTeam.name.toLowerCase().includes(q) ||
          g.awayTeam.name.toLowerCase().includes(q) ||
          g.sport.toLowerCase().includes(q) ||
          g.channels.some((ch) => ch.toLowerCase().includes(q)) ||
          (g.tournament && g.tournament.toLowerCase().includes(q)) ||
          (g.venue && g.venue.toLowerCase().includes(q))
        );
      });
    }

    return games;
  }, [schedule.games, activeSport, searchQuery]);

  const grouped = useMemo(() => groupGamesBySport(filteredGames), [filteredGames]);
  const sportOrder = useMemo(() => getSportOrder(grouped), [grouped]);
  const liveGames = useMemo(() => getLiveGames(filteredGames), [filteredGames]);
  const allSports = useMemo(() => getSportOrder(groupGamesBySport(schedule.games)), [schedule.games]);

  return (
    <div>
      <SportFilter sports={allSports} onFilter={handleFilter} onSearch={handleSearch} />

      {/* Live now */}
      {!searchQuery && !activeSport && <LiveNowSection games={liveGames} />}
      {(searchQuery || activeSport) && liveGames.length > 0 && (
        <LiveNowSection games={liveGames} />
      )}

      {/* No results */}
      {filteredGames.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="text-lg font-semibold">No games found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Sport sections */}
      <div className="space-y-10">
        {sportOrder.map((sport) => (
          <SportSection key={sport} sport={sport} games={grouped[sport] || []} />
        ))}
      </div>

      {/* Game count */}
      {filteredGames.length > 0 && (
        <p className="mt-10 text-center text-zinc-700 text-xs">
          Showing {filteredGames.length} of {schedule.games.length} events · All times ET
        </p>
      )}
    </div>
  );
}
