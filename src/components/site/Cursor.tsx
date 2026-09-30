'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from './motion';

// A label bubble that follows fine pointers over anything with data-cursor="…"
// ("View", "Copy"…), telling the visitor what a click will do. The native
// cursor stays; this is additive and absent on touch / reduced motion.
// Also drives [data-magnetic] elements, which lean toward the pointer.
export default function Cursor() {
  const bubble = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const el = bubble.current;
    if (!el || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    let active: Element | null = null;
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);

      const target = e.target as Element;
      const labelled = target.closest?.('[data-cursor]') ?? null;
      if (labelled !== active) {
        active = labelled;
        if (labelled) setLabel(labelled.getAttribute('data-cursor') ?? '');
        gsap.to(el, { scale: labelled ? 1 : 0, duration: 0.45, ease: 'expo.out', overwrite: 'auto' });
      }

      const m = target.closest?.<HTMLElement>('[data-magnetic]') ?? null;
      if (magnet && m !== magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        gsap.to(m, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.3,
          y: (e.clientY - (r.top + r.height / 2)) * 0.3,
          duration: 0.5,
          ease: 'power3',
        });
      }
    };
    const hide = () => {
      active = null;
      gsap.to(el, { scale: 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, []);

  return (
    <div ref={bubble} className="cursor-bubble label" aria-hidden="true">
      {label}
    </div>
  );
}
