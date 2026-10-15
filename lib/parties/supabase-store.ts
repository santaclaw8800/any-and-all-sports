import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Party, PartyWithCount, Rsvp, SponsorLead, PartyStore } from './types';
import type { SportCategory } from '../types';

interface DbParty {
  id: string;
  game_date: string;
  game_time_et: string;
  home_team: string;
  away_team: string;
  league: string;
  sport: string;
  venue_name: string;
  venue_city: string;
  host_name: string;
  host_email: string;
  host_user_id: string;
  start_time: string;
  description: string | null;
  sponsor_name: string | null;
  sponsor_logo: string | null;
  max_attendees: number | null;
  created_at: string;
  demo: boolean | null;
}

interface DbRsvp {
  id: string;
  party_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

interface DbSponsorLead {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string | null;
  sports: string[];
  budget: string;
  message: string | null;
  created_at: string;
}

function dbToParty(row: DbParty): Party {
  return {
    id: row.id,
    gameDate: row.game_date,
    gameTimeET: row.game_time_et,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    league: row.league,
    sport: row.sport as SportCategory,
    venueName: row.venue_name,
    venueCity: row.venue_city,
    hostName: row.host_name,
    hostEmail: row.host_email,
    hostUserId: row.host_user_id,
    startTime: row.start_time,
    description: row.description ?? undefined,
    sponsorName: row.sponsor_name ?? undefined,
    sponsorLogo: row.sponsor_logo ?? undefined,
    maxAttendees: row.max_attendees ?? undefined,
    createdAt: row.created_at,
    demo: row.demo ?? undefined,
  };
}

function dbToRsvp(row: DbRsvp): Rsvp {
  return {
    id: row.id,
    partyId: row.party_id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function dbToSponsorLead(row: DbSponsorLead): SponsorLead {
  return {
    id: row.id,
    company: row.company,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone ?? undefined,
    sports: row.sports,
    budget: row.budget,
    message: row.message ?? undefined,
    createdAt: row.created_at,
  };
}

export class SupabaseStore implements PartyStore {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
    }
    this.client = createClient(url, key);
  }

  async getPartiesByDate(date: string): Promise<PartyWithCount[]> {
    const { data: parties, error } = await this.client
      .from('parties')
      .select('*')
      .eq('game_date', date)
      .order('start_time', { ascending: true });

    if (error) throw error;
    if (!parties || parties.length === 0) return [];

    const partyIds = parties.map(p => p.id);
    const { data: rsvpCounts, error: rsvpError } = await this.client
      .from('rsvps')
      .select('party_id')
      .in('party_id', partyIds);

    if (rsvpError) throw rsvpError;

    const countMap = new Map<string, number>();
    (rsvpCounts || []).forEach(r => {
      countMap.set(r.party_id, (countMap.get(r.party_id) || 0) + 1);
    });

    return (parties as DbParty[]).map(p => ({
      ...dbToParty(p),
      attendeeCount: countMap.get(p.id) || 0,
    }));
  }

  async createParty(partyData: Omit<Party, 'id' | 'createdAt'>): Promise<Party> {
    const { data, error } = await this.client
      .from('parties')
      .insert({
        game_date: partyData.gameDate,
        game_time_et: partyData.gameTimeET,
        home_team: partyData.homeTeam,
        away_team: partyData.awayTeam,
        league: partyData.league,
        sport: partyData.sport,
        venue_name: partyData.venueName,
        venue_city: partyData.venueCity,
        host_name: partyData.hostName,
        host_email: partyData.hostEmail,
        host_user_id: partyData.hostUserId,
        start_time: partyData.startTime,
        description: partyData.description ?? null,
        sponsor_name: partyData.sponsorName ?? null,
        sponsor_logo: partyData.sponsorLogo ?? null,
        max_attendees: partyData.maxAttendees ?? null,
        demo: partyData.demo ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return dbToParty(data as DbParty);
  }

  async getRsvps(partyId: string): Promise<Rsvp[]> {
    const { data, error } = await this.client
      .from('rsvps')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as DbRsvp[]).map(dbToRsvp);
  }

  async getUserRsvp(partyId: string, userId: string): Promise<Rsvp | null> {
    const { data, error } = await this.client
      .from('rsvps')
      .select('*')
      .eq('party_id', partyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? dbToRsvp(data as DbRsvp) : null;
  }

  async createRsvp(partyId: string, userId: string, name: string): Promise<Rsvp> {
    const { data, error } = await this.client
      .from('rsvps')
      .insert({
        party_id: partyId,
        user_id: userId,
        name,
      })
      .select()
      .single();

    if (error) throw error;
    return dbToRsvp(data as DbRsvp);
  }

  async deleteRsvp(partyId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('rsvps')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async createSponsorLead(leadData: Omit<SponsorLead, 'id' | 'createdAt'>): Promise<SponsorLead> {
    const { data, error } = await this.client
      .from('sponsor_leads')
      .insert({
        company: leadData.company,
        contact_name: leadData.contactName,
        email: leadData.email,
        phone: leadData.phone ?? null,
        sports: leadData.sports,
        budget: leadData.budget,
        message: leadData.message ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return dbToSponsorLead(data as DbSponsorLead);
  }
}
