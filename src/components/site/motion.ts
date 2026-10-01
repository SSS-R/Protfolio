'use client';

// The portfolio's single motion system, driven by data attributes so server
// components can declare motion without shipping JS.
//
// One-shot reveals (split, fade, clip, scramble) are an IntersectionObserver
// toggling .is-in; CSS transitions do the animating (globals.css). That keeps
// page load free of per-element style reads and runs on the compositor.
// GSAP + ScrollTrigger handle only what is scroll-linked: pins, scrubs, marquee.
//
//   data-split            heading → words rise out of a mask on enter
//   data-fade="0.1"       block fades up on enter (value = delay, s)
//   data-scrub-words      paragraph → words brighten as it scrolls through
//   data-scramble         label decrypts from cipher glyphs on enter
//   data-hover-scramble   link re-decrypts on hover
//   data-line             element scales in along Y with scroll (timelines)
//   data-clip             image frame uncovers upward on enter
//   data-marquee          contains two .marquee-track copies; velocity-aware loop
//   data-hscroll          section pinned while [data-hscroll-track] slides left
//
// Everything is created per page and reverted on route change. Under
// prefers-reduced-motion nothing is created: final states only.

import { useEffect, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

export { gsap, ScrollTrigger, SplitText };

export const CIPHER = '01<>/#*+=%$&ABCDEFXYZ';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Lenis handle (created by SiteShell, read by anything that scrolls) ──
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

export function scrollToTarget(target: string | number | HTMLElement) {
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView();
  }
}

// ── Intro signal: fired once per page load when the preloader lifts ──
declare global {
  interface Window {
    __sssIntro?: boolean;
  }
}

export function onIntro(cb: () => void): () => void {
  if (window.__sssIntro) {
    cb();
    return () => {};
  }
  window.addEventListener('sss:intro', cb, { once: true });
  return () => window.removeEventListener('sss:intro', cb);
}

export function fireIntro() {
  if (window.__sssIntro) return;
  window.__sssIntro = true;
  document.documentElement.classList.add('intro-in');
  window.dispatchEvent(new Event('sss:intro'));
}

// ── Reveal engine ──
export function initReveals(root: HTMLElement): () => void {
  const html = document.documentElement;
  if (prefersReducedMotion()) {
    html.classList.add('motion-ready');
    return () => {};
  }

  // 1. DOM writes first (splits, stagger indexes), so the layout reads that
  //    follow happen once instead of interleaving with them.
  const splits: SplitText[] = [];
  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'sw', aria: 'none' });
    split.words.forEach((w, i) => (w as HTMLElement).style.setProperty('--i', String(i)));
    splits.push(split);
  });
  const scrubs = [...root.querySelectorAll<HTMLElement>('[data-scrub-words]')].map((el) => {
    const split = SplitText.create(el, { type: 'words', aria: 'none' });
    splits.push(split);
    return { el, words: split.words };
  });
  root.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
    const delay = parseFloat(el.dataset.fade || '0');
    if (delay) el.style.setProperty('--d', `${delay}s`);
  });
  html.classList.add('motion-ready');

  // 2. One-shot reveals: the observer only flips a class.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        el.classList.add('is-in');
        if (el.hasAttribute('data-scramble')) {
          const text = el.textContent ?? '';
          gsap.to(el, { duration: 1.3, scrambleText: { text, chars: CIPHER, revealDelay: 0.25, speed: 0.5 } });
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  root.querySelectorAll('[data-split], [data-fade], [data-clip], [data-scramble]').forEach((el) => io.observe(el));

  // 3. Scroll-linked motion.
  const listeners: Array<() => void> = [];
  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    // Pins first, so triggers below them measure the added pin spacing.
    root.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      const bar = section.querySelector<HTMLElement>('[data-hscroll-progress]');
      if (!track) return;
      mm.add('(min-width: 1024px)', () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      });
    });

    scrubs.forEach(({ el, words }) => {
      gsap.fromTo(
        words,
        { opacity: 0.42 }, // dim but still ≥ 3:1 for this large text
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
        },
      );
    });

    root.querySelectorAll<HTMLElement>('[data-line]').forEach((el) => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top',
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top 65%', end: 'bottom 65%', scrub: true },
        },
      );
    });

    root.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
      const tracks = el.querySelectorAll<HTMLElement>('.marquee-track');
      const loop = gsap.to(tracks, { xPercent: -100, duration: 38, ease: 'none', repeat: -1, paused: true });
      let settle: gsap.core.Timeline | undefined;
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        // Only runs while on screen.
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        // Scrolling fast pushes the loop faster, then it eases back to cruise.
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
          settle?.kill();
          settle = gsap
            .timeline()
            .to(loop, { timeScale: boost, duration: 0.2 })
            .to(loop, { timeScale: 1, duration: 1.2 });
        },
      });
    });
  }, root);

  // Hover decrypt on links (plain listeners, cleaned up below)
  root.querySelectorAll<HTMLElement>('[data-hover-scramble]').forEach((el) => {
    const text = el.textContent ?? '';
    const onEnter = () =>
      gsap.to(el, { duration: 0.6, scrambleText: { text, chars: CIPHER, speed: 0.8 }, overwrite: true });
    el.addEventListener('mouseenter', onEnter);
    listeners.push(() => el.removeEventListener('mouseenter', onEnter));
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    io.disconnect();
    listeners.forEach((off) => off());
    mm.revert();
    ctx.revert();
    splits.forEach((split) => split.revert());
  };
}

/**
 * Smooth scroll + per-route reveals for a site shell (portfolio and CreaTune).
 * One Lenis instance ticks on GSAP's clock so ScrollTrigger and smooth scroll
 * never disagree. On every route: jump to the top (or the hash target), then
 * wire that page's data-attribute reveals. `waitForIntro` holds scrolling
 * until the preloader lifts.
 */
export function useSiteMotion(root: RefObject<HTMLElement | null>, { waitForIntro = false } = {}) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ lerp: 0.1, anchors: { offset: -40 } });
    const tick = (time: number) => l.raf(time * 1000);
    l.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    if (waitForIntro && !window.__sssIntro) {
      l.stop();
      onIntro(() => l.start());
    }
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
    };
  }, [waitForIntro]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const hash = window.location.hash;
    const target = hash ? document.querySelector(hash) : null;
    const top = target ? target.getBoundingClientRect().top + window.scrollY - 40 : 0;
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo(0, top);
    return initReveals(el);
  }, [pathname, root]);
}
