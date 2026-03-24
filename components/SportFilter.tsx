'use client';

import { useState, useEffect } from 'react';
import { SportCategory } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/sports-config';

interface SportFilterProps {
  sports: SportCategory[];
  onFilter: (sport: SportCategory | null) => void;
  onSearch: (query: string) => void;
}

export default function SportFilter({ sports, onFilter, onSearch }: SportFilterProps) {
  const [active, setActive] = useState<SportCategory | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    onFilter(active);
  }, [active, onFilter]);

  useEffect(() => {
    onSearch(search);
  }, [search, onSearch]);

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search teams, sports, channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sport filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
            active === null
              ? 'bg-white text-black border-white'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          All
        </button>
        {sports.map((sport) => {
          const config = SPORT_CONFIG[sport];
          const isActive = active === sport;
          return (
            <button
              key={sport}
              onClick={() => setActive(isActive ? null : sport)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
              style={
                isActive
                  ? { backgroundColor: config.color, borderColor: config.color }
                  : {}
              }
            >
              {config.emoji} {sport}
            </button>
          );
        })}
      </div>
    </div>
  );
}
