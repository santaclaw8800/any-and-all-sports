#!/bin/bash
# daily-update.sh — Fetch today's schedule + generate social media post
# Runs daily at 5 AM ET via launchd

set -e

PROJECT_DIR="$HOME/Projects/any-and-all-sports"
cd "$PROJECT_DIR"

# Use the system node
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "[$(date)] Starting daily update..."

# 1. Fetch today's schedule from ESPN
echo "[$(date)] Fetching schedule..."
node scripts/fetch-schedules.mjs

# 2. Generate social media post images
echo "[$(date)] Generating social post..."
node scripts/generate-social-post.mjs

# 3. Commit new schedule data
echo "[$(date)] Committing schedule data..."
git add data/schedules/ && git commit -m "chore: daily schedule update $(date +%Y-%m-%d)" || echo "Nothing to commit"

# 4. Redeploy to Vercel so new data is live
echo "[$(date)] Deploying to Vercel..."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
vercel --prod --yes 2>&1 | tail -3

echo "[$(date)] Done!"
