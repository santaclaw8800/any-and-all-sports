#!/usr/bin/env node
/**
 * generate-recap-video.mjs
 * Generates a scoreboard reveal video for TikTok/Instagram Reels (1080x1920)
 * Uses Puppeteer to render frames, then ffmpeg to compile into MP4
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FRAMES_DIR = join(ROOT, 'public', 'recap-frames');
const OUTPUT_DIR = join(ROOT, 'public', 'social');

mkdirSync(FRAMES_DIR, { recursive: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

// Last night's NBA Playoff results
const games = [
  {
    sport: 'NBA Playoffs',
    game: 'Game 5 · First Round',
    awayTeam: 'Philadelphia 76ers',
    awayScore: 107,
    awayColor: '#006BB6',
    awayAbbr: 'PHI',
    homeTeam: 'Boston Celtics',
    homeScore: 115,
    homeColor: '#007A33',
    homeAbbr: 'BOS',
    winner: 'home',
    headline: 'Celtics ADVANCE to Round 2!',
    subtext: 'Boston wins series 4-1',
    channel: 'ESPN',
    date: 'April 28, 2026',
  },
  {
    sport: 'NBA Playoffs',
    game: 'Game 5 · First Round',
    awayTeam: 'Atlanta Hawks',
    awayScore: 92,
    awayColor: '#C1D32F',
    awayAbbr: 'ATL',
    homeTeam: 'New York Knicks',
    homeScore: 109,
    homeColor: '#006BB6',
    homeAbbr: 'NYK',
    winner: 'home',
    headline: 'Knicks ADVANCE to Round 2!',
    subtext: 'New York wins series 4-1',
    channel: 'NBC/Peacock',
    date: 'April 28, 2026',
  },
];

function buildHTML(game, frame) {
  const { awayTeam, awayScore, awayColor, awayAbbr,
          homeTeam, homeScore, homeColor, homeAbbr,
          winner, headline, subtext, sport, game: gameLabel, channel, date } = game;

  const winnerColor = winner === 'home' ? homeColor : awayColor;
  const loserOpacity = 0.5;

  // Animation phases based on frame number (0-120 total frames at 30fps = 4 seconds)
  const showSport = frame > 5;
  const showTeams = frame > 20;
  const showAway = frame > 35;
  const showHome = frame > 50;
  const showScore = frame > 70;
  const showHeadline = frame > 90;
  const showSubtext = frame > 100;
  const showBranding = frame > 108;

  const easeIn = (start, current, delay, duration) => {
    if (current < delay) return 0;
    const t = Math.min((current - delay) / duration, 1);
    return t * t * (3 - 2 * t); // smoothstep
  };

  const sportOpacity = easeIn(0, frame, 5, 15);
  const teamsOpacity = easeIn(0, frame, 20, 15);
  const awayOpacity = easeIn(0, frame, 35, 15);
  const homeOpacity = easeIn(0, frame, 50, 15);
  const scoreOpacity = easeIn(0, frame, 70, 20);
  const headlineOpacity = easeIn(0, frame, 90, 15);
  const subtextOpacity = easeIn(0, frame, 100, 10);
  const brandingOpacity = easeIn(0, frame, 108, 12);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px;
  height: 1920px;
  background: #0a0a0a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bg-glow {
  position: absolute;
  width: 900px;
  height: 900px;
  background: radial-gradient(circle, ${winnerColor}22 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.container {
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 0 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.sport-label {
  opacity: ${sportOpacity};
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #888;
  text-align: center;
}

.game-label {
  font-size: 22px;
  color: #555;
  letter-spacing: 2px;
}

.scoreboard {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  opacity: ${teamsOpacity};
}

.team-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}

.team-row.away { opacity: ${awayOpacity}; }
.team-row.home { opacity: ${homeOpacity}; }

.team-row.winner {
  background: rgba(255,255,255,0.08);
  border-color: ${winnerColor}66;
}

.team-color-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  border-radius: 20px 0 0 20px;
}

.team-abbr {
  font-size: 52px;
  font-weight: 900;
  color: white;
  width: 120px;
  opacity: ${frame > 35 ? 1 : 0};
}

.team-name {
  font-size: 34px;
  font-weight: 600;
  color: ${winner === 'away' ? '#fff' : '#888'};
  flex: 1;
  padding-left: 20px;
}

.team-name.winner-team { color: #fff; }

.score {
  font-size: 88px;
  font-weight: 900;
  opacity: ${scoreOpacity};
  min-width: 140px;
  text-align: right;
}

.score.winner-score { color: ${winnerColor}; }
.score.loser-score { color: #555; }

.winner-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${winnerColor};
  color: white;
  font-size: 18px;
  font-weight: 800;
  padding: 8px 20px;
  border-radius: 0 20px 0 20px;
  letter-spacing: 1px;
  opacity: ${scoreOpacity};
}

.headline {
  opacity: ${headlineOpacity};
  font-size: 68px;
  font-weight: 900;
  color: white;
  text-align: center;
  line-height: 1.1;
  transform: translateY(${Math.max(0, 30 - (frame - 90) * 3)}px);
}

.headline span { color: ${winnerColor}; }

.subtext {
  opacity: ${subtextOpacity};
  font-size: 36px;
  color: #888;
  text-align: center;
  font-weight: 500;
}

.divider {
  width: 120px;
  height: 3px;
  background: ${winnerColor};
  opacity: ${headlineOpacity};
  border-radius: 2px;
}

.meta {
  opacity: ${sportOpacity};
  text-align: center;
  color: #444;
  font-size: 22px;
}

.branding {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  text-align: center;
  opacity: ${brandingOpacity};
}

.branding-text {
  font-size: 26px;
  font-weight: 800;
  color: #10b981;
  letter-spacing: 2px;
}

.branding-sub {
  font-size: 18px;
  color: #444;
  margin-top: 4px;
}

/* Particle effect for winner */
${winner === 'home' ? `
.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${homeColor};
  border-radius: 2px;
  opacity: ${Math.max(0, (frame - 90) / 30) * 0.6};
}` : ''}
</style>
</head>
<body>
<div class="bg-glow"></div>

