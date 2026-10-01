'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV, SITE } from '@/lib/site';
import { gsap, getLenis } from './motion';
import Clock from './Clock';
import Icon from './Icon';

const MENU = [{ label: 'Index', href: '/' }, ...NAV, { label: 'Sound', href: '/music' }];

export const openTerminal = (command?: string) =>
  window.dispatchEvent(new CustomEvent('sss:terminal', { detail: command }));

export default function Header() {
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // Tuck the bar away while reading downward, bring it back on any upward scroll.
  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const hide = y > last && y > 160;
      if (hide !== hidden && Math.abs(y - last) > 2) {
        hidden = hide;
        gsap.to(bar.current, { yPercent: hide ? -120 : 0, duration: 0.7, ease: 'expo.out' });
      }
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: clip-path wipe down, links rise in.
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      getLenis()?.stop();
      gsap.set(el, { display: 'flex' });
      gsap
        .timeline()
        .fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: reduce ? 0 : 0.8, ease: 'expo.inOut' },
        )
        .from(el.querySelectorAll('[data-menu-item]'), { yPercent: 110, duration: reduce ? 0 : 0.9, ease: 'expo.out', stagger: 0.05 }, '-=0.35');
      el.querySelector<HTMLElement>('a')?.focus();
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    getLenis()?.start();
    if (getComputedStyle(el).display !== 'none') {
      gsap.to(el, {
        clipPath: 'inset(0 0 100% 0)',
        duration: reduce ? 0 : 0.6,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(el, { display: 'none' }),
      });
      menuButton.current?.focus();
    }
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <a
        href="#main"
        className="label fixed left-4 top-4 z-[120] -translate-y-24 bg-signal px-3 py-2 text-ink focus:translate-y-0"
      >
        Skip to content
      </a>

      <header ref={bar} className="site-header fixed inset-x-0 top-0 z-[80] px-5 pt-5 md:px-10 md:pt-6">
        <div className="label grid grid-cols-[1fr_auto] items-start gap-6 md:grid-cols-12">
          <Link href="/" className="md:col-span-3">
            <span className="block">{SITE.name}</span>
            <span className="block opacity-60">Engineer — Dhaka</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:col-span-5 md:col-start-5 md:flex md:gap-7">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className="group flex items-center gap-2"
              >
                <span
                  className={`size-1.5 rounded-full bg-current transition-transform duration-500 ${isActive(item.href) ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}
                />
                <span data-hover-scramble>{item.label}</span>
              </Link>
            ))}
            <Link href="/music" className="group flex items-center gap-1">
              <span data-hover-scramble>Sound</span>
              <Icon name="arrow-up-right" className="size-3" />
            </Link>
          </nav>

          <div className="hidden items-start justify-end gap-6 md:col-span-3 md:col-start-10 md:flex">
            <Clock className="opacity-60" />
            <button
              type="button"
              onClick={() => openTerminal()}
              className="flex items-center gap-2"
              aria-keyshortcuts="Control+K"
            >
              <Icon name="command" className="size-3.5" />
              Terminal
            </button>
          </div>

          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="justify-self-end md:hidden"
          >
            Menu
          </button>
        </div>
      </header>

      <div
        ref={menu}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-0 z-[110] hidden flex-col justify-between bg-ink px-5 pb-8 pt-5 text-bone md:hidden"
      >
        <div className="label flex items-start justify-between">
          <span>{SITE.name}</span>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col">
          {MENU.map((item, i) => (
            <div key={item.href} className="overflow-hidden border-b border-line">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                data-menu-item
                aria-current={isActive(item.href) ? 'page' : undefined}
                className="display flex items-baseline justify-between py-2 text-[17vw] aria-[current=page]:text-signal"
              >
                {item.label}
                <span className="label text-dim">0{i + 1}</span>
              </Link>
            </div>
          ))}
        </nav>

        <div className="label flex items-end justify-between text-dim">
          <div className="flex flex-col gap-1">
            <a href={`mailto:${SITE.email}`} className="text-bone">
              {SITE.email}
            </a>
            <Clock />
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openTerminal();
            }}
            className="text-bone"
          >
            Terminal
          </button>
        </div>
      </div>
    </>
  );
}
