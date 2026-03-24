// Server-only: uses fs and path — do NOT import in client components
import { DaySchedule } from './types';
import fs from 'fs';
import path from 'path';

export { getTodayET, formatDateDisplay, getPrevDate, getNextDate, groupGamesBySport, getSportOrder, getLiveGames } from './schedule-utils';

const DATA_DIR = path.join(process.cwd(), 'data', 'schedules');

export function getSchedule(date: string): DaySchedule | null {
  try {
    const filePath = path.join(DATA_DIR, `${date}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as DaySchedule;
  } catch {
    return null;
  }
}

export function getAvailableDates(): string[] {
  try {
    const files = fs.readdirSync(DATA_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
