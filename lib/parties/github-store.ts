import { PartyStore, Party, PartyWithCount, Rsvp, SponsorLead } from './types';

interface GitHubFile {
  sha?: string;
  content?: string;
}

/**
 * Shared JSON store backed by a private GitHub repo (Contents API).
 * Reads/writes data/parties.json, data/rsvps.json, data/sponsor_leads.json.
 * Free, persistent, and shared across serverless instances.
 * Concurrent-write conflicts are retried with fresh SHAs.
 */
export class GitHubStore implements PartyStore {
  private token = process.env.GITHUB_DATA_TOKEN!;
  private repo = process.env.GITHUB_DATA_REPO!;
  private base = `https://api.github.com/repos/${this.repo}/contents/data`;
  private cache = new Map<string, GitHubFile>();

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'aas-parties',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private async getFile(path: string): Promise<GitHubFile> {
    const res = await fetch(`${this.base}/${path}`, {
      headers: this.headers(),
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return { content: undefined, sha: undefined };
      throw new Error(`GitHub read ${path} failed: ${res.status}`);
    }
    const json = await res.json();
    const decoded = json.content
      ? Buffer.from(json.content, 'base64').toString('utf8')
      : undefined;
    const file: GitHubFile = { sha: json.sha, content: decoded };
    this.cache.set(path, file);
    return file;
  }

  private async putFile(path: string, next: string, retries = 2): Promise<void> {
    const current = this.cache.get(path)?.sha ? this.cache.get(path)! : await this.getFile(path);
    const res = await fetch(`${this.base}/${path}`, {
      method: 'PUT',
      headers: { ...this.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `data: update ${path}`,
        content: Buffer.from(next).toString('base64'),
        sha: current.sha,
      }),
    });
    if (res.status === 409 && retries > 0) {
      this.cache.delete(path);
      await this.putFile(path, next, retries - 1);
      return;
    }
    if (!res.ok) {
      throw new Error(`GitHub write ${path} failed: ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    this.cache.set(path, { sha: json.content?.sha, content: next });
  }

  private async readArray<T>(path: string): Promise<T[]> {
    const file = await this.getFile(path);
    if (!file.content || file.content.trim() === '') return [];
    try {
      const parsed = JSON.parse(file.content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async getPartiesByDate(date: string): Promise<PartyWithCount[]> {
    const parties = await this.readArray<Party>('parties.json');
    const rsvps = await this.readArray<Rsvp & { partyId: string }>('rsvps.json');
    return parties
      .filter((p) => p.gameDate === date)
      .map((p) => ({
        ...p,
        attendeeCount: rsvps.filter((r) => r.partyId === p.id).length,
      }));
  }

  async createParty(party: Omit<Party, 'id' | 'createdAt'>): Promise<Party> {
    const parties = await this.readArray<Party>('parties.json');
    const created: Party = {
      ...party,
      id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    parties.push(created);
    await this.putFile('parties.json', JSON.stringify(parties, null, 2));
    return created;
  }

  private async getRsvpsAll(): Promise<(Rsvp & { partyId: string })[]> {
    return this.readArray<Rsvp & { partyId: string }>('rsvps.json');
  }

  async getRsvps(partyId: string): Promise<Rsvp[]> {
    const all = await this.getRsvpsAll();
    return all.filter((r) => r.partyId === partyId);
  }

  async getUserRsvp(partyId: string, userId: string): Promise<Rsvp | null> {
    const all = await this.getRsvpsAll();
    return all.find((r) => r.partyId === partyId && r.userId === userId) || null;
  }

  async createRsvp(partyId: string, userId: string, name: string): Promise<Rsvp> {
    const all = await this.getRsvpsAll();
    const rsvp: Rsvp & { partyId: string } = {
      id: `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      partyId,
      userId,
      name,
      createdAt: new Date().toISOString(),
    };
    all.push(rsvp);
    await this.putFile('rsvps.json', JSON.stringify(all, null, 2));
    return rsvp;
  }

  async deleteRsvp(partyId: string, userId: string): Promise<void> {
    const all = await this.getRsvpsAll();
    const next = all.filter((r) => !(r.partyId === partyId && r.userId === userId));
    await this.putFile('rsvps.json', JSON.stringify(next, null, 2));
  }

  async createSponsorLead(lead: Omit<SponsorLead, 'id' | 'createdAt'>): Promise<SponsorLead> {
    const leads = await this.readArray<SponsorLead>('sponsor_leads.json');
    const created: SponsorLead = {
      ...lead,
      id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    leads.push(created);
    await this.putFile('sponsor_leads.json', JSON.stringify(leads, null, 2));
    return created;
  }
}
