#!/usr/bin/env node
/**
 * scripts/fetch-schedules.mjs
 * Fetches today's sports schedule from the ESPN free public API and writes
 * data/schedules/YYYY-MM-DD.json in the DaySchedule format used by the site.
 *
 * Usage:
 *   node scripts/fetch-schedules.mjs              # today (ET)
 *   node scripts/fetch-schedules.mjs 2026-03-25   # specific date
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Sport configuration ───────────────────────────────────────────────────────
const SPORTS = [
  // Basketball
  { sport: 'basketball', league: 'nba',                      category: 'NBA',                abbr: 'nba'        },
  { sport: 'basketball', league: 'wnba',                     category: 'WNBA',               abbr: 'wnba'       },
  { sport: 'basketball', league: 'mens-college-basketball',  category: 'College Basketball', abbr: 'ncaam'      },
  { sport: 'basketball', league: 'womens-college-basketball',category: 'College Basketball', abbr: 'ncaaw'      },
  // Football
  { sport: 'football',   league: 'nfl',                      category: 'NFL',                abbr: 'nfl'        },
  { sport: 'football',   league: 'college-football',         category: 'College Football',   abbr: 'cfb'        },
  // Baseball
  { sport: 'baseball',   league: 'mlb',                      category: 'MLB',                abbr: 'mlb'        },
  // Hockey
  { sport: 'hockey',     league: 'nhl',                      category: 'NHL',                abbr: 'nhl'        },
  // Soccer
  { sport: 'soccer',     league: 'usa.1',                    category: 'Soccer',             abbr: 'mls'        },
  { sport: 'soccer',     league: 'eng.1',                    category: 'Soccer',             abbr: 'epl'        },
  { sport: 'soccer',     league: 'esp.1',                    category: 'Soccer',             abbr: 'laliga'     },
  { sport: 'soccer',     league: 'ita.1',                    category: 'Soccer',             abbr: 'seriea'     },
  { sport: 'soccer',     league: 'ger.1',                    category: 'Soccer',             abbr: 'bundesliga' },
  { sport: 'soccer',     league: 'fra.1',                    category: 'Soccer',             abbr: 'ligue1'     },
  { sport: 'soccer',     league: 'uefa.champions',           category: 'Soccer',             abbr: 'ucl'        },
  { sport: 'soccer',     league: 'fifa.world',               category: 'Soccer',             abbr: 'fifawc'     },
  // Golf
  { sport: 'golf',       league: 'pga',                      category: 'Golf',               abbr: 'pga'        },
  { sport: 'golf',       league: 'lpga',                     category: 'Golf',               abbr: 'lpga'       },
  { sport: 'golf',       league: 'liv',                      category: 'Golf',               abbr: 'liv'        },
  { sport: 'golf',       league: 'champions-tour',           category: 'Golf',               abbr: 'champs'     },
  { sport: 'golf',       league: 'eur',                      category: 'Golf',               abbr: 'dpwt'       },
  // MMA
  { sport: 'mma',        league: 'ufc',                      category: 'MMA/UFC',            abbr: 'ufc'        },
  // Racing
  { sport: 'racing',     league: 'f1',                       category: 'F1',                 abbr: 'f1'         },
  // Tennis
  { sport: 'tennis',     league: 'atp',                      category: 'Tennis',             abbr: 'atp'        },
  { sport: 'tennis',     league: 'wta',                      category: 'Tennis',             abbr: 'wta'        },
  // International Basketball (ESPN public API only exposes these three)
  { sport: 'basketball', league: 'nba-development',          category: 'International Basketball', abbr: 'gleague'    },
  { sport: 'basketball', league: 'nbl',                      category: 'International Basketball', abbr: 'nbl'        },
  { sport: 'basketball', league: 'fiba',                     category: 'International Basketball', abbr: 'fiba'       },
];

// Tour display names for golf league abbrs
const GOLF_TOUR_NAMES = {
  pga:    'PGA Tour',
  lpga:   'LPGA',
  liv:    'LIV Golf',
  champs: 'Champions Tour',
  dpwt:   'DP World Tour',
};

// ── Channel name normalization ────────────────────────────────────────────────
// Maps ESPN channel names to the StreamingPlatform values used by the site.
// Partial-prefix matches are handled in normalizeChannel() below.
const CHANNEL_MAP = {
  'ESPN':                 'ESPN',
  'ESPN2':                'ESPN2',
  'ESPN+':                'ESPN+',
  'ESPNU':                'ESPNU',
  'ESPNews':              'ESPNews',
  'ABC':                  'ABC',
  'TNT':                  'TNT',
  'TBS':                  'TBS',
  'truTV':                'truTV',
  'Max':                  'Max',
  'NBA TV':               'NBA TV',
  'NHL Network':          'NHL Network',
  'MLB Network':          'MLB Network',
  'NFL Network':          'NFL Network',
  'NFL+':                 'NFL+',
  'FS1':                  'FS1',
  'Fox Sports 1':         'FS1',
  'FS2':                  'FS2',
  'Fox Sports 2':         'FS2',
  'FOX':                  'Fox',
  'Fox':                  'Fox',
  'CBS':                  'CBS',
  'CBS Sports':           'CBS Sports',
  'CBS Sports Network':   'CBS Sports',
  'NBC':                  'NBC',
  'Peacock':              'Peacock',
  'Paramount+':           'Paramount+',
  'Apple TV+':            'Apple TV+',
  'Prime Video':          'Amazon Prime',
  'DAZN':                 'DAZN',
  'fuboTV':               'fuboTV',
  'YouTube TV':           'YouTube TV',
  'Golf Channel':         'Golf Channel',
  'Tennis Channel':       'Tennis Channel',
  'USA':                  'USA Network',
  'USA Network':          'USA Network',
  'MSG':                  'MSG',
  'MSG+':                 'MSG',
  'Sportsnet':            'Sportsnet',
  'Sportsnet 360':        'Sportsnet',
  'TVA Sports':           'TVA Sports',
  'RDS':                  'Regional Sports',
  'HBO Max':              'Max',
  'HBO':                  'Max',
  'Netflix':              'Netflix',
  'NBA League Pass':      'NBA League Pass',
};

/**
 * Normalize an ESPN channel name to a StreamingPlatform value.
 * Returns null for empty/unknown values that should be skipped entirely.
 */
