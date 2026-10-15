#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, '..');
const ASSET_REPO = '/Users/brucetaylor/aas-social-assets';
const ASSET_REMOTE = 'https://github.com/santaclaw8800/aas-social-assets';
const GRAPH_ROOT = 'https://graph.facebook.com/v23.0';
const FALLBACK_HASHTAGS = '#AnyAndAllSports #WhatsOnTonight #SportsTonight #WhereToWatch #DailySchedule';

function todayET() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const positional = argv.filter((arg) => arg !== '--dry-run');
  if (positional.length > 1 || (positional[0] && !/^\d{4}-\d{2}-\d{2}$/.test(positional[0]))) {
    console.error('Usage: node scripts/ig-publish.mjs [YYYY-MM-DD] [--dry-run]');
    process.exit(2);
  }
  return { date: positional[0] || todayET(), dryRun };
}

function runGit(args, cwd = ASSET_REPO) {
  return execFileSync('git', args, { cwd, stdio: 'pipe', encoding: 'utf8' }).trim();
}

function syncAssets(date, packageDir) {
  if (!existsSync(join(ASSET_REPO, '.git'))) {
    mkdirSync(dirname(ASSET_REPO), { recursive: true });
    execFileSync('git', ['clone', ASSET_REMOTE, ASSET_REPO], { stdio: 'inherit' });
  }

  const generatedDir = join(ASSET_REPO, 'generated-posts');
  const destination = join(generatedDir, date);
  mkdirSync(generatedDir, { recursive: true });
  rmSync(destination, { recursive: true, force: true });
  cpSync(packageDir, destination, { recursive: true });

  const cutoff = new Date(`${date}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);
  for (const entry of readdirSync(generatedDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(entry.name)) continue;
    if (new Date(`${entry.name}T00:00:00Z`) < cutoff) {
      rmSync(join(generatedDir, entry.name), { recursive: true, force: true });
    }
  }

  runGit(['add', 'generated-posts']);
  if (!runGit(['status', '--porcelain'])) return;
  runGit([
    '-c', 'user.name=santaclaw',
    '-c', 'user.email=santaclaw@agentmail.to',
    'commit', '-m', `publish Instagram assets for ${date}`,
  ]);
  runGit(['push']);
}

function cleanCaption(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  while (lines.length && (lines.at(-1).trim() === '' || lines.at(-1).trimStart().startsWith('#'))) {
    lines.pop();
  }
  return lines.join('\n').trimEnd().slice(0, 2200);
}

function hashtagComment(path) {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    const hashtags = Array.isArray(parsed) ? parsed : parsed.hashtags;
    const selected = hashtags
      ?.filter((tag) => typeof tag === 'string' && tag.trim())
      .slice(0, 5)
      .map((tag) => tag.trim());
    return selected?.length ? selected.join(' ') : FALLBACK_HASHTAGS;
  } catch {
    return FALLBACK_HASHTAGS;
  }
}

function logApiError(context, body) {
  const logDir = join(ROOT, 'logs');
  mkdirSync(logDir, { recursive: true });
  appendFileSync(
    join(logDir, 'ig-publish-error.log'),
    `[${new Date().toISOString()}] ${context}\n${body}\n`,
  );
}

async function graphRequest(path, { method = 'GET', params = {} } = {}) {
  const token = process.env.IG_ACCESS_TOKEN;
  const values = new URLSearchParams({ ...params, access_token: token });
  const url = method === 'GET' ? `${GRAPH_ROOT}${path}?${values}` : `${GRAPH_ROOT}${path}`;
  try {
    const response = await fetch(url, {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : undefined,
      body: method === 'POST' ? values : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    const body = await response.text();
    if (!response.ok) {
      logApiError(`${method} ${path} (HTTP ${response.status})`, body);
      throw new Error(`Instagram API error: HTTP ${response.status}`);
    }
    try {
      return JSON.parse(body);
    } catch {
      logApiError(`${method} ${path} (invalid JSON)`, body);
      throw new Error('Instagram API returned invalid JSON');
    }
  } catch (error) {
    if (!error.message.startsWith('Instagram API')) {
      logApiError(`${method} ${path} (request failed)`, error.stack || String(error));
    }
    throw error;
  }
}

async function waitUntilFinished(creationId) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const result = await graphRequest(`/${creationId}`, { params: { fields: 'status_code' } });
    if (result.status_code === 'FINISHED') return;
    if (result.status_code === 'ERROR' || result.status_code === 'EXPIRED') {
      logApiError(`GET /${creationId} (terminal status)`, JSON.stringify(result));
      throw new Error(`Instagram media ${creationId} has status ${result.status_code}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }
  logApiError(`GET /${creationId} (timeout)`, 'Media did not reach FINISHED within 60 seconds');
  throw new Error(`Timed out waiting for Instagram media ${creationId}`);
}

async function main() {
  const { date, dryRun } = parseArgs(process.argv.slice(2));
  const packageDir = join(ROOT, 'generated-posts', date);
  if (!existsSync(packageDir)) throw new Error(`Missing generated package: generated-posts/${date}`);

  const slides = readdirSync(packageDir)
    .filter((name) => /^slide-\d+\.png$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  if (!slides.length) throw new Error(`No slide PNGs found in generated-posts/${date}`);

  const captionPath = join(packageDir, 'caption.txt');
  if (!existsSync(captionPath)) throw new Error(`Missing caption.txt in generated-posts/${date}`);
  const caption = cleanCaption(readFileSync(captionPath, 'utf8'));
  const comment = hashtagComment(join(packageDir, 'hashtags.json'));
  const urls = slides.map((slide) =>
    `https://raw.githubusercontent.com/santaclaw8800/aas-social-assets/main/generated-posts/${date}/${basename(slide)}`,
  );

  if (dryRun) {
    console.log('Slide URLs:');
    urls.forEach((url) => console.log(url));
    console.log('\nFinal caption:');
    console.log(caption);
    console.log('\nFirst comment:');
    console.log(comment);
    return;
  }

  const userId = process.env.IG_USER_ID;
  if (!userId || !process.env.IG_ACCESS_TOKEN) {
    console.error('Missing IG_USER_ID or IG_ACCESS_TOKEN; Instagram publish skipped.');
    process.exitCode = 2;
    return;
  }

  syncAssets(date, packageDir);

  const creationIds = [];
  for (const imageUrl of urls) {
    const result = await graphRequest(`/${userId}/media`, {
      method: 'POST',
      params: { image_url: imageUrl, is_carousel_item: 'true' },
    });
    creationIds.push(result.id);
    await waitUntilFinished(result.id);
  }

  const carousel = await graphRequest(`/${userId}/media`, {
    method: 'POST',
    params: { media_type: 'CAROUSEL', children: creationIds.join(','), caption },
  });
  await waitUntilFinished(carousel.id);
  const published = await graphRequest(`/${userId}/media_publish`, {
    method: 'POST',
    params: { creation_id: carousel.id },
  });
  await graphRequest(`/${published.id}/comments`, { method: 'POST', params: { message: comment } });

  mkdirSync(join(ROOT, 'logs'), { recursive: true });
  appendFileSync(
    join(ROOT, 'logs', 'ig-publish.log'),
    `${JSON.stringify({ ts: new Date().toISOString(), date, slides: slides.length, media_id: published.id })}\n`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
