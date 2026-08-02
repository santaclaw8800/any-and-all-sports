# Sports Automation

The automation now generates sports content in local batches instead of doing full daily generation.

## Jobs

- Weekly generation: Sunday at 11:30 PM ET, `npm run generate-weekly`
- Morning verification: daily at 6:00 AM ET, `npm run verify-generated`
- Daily publish: daily at 6:30 AM ET, `npm run daily-publish`

The launchd templates are in `config/launchd/`.

## Generated Package Layout

Each day is saved under `generated-posts/YYYY-MM-DD/`:

- `captions.json`
- `hashtags.json`
- `slides.json`
- `slide-N.png`
- `website.json`
- `telegram.json`
- `manifest.json`

The website reads `generated-posts/YYYY-MM-DD/website.json` first, then falls back to `data/schedules/YYYY-MM-DD.json`.

## OpenAI Cost Controls

- Default model: `gpt-5.4-mini`
- Token cap: `max_output_tokens` is capped at 1200
- One OpenAI Responses API request is used for all uncached days in the batch
- Packages are cached by schedule hash in `manifest.json`
- Daily publish does not call OpenAI
- Verification only regenerates one affected day when the schedule hash changes
- If OpenAI quota is exceeded, the job logs and sends a Telegram alert when configured, then uses saved or deterministic content

Environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-5.4-mini`
- `OPENAI_MAX_OUTPUT_TOKENS` optional, capped at 1200
- `OPENAI_COST_PER_1K_INPUT` optional logging estimate
- `OPENAI_COST_PER_1K_OUTPUT` optional logging estimate
- `TELEGRAM_BOT_TOKEN` optional
- `TELEGRAM_CHAT_ID` optional

## Manual Commands

Initial three-day generation:

```sh
npm run generate-initial
```

Weekly generation:

```sh
npm run generate-weekly
```

Verification:

```sh
npm run verify-generated
```

Daily publish without OpenAI:

```sh
npm run daily-publish
```

Install launchd jobs:

```sh
cp config/launchd/com.anyandallsports.*.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.anyandallsports.weekly-generation.plist 2>/dev/null || true
launchctl unload ~/Library/LaunchAgents/com.anyandallsports.verification.plist 2>/dev/null || true
launchctl unload ~/Library/LaunchAgents/com.anyandallsports.daily-publish.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.anyandallsports.weekly-generation.plist
launchctl load ~/Library/LaunchAgents/com.anyandallsports.verification.plist
launchctl load ~/Library/LaunchAgents/com.anyandallsports.daily-publish.plist
```
