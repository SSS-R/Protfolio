'use client';

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, CIPHER } from './motion';

// Route transition: "signal from noise" as a page change. An ink panel rises
// with a leading edge that frays into glyph tiles; the destination name decrypts
// in the centre; then the ink lifts off upward the way the preloader panel exits.
// Portfolio pages use the cipher glyphs; CreaTune uses level-meter blocks in its
// lavender.
//
// It covers portfolio ↔ portfolio and portfolio ↔ CreaTune navigations. CreaTune's
// internal links stay instant so the persistent player bar is never covered.
// Plain <a>/<Link> clicks are intercepted at the window (capture phase, before
// Next's Link handler sees them), so no special link component is needed.

type Tone = 'music' | 'portfolio';

const NavContext = createContext<{ navigate: (href: string) => void }>({ navigate: () => {} });

export const useTransitionNav = () => useContext(NavContext);

/** Back-compat for CreaTunePlayer. */
export function useCurtain() {
  const { navigate } = useContext(NavContext);
  return { navigateWithCurtain: navigate };
}

const LABELS: Record<string, string> = {
  '/': 'Index',
  '/work': 'Work',
  '/about': 'About',
  '/contact': 'Contact',
};

const isMusic = (path: string) => path.startsWith('/music');

const TONES: Record<Tone, { glyphs: string; base: string; accent: string; kicker: string }> = {
  portfolio: { glyphs: CIPHER, base: '236,231,223', accent: '255,90,31', kicker: '(Routing)' },
  music: { glyphs: '▁▂▃▄▅▆▇█', base: '169,163,206', accent: '201,169,192', kicker: '(Now entering)' },
};

type Grid = { cols: number; rows: number; size: number; w: number; h: number; dpr: number; seed: Float32Array; font: string };

function makeGrid(canvas: HTMLCanvasElement): Grid {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  const size = w < 768 ? 14 : 18;
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const seed = new Float32Array(cols * rows).map(() => Math.random());
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-jetbrains-mono') || 'monospace';
  return { cols, rows, size, w, h, dpr, seed, font: `${Math.round(size * 0.66)}px ${family}` };
}

/**
 * One smooth ink panel whose leading edge frays into glyph tiles: tiles thin
 * out away from the edge, and just inside it glyphs fade into solid ink.
 * p: 0 → 1 moves the edge from below the screen to above it. Covering, the ink
 * sits below the edge (rises); lifting, above it (the bottom clears first).
 */
function paint(g: CanvasRenderingContext2D, grid: Grid, tone: Tone, p: number, lifting: boolean, frame: number) {
  const { cols, rows, size, w, h, dpr, seed } = grid;
  const { glyphs, base, accent } = TONES[tone];
  const fringe = size * 6;
  const edge = h + fringe - p * (h + fringe * 2);

  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#0b0b0c';
  if (lifting) g.fillRect(0, 0, w, Math.max(0, edge));
  else g.fillRect(0, Math.max(0, edge), w, h);

  g.font = grid.font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const r0 = Math.max(0, Math.floor((edge - fringe) / size));
  const r1 = Math.min(rows - 1, Math.ceil((edge + fringe) / size));
  for (let r = r0; r <= r1; r++) {
    const cy = r * size + size / 2;
    const d = lifting ? cy - edge : edge - cy; // > 0: open side of the edge
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = c * size;
      let alpha: number;
      if (d > 0) {
        const fall = d / fringe;
        if (fall > 1 || seed[i] < fall) continue; // tiles thin out away from the edge
        g.fillStyle = '#0b0b0c';
        g.fillRect(x, r * size, size + 0.5, size + 0.5);
        alpha = (1 - fall) * 0.8;
      } else {
        alpha = (1 + d / (fringe * 0.6)) * 0.45; // glyphs resolving into the ink
      }
      if (alpha < 0.06 || (seed[i] * 13) % 1 < 0.45) continue;
      g.fillStyle = `rgba(${seed[i] < 0.06 ? accent : base},${alpha})`;
      g.fillText(glyphs[Math.floor(seed[i] * 97 + frame * 0.35) % glyphs.length], x + size / 2, cy);
    }
  }
}

