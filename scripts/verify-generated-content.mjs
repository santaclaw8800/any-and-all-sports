#!/usr/bin/env node
/**
 * Cheap morning verification:
 * 1. Fetch only today's sports schedule.
 * 2. Compare it to the pre-generated package manifest.
 * 3. Regenerate only today if the schedule changed.
 */

import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOG_DIR = join(ROOT, 'logs');
const NATIVE_FETCH_DISABLED = Boolean(process.env.NODE_USE_SYSTEM_CA || process.env.NODE_EXTRA_CA_CERTS);

delete process.env.NODE_USE_SYSTEM_CA;
delete process.env.NODE_EXTRA_CA_CERTS;

function safeEnv() {
  const env = { ...process.env };
  delete env.NODE_USE_SYSTEM_CA;
  delete env.NODE_EXTRA_CA_CERTS;
  return env;
}

function todayET() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function logLine(message) {
  mkdirSync(LOG_DIR, { recursive: true });
  const line = `[${new Date().toISOString()}] ${message}`;
  writeFileSync(join(LOG_DIR, 'verification.log'), `${line}\n`, { flag: 'a' });
  console.log(line);
}

function scheduleHash(schedule) {
  const stableGames = [...(schedule.games || [])]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((game) => ({
      id: game.id,
      sport: game.sport,
      startTime: game.startTime,
      timeET: game.timeET,
      status: game.status,
      homeTeam: game.homeTeam?.name,
      awayTeam: game.awayTeam?.name,
      channels: game.channels,
      tournament: game.tournament,
      description: game.description,
    }));
  return createHash('sha256').update(JSON.stringify(stableGames)).digest('hex');
}

async function sendTelegram(text) {
  if (NATIVE_FETCH_DISABLED) {
    logLine(`Telegram skipped due native fetch environment: ${text}`);
    return false;
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    logLine(`Telegram skipped: ${text}`);
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    logLine(`Telegram failed: ${err.message}`);
    return false;
  }
}

function runNodeScript(script, args, timeout = 120_000) {
  execFileSync(process.execPath, [join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT,
    stdio: 'pipe',
    timeout,
    env: safeEnv(),
  });
}

async function main() {
  const date = process.argv[2] || todayET();
  const schedulePath = join(ROOT, 'data', 'schedules', `${date}.json`);
  const manifestPath = join(ROOT, 'generated-posts', date, 'manifest.json');

  logLine(`Verification started for ${date}`);
  runNodeScript('fetch-schedules.mjs', [date], 90_000);

  if (!existsSync(schedulePath)) {
    throw new Error(`Schedule fetch did not create ${schedulePath}`);
  }

  const schedule = JSON.parse(readFileSync(schedulePath, 'utf-8'));
  const currentHash = scheduleHash(schedule);
  const savedManifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf-8'))
    : null;

  if (savedManifest?.scheduleHash === currentHash) {
    logLine(`No schedule change for ${date}; using existing saved content`);
    return;
  }

  logLine(`Schedule changed for ${date}; regenerating only affected day`);
  await sendTelegram(`Any & All Sports verification: schedule changed for ${date}. Regenerating only that day.`);
  runNodeScript('generate-weekly-content.mjs', ['--start', date, '--days', '1', '--force', '--reason', 'verification', '--skip-fetch'], 240_000);
  logLine(`Verification regeneration complete for ${date}`);
}

main().catch(async (err) => {
  logLine(`Fatal verification error: ${err.stack || err.message}`);
  await sendTelegram(`Any & All Sports verification error: ${err.message}`);
  process.exitCode = 1;
});
