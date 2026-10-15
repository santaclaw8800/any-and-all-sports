import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPartyStore } from '@/lib/parties';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.name) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { id: partyId } = await params;

  if (partyId.startsWith('demo-')) {
    return NextResponse.json({
      rsvped: true,
      message: 'Demo parties are for preview only'
    });
  }

  const store = getPartyStore();
  const existingRsvp = await store.getUserRsvp(partyId, session.user.id);

  if (existingRsvp) {
    await store.deleteRsvp(partyId, session.user.id);
    return NextResponse.json({ rsvped: false, message: 'RSVP cancelled' });
  } else {
    await store.createRsvp(partyId, session.user.id, session.user.name);
    return NextResponse.json({ rsvped: true, message: 'RSVP confirmed' });
  }
}
