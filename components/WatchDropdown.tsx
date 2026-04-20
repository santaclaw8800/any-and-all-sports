'use client';

import { useState, useRef, useEffect } from 'react';
import { getAffiliateConfig, trackAffiliateClick } from '@/lib/affiliates';

interface WatchDropdownProps {
  channels: string[];
  gameId: string;
}

export default function WatchDropdown({ channels, gameId }: WatchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter to only channels with affiliate links
  const affiliateChannels = channels.filter((ch) => getAffiliateConfig(ch));

  if (affiliateChannels.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
      >
        <span>📺</span>
        <span>Watch</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1">
          <div className="px-2 py-1 text-[9px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
            Streaming Options <span className="text-zinc-600">(Ad)</span>
          </div>
          {affiliateChannels.map((ch) => {
            const affiliate = getAffiliateConfig(ch)!;
            return (
              <a
                key={ch}
                href={affiliate.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => {
                  trackAffiliateClick(ch, gameId);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: affiliate.color }}
                />
                <span className="text-xs text-white">{affiliate.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
