'use client';

import { getAffiliateConfig, trackAffiliateClick } from '@/lib/affiliates';

interface AffiliateButtonProps {
  channel: string;
  gameId: string;
}

export default function AffiliateButton({ channel, gameId }: AffiliateButtonProps) {
  const affiliate = getAffiliateConfig(channel);

  // No affiliate link - render plain channel name
  if (!affiliate) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
        {channel}
      </span>
    );
  }

  const handleClick = () => {
    trackAffiliateClick(channel, gameId);
  };

  return (
    <a
      href={affiliate.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="group inline-flex flex-col items-center"
    >
      <span
        className="px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all duration-150 hover:scale-105 cursor-pointer"
        style={{
          backgroundColor: affiliate.color,
          borderColor: affiliate.color,
          color: '#fff',
        }}
        title={affiliate.label}
      >
        {channel}
      </span>
      <span className="text-[8px] text-zinc-600 mt-0.5 opacity-70">Ad</span>
    </a>
  );
}
