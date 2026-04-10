# ESPN Public API Reference

Source: https://github.com/pseudo-r/Public-ESPN-API

## Base URLs

| Domain | Version | Purpose |
|--------|---------|---------|
| site.api.espn.com | v2/v3 | Scores, news, teams, standings (site-facing) |
| sports.core.api.espn.com | v2 | Athletes, stats, odds, play-by-play, detailed data |
| sports.core.api.espn.com | v3 | Athletes, leaders (richer schema) |
| site.web.api.espn.com | v3 | Search, athlete profiles |
| cdn.espn.com | — | CDN-optimized live data |
| now.core.api.espn.com | — | Real-time news feeds |

## Key Endpoints

### Scoreboard (what we use)
```
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard?dates=YYYYMMDD
```

### Dedicated Broadcasts Endpoint (more detailed)
```
GET https://sports.core.api.espn.com/v2/sports/{sport}/leagues/{league}/events/{id}/competitions/{id}/broadcasts
```

### V3 Scoreboard (richer data)
```
GET https://site.api.espn.com/apis/site/v3/sports/{sport}/{league}/scoreboard
```

## Sports Coverage (17 sports, 139 leagues)

### 🏀 Basketball (15 leagues)
| League | Slug | Notes |
|--------|------|-------|
| NBA | `nba` | ✅ Using |
| WNBA | `wnba` | ✅ Using |
| Men's College | `mens-college-basketball` | ✅ Using |
| Women's College | `womens-college-basketball` | ✅ Using |
| NBA G League | `nba-g-league` | Available |
| NBA Summer League | `nba-summer-league` | Seasonal |
| Basketball Africa League | `bal` | Available |
| EuroLeague | `euroleague` | Available |
| Spanish ACB | `esp.1` | Available |
| Turkish BSL | `tur.bsl` | Available |
| Australian NBL | `aus.nbl` | Available |
| French Pro A | `fra.a` | Available |
| Greek Basket League | `gre.a1` | Available |
| Israeli Super League | `isr.bsl` | Available |
| Italian Lega | `ita.a` | Available |

### 🏈 Football (5 leagues)
| League | Slug | Notes |
|--------|------|-------|
| NFL | `nfl` | ✅ Using |
| College Football | `college-football` | ✅ Using |
| CFL | `cfl` | Available |
| XFL | `xfl` | Available |
| UFL | `ufl` | Available |

### ⚾ Baseball (13 leagues)
| League | Slug | Notes |
|--------|------|-------|
| MLB | `mlb` | ✅ Using |
| College Baseball | `college-baseball` | Available |
| College Softball | `college-softball` | Available |
| Japanese NPB | `jpn.npb` | Available |
| Korean KBO | `kor.kbo` | Available |
| Mexican LMB | `mex.lmb` | Available |
| + more international | various | See full docs |

### 🏒 Hockey (6 leagues)
| League | Slug | Notes |
|--------|------|-------|
| NHL | `nhl` | ✅ Using |
| College Hockey | `mens-college-hockey` | Available |
| KHL | `khl` | Available |
| SHL | `shl` | Available |
| AHL | `ahl` | Available |
| + more | various | See full docs |

### ⚽ Soccer (24 leagues)
| League | Slug | Notes |
|--------|------|-------|
| MLS | `usa.1` | ✅ Using |
| Premier League | `eng.1` | ✅ Using |
| La Liga | `esp.1` | ✅ Using |
| Serie A | `ita.1` | ✅ Using |
| Bundesliga | `ger.1` | ✅ Using |
| Ligue 1 | `fra.1` | ✅ Using |
| Champions League | `uefa.champions` | ✅ Using |
| FIFA World Cup | `fifa.world` | ✅ Using |
| Liga MX | `mex.1` | Available |
| Eredivisie | `ned.1` | Available |
| Primeira Liga | `por.1` | Available |
| Scottish Premiership | `sco.1` | Available |
| EFL Championship | `eng.2` | Available |
| Europa League | `uefa.europa` | Available |
| Conference League | `uefa.europa.conf` | Available |
| Copa Libertadores | `conmebol.libertadores` | Available |
| NWSL | `usa.nwsl` | Available |
| Copa America | `conmebol.america` | Available |
| Euro Championship | `uefa.euro` | Available |
| Women's World Cup | `fifa.wwc` | Available |
| + more | various | See full docs |

### ⛳ Golf (9 tours)
| Tour | Slug | Notes |
|------|------|-------|
| PGA Tour | `pga` | ✅ Using |
| LPGA | `lpga` | ✅ Using |
| LIV Golf | `liv` | ✅ Using |
| Champions Tour | `champions-tour` | ✅ Using |
| DP World Tour | `eur` | ✅ Using |
| Korn Ferry Tour | `kft` | Available |
| PGA Tour Americas | `ama` | Available |
| Asian Tour | `asian` | Available |
| Ladies European Tour | `let` | Available |

### 🏎️ Racing (5 leagues)
| League | Slug | Notes |
|--------|------|-------|
| Formula 1 | `f1` | ✅ Using |
| NASCAR Cup Series | `nascar-cup` | Need to test |
| NASCAR Xfinity | `nascar-xfinity` | Available |
| NASCAR Trucks | `nascar-trucks` | Available |
| IndyCar | `irl` | Need to test |

### 🥊 MMA (25+ organizations)
| Org | Slug | Notes |
|-----|------|-------|
| UFC | `ufc` | ✅ Using |
| Bellator | `bellator` | Available |
| PFL | `pfl` | Available |
| ONE Championship | `one` | Available |
| + more | various | See full docs |

### 🎾 Tennis (2 leagues)
| League | Slug | Notes |
|--------|------|-------|
| ATP | `atp` | ✅ Using |
| WTA | `wta` | ✅ Using |

### Other Sports Available
- 🏉 Australian Football (AFL)
- 🏏 Cricket (multiple leagues)
- 🏑 Field Hockey
- 🥍 Lacrosse (PLL, NLL, college)
- 🏉 Rugby (24 leagues!)
- 🏐 Volleyball
- 🤽 Water Polo

## Other Useful Endpoints

### Teams
```
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams/{id}
```

### Standings
```
GET https://site.api.espn.com/apis/v2/sports/{sport}/{league}/standings
```
⚠️ Use `/apis/v2/` NOT `/apis/site/v2/` for standings

### News
```
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/news
```

### Game Summary
```
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/summary?event={id}
```

### Play-by-Play
```
GET https://sports.core.api.espn.com/v2/sports/{sport}/leagues/{league}/events/{id}/competitions/{id}/plays
```

### Odds
```
GET https://sports.core.api.espn.com/v2/sports/{sport}/leagues/{league}/events/{id}/competitions/{id}/odds
```

## Notes
- No authentication required
- No official rate limits published, but be respectful
- Implement caching to avoid excessive requests
- APIs are undocumented and may change without notice
- Our fetch script runs once daily at 5 AM ET — well within any reasonable limits
