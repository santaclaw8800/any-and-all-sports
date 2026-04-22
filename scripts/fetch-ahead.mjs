#!/usr/bin/env node
/**
 * scripts/fetch-ahead.mjs
 * Fetches sports schedules for the next N days in advance.
 * Runs via launchd weekly cron to keep the site populated 7-30 days out.
 *
 * Usage:
 *   node scripts/fetch-ahead.mjs          # fetches next 7 days (default)
 *   node scripts/fetch-ahead.mjs 30       # fetches next 30 days
 *   node scripts/fetch-ahead.mjs 7 2      # 7 days starting 2 days from now
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const daysAhead = parseInt(process.argv[2] || '7', 10);
const startOffset = parseInt(process.argv[3] || '1', 10); // start from tomorrow by default

function getDateString(offsetDays) {
  const d = new Date();
  // Use ET timezone
  const etOffset = -5; // EST; adjust for EDT when needed
  d.setHours(d.getHours() + etOffset);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

console.log(`[${new Date().toISOString()}] Fetching ${daysAhead} days of schedules ahead...`);

let success = 0;
let failed = 0;

for (let i = startOffset; i < startOffset + daysAhead; i++) {
  const dateStr = getDateString(i);
  try {
    console.log(`  Fetching ${dateStr}...`);
    execSync(`node ${ROOT}/scripts/fetch-schedules.mjs ${dateStr}`, {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 30000,
    });
    success++;
    // Small delay to be respectful to ESPN API
    // small delay
    execSync("sleep 0.5");
  } catch (err) {
    console.error(`  ERROR fetching ${dateStr}:`, err.message);
    failed++;
  }
}

console.log(`[${new Date().toISOString()}] Done. Success: ${success} | Failed: ${failed}`);

// Trigger a Vercel redeploy after fetching so the site shows new data
try {
  console.log('Deploying to Vercel...');
  execSync('vercel --prod --yes', { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
  console.log('Deployed successfully.');
} catch (err) {
  console.error('Vercel deploy failed:', err.message);
}

// Notify OpenClaw
try {
  execSync(`openclaw system event --text "Advance schedule fetch complete: ${success} days fetched" --mode now`, { stdio: 'pipe' });
} catch {}
