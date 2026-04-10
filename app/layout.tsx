import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: {
    default: 'Any & All Sports — Daily TV & Streaming Schedule',
    template: '%s | Any & All Sports',
  },
  description:
    "Today's complete sports TV and streaming schedule. NBA, NFL, MLB, NHL, Soccer, Tennis, Golf, MMA and more. Never miss a game.",
  keywords: [
    'sports schedule',
    'sports TV schedule',
    'sports streaming',
    'NBA schedule',
    'NFL schedule',
    'MLB schedule',
    'NHL schedule',
    'soccer schedule',
    'what sports are on today',
    'sports on TV today',
  ],
  openGraph: {
    title: 'Any & All Sports — Daily TV & Streaming Schedule',
    description: "Today's complete sports TV and streaming schedule.",
    type: 'website',
    siteName: 'Any & All Sports',
  },
  twitter: {
    card: 'summary',
    title: 'Any & All Sports — Daily TV & Streaming Schedule',
    description: "Today's complete sports TV and streaming schedule.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
