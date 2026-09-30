'use client';

import { useRef } from 'react';
import type { TerminalCommand } from '@/types/portfolio';
import { useSiteMotion } from './motion';
import Preloader from './Preloader';
import Header from './Header';
import Footer from './Footer';
import Terminal from './Terminal';
import Cursor from './Cursor';

export default function SiteShell({ children, commands }: { children: React.ReactNode; commands: TerminalCommand[] }) {
  const root = useRef<HTMLDivElement>(null);
  useSiteMotion(root, { waitForIntro: true });

  return (
    <div ref={root} className="site relative min-h-screen">
      <Preloader />
      <Header />
      <main id="main" tabIndex={-1} className="relative outline-none">
        {children}
      </main>
      <Footer />
      <Terminal commands={commands} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
