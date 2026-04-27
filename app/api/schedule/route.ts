import { NextRequest, NextResponse } from 'next/server';
import { getSchedule, getTodayET } from '@/lib/schedule';
import { Game, SportCategory } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const team = searchParams.get('team');

  const today = getTodayET();
  const schedule = getSchedule(today);

  if (!schedule) {
    return NextResponse.json(
      { error: 'No schedule available for today', date: today },
      { status: 404 }
    );
  }

  // Filter out completed games for today's schedule
  let filteredGames = schedule.games.filter((game: Game) =>
    game.status !== 'final'
  );

  // Filter by sport (case-insensitive)
  if (sport) {
    const sportLower = sport.toLowerCase();
    filteredGames = filteredGames.filter((game: Game) => {
      const gameSportLower = game.sport.toLowerCase();
      return gameSportLower === sportLower || gameSportLower.includes(sportLower);
    });
  }

  // Filter by team (case-insensitive, matches home or away)
  if (team) {
    const teamLower = team.toLowerCase();
    filteredGames = filteredGames.filter((game: Game) => {
      return (
        game.homeTeam.name.toLowerCase().includes(teamLower) ||
        game.awayTeam.name.toLowerCase().includes(teamLower) ||
        (game.homeTeam.abbreviation?.toLowerCase().includes(teamLower)) ||
        (game.awayTeam.abbreviation?.toLowerCase().includes(teamLower))
      );
    });
  }

  return NextResponse.json({
    date: schedule.date,
    games: filteredGames,
    totalGames: schedule.games.length,
    filteredCount: filteredGames.length,
    lastUpdated: schedule.lastUpdated,
  });
}
