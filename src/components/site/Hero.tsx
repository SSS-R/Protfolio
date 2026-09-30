'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { SITE } from '@/lib/site';
import { gsap, SplitText, onIntro, prefersReducedMotion, scrollToTarget } from './motion';
import Icon from './Icon';

const SignalField = dynamic(() => import('./SignalField'), { ssr: false });

export default function Hero({ nowBuilding, studying }: { nowBuilding?: string; studying?: string }) {
  const root = useRef<HTMLElement>(null);

  // Intro: the name rises letter by letter as the preloader lifts, then the lead
  // and supporting details. Everything is readable/usable before it finishes.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let tl: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      const name = SplitText.create(el.querySelector('h1')!, { type: 'chars', mask: 'chars', aria: 'none' });
      const lead = SplitText.create(el.querySelector('[data-hero-lead]')!, { type: 'words', mask: 'words' });
      tl = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .from(name.chars, { yPercent: 108, duration: 1.5, stagger: 0.028 })
        .from(lead.words, { yPercent: 115, duration: 1.2, stagger: 0.035 }, 0.25)
        .fromTo('[data-hero-fade]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.6)
        .fromTo(
          document.querySelectorAll('.site-header .label > *'),
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.06 },
          0.5,
        );
    }, el);
    const off = onIntro(() => tl?.play());
    return () => {
      off();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      data-formation="hero"
      className="relative z-[1] flex min-h-[100svh] flex-col justify-end px-5 pb-6 pt-28 md:px-10 md:pb-8"
      aria-labelledby="hero-name"
    >
      <SignalField />

      <div className="flex flex-1 flex-col justify-center pb-10 md:max-w-[52vw] md:pb-0">
        {nowBuilding ? (
          <p className="label mb-6 flex items-start gap-3 text-dim md:mb-8" data-hero-fade data-intro>
            <span className="relative mt-[3px] flex size-2 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60 motion-reduce:animate-none" />
              <span className="size-2 rounded-full bg-signal" />
            </span>
            <span>
              Currently building — <span className="text-bone">{nowBuilding}</span>
            </span>
          </p>
        ) : null}

        <p
          data-hero-lead
          data-intro
          className="balance text-[9.2vw] font-medium leading-[1.02] tracking-[-0.04em] md:text-[3.7vw]"
        >
          Building full-stack systems and AI agent tooling. Researching{' '}
          <em className="italic-serif text-signal">quantum cryptography.</em>
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-6 md:mt-10" data-hero-fade data-intro>
          <a
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#work');
            }}
            data-magnetic
            className="label inline-flex items-center gap-2 rounded-full bg-bone px-6 py-4 text-ink transition-colors duration-300 hover:bg-signal"
          >
            See selected work <Icon name="arrow-down" className="size-4" />
          </a>
          <a href="/about" className="label u-link">
            About me
          </a>
        </div>
      </div>

      <div className="label mb-4 grid grid-cols-2 gap-4 text-dim md:mb-6 md:grid-cols-12" data-hero-fade data-intro>
        <p className="md:col-span-4">{studying}</p>
        <p className="hidden md:col-span-3 md:col-start-6 md:block">{SITE.location}</p>
        <p className="text-right md:col-span-3 md:col-start-10">{SITE.coords}</p>
      </div>

      {/* Words are separate boxes (block on mobile, spaced inline on desktop) so
          the per-letter split never eats the spaces; the name comes from aria-label. */}
      <h1
        id="hero-name"
        data-intro
        aria-label={SITE.name}
        className="display -mb-[0.06em] text-[21vw] leading-[0.8] md:flex md:justify-between md:text-[10.6vw]"
      >
        <span className="block">Sultan</span>
        <span className="block">Sajed</span>
        <span className="block">Shahriar</span>
      </h1>
    </section>
  );
}