<div class="container">
  <div style="opacity: ${sportOpacity}; text-align: center;">
    <div class="sport-label">${sport}</div>
    <div style="font-size: 20px; color: #444; margin-top: 8px; letter-spacing: 2px;">${gameLabel} · ${date}</div>
  </div>

  <div class="scoreboard">
    <!-- Away Team -->
    <div class="team-row away ${winner === 'away' ? 'winner' : ''}">
      <div class="team-color-bar" style="background: ${awayColor};"></div>
      <div class="team-abbr">${awayAbbr}</div>
      <div class="team-name ${winner === 'away' ? 'winner-team' : ''}">${awayTeam}</div>
      <div class="score ${winner === 'away' ? 'winner-score' : 'loser-score'}">${awayScore}</div>
      ${winner === 'away' ? '<div class="winner-badge">WIN</div>' : ''}
    </div>

    <!-- Home Team -->
    <div class="team-row home ${winner === 'home' ? 'winner' : ''}">
      <div class="team-color-bar" style="background: ${homeColor};"></div>
      <div class="team-abbr">${homeAbbr}</div>
      <div class="team-name ${winner === 'home' ? 'winner-team' : ''}">${homeTeam}</div>
      <div class="score ${winner === 'home' ? 'winner-score' : 'loser-score'}">${homeScore}</div>
      ${winner === 'home' ? '<div class="winner-badge">WIN</div>' : ''}
    </div>
  </div>

  <div class="divider"></div>

  <div class="headline">
    <span>${headline.replace('ADVANCE', '<span>ADVANCE</span>').replace('!', '')}</span>!
  </div>

  <div class="subtext">${subtext}</div>

  <div style="opacity: ${subtextOpacity}; font-size: 24px; color: #444;">📺 ${channel}</div>
</div>

<div class="branding">
  <div class="branding-text">📺 ANY & ALL SPORTS</div>
  <div class="branding-sub">anyandallsports.com · @any_and_all_sports</div>
</div>
</body>
</html>`;
}

async function generateVideo(game, outputName) {
  console.log(`Generating video: ${outputName}...`);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const TOTAL_FRAMES = 120; // 4 seconds at 30fps
  
  for (let frame = 0; frame <= TOTAL_FRAMES; frame++) {
    const html = buildHTML(game, frame);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });
    const framePath = join(FRAMES_DIR, `frame-${outputName}-${String(frame).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: framePath, type: 'jpeg', quality: 90 });
    if (frame % 20 === 0) process.stdout.write(`  Frame ${frame}/${TOTAL_FRAMES}\r`);
  }
  
  await browser.close();
  console.log(`\n  Frames done. Compiling video...`);

  const outputPath = join(OUTPUT_DIR, `${outputName}.mp4`);
  execSync(
    `ffmpeg -y -framerate 30 -pattern_type glob -i "${FRAMES_DIR}/frame-${outputName}-*.jpg" ` +
    `-c:v libx264 -pix_fmt yuv420p -crf 23 -preset fast "${outputPath}"`,
    { stdio: 'pipe' }
  );
  
  // Clean up frames
  execSync(`rm -f "${FRAMES_DIR}/frame-${outputName}-"*.jpg`);
  
  console.log(`  ✅ Saved: ${outputPath}`);
  return outputPath;
}

// Generate for the best game (Celtics series clincher)
const game = games[0]; // Celtics clinch
const today = new Date().toISOString().split('T')[0];
await generateVideo(game, `recap-celtics-${today}`);

console.log('\nDone!');
