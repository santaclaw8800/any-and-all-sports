import { Game } from '@/lib/types';

interface WebSiteSchemaProps {
  url?: string;
}

export function WebSiteSchema({ url = 'https://anyandallsports.com' }: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Any & All Sports',
    url,
    description:
      "Today's complete sports TV and streaming schedule. Find every NBA, NFL, MLB, NHL, Soccer, Golf and MMA game on tonight.",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SportsEventsSchemaProps {
  games: Game[];
  date: string;
}

export function SportsEventsSchema({ games, date }: SportsEventsSchemaProps) {
  const events = games.slice(0, 20).map((game) => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${game.awayTeam.name} vs ${game.homeTeam.name}`,
    startDate: game.startTime,
    eventStatus:
      game.status === 'postponed'
        ? 'https://schema.org/EventPostponed'
        : game.status === 'delayed'
          ? 'https://schema.org/EventRescheduled'
          : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: game.venue
      ? {
          '@type': 'Place',
          name: game.venue,
        }
      : undefined,
    homeTeam: {
      '@type': 'SportsTeam',
      name: game.homeTeam.name,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: game.awayTeam.name,
    },
    sport: game.sport,
    description: `Watch ${game.awayTeam.name} vs ${game.homeTeam.name} - ${game.sport} game on ${game.channels.join(', ')}`,
    offers: game.channels.map((channel) => ({
      '@type': 'Offer',
      name: `Watch on ${channel}`,
      availability: 'https://schema.org/InStock',
    })),
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(events) }}
    />
  );
}

interface SchedulePageSchemaProps {
  date: string;
  totalGames: number;
}

export function SchedulePageSchema({ date, totalGames }: SchedulePageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Sports Schedule for ${date}`,
    description: `Complete sports TV and streaming schedule with ${totalGames} games`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalGames,
      itemListElement: {
        '@type': 'SportsEvent',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
