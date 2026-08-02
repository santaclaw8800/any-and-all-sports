#!/usr/bin/env node
/**
 * Generate prebuilt sports content packages for a date range.
 *
 * Default weekly mode:
 *   node scripts/generate-weekly-content.mjs
 *
 * Initial/manual run:
 *   node scripts/generate-weekly-content.mjs --days 3 --start today
 *
 * Verification regeneration:
 *   node scripts/generate-weekly-content.mjs --start 2026-05-14 --days 1 --force --reason verification
 */

import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { generateSocialPost, buildCaption } from './generate-social-post.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GENERATED_DIR = join(ROOT, 'generated-posts');
const LOG_DIR = join(ROOT, 'logs');
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const MAX_OUTPUT_TOKENS = Math.min(Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1200), 1200);
const COST_PER_1K_OUTPUT = Number(process.env.OPENAI_COST_PER_1K_OUTPUT || 0);
const COST_PER_1K_INPUT = Number(process.env.OPENAI_COST_PER_1K_INPUT || 0);
const NATIVE_FETCH_DISABLED = Boolean(process.env.NODE_USE_SYSTEM_CA || process.env.NODE_EXTRA_CA_CERTS);

delete process.env.NODE_USE_SYSTEM_CA;
delete process.env.NODE_EXTRA_CA_CERTS;

function safeEnv() {
  const env = { ...process.env };
  delete env.NODE_USE_SYSTEM_CA;
  delete env.NODE_EXTRA_CA_CERTS;
  return env;
}

function parseArgs(argv) {
  const args = {
    days: 7,
    start: 'tomorrow',
    force: false,
    reason: 'weekly',
    skipFetch: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--days') args.days = Number(argv[++i]);
    else if (arg === '--start') args.start = argv[++i];
    else if (arg === '--force') args.force = true;
    else if (arg === '--reason') args.reason = argv[++i];
    else if (arg === '--skip-fetch') args.skipFetch = true;
    else if (/^\d+$/.test(arg)) args.days = Number(arg);
  }

  if (!Number.isInteger(args.days) || args.days < 1 || args.days > 14) {
    throw new Error('--days must be an integer from 1 to 14');
  }
  return args;
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

function addDays(dateStr, offset) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function resolveStartDate(start) {
  if (start === 'today') return todayET();
  if (start === 'tomorrow') return addDays(todayET(), 1);
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) return start;
  throw new Error('--start must be today, tomorrow, or YYYY-MM-DD');
}

function schedulePath(date) {
  return join(ROOT, 'data', 'schedules', `${date}.json`);
}

function generatedDayDir(date) {
  return join(GENERATED_DIR, date);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function logLine(message) {
  mkdirSync(LOG_DIR, { recursive: true });
  const line = `[${new Date().toISOString()}] ${message}`;
  writeFileSync(join(LOG_DIR, 'weekly-generation.log'), `${line}\n`, { flag: 'a' });
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

function fetchSchedule(date) {
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'fetch-schedules.mjs'), date], {
    cwd: ROOT,
    stdio: 'pipe',
    timeout: 90_000,
    env: safeEnv(),
  });
}

function summarizeDayForPrompt(schedule) {
  const games = (schedule.games || []).slice(0, 18).map((game) => ({
    sport: game.sport,
    matchup: `${game.awayTeam?.name || 'TBD'} at ${game.homeTeam?.name || 'TBD'}`,
    timeET: game.timeET,
    channels: (game.channels || []).slice(0, 3),
    tournament: game.tournament || game.description || undefined,
  }));
  return {
    date: schedule.date,
    totalGames: schedule.games?.length || 0,
    sports: [...new Set((schedule.games || []).map((game) => game.sport))],
    games,
  };
}

function buildPrompt(days) {
  return [
    'Create concise social copy for Any & All Sports pre-generated daily sports schedule posts.',
    'Return JSON only with this exact shape: {"days":{"YYYY-MM-DD":{"caption":"...","hashtags":["#Tag"],"slides":[{"title":"...","body":"..."}],"telegram":{"text":"..."}}}}.',
    'Rules: one caption under 450 characters, 10 to 18 hashtags, 3 to 6 slides per day, slide title under 45 characters, slide body under 120 characters, no markdown fences.',
    'Tone: useful, direct, schedule-first. Mention where to watch and follow @any_and_all_sports.',
    'Sports focus: NBA, NHL, MLB, MLS, WNBA, EPL, La Liga, and golf tournaments when present.',
    `Days: ${JSON.stringify(days)}`,
  ].join('\n');
}

