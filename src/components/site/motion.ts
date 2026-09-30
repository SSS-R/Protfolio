'use client';

// The portfolio's single motion system: GSAP + ScrollTrigger, driven by data
// attributes so server components can declare motion without shipping JS.
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
// Everything is created inside one gsap.context per page and reverted on route
// change. Under prefers-reduced-motion nothing is created: final states only.

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
  window.dispatchEvent(new Event('sss:intro'));
}

// ── Reveal engine ──
export function initReveals(root: HTMLElement): () => void {
  const ready = () => document.documentElement.classList.add('motion-ready');

  if (prefersReducedMotion()) {
    ready();
    return () => {};
  }

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

    root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      const split = SplitText.create(el, { type: 'words', mask: 'words' });
      gsap.from(split.words, {
        yPercent: 115,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.055,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    root.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
      // fromTo, not from: the CSS pre-hide would otherwise be read as the end state.
      gsap.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'expo.out',
        delay: parseFloat(el.dataset.fade || '0') || 0,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });

    // Images uncover from the bottom while their content settles from a slight zoom.
    root.querySelectorAll<HTMLElement>('[data-clip]').forEach((el) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
      if (el.firstElementChild) tl.fromTo(el.firstElementChild, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
    });

    root.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
      const split = SplitText.create(el, { type: 'words' });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
        },
      );
    });

    root.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
      const text = el.textContent ?? '';
      el.setAttribute('aria-label', text);
      gsap.to(el, {
        duration: 1.3,
        scrambleText: { text, chars: CIPHER, revealDelay: 0.25, speed: 0.5 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
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
      const loop = gsap.to(tracks, { xPercent: -100, duration: 38, ease: 'none', repeat: -1 });
      let settle: gsap.core.Timeline | undefined;
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
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

  ready();
  ScrollTrigger.refresh();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    listeners.forEach((off) => off());
    mm.revert();
    ctx.revert();
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
