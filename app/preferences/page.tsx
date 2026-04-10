'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SportCategory } from '@/lib/types';
import { SPORT_CONFIG, SPORT_ORDER } from '@/lib/sports-config';
import { DEFAULT_SPORTS, TEAMS_BY_SPORT, getPreferences, savePreferences } from '@/lib/preferences';

export default function PreferencesPage() {
  const router = useRouter();
  const [selectedSports, setSelectedSports] = useState<SportCategory[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing preferences
  useEffect(() => {
    const prefs = getPreferences();
    if (prefs) {
      setSelectedSports(prefs.sports);
      setSelectedTeams(prefs.teams);
      setEmail(prefs.email || '');
    }
    setIsLoading(false);
  }, []);

  // Available teams based on selected sports
  const availableTeams = useMemo(() => {
    const teams: { sport: SportCategory; teams: string[] }[] = [];
    for (const sport of selectedSports) {
      const sportTeams = TEAMS_BY_SPORT[sport];
      if (sportTeams && sportTeams.length > 0) {
        teams.push({ sport, teams: sportTeams });
      }
    }
    return teams;
  }, [selectedSports]);

  const toggleSport = (sport: SportCategory) => {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        // Remove sport and any teams from that sport
        const sportTeams = TEAMS_BY_SPORT[sport] || [];
        setSelectedTeams((teams) => teams.filter((t) => !sportTeams.includes(t)));
        return prev.filter((s) => s !== sport);
      }
      return [...prev, sport];
    });
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const selectAllTeams = (sport: SportCategory) => {
    const sportTeams = TEAMS_BY_SPORT[sport] || [];
    setSelectedTeams((prev) => {
      const otherTeams = prev.filter((t) => !sportTeams.includes(t));
      return [...otherTeams, ...sportTeams];
    });
  };

  const clearTeams = (sport: SportCategory) => {
    const sportTeams = TEAMS_BY_SPORT[sport] || [];
    setSelectedTeams((prev) => prev.filter((t) => !sportTeams.includes(t)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    // Save to localStorage
    savePreferences({
      sports: selectedSports,
      teams: selectedTeams,
      email: email || undefined,
    });

    // Subscribe to email if provided
    if (email) {
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            sports: selectedSports,
            teams: selectedTeams,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to subscribe');
        }
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to subscribe' });
        setIsSaving(false);
        return;
      }
    }

    setMessage({ type: 'success', text: 'Preferences saved!' });
    setIsSaving(false);

    // Redirect to home after a short delay
    setTimeout(() => router.push('/'), 1000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-zinc-800 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
        >
          <span>&larr;</span> Back to schedule
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Personalize Your Feed</h1>
        <p className="text-zinc-400">
          Select your favorite sports and teams to see a customized schedule on the homepage.
        </p>
      </div>

      {/* Sports Selection */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">1</span>
          <span>Choose Your Sports</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SPORT_ORDER.filter((s) => DEFAULT_SPORTS.includes(s) || s === 'Other').map((sport) => {
            const config = SPORT_CONFIG[sport];
            const isSelected = selectedSports.includes(sport);
            return (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{config.emoji}</span>
                <span className="font-semibold text-sm">{sport}</span>
                {isSelected && (
                  <span className="ml-auto text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Teams Selection */}
      {availableTeams.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">2</span>
            <span>Pick Your Teams</span>
            <span className="text-sm font-normal text-zinc-500 ml-2">(optional)</span>
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            Leave empty to see all games for selected sports, or pick specific teams.
          </p>

          <div className="space-y-6">
            {availableTeams.map(({ sport, teams }) => {
              const config = SPORT_CONFIG[sport];
              const selectedCount = teams.filter((t) => selectedTeams.includes(t)).length;
              return (
                <div key={sport} className="border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.emoji}</span>
                      <span className="font-bold text-white">{sport}</span>
                      {selectedCount > 0 && (
                        <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full">
                          {selectedCount} selected
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => selectAllTeams(sport)}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                      >
                        Select all
                      </button>
                      <span className="text-zinc-700">|</span>
                      <button
                        onClick={() => clearTeams(sport)}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {teams.map((team) => {
                      const isSelected = selectedTeams.includes(team);
                      return (
                        <button
                          key={team}
                          onClick={() => toggleTeam(team)}
                          className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                              : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {team}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Email Signup */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">{availableTeams.length > 0 ? '3' : '2'}</span>
          <span>Daily Digest</span>
          <span className="text-sm font-normal text-zinc-500 ml-2">(optional)</span>
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Get a daily email with your personalized schedule.
        </p>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>
      </section>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-700 text-emerald-300'
              : 'bg-red-950/50 border border-red-700 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving || selectedSports.length === 0}
          className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold transition-all"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all font-semibold"
        >
          Cancel
        </Link>
      </div>

      {/* Summary */}
      {selectedSports.length > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-sm text-zinc-500">
            <span className="text-white font-semibold">{selectedSports.length}</span> sport
            {selectedSports.length !== 1 ? 's' : ''} selected
            {selectedTeams.length > 0 && (
              <>
                {' '}with <span className="text-white font-semibold">{selectedTeams.length}</span> favorite
                team{selectedTeams.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
