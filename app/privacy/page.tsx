import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Any & All Sports',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <p className="text-gray-300 mb-6">
        Last updated: October 2026
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">What We Collect</h2>
        <p className="text-gray-300 mb-4">
          Any & All Sports is a sports schedule app that does not require accounts or
          collect personal information. We do not ask for your name, email address,
          or any identifying details.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Anonymous Usage Data</h2>
        <p className="text-gray-300 mb-4">
          We may collect anonymous, aggregated usage data to understand how people
          use the app and improve the experience. This data cannot be used to identify
          you personally. Examples include which pages are visited most often and
          general geographic regions of visitors.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">No Personal Data Storage</h2>
        <p className="text-gray-300 mb-4">
          We do not store personal data on our servers. Any preferences you set
          (like favorite sports) are stored locally on your device and are not
          transmitted to us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
        <p className="text-gray-300 mb-4">
          Our app may contain links to external websites or streaming services.
          We are not responsible for the privacy practices of these third-party sites.
          We encourage you to review their privacy policies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Children&apos;s Privacy</h2>
        <p className="text-gray-300 mb-4">
          Our service does not address anyone under the age of 13. We do not knowingly
          collect any information from children.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Changes to This Policy</h2>
        <p className="text-gray-300 mb-4">
          We may update this privacy policy from time to time. Any changes will be
          posted on this page with an updated revision date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
        <p className="text-gray-300">
          If you have questions about this privacy policy, please contact us at{' '}
          <a
            href="mailto:brucect20@gmail.com"
            className="text-amber-500 hover:text-amber-400 underline"
          >
            brucect20@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
