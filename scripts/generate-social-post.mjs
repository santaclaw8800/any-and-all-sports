import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Sport config
const SPORT_CONFIG = {
  NBA:                 { color: '#f97316', emoji: '🏀' },
  NFL:                 { color: '#22c55e', emoji: '🏈' },
  MLB:                 { color: '#ef4444', emoji: '⚾' },
  NHL:                 { color: '#3b82f6', emoji: '🏒' },
  Soccer:              { color: '#22c55e', emoji: '⚽' },
  Golf:                { color: '#22c55e', emoji: '⛳' },
  Tennis:              { color: '#eab308', emoji: '🎾' },
  'MMA/UFC':           { color: '#ef4444', emoji: '🥊' },
  F1:                  { color: '#ef4444', emoji: '🏎️' },
  'College Basketball':{ color: '#f97316', emoji: '🏀' },
  'College Football':  { color: '#22c55e', emoji: '🏈' },
  NASCAR:              { color: '#ef4444', emoji: '🏁' },
  Boxing:              { color: '#ef4444', emoji: '🥊' },
  WNBA:                { color: '#f97316', emoji: '🏀' },
  'International Basketball': { color: '#f97316', emoji: '🏀' },
  Other:               { color: '#94a3b8', emoji: '🏆' },
};

function getSportConfig(sport) {
  return SPORT_CONFIG[sport] || SPORT_CONFIG.Other;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatChannels(channels) {
  if (!channels || channels.length === 0) return 'Check local listings';

  // Tier 1: Major national networks (prefer these)
  const tier1 = channels.filter(ch =>
    ['ESPN', 'ESPN2', 'ESPN+', 'ABC', 'TNT', 'TBS', 'NBC', 'CBS', 'Fox', 'NFL Network',
     'NBA TV', 'NHL Network', 'MLB Network', 'FS1', 'FS2', 'USA Network', 'truTV', 'Max',
     'Peacock', 'Netflix', 'Amazon Prime', 'Apple TV+', 'DAZN', 'Paramount+',
     'Golf Channel', 'Golf Chnl', 'Tennis Channel', 'NBC Sports', 'NBCSN', 'NBCSN Extra',
     'CBS Sports Network', 'CBSSN'].includes(ch)
  );

  // Tier 2: Streaming / league-level (still useful to show)
  const tier2 = channels.filter(ch =>
    ['NBA League Pass', 'MLB.TV', 'NHL Live', 'ESPN Unlmtd',
     'FanDuel Sports Network', 'FanDuel Sports', 'Bally Sports',
     'Spectrum Sports Net', 'NESN', 'MSG', 'YES Network', 'SNY',
     'AT&T SportsNet', 'ROOT Sports', 'Altitude'].includes(ch)
  );

  if (tier1.length > 0) return tier1.slice(0, 2).join(' / ');
  if (tier2.length > 0) return tier2.slice(0, 2).join(' / ');
  // Fallback: show first 2 whatever they are
  return channels.slice(0, 2).join(' / ');
}

function groupBySport(games) {
  const groups = {};
  for (const game of games) {
    const key = game.sport;
    if (!groups[key]) groups[key] = [];
    groups[key].push(game);
  }
  // Sort sports by priority
  const priority = ['NBA', 'NHL', 'MLB', 'NFL', 'Soccer', 'College Basketball', 'College Football', 'International Basketball', 'MMA/UFC', 'F1', 'Tennis', 'Golf', 'NASCAR', 'Boxing', 'WNBA', 'Other'];
  return Object.entries(groups).sort(([a], [b]) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function buildGameCardHTML(game) {
  const channels = formatChannels(game.channels);
  const desc = game.tournament || game.description || '';
  return `
    <div style="
      background: #1a1a2e;
      border-radius: 14px;
      border-left: 6px solid #14b8a6;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      min-height: 100px;
    ">
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 32px; color: #ffffff; line-height: 1.2; overflow: hidden; text-overflow: ellipsis;">
          <span style="font-weight: 400;">${escHtml(game.awayTeam.name)}</span>
          <span style="color: #94a3b8; font-size: 24px; margin: 0 6px;">@</span>
          <span style="font-weight: 700;">${escHtml(game.homeTeam.name)}</span>
        </div>
        ${desc ? `<div style="font-size: 18px; color: #64748b; margin-top: 4px;">${escHtml(desc)}</div>` : ''}
      </div>
      <div style="text-align: right; margin-left: 16px; flex-shrink: 0;">
        <div style="font-size: 28px; font-weight: 800; color: #f97316; line-height: 1.2;">${escHtml(game.timeET)}</div>
        <div style="font-size: 22px; color: #94a3b8; margin-top: 4px; white-space: nowrap;">${escHtml(channels)}</div>
      </div>
    </div>
  `;
}

function buildPageHTML({ date, groups, pageNum, totalPages }) {
  const displayDate = formatDate(date);

  let gamesHTML = '';
  for (const [sport, games] of groups) {
    const cfg = getSportConfig(sport);
    gamesHTML += `
      <div style="margin-bottom: 12px;">
        <div style="
          font-size: 24px;
          font-weight: 800;
          color: ${cfg.color};
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span>${cfg.emoji}</span>
          <span>${escHtml(sport)}</span>
        </div>
        ${games.map(buildGameCardHTML).join('')}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #080c14;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
</head>
<body>
  <!-- Background gradient -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at top left, #0f1e3a 0%, #080c14 60%);z-index:0;"></div>

  <!-- Content wrapper -->
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%;padding:44px 48px 36px;">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <div>
        <div style="font-size:13px;font-weight:700;color:#14b8a6;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">
          ANY &amp; ALL SPORTS
        </div>
        <div style="font-size:46px;font-weight:900;color:#ffffff;font-style:italic;line-height:1;letter-spacing:-0.02em;">
          What's On Tonight
        </div>
        <div style="font-size:22px;color:#64748b;margin-top:8px;font-weight:400;">
          ${escHtml(displayDate)}
        </div>
      </div>
      <!-- Page indicator -->
      <div style="
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #f97316;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 900;
        color: #ffffff;
        flex-shrink: 0;
        margin-top: 4px;
      ">${pageNum}/${totalPages}</div>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:linear-gradient(to right, #14b8a6, transparent);margin-bottom:20px;"></div>

    <!-- Games -->
    <div style="flex:1;overflow:hidden;">
      ${gamesHTML}
    </div>

    <!-- Footer -->
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:16px;
      padding-top:14px;
      border-top:1px solid #1e293b;
    ">
      <div style="font-size:14px;font-weight:700;color:#14b8a6;">@any_and_all_sports</div>
      <div style="font-size:13px;color:#64748b;">Follow for daily schedules 🔔</div>
    </div>

  </div>
</body>
</html>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chunkGamesIntoPages(sportGroups, maxPerPage = 7) {
  // We need to pack sport groups into pages without splitting a group across pages
  // (unless a single group is too large)
  const pages = [];
  let currentPageGroups = [];
  let currentCount = 0;

  for (const [sport, games] of sportGroups) {
    // If adding this entire group would exceed the limit and we already have some content, start a new page
    if (currentCount + games.length > maxPerPage && currentPageGroups.length > 0) {
      pages.push(currentPageGroups);
      currentPageGroups = [];
      currentCount = 0;
    }

    if (games.length > maxPerPage) {
      // Split this large group across pages
      let i = 0;
      while (i < games.length) {
        const slice = games.slice(i, i + maxPerPage - currentCount);
        if (slice.length === 0) break;
        currentPageGroups.push([sport, slice]);
        currentCount += slice.length;
        i += slice.length;
        if (currentCount >= maxPerPage) {
          pages.push(currentPageGroups);
          currentPageGroups = [];
          currentCount = 0;
        }
      }
    } else {
      currentPageGroups.push([sport, games]);
      currentCount += games.length;
    }

    if (currentCount >= maxPerPage) {
      pages.push(currentPageGroups);
      currentPageGroups = [];
      currentCount = 0;
    }
  }

  if (currentPageGroups.length > 0) {
    pages.push(currentPageGroups);
  }

  return pages;
}

function buildCaption(date, games) {
  const displayDate = formatDate(date);
  const sportSet = [...new Set(games.map(g => g.sport))];

  const lines = [
    `🏟️ What's On Tonight — ${displayDate}`,
    '',
    sportSet.map(s => `${getSportConfig(s).emoji} ${s}`).join('  ·  '),
    '',
    `${games.length} games on tonight — swipe to see the full schedule with channel info!`,
    '',
    `Know where to watch. Every game. Every channel.`,
    `📲 Follow @any_and_all_sports for daily schedules!`,
    '',
    `— — — — — — — — — —`,
    '',
    // Core brand hashtags (always include)
    '#AnyAndAllSports #WhatsOnTonight #SportsTonight',
    '#SportsSchedule #SportsTV #SportsTVSchedule #WatchSports',
    '#WhereToWatch #GameTonight #SportsOnTV #LiveSports',
    '',
    // Sport-specific hashtags for TODAY's games
    ...sportSet.map(s => {
      const tags = {
        NBA: '#NBA #NBATonight #NBABasketball #NBAonESPN #NBAonTNT',
        NHL: '#NHL #NHLTonight #Hockey #StanleyCup #NHLonTNT #NHLonESPN',
        MLB: '#MLB #MLBTonight #Baseball #MLBonFOX #MLBonESPN',
        NFL: '#NFL #NFLTonight #Football #NFLSunday #MondayNightFootball #TNF',
        Soccer: '#Soccer #Football #PremierLeague #LaLiga #SerieA #Bundesliga #MLS #UCL #ChampionsLeague',
        'College Basketball': '#MarchMadness #CollegeBasketball #NCAAB #NCAABasketball #CollegeHoops #FinalFour',
        'College Football': '#CollegeFootball #NCAAF #CFB #CFBPlayoff',
        'MMA/UFC': '#UFC #MMA #UFCFightNight #UFCTonight',
        F1: '#F1 #Formula1 #F1Racing #GrandPrix',
        Tennis: '#Tennis #ATP #WTA #ATPTour #WTATour #GrandSlam',
        Golf: '#Golf #PGA #PGATour #LPGA #LIVGolf #ChampionsTour #DPWorldTour',
        WNBA: '#WNBA #WNBABasketball #WomensBasketball',
        NASCAR: '#NASCAR #NASCARCup #NASCARRacing',
        Boxing: '#Boxing #BoxingTonight',
        'International Basketball': '#FIBA #EuroLeague #InternationalBasketball #BasketballWorldCup',
      };
      return tags[s] || '';
    }).filter(Boolean),
    '',
    // Always include cross-sport discovery hashtags
    '#NBA #NFL #MLB #NHL #Soccer #Golf #UFC #Tennis #F1',
    '#CollegeBasketball #MarchMadness #WNBA #NASCAR',
    '#ESPN #FOXSports #TNT #NBC #Peacock #AppleTV #Netflix',
    '#SportsContent #SportsMedia #SportsNews #DailySports',
  ];

  return lines.join('\n');
}

async function run() {
  const dateArg = process.argv[2];
  const date = dateArg || new Date().toISOString().slice(0, 10);

  const schedulePath = join(ROOT, 'data', 'schedules', `${date}.json`);
  let schedule;
  try {
    schedule = JSON.parse(readFileSync(schedulePath, 'utf-8'));
  } catch {
    console.error(`Could not read schedule file: ${schedulePath}`);
    process.exit(1);
  }

  const { games: allGames } = schedule;
  // Filter out completed games
  const games = allGames.filter(g => g.status !== 'final' && g.status !== 'completed');
  const sportGroups = groupBySport(games);
  const pages = chunkGamesIntoPages(sportGroups, 6);
  const totalPages = pages.length;

  const outDir = join(ROOT, 'public', 'social');
  mkdirSync(outDir, { recursive: true });

  console.log(`Generating ${totalPages} page(s) for ${date}...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });

  const imagePaths = [];

  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;
    const html = buildPageHTML({
      date,
      groups: pages[i],
      pageNum,
      totalPages,
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const outPath = join(outDir, `${date}-page-${pageNum}.png`);
    await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    imagePaths.push(outPath);
    console.log(`  Saved: ${outPath}`);
  }

  await browser.close();

  // Write caption
  const captionPath = join(outDir, `${date}-caption.txt`);
  writeFileSync(captionPath, buildCaption(date, games));
  console.log(`  Saved: ${captionPath}`);

  console.log(`\nDone! Generated ${imagePaths.length} image(s).`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