function normalizeChannel(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Direct lookup first
  if (CHANNEL_MAP[trimmed]) return CHANNEL_MAP[trimmed];

  // Prefix-based normalization for regional variants
  if (trimmed.startsWith('Bally Sports'))          return 'Bally Sports';
  if (trimmed.startsWith('FanDuel'))               return 'FanDuel Sports Network';
  if (trimmed.startsWith('NBC Sports'))            return 'NBC Sports';
  if (trimmed.startsWith('Sportsnet'))             return 'Sportsnet';

  // Unknown channel names are kept verbatim so users still see the information.
  return trimmed;
}

// ── Status mapping ────────────────────────────────────────────────────────────
function mapStatus(espnStatus) {
  const name = espnStatus?.type?.name ?? '';
  switch (name) {
    case 'STATUS_SCHEDULED':
    case 'STATUS_PREGAME':
      return 'upcoming';
    case 'STATUS_IN_PROGRESS':
    case 'STATUS_HALFTIME':
      return 'live';
    case 'STATUS_FINAL':
    case 'STATUS_FULL_TIME':
      return 'final';
    case 'STATUS_POSTPONED':
      return 'postponed';
    case 'STATUS_DELAYED':
      return 'delayed';
  }
  // Fallback on numeric id (1=pre, 2=in-progress, 3=final, 5=postponed, 6=delayed)
  const id = espnStatus?.type?.id;
  if (id === '1') return 'upcoming';
  if (id === '2') return 'live';
  if (id === '3') return 'final';
  if (id === '5') return 'postponed';
  if (id === '6') return 'delayed';
  return 'upcoming';
}

