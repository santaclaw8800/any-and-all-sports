import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getSchedule, getTodayET } from '@/lib/schedule';
import CreatePartyForm from './CreatePartyForm';

export const metadata: Metadata = {
  title: 'Host a Viewing Party | Any & All Sports',
  description: 'Create a viewing party for any sports game and invite fans to watch together.',
};

export default async function NewPartyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/parties/new');
  }

  const today = getTodayET();
  const schedule = getSchedule(today);
  const games = schedule?.games || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Host a Viewing Party</h1>
        <p className="text-zinc-500 text-sm">Pick a game and set your venue</p>
      </div>

      <CreatePartyForm games={games} date={today} />
    </div>
  );
}
