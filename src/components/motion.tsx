'use client';

import { motion, useReducedMotion, type Transition } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Two motion personalities:
 *  - 'hud'    → portfolio (retro terminal): snappy, small offset, sharp ease.
 *               Reads like HUD panels booting online.
 *  - 'smooth' → CreaTune (Swiss/glass): slower, larger offset, soft ease-out.
 *               Reads as calm and premium.
 * Both fade + rise, transform/opacity only, and collapse to no motion when the
 * viewer prefers reduced motion.
 */
type Preset = 'hud' | 'smooth';

const PRESET: Record<Preset, { y: number; transition: Transition; stagger: number }> = {
  hud: { y: 8, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, stagger: 0.05 },
  smooth: { y: 16, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, stagger: 0.08 },
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

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: p.y }}
      whileInView={{ opacity: 1, y: 0 }}
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

  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: p.y }, show: { opacity: 1, y: 0, transition: p.transition } }}
    >
      {children}
    </motion.div>
  );
}