// ── Time helpers ──────────────────────────────────────────────────────────────
const ET_TIME_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function toTimeET(isoString) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'TBD';
  // e.g. "7:30 PM" -> "7:30 PM ET"
  return ET_TIME_FMT.format(d) + ' ET';
}

// ── Broadcast / channel extraction ───────────────────────────────────────────
/**
 * Collects all unique channel names from a competition object.
 * National broadcasts are added first, then regional/home/away, then
 * anything additional found in geoBroadcasts that wasn't already captured.
 */
function extractChannels(competition) {
  const seen = new Set();
  const channels = [];

  function addChannel(name) {
    const normalized = normalizeChannel(name);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      channels.push(normalized);
    }
  }

  // Step 1 — broadcasts[] : national first, then regional
  const broadcasts = competition.broadcasts ?? [];
  const national = broadcasts.filter(b => b.market === 'national');
  const regional = broadcasts.filter(b => b.market !== 'national');

  for (const b of [...national, ...regional]) {
    for (const name of b.names ?? []) addChannel(name);
  }

  // Step 2 — geoBroadcasts[] : TV before streaming, fills in anything missed
  const geoBroadcasts = competition.geoBroadcasts ?? [];
  const tvGeo  = geoBroadcasts.filter(g => g.type?.shortName === 'TV');
  const stGeo  = geoBroadcasts.filter(g => g.type?.shortName !== 'TV');

  for (const g of [...tvGeo, ...stGeo]) {
    addChannel(g.media?.shortName);
  }

  return channels;
}

// ── ESPN event -> Game ────────────────────────────────────────────────────────
function mapEventToGame(event, sportConfig) {
  const comp = event.competitions?.[0];
  if (!comp) return null;

  const startTime  = event.date; // ESPN: UTC ISO-8601
  const status     = mapStatus(event.status);
  const channels   = extractChannels(comp);
  const isNational = (comp.broadcasts ?? []).some(b => b.market === 'national');

  const v = comp.venue;
  const venue = v
    ? [v.fullName, v.address?.city, v.address?.state].filter(Boolean).join(', ')
    : undefined;

  let homeTeam, awayTeam;

  if (sportConfig.sport === 'golf') {
    // Golf: tournament event vs a tour — no home/away competitors
    const tourName = GOLF_TOUR_NAMES[sportConfig.abbr] ?? 'Golf';
    homeTeam = { name: event.name ?? event.shortName ?? 'Golf Tournament' };
    awayTeam = { name: tourName };
  } else if (sportConfig.sport === 'racing') {
    // F1: race event — no home/away
    homeTeam = { name: event.name ?? event.shortName ?? 'Race' };
    awayTeam = { name: 'Formula 1' };
  } else if (sportConfig.sport === 'tennis') {
    // Tennis: competitors are athletes, not teams; may lack homeAway
    const competitors = comp.competitors ?? [];
    const p1 = competitors[0];
    const p2 = competitors[1];
    if (!p1 || !p2) return null;
    const athleteName = c =>
      c.athlete?.displayName ?? c.athlete?.fullName ??
      c.team?.displayName ?? c.team?.name ?? 'TBD';
    homeTeam = { name: athleteName(p1) };
    awayTeam = { name: athleteName(p2) };
  } else {
    // Standard team sport (basketball, football, baseball, hockey, soccer, mma)
    const competitors = comp.competitors ?? [];
    const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0];
    const away = competitors.find(c => c.homeAway === 'away') ?? competitors[1];
    if (!home || !away) return null;

    function getRecord(competitor) {
      const stats = competitor.records ?? competitor.statistics ?? [];
      const overall = stats.find(r =>
        r.name === 'overall' || r.type === 'total' || r.name === 'total'
      );
      return overall?.summary ?? overall?.displayValue ?? undefined;
    }

    homeTeam = {
      name: home.team?.displayName ?? home.team?.name ?? 'TBD',
      ...(home.team?.abbreviation && { abbreviation: home.team.abbreviation }),
      ...(getRecord(home) && { record: getRecord(home) }),
    };
    awayTeam = {
      name: away.team?.displayName ?? away.team?.name ?? 'TBD',
      ...(away.team?.abbreviation && { abbreviation: away.team.abbreviation }),
      ...(getRecord(away) && { record: getRecord(away) }),
    };
  }

  // Current period when live
  let currentPeriod;
  if (status === 'live' && event.status?.period) {
    currentPeriod = String(event.status.period);
  }

  // Score — team sports only, when live or final
  let score;
  if (sportConfig.sport !== 'golf' && sportConfig.sport !== 'racing' && sportConfig.sport !== 'tennis') {
    const competitors = comp.competitors ?? [];
    const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0];
    const away = competitors.find(c => c.homeAway === 'away') ?? competitors[1];
    if (home && away && (status === 'live' || status === 'final')) {
      const h = parseInt(home.score, 10);
      const a = parseInt(away.score, 10);
      if (!isNaN(h) && !isNaN(a)) score = { home: h, away: a };
    }
  }

  const game = {
    id: `${sportConfig.abbr}-${event.id}`,
    sport: sportConfig.category,
    homeTeam,
    awayTeam,
    startTime,
    timeET: toTimeET(startTime),
    channels,
    status,
  };

  if (currentPeriod !== undefined) game.currentPeriod = currentPeriod;
  if (score !== undefined)         game.score = score;
  if (venue)                       game.venue = venue;
  if (isNational)                  game.isNational = true;

  // Tournament labels
  if (sportConfig.abbr === 'mls') game.tournament = 'MLS';
  if (sportConfig.sport === 'golf') game.tournament = GOLF_TOUR_NAMES[sportConfig.abbr] ?? 'Golf';

  return game;
}

