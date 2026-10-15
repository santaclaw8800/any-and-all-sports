'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Game } from '@/lib/types';
import Toast from '@/components/Toast';

interface CreatePartyFormProps {
  games: Game[];
  date: string;
}

export default function CreatePartyForm({ games, date }: CreatePartyFormProps) {
  const router = useRouter();
  const [selectedGameId, setSelectedGameId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const selectedGame = games.find(g => g.id === selectedGameId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGameId || !venueName || !venueCity || !startTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedGame) {
      setError('Please select a game');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameDate: date,
          gameTimeET: selectedGame.timeET,
          homeTeam: selectedGame.homeTeam.name,
          awayTeam: selectedGame.awayTeam.name,
          league: selectedGame.tournament || selectedGame.sport,
          sport: selectedGame.sport,
          venueName,
          venueCity,
          startTime: new Date(`${date}T${startTime}`).toISOString(),
          description: description || undefined,
          maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create party');
      }

      setToastVisible(true);
      setTimeout(() => {
        router.push('/parties');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Game selection */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Select Game *
        </label>
        {games.length > 0 ? (
          <select
            value={selectedGameId}
            onChange={e => setSelectedGameId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            required
          >
            <option value="">Choose a game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.awayTeam.name} @ {game.homeTeam.name} ({game.sport}) - {game.timeET}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-zinc-500 text-sm p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            No games scheduled for today. Try again when games are available.
          </p>
        )}
      </div>

      {/* Venue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Venue Name *
          </label>
          <input
            type="text"
            value={venueName}
            onChange={e => setVenueName(e.target.value)}
            placeholder="e.g. Stats Brewpub"
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            City *
          </label>
          <input
            type="text"
            value={venueCity}
            onChange={e => setVenueCity(e.target.value)}
            placeholder="e.g. Atlanta"
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
      </div>

      {/* Start time */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Party Start Time *
        </label>
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          required
        />
        <p className="text-zinc-600 text-xs mt-1">
          When guests should arrive (often 30 min before game time)
        </p>
      </div>

      {/* Optional fields */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Tell people what to expect..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Max Attendees
        </label>
        <input
          type="number"
          value={maxAttendees}
          onChange={e => setMaxAttendees(e.target.value)}
          placeholder="Leave blank for no limit"
          min={1}
          max={500}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || games.length === 0}
          className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Party'}
        </button>
      </div>

      <Toast
        message="Party created!"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </form>
  );
}
