'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV, SITE } from '@/lib/site';
import { scrollToTarget } from './motion';
import { openTerminal } from './Header';
import Clock from './Clock';
import Icon from './Icon';

const YEAR = new Date().getFullYear();

export function CopyEmail({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      data-magnetic
      onClick={() => {
        navigator.clipboard?.writeText(SITE.email).then(
          () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
          },
          () => {},
        );
      }}
      className={`label inline-flex items-center gap-2 rounded-full border border-current px-5 py-3 transition-colors duration-300 hover:bg-bone hover:text-ink ${className}`}
    >
      <Icon name={copied ? 'check' : 'copy'} className="size-4" />
      <span aria-live="polite">{copied ? 'Copied' : 'Copy email'}</span>
    </button>
  );
}

export default function Footer() {
  // The contact page already is the call to action; don't repeat it below.
  const cta = usePathname() !== '/contact';
  return (
    <footer
      className={`site-footer relative z-[3] overflow-hidden px-5 md:px-10 ${cta ? 'pt-28 md:pt-44' : 'pt-10'}`}
      data-formation="contact"
      aria-label="Footer"
    >
      {cta ? (
        <>
          <p className="label text-dim" data-scramble>
            (Get in touch)
          </p>
          <h2
            data-split
            className="balance mt-6 max-w-[15ch] text-[11.5vw] font-medium leading-[0.95] tracking-[-0.04em] md:text-[6.4vw]"
          >
            Have a project, a role or a <em className="italic-serif text-signal">research</em> question?
          </h2>

          <div className="mt-10 flex flex-col items-start gap-6 md:mt-14 md:flex-row md:items-center md:gap-10" data-fade>
            <a
              href={`mailto:${SITE.email}`}
              data-cursor="Write"
              className="u-link text-[6.3vw] font-medium tracking-[-0.03em] md:text-[3.2vw]"
            >
              {SITE.email}
            </a>
            <CopyEmail />
          </div>
        </>
      ) : null}

      <div className="label mt-24 grid grid-cols-2 gap-10 border-t border-line pt-8 md:mt-36 md:grid-cols-12" data-fade>
        <div className="md:col-span-3">
          <p className="text-dim">Pages</p>
          <ul className="mt-3 space-y-1.5">
            {[{ label: 'Index', href: '/' }, ...NAV].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="u-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/music" className="u-link">
                CreaTune ↗
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-dim">Elsewhere</p>
          <ul className="mt-3 space-y-1.5">
            {SITE.socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="u-link">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-dim">Based in</p>
          <p className="mt-3">{SITE.location}</p>
          <Clock className="mt-1.5 block text-dim" />
        </div>
        <div className="md:col-span-3">
          <p className="text-dim">Shortcut</p>
          <button type="button" onClick={() => openTerminal()} className="u-link mt-3">
            Press ` for the terminal
          </button>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="display pointer-events-none mt-16 select-none whitespace-nowrap text-center text-[9.7vw] leading-[0.74] md:mt-24"
      >
        Sultan Sajed Shahriar
      </p>

      <div className="label flex flex-wrap items-center justify-between gap-4 border-t border-line py-5 text-dim">
        <span>
          © {YEAR} {SITE.name}
        </span>
        <span className="hidden md:inline">Built in Dhaka — Next.js, GSAP, Three.js</span>
        <span className="flex gap-6">
          <button type="button" onClick={() => openTerminal('login')} className="hover:text-bone">
            Admin
          </button>
          <button type="button" onClick={() => scrollToTarget(0)} className="hover:text-bone">
            Back to top ↑
          </button>
        </span>
      </div>
    </footer>
  );
}
