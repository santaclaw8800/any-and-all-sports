# Any and All Sports

Sports media platform that aggregates daily schedules across major leagues and powers automated Instagram content publishing.

**Live site:** Deployed on Vercel

## Stack
- Next.js
- TypeScript
- Puppeteer
- Vercel

## Highlights
- ESPN integration spanning 25+ endpoints across 17 sports and 139 leagues
- Daily schedule aggregation and normalization pipeline
- Puppeteer-based Instagram carousel generator
- Automated daily publishing workflow via cron / scheduled jobs
- SEO-friendly schedule pages and archive views

## Local development
```bash
npm install
npm run dev
```

## Automation scripts
```bash
npm run fetch-schedule
npm run fetch-ahead
npm run generate-post
npm run generate-weekly
npm run verify-generated
npm run daily-publish
```

## Notes
This repository is sanitized for public release. Runtime credentials, local env files, and deployment secrets are not committed.
