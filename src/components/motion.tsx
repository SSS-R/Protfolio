'use client';

import { motion, useReducedMotion, type Transition } from 'framer-motion';
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
  as?: 'div' | 'section' | 'li';
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
export function RevealGroup({ children, preset = 'smooth', className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ show: { transition: { staggerChildren: PRESET[preset].stagger } } }}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child inside a <RevealGroup>. */
export function RevealItem({ children, preset = 'smooth', className }: RevealProps) {
  const reduce = useReducedMotion();
  const p = PRESET[preset];
  if (reduce) return <div className={className}>{children}</div>;

  const hidden = p.y !== undefined ? { opacity: 0, y: p.y } : { opacity: 0 };
  const show = p.y !== undefined ? { opacity: 1, y: 0, transition: p.transition } : { opacity: 1, transition: p.transition };

  return (
    <motion.div className={className} variants={{ hidden, show }}>
      {children}
    </motion.div>
  );
}