// ── Fetch one league's scoreboard ─────────────────────────────────────────────
async function fetchSport(sportConfig, espnDate) {
  const { sport, league } = sportConfig;
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard` +
    `?limit=100${espnDate ? `&dates=${espnDate}` : ''}`;

  console.log(`  Fetching ${league.toUpperCase()} …`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'any-and-all-sports/1.0 (public sports schedule site)' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const events = data.events ?? [];
  const games = events.map(e => mapEventToGame(e, sportConfig)).filter(Boolean);

  console.log(`    ${league.toUpperCase()}: ${games.length} game(s)`);
  return games;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const arg = process.argv[2];
  let targetDate; // YYYY-MM-DD
  let espnDate;   // YYYYMMDD for ESPN API param

  if (arg) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      console.error('Usage: node scripts/fetch-schedules.mjs [YYYY-MM-DD]');
      process.exit(1);
    }
    targetDate = arg;
  } else {
    // Default: today in Eastern Time
    targetDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()); // en-CA produces YYYY-MM-DD
  }

  espnDate = targetDate.replace(/-/g, ''); // 20260325

  console.log(`\nFetching ESPN schedules for ${targetDate} …\n`);

  const results = await Promise.allSettled(
    SPORTS.map(s => fetchSport(s, espnDate))
  );

  const allGames = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      allGames.push(...r.value);
    } else {
      console.error(`  [ERROR] ${SPORTS[i].league.toUpperCase()}: ${r.reason?.message}`);
    }
  }

  // Sort chronologically
  allGames.sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filter out completed games
  const filteredGames = allGames.filter(g => g.status !== 'final' && g.status !== 'completed');

  const daySchedule = {
    date: targetDate,
    games: filteredGames,
    lastUpdated: new Date().toISOString(),
  };

  const outDir  = join(ROOT, 'data', 'schedules');
  const outPath = join(outDir, `${targetDate}.json`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(daySchedule, null, 2));

  console.log(`\nDone — wrote ${allGames.length} game(s) to ${outPath}\n`);
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
