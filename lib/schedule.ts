// Server-only: uses fs and path — do NOT import in client components
import { DaySchedule } from './types';
import fs from 'fs';
import path from 'path';

export { getTodayET, formatDateDisplay, getPrevDate, getNextDate, groupGamesBySport, getSportOrder, getLiveGames } from './schedule-utils';

const DATA_DIR = path.join(process.cwd(), 'data', 'schedules');
const GENERATED_DIR = path.join(process.cwd(), 'generated-posts');

export function getSchedule(date: string): DaySchedule | null {
  try {
    const generatedPath = path.join(GENERATED_DIR, date, 'website.json');
    if (fs.existsSync(generatedPath)) {
      const raw = fs.readFileSync(generatedPath, 'utf-8');
      const generated = JSON.parse(raw) as { schedule?: DaySchedule };
      if (generated.schedule) return generated.schedule;
    }

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
    const dataDates = fs.existsSync(DATA_DIR)
      ? fs.readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      : [];
    const generatedDates = fs.existsSync(GENERATED_DIR)
      ? fs.readdirSync(GENERATED_DIR)
        .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
        .filter((date) => fs.existsSync(path.join(GENERATED_DIR, date, 'website.json')))
      : [];

    return [...new Set([...dataDates, ...generatedDates])].sort().reverse();
  } catch {
    return [];
  }
}
