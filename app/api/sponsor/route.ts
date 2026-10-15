import { NextRequest, NextResponse } from 'next/server';
import { getPartyStore } from '@/lib/parties';

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmailViaAgentMail(lead: {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  sports: string[];
  budget: string;
  message?: string;
}): Promise<boolean> {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    console.log('AGENTMAIL_API_KEY not set, skipping email');
    return false;
  }

  const inbox = 'santaclaw@agentmail.to';
  const subject = `New Sponsor Lead: ${lead.company}`;
  const text = `
New sponsorship inquiry from Any & All Sports

Company: ${lead.company}
Contact: ${lead.contactName}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Sports: ${lead.sports.join(', ')}
Budget: ${lead.budget}
Message: ${lead.message || 'None'}

Submitted: ${new Date().toISOString()}
`.trim();

  try {
    const res = await fetch(`https://api.agentmail.to/v0/inboxes/${inbox}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: [inbox],
        subject,
        text,
      }),
    });

    if (!res.ok) {
      console.error('AgentMail error:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('AgentMail request failed:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  let body: {
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    sports?: string[];
    budget?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { company, contactName, email, phone, sports, budget, message } = body;

  if (!company || !contactName || !email || !sports || sports.length === 0 || !budget) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const leadData = {
    company: stripHtml(company),
    contactName: stripHtml(contactName),
    email: stripHtml(email),
    phone: phone ? stripHtml(phone) : undefined,
    sports: sports.map(s => stripHtml(s)),
    budget: stripHtml(budget),
    message: message ? stripHtml(message) : undefined,
  };

  const store = getPartyStore();
  await store.createSponsorLead(leadData);

  await sendEmailViaAgentMail(leadData);

  return NextResponse.json({ ok: true, message: 'Thank you for your interest. We will be in touch soon.' });
}
