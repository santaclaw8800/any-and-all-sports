import { PartyStore, Party } from './types';
import { LocalJsonStore } from './local-store';

export * from './types';

let storeInstance: PartyStore | null = null;

export function getPartyStore(): PartyStore {
  if (storeInstance) return storeInstance;

  if (process.env.GITHUB_DATA_TOKEN && process.env.GITHUB_DATA_REPO) {
    const { GitHubStore } = require('./github-store');
    storeInstance = new GitHubStore();
  } else if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
    const { SupabaseStore } = require('./supabase-store');
    storeInstance = new SupabaseStore();
  } else {
    storeInstance = new LocalJsonStore();
  }

  return storeInstance!;
}

export function getTodayET(): string {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

export function getDemoParties(): Omit<Party, 'id' | 'createdAt'>[] {
  const today = getTodayET();

  return [
    {
      gameDate: today,
      gameTimeET: '7:30 PM ET',
      homeTeam: 'Atlanta Hawks',
      awayTeam: 'Boston Celtics',
      league: 'NBA',
      sport: 'NBA',
      venueName: 'Stats Brewpub',
      venueCity: 'Atlanta',
      hostName: 'Mike T.',
      hostEmail: 'demo@example.com',
      hostUserId: 'demo-user-1',
      startTime: `${today}T19:00:00-04:00`,
      description: 'Hawks home opener watch party. First round on the house for early arrivals.',
      sponsorName: 'Terrapin Beer Co.',
      sponsorLogo: '🍺',
      maxAttendees: 50,
      demo: true,
    },
    {
      gameDate: today,
      gameTimeET: '8:20 PM ET',
      homeTeam: 'Dallas Cowboys',
      awayTeam: 'Philadelphia Eagles',
      league: 'NFL',
      sport: 'NFL',
      venueName: 'Hudson Grille',
      venueCity: 'Atlanta',
      hostName: 'Sarah K.',
      hostEmail: 'demo@example.com',
      hostUserId: 'demo-user-2',
      startTime: `${today}T20:00:00-04:00`,
      description: 'Sunday Night Football on the big screens. Wings special all night.',
      sponsorName: 'Miller Lite',
      sponsorLogo: '🏈',
      maxAttendees: 75,
      demo: true,
    },
    {
      gameDate: today,
      gameTimeET: '3:00 PM ET',
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester City',
      league: 'Champions League',
      sport: 'Soccer',
      venueName: "Fado Irish Pub",
      venueCity: 'Atlanta',
      hostName: 'James R.',
      hostEmail: 'demo@example.com',
      hostUserId: 'demo-user-3',
      startTime: `${today}T14:30:00-04:00`,
      description: 'UCL matchday at the best soccer pub in Midtown.',
      demo: true,
    },
  ];
}
