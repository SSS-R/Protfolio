import type { Metadata } from 'next';
import {
  Archivo,
  Instrument_Serif,
  JetBrains_Mono,
  Inter,
  IBM_Plex_Mono,
  Press_Start_2P,
  Yellowtail,
  Montserrat,
} from 'next/font/google';
import './globals.css';
import Transitions from '@/components/site/Transitions';

// ── Portfolio (v3) ──
// Archivo's width axis gives the condensed caps of the name from the same family as the body.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

const instrument = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// ── Admin panel (v2 theme tokens) and CreaTune: loaded on use, never preloaded ──
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false });
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: false,
});
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start-2p',
  display: 'swap',
  preload: false,
});
const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'], variable: '--font-script', display: 'swap', preload: false });
const montserrat = Montserrat({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
});

const description =
  'Computer Engineering student at BRAC University building full-stack systems and AI agent tooling, and researching quantum cryptography. Based in Dhaka.';

export const metadata: Metadata = {
  // Absolute URLs for share images. VERCEL_PROJECT_PRODUCTION_URL is the public
  // production domain; VERCEL_URL (per-deployment) can sit behind Vercel's
  // Deployment Protection, which would hide the image from link-preview bots.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3000'),
  ),
  title: { default: 'Sultan Sajed Shahriar — Engineer', template: '%s — Sultan Sajed Shahriar' },
  description,
  icons: { icon: '/favicon.ico' },
  openGraph: { title: 'Sultan Sajed Shahriar', description, type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Sultan Sajed Shahriar', description },
};

// Runs before paint: marks JS as available (so motion can pre-hide what it will
// reveal), skips the preloader after the first page of a session, and never
// leaves content hidden for more than 4s if the motion bundle fails.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('sss-intro'))d.dataset.intro='seen'}catch(e){}setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.add('no-motion')},4000)})();`;

// Dev only: Bitdefender's browser extension stamps bis_skin_checked / bis_register
// onto every <div> before React hydrates, which trips the dev hydration overlay.
// Production React doesn't diff attributes on hydration, so visitors never see it.
const extensionGuard = `new MutationObserver(function(m){m.forEach(function(r){r.target.removeAttribute(r.attributeName)})}).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['bis_skin_checked','bis_register']});`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${instrument.variable} ${jetbrainsMono.variable} ${inter.variable} ${ibmPlexMono.variable} ${pressStart2P.variable} ${yellowtail.variable} ${montserrat.variable} dark`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {process.env.NODE_ENV === 'development' ? <script dangerouslySetInnerHTML={{ __html: extensionGuard }} /> : null}
      </head>
      <body className="bg-background text-on-background min-h-screen antialiased">
        <Transitions>{children}</Transitions>
      </body>
    </html>
  );
}
