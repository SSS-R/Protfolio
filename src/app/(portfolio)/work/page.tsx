import type { Metadata } from 'next';
import { readData } from '@/lib/store';
import type { PortfolioData } from '@/types/portfolio';
import WorkIndex from '@/components/site/WorkIndex';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Every project by Sultan Sajed Shahriar — shipped tools, systems in progress, and academic research.',
};

export default async function WorkPage() {
  const data = await readData<PortfolioData | null>('portfolio', null);
  const projects = data?.projects ?? [];

  return (
    <>
      <section className="relative z-[1] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-48" aria-labelledby="work-title">
        <p className="label text-dim" data-scramble>
          (Index) — All work
        </p>
        <div className="mt-6 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h1 id="work-title" data-split className="display text-[34vw] leading-[0.78] md:text-[19vw]">
            Work<sup className="label ml-2 align-top text-dim md:text-[1vw]">({String(projects.length).padStart(2, '0')})</sup>
          </h1>
          <p className="max-w-[34ch] text-[17px] leading-relaxed text-dim md:mb-6 md:text-[19px]" data-fade>
            Shipped tools, systems in progress and academic research — each with a live diagram of how it works.
          </p>
        </div>
      </section>

      <section className="paper min-h-screen rounded-t-[28px] px-5 py-16 md:rounded-t-[44px] md:px-10 md:py-24" aria-label="Projects">
        <WorkIndex projects={projects} />
      </section>
    </>
  );
}
