import { Game } from './types';

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateGameAnchorId(game: Game): string {
  const sportSlug = slugify(game.sport);
  const awaySlug = game.awayTeam.abbreviation
    ? slugify(game.awayTeam.abbreviation)
    : slugify(game.awayTeam.name).slice(0, 6);
  const homeSlug = game.homeTeam.abbreviation
    ? slugify(game.homeTeam.abbreviation)
    : slugify(game.homeTeam.name).slice(0, 6);
  return `${sportSlug}-${awaySlug}-${homeSlug}`;
}

export function generateShareText(game: Game): string {
  const matchup =
    game.sport === 'Horse Racing'
      ? game.homeTeam.name
      : `${game.awayTeam.name} @ ${game.homeTeam.name}`;
  const channelInfo =
    game.channels.length > 0 ? ` on ${game.channels[0]}` : '';
  return `${matchup}, ${game.timeET}${channelInfo}`;
}

export function generateShareTitle(game: Game): string {
  const matchup =
    game.sport === 'Horse Racing'
      ? game.homeTeam.name
      : `${game.awayTeam.name} @ ${game.homeTeam.name}`;
  return `${matchup} - Any & All Sports`;
}

export async function shareGame(
  game: Game,
  date: string
): Promise<'shared' | 'copied' | 'failed'> {
  const anchor = generateGameAnchorId(game);
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${date === getTodayDateET() ? '' : `/${date}`}`
      : `https://anyandallsports.com/${date}`;
  const url = `${baseUrl}#${anchor}`;
  const title = generateShareTitle(game);
  const text = generateShareText(game);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return 'failed';
      }
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}

function getTodayDateET(): string {
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
