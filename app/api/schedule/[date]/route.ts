import { NextResponse } from 'next/server';
import { getSchedule } from '@/lib/schedule';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const schedule = getSchedule(date);

  if (!schedule) {
    return NextResponse.json(
      { error: `No schedule available for ${date}` },
      { status: 404 }
    );
  }

  return NextResponse.json(schedule);
}
