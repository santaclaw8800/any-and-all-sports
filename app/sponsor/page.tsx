import { Metadata } from 'next';
import SponsorForm from './SponsorForm';

export const metadata: Metadata = {
  title: 'Sponsor | Any & All Sports',
  description: 'Put your brand in front of Atlanta sports fans. Sponsor viewing parties, featured venues, and game-day takeovers.',
};

const sponsorshipOptions = [
  {
    name: 'Event Sponsor',
    description: 'Your brand appears on viewing party cards with "Hosted by" chip. Includes logo placement and featured positioning.',
    price: 'Starting at $500/event',
    icon: '🎉',
  },
  {
    name: 'Featured Venue',
    description: 'Your venue highlighted in our recommendation engine. Priority placement for sports fans finding where to watch.',
    price: 'Starting at $1,000/month',
    icon: '📍',
  },
  {
    name: 'Game-Day Takeover',
    description: 'Full homepage branding for major sporting events. Exclusive visibility during NFL Sundays, playoffs, and championships.',
    price: 'Custom pricing',
    icon: '🏆',
  },
];

export default function SponsorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Put your brand in front of Atlanta sports fans
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Any & All Sports reaches thousands of local fans looking for where to watch.
          Connect with them at the moment they are planning their game day.
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-6 sm:grid-cols-3 mb-12">
        {sponsorshipOptions.map(option => (
          <div
            key={option.name}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-all"
          >
            <div className="text-3xl mb-3">{option.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{option.name}</h3>
            <p className="text-zinc-400 text-sm mb-4">{option.description}</p>
            <p className="text-emerald-400 text-sm font-semibold">{option.price}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Get in touch</h2>
        <SponsorForm />
      </div>
    </div>
  );
}