export default function Transitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pending = useRef<string | null>(null);
  const run = useRef<{ tone: Tone; grid: Grid; frame: number } | null>(null);

  const lift = useCallback(() => {
    const el = curtain.current;
    const g = canvas.current?.getContext('2d');
    const r = run.current;
    pending.current = null;
    if (!el || !g || !r) return;
    const state = { p: 0 };
    gsap
      .timeline({
        delay: 0.25,
        onComplete: () => {
          el.classList.remove('wipe-shut');
          g.clearRect(0, 0, r.grid.w, r.grid.h);
        },
      })
      .to(el.querySelector('.wipe-label'), { opacity: 0, y: -12, duration: 0.3, ease: 'power2.in' })
      .to(state, { p: 1, duration: 0.9, ease: 'power3.inOut', onUpdate: () => paint(g, r.grid, r.tone, state.p, true, r.frame++) }, '-=0.1');
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const path = href.split(/[?#]/)[0] || '/';
      const el = curtain.current;
      const c = canvas.current;
      const g = c?.getContext('2d');
      if (pending.current) return;
      if (path === pathname || !el || !c || !g || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href);
        return;
      }

      const tone: Tone = isMusic(path) ? 'music' : 'portfolio';
      const text = tone === 'music' ? 'CreaTune' : (LABELS[path] ?? '');
      const r = { tone, grid: makeGrid(c), frame: 0 };
      run.current = r;
      pending.current = path;
      router.prefetch(href);

      const label = el.querySelector<HTMLElement>('.wipe-label')!;
      const word = el.querySelector<HTMLElement>('.wipe-word')!;
      el.dataset.tone = tone;
      el.querySelector('.wipe-kicker')!.textContent = TONES[tone].kicker;
      el.querySelector('.wipe-sub')!.textContent =
        tone === 'music' ? 'Tuning in — independent sound studio' : `Resolving signal — ${path === '/' ? '/index' : path}`;
      word.textContent = '';
      el.classList.add('wipe-shut');

      const state = { p: 0 };
      const tl = gsap
        .timeline()
        .to(state, { p: 1, duration: 0.85, ease: 'power3.inOut', onUpdate: () => paint(g, r.grid, tone, state.p, false, r.frame++) })
        .fromTo(label, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, '-=0.3')
        .to(word, { duration: 0.8, scrambleText: { text, chars: TONES[tone].glyphs, revealDelay: 0.2, speed: 0.6 } }, '<')
        .add(() => router.push(href), 0.85);
      if (tone === 'music') {
        tl.fromTo(
          word,
          { letterSpacing: '0.6em', paddingLeft: '0.6em' },
          { letterSpacing: '0.12em', paddingLeft: '0.12em', duration: 1, ease: 'expo.out' },
          '<',
        );
      }

      // Never leave the screen covered if the navigation fails or is cancelled.
      window.setTimeout(() => pending.current === path && lift(), 8000);
    },
    [pathname, router, lift],
  );

  // Destination rendered → lift.
  useEffect(() => {
    if (pending.current && pathname === pending.current) lift();
  }, [pathname, lift]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      const from = location.pathname;
      const to = url.pathname;
      if (to === from) return; // same-page hash links: leave to Lenis / the browser
      if (to.startsWith('/admin') || (isMusic(from) && isMusic(to))) return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [navigate]);

  return (
    <NavContext.Provider value={{ navigate }}>
      {children}
      <div ref={curtain} className="wipe" aria-hidden="true">
        <canvas ref={canvas} />
        <div className="wipe-label">
          <span className="wipe-kicker label" />
          <span className="wipe-word" />
          <span className="wipe-sub label" />
        </div>
      </div>
    </NavContext.Provider>
  );
}
