'use client';

import { useEffect, useRef } from 'react';
import { SITE } from '@/lib/site';
import { CIPHER, fireIntro, getLenis, gsap } from './motion';

const YEAR = new Date().getFullYear();

// First page of a session: the name decrypts while a counter runs to 100, then
// the panel lifts and fires the intro. CSS keeps it hidden for no-JS, reduced
// motion and repeat pages (see .preloader rules in globals.css).
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || getComputedStyle(el).display === 'none') {
      fireIntro();
      return;
    }

    const name = el.querySelector<HTMLElement>('[data-name]');
    const count = el.querySelector<HTMLElement>('[data-count]');
    const progress = { v: 0 };
    getLenis()?.stop();

    const tl = gsap
      .timeline({
        onComplete: () => {
          el.style.display = 'none';
          getLenis()?.start();
        },
      })
      .to(name, {
        duration: 1.5,
        scrambleText: { text: SITE.name.toUpperCase(), chars: CIPHER, revealDelay: 0.35, speed: 0.45 },
      })
      .to(
        progress,
        {
          v: 100,
          duration: 1.7,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (count) count.textContent = String(Math.round(progress.v)).padStart(3, '0');
          },
        },
        0,
      )
      .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=0.2')
      .add(() => {
        try {
          sessionStorage.setItem('sss-intro', '1');
        } catch {}
        fireIntro();
      }, '-=0.6');

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="preloader fixed inset-0 z-[150] flex-col justify-between bg-ink px-5 pb-6 pt-5 text-bone md:px-10 md:pb-8 md:pt-6"
    >
      <div className="label flex justify-between text-dim">
        <span>Portfolio — ©{YEAR}</span>
        <span>{SITE.coords}</span>
      </div>
      <p data-name className="display text-[15vw] leading-[0.86] md:text-[9.4vw]">
        #%1T@N $4J3D $H4HR!4R
      </p>
      <div className="flex items-end justify-between">
        <span className="label text-dim">Resolving signal</span>
        <span data-count className="display text-[22vw] tabular-nums leading-[0.8] md:text-[11vw]">
          000
        </span>
      </div>
    </div>
  );
}
