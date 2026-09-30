'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/types/portfolio';
import { CATEGORY_LABEL, linkLabel } from '@/lib/site';
import { gsap } from './motion';
import ProjectCover from './ProjectCover';
import Icon from './Icon';

const FILTERS = ['ALL', 'SHIPPED', 'ACTIVE', 'TBD'] as const;
type Filter = (typeof FILTERS)[number];

export default function WorkIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<Project | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  const shown = filter === 'ALL' ? projects : projects.filter((p) => p.category === filter);
  const count = (f: Filter) => (f === 'ALL' ? projects.length : projects.filter((p) => p.category === f).length);

  // Re-deal the rows whenever the filter changes.
  useEffect(() => {
    if (!list.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      list.current.children,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true },
    );
  }, [filter]);

  // Floating live preview that trails the pointer across the list (fine pointers only).
  useEffect(() => {
    const el = preview.current;
    if (!el || !matchMedia('(pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const move = (e: PointerEvent) => {
      x(e.clientX + 28);
      y(e.clientY - 120);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useEffect(() => {
    gsap.to(preview.current, { scale: hover ? 1 : 0.6, opacity: hover ? 1 : 0, duration: 0.5, ease: 'expo.out' });
  }, [hover]);

  return (
    <div onPointerLeave={() => setHover(null)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setOpen(null);
            }}
            className="label rounded-full border border-ink/25 px-4 py-2.5 transition-colors duration-300 hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bone"
          >
            {f === 'ALL' ? 'All' : CATEGORY_LABEL[f]} <span className="opacity-50">({String(count(f)).padStart(2, '0')})</span>
          </button>
        ))}
      </div>

      <ol ref={list} className="mt-12 border-b border-line-ink">
        {shown.map((p) => {
          const expanded = open === p.id;
          const label = linkLabel(p.link);
          const n = projects.indexOf(p) + 1;
          return (
            <li key={p.id} className="border-t border-line-ink">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`project-${p.id}`}
                onClick={() => {
                  setOpen(expanded ? null : p.id);
                  setHover(null);
                }}
                onPointerEnter={() => setHover(expanded ? null : p)}
                className="group grid w-full grid-cols-12 items-baseline gap-4 py-6 text-left md:py-8"
              >
                <span className="label col-span-2 text-dim-ink md:col-span-1">{String(n).padStart(2, '0')}</span>
                <span className="col-span-9 text-[8vw] font-medium leading-[0.95] tracking-[-0.04em] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 md:col-span-6 md:text-[3.6vw]">
                  {p.title}
                </span>
                <span className="label col-span-6 col-start-3 text-dim-ink md:col-span-2 md:col-start-auto">
                  {CATEGORY_LABEL[p.category] ?? p.category}
                </span>
                <span className="label col-span-3 hidden text-dim-ink md:col-span-2 md:block">{p.tech.join(' · ')}</span>
                <span className="col-span-1 justify-self-end" aria-hidden="true">
                  <span className={`block text-2xl leading-none transition-transform duration-500 ${expanded ? 'rotate-45' : ''}`}>+</span>
                </span>
              </button>

              <div
                id={`project-${p.id}`}
                className={`grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)] ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  {expanded ? (
                    <div className="grid gap-8 pb-10 md:grid-cols-12 md:gap-4">
                      <div className="relative aspect-[16/10] overflow-hidden bg-ink-2 md:col-span-6 md:col-start-2">
                        <ProjectCover id={p.id} image={p.image} title={p.title} sizes="(min-width: 768px) 50vw, 100vw" />
                      </div>
                      <div className="flex flex-col gap-6 md:col-span-4 md:col-start-8">
                        <span className="label self-start rounded-full border border-ink/25 px-3 py-1.5">{p.subtitle || p.status}</span>
                        <p className="text-[17px] leading-relaxed">{p.desc}</p>
                        <ul className="label flex flex-wrap gap-x-4 gap-y-1 text-dim-ink" aria-label="Built with">
                          {p.tech.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                        {label ? (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-magnetic
                            className="label mt-auto inline-flex items-center gap-2 self-start rounded-full bg-ink px-5 py-3 text-bone transition-colors duration-300 hover:bg-signal-deep"
                          >
                            {label} <Icon name="arrow-up-right" className="size-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden aspect-[4/3] w-[22vw] overflow-hidden bg-ink-2 opacity-0 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)] lg:block"
      >
        {hover ? <ProjectCover key={hover.id} id={hover.id} image={hover.image} title={hover.title} sizes="22vw" /> : null}
      </div>
    </div>
  );
}
