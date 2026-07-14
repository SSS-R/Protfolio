import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, JetBrains_Mono, Press_Start_2P, Yellowtail, Montserrat } from 'next/font/google';
import './globals.css';
import { readData } from '@/lib/store';
import ClientLayout from '@/components/ClientLayout';

// Font configuration using next/font/google
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start-2p',
  display: 'swap',
});

// Script face for the CreaTune wordmark (matches the studio's signature logo)
const yellowtail = Yellowtail({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

// Geometric sans for CreaTune display lettering (matches the banner's spaced caps)
const montserrat = Montserrat({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  // Uses the deployment URL Vercel injects; falls back to localhost in dev.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: 'SULTAN SAJED SHAHRIAR | PORTFOLIO',
  description: 'CS Student · Freelance Web Dev · AI Systems Builder. Swiss Modernism meets Cyberpunk Terminal interface.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SULTAN SAJED SHAHRIAR | PORTFOLIO',
    description: 'CS Student · Freelance Web Dev · AI Systems Builder. Swiss Modernism meets Cyberpunk Terminal interface.',
    type: 'website',
    images: [
      {
        url: '/images/developer_avatar.png',
        width: 512,
        height: 512,
        alt: 'Pixel art avatar of Sultan Sajed Shahriar at a retro computer',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'SULTAN SAJED SHAHRIAR | PORTFOLIO',
    description: 'CS Student · Freelance Web Dev · AI Systems Builder.',
    images: ['/images/developer_avatar.png'],
  },
};

// Force dynamic rendering to load fresh portfolio data updates
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getPortfolioData();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${jetbrainsMono.variable} ${pressStart2P.variable} ${yellowtail.variable} ${montserrat.variable} dark`}
    >
      <head>
        {/*
          Material Symbols is an icon font, not a text typeface — next/font/google
          doesn't provide it, so it loads via <link>. Suppressing the text-font rule.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background selection:bg-brand-amber selection:text-background min-h-screen antialiased">
        <ClientLayout portfolioData={data}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
