import Link from 'next/link';
import { readData } from '@/lib/store';
import type { PortfolioData, RoadmapNode } from '@/types/portfolio';
import type { CreaTuneTrack } from '@/components/creatune-types';
import { SITE, skillName } from '@/lib/site';
import Hero from '@/components/site/Hero';
import ProjectCard from '@/components/site/ProjectCard';
import Icon from '@/components/site/Icon';

export const dynamic = 'force-dynamic';

type Music = { studio?: string; tagline?: string; tracks?: CreaTuneTrack[] };

const STATUS: Record<string, string> = { completed: 'Done', active: 'Now', locked: 'Next' };

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="label" data-scramble>
      ({n}) — {children}
    </p>
  );
}

export default async function Home() {
  const [data, music] = await Promise.all([
    readData<PortfolioData | null>('portfolio', null),
    readData<Music | null>('creatune', null),
  ]);

  const profile = data?.profile;
  const edu = data?.education?.[0];
  const exp = data?.experience?.[0];
  const projects = data?.projects ?? [];
  const featured = [
    ...projects.filter((p) => p.category === 'SHIPPED'),
    ...projects.filter((p) => p.category === 'ACTIVE'),
  ];
  const interests = data?.about?.interests ?? [];
  const toolkit = (data?.skills ?? []).map((s) => skillName(s.name));
  const tracks = music?.tracks ?? [];

  const thesis = edu?.bullets.find((b) => /^thesis/i.test(b))?.replace(/^thesis:\s*/i, '');
  const facts = [
    { k: 'Based in', v: SITE.location },
    edu && { k: 'Studying', v: `${edu.degree}, ${edu.institution}` },
    thesis && { k: 'Thesis', v: thesis },
    exp && { k: 'Most recently', v: `${exp.role}, ${exp.company}` },
  ].filter(Boolean) as { k: string; v: string }[];

  // Journey grouped by year, so each year is set once.
  const years = (data?.roadmap ?? []).reduce<{ year: string; nodes: RoadmapNode[] }[]>((acc, node) => {
    const last = acc[acc.length - 1];
    if (last?.year === node.year) last.nodes.push(node);
    else acc.push({ year: node.year, nodes: [node] });
    return acc;
  }, []);

  return (
    <>
      <Hero nowBuilding={data?.nowBuilding} studying={edu ? `${edu.degree} — ${edu.institution}` : undefined} />

      {/* 01 — Statement */}
      <section data-formation="statement" className="relative z-[1] px-5 py-32 md:px-10 md:py-48" aria-label="About">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="text-dim md:col-span-2">
            <SectionLabel n="01">About</SectionLabel>
          </div>
          <div className="md:col-span-10">
            <p data-scrub-words className="text-[7.4vw] font-medium leading-[1.08] tracking-[-0.035em] md:text-[3.4vw]">
              {profile?.intro}
            </p>
            <dl className="mt-16 grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4" data-fade>
              {facts.map((f) => (
                <div key={f.k}>
                  <dt className="label text-dim">{f.k}</dt>
                  <dd className="mt-2 text-[15px] leading-snug">{f.v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/about" className="label u-link mt-12 inline-flex items-center gap-2" data-fade>
              More about me <Icon name="arrow-up-right" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 02 — Selected work (paper, pinned horizontal scroll on desktop) */}
      <section id="work" data-hscroll className="paper overflow-hidden rounded-t-[28px] md:rounded-t-[44px]" aria-labelledby="work-title">
        <div className="flex flex-col pb-16 pt-24 md:pt-28 lg:h-screen lg:pb-10">
          <div className="flex flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-10">
            <div>
              <div className="text-dim-ink">
                <SectionLabel n="02">Selected work</SectionLabel>
              </div>
              <h2 id="work-title" data-split className="mt-4 text-[13vw] font-medium leading-[0.9] tracking-[-0.05em] md:text-[6vw]">
                Things I&apos;ve <em className="italic-serif">built</em>
              </h2>
            </div>
            <div className="label flex items-center gap-8 text-dim-ink">
              <span>
                {String(featured.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} projects
              </span>
              <Link href="/work" className="u-link flex items-center gap-1 text-ink">
                Full index <Icon name="arrow-up-right" className="size-3.5" />
              </Link>
            </div>
          </div>

          <div data-hscroll-track className="mt-10 flex flex-col gap-6 px-5 md:px-10 lg:mt-auto lg:w-max lg:flex-row">
            {featured.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
            <Link
              href="/work"
              data-cursor="Index"
              className="group flex shrink-0 flex-col justify-between border border-line-ink bg-ink p-6 text-bone md:p-8 lg:h-[64vh] lg:w-[26vw]"
            >
              <span className="label text-dim">Also in the index</span>
              <span className="text-[9vw] font-medium leading-[0.95] tracking-[-0.04em] lg:text-[2.6vw]">
                {projects
                  .filter((p) => !featured.includes(p))
                  .map((p) => p.title)
                  .join(', ')}
              </span>
              <span className="label flex items-center gap-2">
                See every project
                <Icon name="arrow-up-right" className="size-4 transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </div>

          <div className="mx-10 mt-8 hidden h-px bg-line-ink lg:block" aria-hidden="true">
            <div data-hscroll-progress className="h-full origin-left scale-x-0 bg-ink" />
          </div>
        </div>
      </section>

      {/* 03 — Focus */}
      <section data-formation="focus" className="relative z-[1] py-32 md:py-44" aria-labelledby="focus-title">
        <div className="px-5 md:px-10">
          <div className="text-dim">
            <SectionLabel n="03">Focus</SectionLabel>
          </div>
          <h2 id="focus-title" data-split className="mt-4 max-w-[12ch] text-[13vw] font-medium leading-[0.9] tracking-[-0.05em] md:text-[6vw]">
            Where my <em className="italic-serif text-signal">attention</em> goes
          </h2>
          <ol className="mt-16 border-b border-line md:mt-24">
            {interests.map((item, i) => (
              <li key={item} className="group grid grid-cols-12 items-baseline gap-4 border-t border-line py-6 md:py-8" data-fade>
                <span className="label col-span-2 text-dim md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                <span className="col-span-10 text-[7vw] font-medium leading-[1] tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 md:col-span-9 md:text-[3.6vw]">
                  {item}
                </span>
                <span className="col-span-2 hidden justify-self-end md:block" aria-hidden="true">
                  <span className="block size-2 scale-0 rounded-full bg-signal transition-transform duration-500 group-hover:scale-100" />
                </span>
              </li>
            ))}
          </ol>
        </div>

        {toolkit.length ? (
          <div className="mt-24 md:mt-32">
            <p className="label px-5 text-dim md:px-10">Toolkit</p>
            <div data-marquee className="mt-6 flex overflow-hidden" aria-label={`Toolkit: ${toolkit.join(', ')}`}>
              {[0, 1].map((copy) => (
                <div key={copy} className="marquee-track flex shrink-0 items-center" aria-hidden="true">
                  {toolkit.map((t, i) => (
                    <span key={t} className="display flex items-center whitespace-nowrap text-[18vw] md:text-[9vw]">
                      <span className={i % 2 ? 'text-transparent [-webkit-text-stroke:1px_rgb(236_231_223/0.55)]' : ''}>{t}</span>
                      <span className="mx-[0.25em] text-signal">/</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* 04 — Journey (paper) */}
      <section id="journey" className="paper rounded-t-[28px] px-5 py-28 md:rounded-t-[44px] md:px-10 md:py-40" aria-labelledby="journey-title">
        <div className="text-dim-ink">
          <SectionLabel n="04">Journey</SectionLabel>
        </div>
        <h2 id="journey-title" data-split className="mt-4 max-w-[13ch] text-[13vw] font-medium leading-[0.9] tracking-[-0.05em] md:text-[6vw]">
          The road <em className="italic-serif">so far</em>
        </h2>

        <div className="relative mt-16 md:mt-24">
          <div className="absolute bottom-0 left-0 top-0 w-px bg-line-ink md:left-[25%]" aria-hidden="true">
            <div data-line className="h-full w-full bg-ink" />
          </div>
          {years.map(({ year, nodes }) => (
            <div key={year} className="relative grid gap-6 pb-16 pl-6 md:grid-cols-4 md:gap-0 md:pb-24 md:pl-0">
              <p
                className={`display text-[20vw] leading-[0.8] md:sticky md:top-28 md:self-start md:pr-8 md:text-right md:text-[7vw] ${
                  nodes.every((n) => n.status === 'locked') ? 'text-transparent [-webkit-text-stroke:1px_rgb(11_11_12/0.45)]' : ''
                }`}
              >
                {year}
              </p>
              <ul className="space-y-10 md:col-span-3 md:pl-12">
                {nodes.map((n) => (
                  <li key={n.id} className="relative grid gap-3 md:grid-cols-[1fr_auto] md:gap-10" data-fade>
                    <span
                      className={`absolute -left-[29px] top-2 size-2.5 rounded-full md:-left-[53px] ${
                        n.status === 'active' ? 'bg-signal-deep ring-4 ring-signal/25' : n.status === 'locked' ? 'border border-ink/40 bg-bone' : 'bg-ink'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="label text-dim-ink">{n.type}</p>
                      <h3 className="mt-2 text-[6.5vw] font-medium leading-[1.05] tracking-[-0.03em] md:text-[2.2vw]">{n.title}</h3>
                      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-dim-ink">{n.description}</p>
                    </div>
                    <span
                      className={`label self-start justify-self-start rounded-full px-3 py-1.5 md:justify-self-end ${
                        n.status === 'active' ? 'bg-ink text-bone' : 'border border-ink/25'
                      }`}
                    >
                      {STATUS[n.status] ?? n.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 05 — Sound */}
      <section
        data-formation="sound"
        className="relative z-[1] flex min-h-[100svh] flex-col justify-between px-5 py-32 md:px-10 md:py-40"
        aria-labelledby="sound-title"
      >
        <div className="grid gap-10 md:grid-cols-12">
          <div className="text-dim md:col-span-2">
            <SectionLabel n="05">Off the clock</SectionLabel>
          </div>
          <div className="md:col-span-10">
            <h2 id="sound-title" data-split className="max-w-[14ch] text-[13vw] font-medium leading-[0.9] tracking-[-0.05em] md:text-[6vw]">
              Sometimes the signal is <em className="italic-serif text-signal">sound</em>
            </h2>
            <p className="mt-8 max-w-[44ch] text-[17px] leading-relaxed text-dim md:text-[19px]" data-fade>
              My music lives at {music?.studio ?? 'CreaTune'}. {music?.tagline}
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-12">
          <ol className="md:col-span-7 md:col-start-3">
            {tracks.slice(0, 4).map((t, i) => (
              <li key={t.id} data-fade>
                <Link
                  href="/music"
                  data-cursor="Listen"
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 border-t border-line py-5 transition-colors hover:text-signal"
                >
                  <span className="label text-dim">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[6vw] font-medium tracking-[-0.03em] md:text-[2.2vw]">{t.title}</span>
                  <span className="label text-dim tabular-nums">{t.duration}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex items-end md:col-span-3" data-fade>
            <Link
              href="/music"
              data-magnetic
              className="label inline-flex items-center gap-2 rounded-full border border-bone px-6 py-4 transition-colors duration-300 hover:bg-bone hover:text-ink"
            >
              Enter {music?.studio ?? 'CreaTune'} <Icon name="arrow-up-right" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
