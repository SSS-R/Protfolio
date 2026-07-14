'use client';

import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Three motion personalities:
 *  - 'hud'    → portfolio (retro terminal): snappy, small offset, sharp ease.
 *               Reads like HUD panels booting online.
 *  - 'smooth' → CreaTune (Swiss/glass): slower, larger offset, soft ease-out.
 *               Reads as calm and premium.
 *  - 'fade'   → opacity only, no transform at all. Use this when the reveal
 *               wraps a large subtree sitting directly inside an ancestor with
 *               overflow-x-hidden (a `transform` on the child makes it the
 *               containing block for fixed descendants and forces a new
 *               compositing layer, which can cause a transient scrollbar
 *               flicker in that specific combination).
 * All collapse to no motion when the viewer prefers reduced motion.
 */
type Preset = 'hud' | 'smooth' | 'fade';

const PRESET: Record<Preset, { y?: number; transition: Transition; stagger: number }> = {
  hud: { y: 8, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, stagger: 0.05 },
  smooth: { y: 16, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, stagger: 0.08 },
  fade: { transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }, stagger: 0.05 },
};

interface RevealProps {
  children: ReactNode;
  preset?: Preset;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'ul' | 'ol';
}

/** Reveal a block as it scrolls into view (once). Safe in flex/block/grid flow. */
export function Reveal({ children, preset = 'smooth', delay = 0, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const p = PRESET[preset];
  const Tag = motion[as];

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  // Only include `y` in the animated keyframes when the preset defines one —
  // if it's omitted, Framer Motion never touches `transform` at all.
  const initial = p.y !== undefined ? { opacity: 0, y: p.y } : { opacity: 0 };
  const animate = p.y !== undefined ? { opacity: 1, y: 0 } : { opacity: 1 };

  return (
    <Tag
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ ...p.transition, delay }}
    >
      {children}
    </Tag>
  );
}

/** Container that cascades its <RevealItem> children in as it enters view. */
export function RevealGroup({ children, preset = 'smooth', className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ show: { transition: { staggerChildren: PRESET[preset].stagger } } }}
    >
      {children}
    </Tag>
  );
}

/** A single staggered child inside a <RevealGroup>. */
export function RevealItem({ children, preset = 'smooth', className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const p = PRESET[preset];
  const Tag = motion[as];

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const hidden = p.y !== undefined ? { opacity: 0, y: p.y } : { opacity: 0 };
  const show = p.y !== undefined ? { opacity: 1, y: 0, transition: p.transition } : { opacity: 1, transition: p.transition };

  return (
    <Tag className={className} variants={{ hidden, show }}>
      {children}
    </Tag>
  );
}

/**
 * Crossfades route content on client-side navigation instead of an instant
 * pop. Opacity-only by construction (no `y`/transform ever) so it carries
 * zero risk of the transform/overflow-ancestor interaction that caused the
 * Architect scrollbar flicker — safe to use on every page, including that
 * one. Waits for the outgoing page to finish fading before the incoming one
 * starts (mode="wait"): sibling pages here differ a lot in height, so
 * overlapping them mid-crossfade would look broken, not smooth.
 * `initial={false}` skips animating the very first paint of the app.
 */
export function PageTransition({ children, preset = 'smooth' }: { children: ReactNode; preset?: 'hud' | 'smooth' }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const duration = preset === 'hud' ? 0.16 : 0.22;

  if (reduce) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
