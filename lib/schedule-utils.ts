// Client-safe utility functions (no fs/path)
import { Game, SportCategory } from './types';
import { SPORT_ORDER } from './sports-config';

export function groupGamesBySport(games: Game[]): Partial<Record<SportCategory, Game[]>> {
  const grouped: Partial<Record<SportCategory, Game[]>> = {};
  for (const game of games) {
    if (!grouped[game.sport]) grouped[game.sport] = [];
    grouped[game.sport]!.push(game);
  }
  // Sort each group: live first, then upcoming, then final
  for (const sport of Object.keys(grouped) as SportCategory[]) {
    grouped[sport] = grouped[sport]!.sort((a, b) => {
      const order: Record<string, number> = { live: 0, upcoming: 1, delayed: 2, postponed: 3, final: 4 };
      const aOrder = order[a.status] ?? 5;
      const bOrder = order[b.status] ?? 5;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  }
  return grouped;
}

export function getSportOrder(grouped: Partial<Record<SportCategory, Game[]>>): SportCategory[] {
  const presentSports = Object.keys(grouped) as SportCategory[];
  return SPORT_ORDER.filter((s) => presentSports.includes(s));
}

export function getLiveGames(games: Game[]): Game[] {
  return games.filter((g) => g.status === 'live');
}

export function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getPrevDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getNextDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function getTodayET(): string {
  const now = new Date();
  const etFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = etFormatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}
