# Feature: Horse Racing coverage (marquee races)

## Why
ESPN API has no horse-racing sport (verified: sports.core.api.espn.com/v2/sports/horse-racing returns 400). Horse racing therefore needs a curated events feed merged into the existing schedule pipeline, so races show up on anyandallsports.com and in the nightly "What's On Tonight" Instagram carousel like any other sport.

## Data
Create `data/horse-racing-events.json` — array of events:
```json
[
  {
    "id": "jcgc-2026",
    "name": "Jockey Club Gold Cup",
    "venue": "Belmont Park",
    "date": "2026-09-18",
    "timeEt": "4:14 PM ET",
    "networks": ["FOX"],
    "grade": "G1",
    "verified": true
  }
]
```

Seed events (research done Sep 18, 2026; mark verified as noted):
- Jockey Club Gold Cup — Sep 18, 2026 — Belmont Park — 4:14 PM ET — FOX (G1) [VERIFIED]
- Breeders' Cup World Championships (Future Stars Friday) — Oct 30, 2026 — Keeneland — NBC/Peacock/USA [VERIFIED]
- Breeders' Cup Classic (Saturday) — Oct 31, 2026 — Keeneland — NBC, Classic post 5:40 PM ET [VERIFIED]
- Pegasus World Cup — Jan 30, 2027 (tentative) — Gulfstream Park — NBC [date UNVERIFIED]
- Kentucky Derby — May 1, 2027 — Churchill Downs — NBC [date = first Saturday of May; verify]
- Preakness Stakes — May 15, 2027 (tentative) — Pimlico — NBC [UNVERIFIED]
- Belmont Stakes — June 2027 (exact date TBD) — Belmont Park — FOX [UNVERIFIED]
- Travers Stakes — late Aug 2027 (TBD) — Saratoga — FOX [UNVERIFIED]

## Build requirements
1. `data/horse-racing-events.json` with the seed above.
2. Modify the schedule merge so horse-racing events with today's date appear in tonight's slate (same shape as other events; category "Horse Racing", abbr "hr"). Look at `scripts/fetch-schedules.mjs` for the league list and event shape, and wherever the merged schedule is written (data/schedules/).
3. Nightly carousel generator (`scripts/generate-social-post.mjs` or similar): include horse racing events like other sports, using the event name as the "matchup" line and networks as the channel line.
4. Website: add "Horse Racing" to the sports/leagues list wherever leagues are rendered (search app/ and components/ for the league list source), with an upcoming races view fed by the same JSON (filter date >= today).
5. Keep changes minimal and consistent with existing patterns. Do NOT refactor unrelated code.
6. Test: run the fetch/generate scripts in dry-run if such a mode exists, or at minimum `npm run build` must pass.
7. Commit with a clear message on the current branch. Do not push.
