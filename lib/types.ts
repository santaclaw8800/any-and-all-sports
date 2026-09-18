export type SportCategory =
  | 'NBA'
  | 'NFL'
  | 'MLB'
  | 'NHL'
  | 'Soccer'
  | 'Tennis'
  | 'Golf'
  | 'MMA/UFC'
  | 'College Basketball'
  | 'College Football'
  | 'NASCAR'
  | 'F1'
  | 'Boxing'
  | 'WNBA'
  | 'International Basketball'
  | 'Horse Racing'
  | 'Other';

export type GameStatus = 'upcoming' | 'live' | 'final' | 'delayed' | 'postponed';

export type StreamingPlatform =
  | 'ESPN'
  | 'ESPN2'
  | 'ESPN+'
  | 'ESPNU'
  | 'ESPNews'
  | 'ABC'
  | 'TNT'
  | 'TBS'
  | 'NBA TV'
  | 'NHL Network'
  | 'MLB Network'
  | 'NFL Network'
  | 'NFL+'
  | 'Fox Sports 1'
  | 'Fox Sports 2'
  | 'CBS Sports'
  | 'NBC Sports'
  | 'Peacock'
  | 'Paramount+'
  | 'Apple TV+'
  | 'Amazon Prime'
  | 'DAZN'
  | 'fuboTV'
  | 'YouTube TV'
  | 'Bally Sports'
  | 'FanDuel Sports Network'
  | 'MSG'
  | 'Regional Sports'
  | 'Golf Channel'
  | 'Tennis Channel'
  | 'FS1'
  | 'FS2'
  | 'USA Network'
  | 'truTV'
  | 'Max'
  | 'CBS'
  | 'NBC'
  | 'Fox'
  | 'ABC/ESPN'
  | 'Sportsnet'
  | 'TVA Sports'
  | 'Netflix'
  | 'NBA League Pass';

export interface Team {
  name: string;
  abbreviation?: string;
  record?: string;
  seed?: number;
}

export interface Game {
  id: string;
  sport: SportCategory;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string; // ISO 8601 in ET
  timeET: string; // Display time e.g. "7:30 PM ET"
  channels: StreamingPlatform[];
  status: GameStatus;
  currentPeriod?: string; // e.g. "Q3", "2nd Half", "3rd Period"
  score?: {
    home: number;
    away: number;
  };
  venue?: string;
  tournament?: string; // e.g. "NBA Playoffs", "US Open"
  description?: string; // e.g. "Game 7", "Championship"
  isNational?: boolean; // national broadcast
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  games: Game[];
  lastUpdated: string; // ISO timestamp
}
