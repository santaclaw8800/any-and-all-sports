import { Metadata } from 'next';
import { getTodayET } from '@/lib/schedule';
import PartiesClient from './PartiesClient';

export const metadata: Metadata = {
  title: 'Viewing Parties | Any & All Sports',
  description: 'Find or host viewing parties for sports games in your city. Watch the game with fellow fans at local venues.',
};

export const revalidate = 60;

export default function PartiesPage() {
  const today = getTodayET();
  return <PartiesClient initialDate={today} />;
}
