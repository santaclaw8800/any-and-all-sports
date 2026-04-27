'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DaySchedule, Game } from '@/lib/types';
import { usePreferences } from '@/hooks/usePreferences';
import ScheduleView from './ScheduleView';

interface PersonalizedScheduleProps {
  schedule: DaySchedule;
}

export default function PersonalizedSchedule({ schedule }: PersonalizedScheduleProps) {
  const { preferences, hasPreferences, isLoading } = usePreferences();

  const filteredSchedule = useMemo(() => {
    if (!hasPreferences || !preferences) {
      return schedule;
    }

    const filteredGames = schedule.games.filter((game: Game) => {
      // Filter out completed games
      if (game.status === 'final' || game.status === 'completed') return false;

      // Check if sport matches
      const sportMatches = preferences.sports.length === 0 || preferences.sports.includes(game.sport);
      if (!sportMatches) return false;

      // If no teams selected, show all games for the sport
      if (preferences.teams.length === 0) return true;

      // Check if any team matches
      const teamMatches =
        preferences.teams.some(
          (team) =>
            game.homeTeam.name.toLowerCase().includes(team.toLowerCase()) ||
            game.awayTeam.name.toLowerCase().includes(team.toLowerCase()) ||
            team.toLowerCase().includes(game.homeTeam.name.toLowerCase()) ||
            team.toLowerCase().includes(game.awayTeam.name.toLowerCase())
        );

      return teamMatches;
    });

    return {
      ...schedule,
      games: filteredGames,
    };
  }, [schedule, preferences, hasPreferences]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-zinc-800 rounded-lg w-48 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Personalization banner */}
      {hasPreferences ? (
        <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg">&#10003;</span>
            <span className="text-emerald-300 font-medium">Your personalized schedule</span>
            <span className="text-zinc-500 text-sm">
              ({filteredSchedule.games.length} of {schedule.games.length} events)
            </span>
          </div>
          <Link
            href="/preferences"
            className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Edit preferences &rarr;
          </Link>
        </div>
      ) : (
        <div className="mb-6 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <span className="text-zinc-400">See only the sports and teams you care about</span>
          <Link
            href="/preferences"
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
          >
            Personalize your feed &rarr;
          </Link>
        </div>
      )}

      {/* No matches message */}
      {hasPreferences && filteredSchedule.games.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">&#128517;</p>
          <h3 className="text-xl font-bold text-white mb-2">No games match your preferences</h3>
          <p className="text-zinc-500 mb-6">
            None of your selected sports or teams are playing today.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/preferences"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors"
            >
              Adjust preferences
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white font-semibold text-sm transition-colors"
            >
              Show all games
            </button>
          </div>
        </div>
      )}

      {/* Schedule */}
      {filteredSchedule.games.length > 0 && <ScheduleView schedule={filteredSchedule} />}
    </div>
  );
}
