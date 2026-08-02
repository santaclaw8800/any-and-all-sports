#!/bin/bash
# daily-update.sh — Publish today's pre-generated package without OpenAI
# Runs daily via launchd after weekly generation and morning verification

set -e

PROJECT_DIR="$HOME/Projects/any-and-all-sports"
cd "$PROJECT_DIR"

# Use the system node
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "[$(date)] Starting daily pre-generated publish..."
node scripts/daily-publish.mjs

echo "[$(date)] Done!"
