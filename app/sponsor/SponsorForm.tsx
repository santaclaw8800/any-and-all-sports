'use client';

import { useState } from 'react';

const sportsOptions = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'College'];
const budgetOptions = [
  'Under $500',
  '$500 - $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000+',
];

export default function SponsorForm() {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleSport = (sport: string) => {
    setSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!company || !contactName || !email || sports.length === 0 || !budget) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          contactName,
          email,
          phone: phone || undefined,
          sports,
          budget,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <p className="text-5xl mb-4">✅</p>
        <h3 className="text-xl font-bold text-white mb-2">Thanks for reaching out</h3>
        <p className="text-zinc-400">We will be in touch soon to discuss sponsorship opportunities.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company + Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Company *
          </label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Sports */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Sports of Interest *
        </label>
        <div className="flex flex-wrap gap-2">
          {sportsOptions.map(sport => (
            <button
              key={sport}
              type="button"
              onClick={() => toggleSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                sports.includes(sport)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Budget *
        </label>
        <select
          value={budget}
          onChange={e => setBudget(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          required
        >
          <option value="">Select a budget range...</option>
          {budgetOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell us about your sponsorship goals..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  );
}
