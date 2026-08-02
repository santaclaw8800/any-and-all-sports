#!/usr/bin/env node
/**
 * Publish today's pre-generated package without calling OpenAI.
 */

import { execFileSync } from 'child_process';
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
  writeFileSync(join(LOG_DIR, 'daily-publish.log'), `${line}\n`, { flag: 'a' });
  console.log(line);
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

function tryCommand(label, command, args, options = {}) {
  try {
    const output = execFileSync(command, args, {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: options.timeout || 120_000,
      env: safeEnv(),
    }).toString().trim();
    logLine(`${label} succeeded${output ? `: ${output.split('\n').slice(-3).join(' | ')}` : ''}`);
    return true;
  } catch (err) {
    logLine(`${label} failed: ${err.message}`);
    return false;
  }
}

async function main() {
  const date = process.argv[2] || todayET();
  const packageDir = join(ROOT, 'generated-posts', date);
  const websitePath = join(packageDir, 'website.json');
  const telegramPath = join(packageDir, 'telegram.json');

  logLine(`Daily publish started for ${date}`);

  if (!existsSync(websitePath)) {
    const message = `Missing generated package for ${date}. Daily publish did not call OpenAI.`;
    logLine(message);
    await sendTelegram(`Any & All Sports alert: ${message}`);
    process.exitCode = 1;
    return;
  }

  const website = JSON.parse(readFileSync(websitePath, 'utf-8'));
  const telegram = existsSync(telegramPath)
    ? JSON.parse(readFileSync(telegramPath, 'utf-8'))
    : { text: `Sports package ready for ${date}: ${website.schedule?.games?.length || 0} events.` };

  const gitOk = tryCommand('Git add generated package', 'git', ['add', `generated-posts/${date}`, `data/schedules/${date}.json`], { timeout: 30_000 });
  tryCommand('Git commit generated package', 'git', ['commit', '-m', `chore: publish pre-generated sports package ${date}`], { timeout: 30_000 });

  const deployOk = tryCommand('Vercel deploy', 'vercel', ['--prod', '--yes'], { timeout: 180_000 });
  await sendTelegram(`${telegram.text}\nDeploy: ${deployOk ? 'ok' : 'failed'}\nGit staged: ${gitOk ? 'ok' : 'failed'}`);

  logLine(`Daily publish complete for ${date}`);
}

main().catch(async (err) => {
  logLine(`Fatal daily publish error: ${err.stack || err.message}`);
  await sendTelegram(`Any & All Sports daily publish error: ${err.message}`);
  process.exitCode = 1;
});
