import { NextResponse } from 'next/server';
import { getSchedule, getTodayET } from '@/lib/schedule';

export async function GET() {
  const today = getTodayET();
  const schedule = getSchedule(today);

  if (!schedule) {
    return NextResponse.json(
      { error: 'No schedule available for today', date: today },
      { status: 404 }
    );
  }

  return NextResponse.json(schedule);
}