function getOpenAIText(responseJson) {
  if (typeof responseJson.output_text === 'string') return responseJson.output_text;
  const chunks = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

async function requestBatchCopy(days) {
  if (NATIVE_FETCH_DISABLED) {
    return { status: 'skipped_native_fetch_env', contentByDate: {}, usage: null };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { status: 'skipped_no_key', contentByDate: {}, usage: null };
  }

  const prompt = buildPrompt(days.map(summarizeDayForPrompt));
  const started = Date.now();
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: prompt,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const raw = await response.text();
  if (!response.ok) {
    const error = new Error(`OpenAI request failed: HTTP ${response.status} ${raw.slice(0, 300)}`);
    error.status = response.status;
    error.isQuota = response.status === 429 || /quota|rate limit/i.test(raw);
    throw error;
  }

  const json = JSON.parse(raw);
  const text = getOpenAIText(json).trim();
  const parsed = JSON.parse(text);
  return {
    status: 'ok',
    contentByDate: parsed.days || {},
    usage: json.usage || null,
    durationMs: Date.now() - started,
  };
}

function extractHashtags(caption) {
  const tags = caption.match(/#[A-Za-z0-9_]+/g) || [];
  return [...new Set(tags)].slice(0, 24);
}

function fallbackContent(schedule) {
  const games = schedule.games || [];
  const caption = buildCaption(schedule.date, games);
  const sports = [...new Set(games.map((game) => game.sport))];
  const leadGames = games.slice(0, 5).map((game) => {
    const channels = (game.channels || []).slice(0, 2).join(' / ') || 'Check listings';
    return `${game.awayTeam?.name || 'TBD'} at ${game.homeTeam?.name || 'TBD'} ${game.timeET} on ${channels}`;
  });
  return {
    caption,
    hashtags: extractHashtags(caption),
    slides: [
      { title: "What's On Tonight", body: `${games.length} events across ${sports.join(', ') || 'sports'}.` },
      ...leadGames.map((body, index) => ({ title: `Game ${index + 1}`, body })),
    ].slice(0, 6),
    telegram: {
      text: `Sports package ready for ${schedule.date}: ${games.length} events. Open ${generatedDayDir(schedule.date)}`,
    },
  };
}

function normalizeContent(schedule, aiContent, source) {
  const fallback = fallbackContent(schedule);
  const caption = typeof aiContent?.caption === 'string' && aiContent.caption.trim()
    ? aiContent.caption.trim()
    : fallback.caption;
  const hashtags = Array.isArray(aiContent?.hashtags) && aiContent.hashtags.length
    ? aiContent.hashtags.map(String).filter((tag) => tag.startsWith('#')).slice(0, 24)
    : fallback.hashtags;
  const slides = Array.isArray(aiContent?.slides) && aiContent.slides.length
    ? aiContent.slides.slice(0, 8).map((slide) => ({
        title: String(slide.title || '').slice(0, 80),
        body: String(slide.body || '').slice(0, 180),
      }))
    : fallback.slides;
  const telegram = typeof aiContent?.telegram?.text === 'string'
    ? { text: aiContent.telegram.text }
    : fallback.telegram;

  return { caption, hashtags, slides, telegram, source };
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

function usageSummary(usage) {
  const inputTokens = usage?.input_tokens || usage?.prompt_tokens || 0;
  const outputTokens = usage?.output_tokens || usage?.completion_tokens || 0;
  const totalTokens = usage?.total_tokens || inputTokens + outputTokens;
  const estimatedCost = (inputTokens / 1000) * COST_PER_1K_INPUT + (outputTokens / 1000) * COST_PER_1K_OUTPUT;
  return { inputTokens, outputTokens, totalTokens, estimatedCost };
}

async function writePackage(schedule, content, hash, reason, openAiUsage) {
  const outDir = generatedDayDir(schedule.date);
  mkdirSync(outDir, { recursive: true });

  const social = await generateSocialPost({
    date: schedule.date,
    outputDir: outDir,
    captionFileName: 'caption.txt',
    imageNameForPage: (pageNum) => `slide-${pageNum}.png`,
  });

  const pngFiles = social.imagePaths.map((path) => path.replace(`${outDir}/`, ''));
  const now = new Date().toISOString();

  writeJson(join(outDir, 'captions.json'), {
    date: schedule.date,
    caption: content.caption,
    generatedAt: now,
    source: content.source,
    model: content.source === 'openai' ? DEFAULT_MODEL : null,
  });
  writeJson(join(outDir, 'hashtags.json'), {
    date: schedule.date,
    hashtags: content.hashtags,
    generatedAt: now,
  });
  writeJson(join(outDir, 'slides.json'), {
    date: schedule.date,
    slides: content.slides,
    pngFiles,
    generatedAt: now,
  });
  writeJson(join(outDir, 'website.json'), {
    date: schedule.date,
    schedule,
    social: {
      caption: content.caption,
      hashtags: content.hashtags,
      slides: content.slides,
      pngFiles,
    },
    lastUpdated: now,
  });
  writeJson(join(outDir, 'telegram.json'), {
    date: schedule.date,
    text: content.telegram.text,
    pngFiles,
    generatedAt: now,
  });
  writeJson(join(outDir, 'manifest.json'), {
    date: schedule.date,
    scheduleHash: hash,
    reason,
    source: content.source,
    generatedAt: now,
    model: content.source === 'openai' ? DEFAULT_MODEL : null,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    openAiUsage,
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startDate = resolveStartDate(args.start);
  const dates = Array.from({ length: args.days }, (_, index) => addDays(startDate, index));
  const started = Date.now();

  mkdirSync(GENERATED_DIR, { recursive: true });
  logLine(`Generation started: dates=${dates.join(',')} reason=${args.reason} model=${DEFAULT_MODEL} max_output_tokens=${MAX_OUTPUT_TOKENS}`);

  const daysToGenerate = [];
  let cacheHits = 0;

  for (const date of dates) {
    if (!args.skipFetch) {
      try {
        fetchSchedule(date);
      } catch (err) {
        logLine(`Schedule fetch failed for ${date}: ${err.message}`);
      }
    }

    if (!existsSync(schedulePath(date))) {
      logLine(`No schedule file for ${date}; skipping package`);
      continue;
    }

    const schedule = readJson(schedulePath(date));
    const hash = scheduleHash(schedule);
    const manifestPath = join(generatedDayDir(date), 'manifest.json');
    const currentManifest = existsSync(manifestPath) ? readJson(manifestPath) : null;

    if (!args.force && currentManifest?.scheduleHash === hash && existsSync(join(generatedDayDir(date), 'website.json'))) {
      cacheHits++;
      logLine(`Cache hit for ${date}`);
      continue;
    }

    daysToGenerate.push({ date, schedule, hash });
  }

  let batchResult = { status: 'not_needed', contentByDate: {}, usage: null, durationMs: 0 };
  if (daysToGenerate.length > 0) {
    try {
      batchResult = await requestBatchCopy(daysToGenerate.map((day) => day.schedule));
      logLine(`OpenAI batch status=${batchResult.status} days=${daysToGenerate.length}`);
    } catch (err) {
      const quotaText = err.isQuota ? ' quota exceeded' : '';
      logLine(`OpenAI${quotaText} error: ${err.message}`);
      await sendTelegram(`Any & All Sports OpenAI${quotaText} error. Using saved or fallback content. ${err.message.slice(0, 180)}`);
      batchResult = { status: err.isQuota ? 'quota_fallback' : 'error_fallback', contentByDate: {}, usage: null, durationMs: 0 };
    }
  }

  const regenerated = [];
  for (const day of daysToGenerate) {
    const existingWebsite = join(generatedDayDir(day.date), 'website.json');
    const hasExistingPackage = existsSync(existingWebsite);
    const aiContent = batchResult.contentByDate[day.date];
    const source = aiContent ? 'openai' : (hasExistingPackage && batchResult.status.includes('fallback') ? 'saved' : 'deterministic');

    if (source === 'saved') {
      logLine(`Keeping last valid saved content for ${day.date}`);
      continue;
    }

    const content = normalizeContent(day.schedule, aiContent, source);
    await writePackage(day.schedule, content, day.hash, args.reason, batchResult.usage);
    regenerated.push(day.date);
  }

  const usage = usageSummary(batchResult.usage);
  const durationMs = Date.now() - started;
  const summary = {
    dates,
    regenerated,
    cacheHits,
    daysRegenerated: regenerated.length,
    openAiStatus: batchResult.status,
    model: DEFAULT_MODEL,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    totalTokens: usage.totalTokens,
    estimatedCost: usage.estimatedCost,
    generationDurationMs: durationMs,
    openAiDurationMs: batchResult.durationMs || 0,
  };

  writeJson(join(LOG_DIR, 'weekly-generation-last.json'), summary);
  logLine(`Generation complete: regenerated=${regenerated.join(',') || 'none'} cache_hits=${cacheHits} tokens=${usage.totalTokens} estimated_cost=${usage.estimatedCost.toFixed(6)} duration_ms=${durationMs}`);
}

main().catch(async (err) => {
  logLine(`Fatal generation error: ${err.stack || err.message}`);
  await sendTelegram(`Any & All Sports generation error: ${err.message}`);
  process.exitCode = 1;
});
