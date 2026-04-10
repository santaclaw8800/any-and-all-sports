import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Subscription {
  email: string;
  sports: string[];
  teams: string[];
  subscribedAt: string;
}

const SIGNUPS_FILE = path.join(process.cwd(), 'data', 'email-signups.json');

function getSignups(): Subscription[] {
  try {
    if (!fs.existsSync(SIGNUPS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(SIGNUPS_FILE, 'utf-8');
    return JSON.parse(raw) as Subscription[];
  } catch {
    return [];
  }
}

function saveSignups(signups: Subscription[]): void {
  const dir = path.dirname(SIGNUPS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SIGNUPS_FILE, JSON.stringify(signups, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sports, teams } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate sports and teams
    if (!Array.isArray(sports)) {
      return NextResponse.json({ error: 'Sports must be an array' }, { status: 400 });
    }
    if (!Array.isArray(teams)) {
      return NextResponse.json({ error: 'Teams must be an array' }, { status: 400 });
    }

    // Load existing signups
    const signups = getSignups();

    // Check if email already exists, update if so
    const existingIndex = signups.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());

    const subscription: Subscription = {
      email: email.toLowerCase(),
      sports,
      teams,
      subscribedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      signups[existingIndex] = subscription;
    } else {
      signups.push(subscription);
    }

    // Save
    saveSignups(signups);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
