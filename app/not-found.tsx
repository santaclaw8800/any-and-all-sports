import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="text-7xl mb-6">🏟️</p>
      <h1 className="text-4xl font-black text-white mb-4">Page Not Found</h1>
      <p className="text-zinc-500 mb-8 text-lg">
        That page doesn&apos;t exist. Head back to the schedule.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all"
      >
        Back to Today&apos;s Schedule
      </Link>
    </div>
  );
}
