import type { Metadata } from 'next';
import Image from 'next/image';
import { readData } from '@/lib/store';
import type { PortfolioData } from '@/types/portfolio';
import { SITE, isRealImage, prettyRange, skillName } from '@/lib/site';
import PrintButton from '@/components/site/PrintButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'Biography, experience, education and certifications of Sultan Sajed Shahriar.',
};

/** "CGPA: 3.65 / 4.00" → { k: 'CGPA', v: '3.65 / 4.00' } */
const fact = (line: string) => {
  const i = line.indexOf(':');
  return i > 0 ? { k: line.slice(0, i).trim(), v: line.slice(i + 1).trim() } : null;
};

function Heading({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-line-ink pt-6 md:grid-cols-12">
      <p className="label text-dim-ink md:col-span-3">({n})</p>
      <h2 data-split className="text-[9vw] font-medium leading-[0.95] tracking-[-0.045em] md:col-span-9 md:text-[3.8vw]">
        {children}
      </h2>
    </div>
  );
}

export default async function AboutPage() {
  const data = await readData<PortfolioData | null>('portfolio', null);
  const profile = data?.profile;
  const about = data?.about;
  const edu = data?.education ?? [];
  const exp = data?.experience ?? [];
  const certs = data?.certifications ?? [];
  const skills = data?.skillsAcquired ?? [];
  const toolkit = (data?.skills ?? []).map((s) => skillName(s.name));
  const portrait = isRealImage(profile?.avatar) ? profile?.avatar : undefined;

  const facts = [{ k: 'Based in', v: SITE.location }, ...(edu[0]?.bullets.map(fact).filter(Boolean) as { k: string; v: string }[])];

  return (
    <>
      {/* Intro */}
      <section className="relative z-[1] px-5 pb-24 pt-36 md:px-10 md:pb-36 md:pt-48" aria-labelledby="about-title">
        <p className="label text-dim" data-scramble>
          (About) — {SITE.name}
        </p>
        <div className="mt-6 grid gap-12 md:grid-cols-12 md:gap-6">
          <h1
            id="about-title"
            data-split
            className={`balance text-[12.5vw] font-medium leading-[0.9] tracking-[-0.05em] md:text-[6.6vw] ${portrait ? 'md:col-span-8' : 'md:col-span-11'}`}
          >
            Building systems people can <em className="italic-serif text-signal">trust</em>.
          </h1>
          {portrait ? (
            <figure data-clip className="relative aspect-[4/5] overflow-hidden bg-ink-2 md:col-span-4 md:-mt-4">
              <Image
                src={portrait}
                alt={`Portrait of ${SITE.name}`}
                fill
                priority
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover grayscale-[0.85] transition-[filter] duration-700 hover:grayscale-0"
              />
            </figure>
          ) : null}
        </div>

        <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-12 md:gap-6">
          <p className="text-[5.6vw] leading-[1.25] tracking-[-0.02em] md:col-span-7 md:text-[1.9vw]" data-fade>
            {about?.biography}
          </p>
          <dl className="grid content-start gap-6 md:col-span-4 md:col-start-9" data-fade="0.1">
            {facts.map((f) => (
              <div key={f.k} className="border-t border-line pt-3">
                <dt className="label text-dim">{f.k}</dt>
                <dd className="mt-1.5 text-[15px]">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Aims */}
      {about?.aims ? (
        <section className="relative z-[1] px-5 pb-32 md:px-10 md:pb-44" aria-label="What's next">
          <div className="grid gap-8 md:grid-cols-12">
            <p className="label text-dim md:col-span-2" data-scramble>
              (Next)
            </p>
            <p data-scrub-words className="text-[7.4vw] font-medium leading-[1.08] tracking-[-0.035em] md:col-span-10 md:text-[3.4vw]">
              {about.aims}
            </p>
          </div>
        </section>
      ) : null}

      {/* CV — prints as a clean one-column document */}
      <section id="cv" className="paper rounded-t-[28px] px-5 py-20 md:rounded-t-[44px] md:px-10 md:py-28" aria-label="Curriculum vitae">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6 md:mb-24">
          <p className="display text-[18vw] leading-[0.8] md:text-[10vw]">Curriculum</p>
          <PrintButton className="label no-print rounded-full border border-ink px-5 py-3 transition-colors duration-300 hover:bg-ink hover:text-bone" />
        </div>

        <div className="space-y-20 md:space-y-28">
          <div>
            <Heading n="Experience">Where I&apos;ve worked</Heading>
            {exp.map((e) => (
              <article key={e.company + e.role} className="print-break mt-10 grid gap-4 md:grid-cols-12" data-fade>
                <p className="label text-dim-ink md:col-span-3">{prettyRange(e.yearRange)}</p>
                <div className="md:col-span-9">
                  <h3 className="text-[6vw] font-medium tracking-[-0.03em] md:text-[2vw]">{e.role}</h3>
                  <p className="mt-1 text-dim-ink">{e.company}</p>
                  <ul className="mt-5 grid gap-x-10 gap-y-2 text-[15px] leading-relaxed md:grid-cols-2">
                    {e.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span className="mt-[9px] h-px w-3 shrink-0 bg-ink/50" aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div>
            <Heading n="Education">Where I study</Heading>
            {edu.map((e) => (
              <article key={e.institution} className="print-break mt-10 grid gap-4 md:grid-cols-12" data-fade>
                <p className="label text-dim-ink md:col-span-3">{prettyRange(e.yearRange)}</p>
                <div className="md:col-span-9">
                  <h3 className="text-[6vw] font-medium tracking-[-0.03em] md:text-[2vw]">{e.institution}</h3>
                  <p className="mt-1 text-dim-ink">{e.degree}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {e.bullets.map((b) => (
                      <li key={b} className="label rounded-full border border-ink/25 px-3 py-1.5">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div>
            <Heading n="Skills">What I work with</Heading>
            <div className="mt-10 grid gap-10 md:grid-cols-12" data-fade>
              <div className="md:col-span-5 md:col-start-4">
                <p className="label text-dim-ink">Strongest in</p>
                <ul className="mt-4">
                  {skills.map((s) => (
                    <li key={s.name} className="border-b border-line-ink py-3 text-[5.4vw] font-medium tracking-[-0.02em] md:text-[1.6vw]">
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-4">
                <p className="label text-dim-ink">Toolkit</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {toolkit.map((t) => (
                    <li key={t} className="label rounded-full border border-ink/25 px-3 py-1.5">
                      {t}
                    </li>
                  ))}
                </ul>
                {about?.interests?.length ? (
                  <>
                    <p className="label mt-10 text-dim-ink">Focus areas</p>
                    <ul className="mt-4 space-y-2 text-[15px]">
                      {about.interests.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {certs.length ? (
            <div>
              <Heading n="Certificates">Courses I&apos;ve completed</Heading>
              <ul className="mt-10 md:ml-[25%]" data-fade>
                {certs.map((c) => (
                  <li
                    key={c.name}
                    className="print-break grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line-ink py-4 md:grid-cols-[1fr_12rem_4rem]"
                  >
                    <span className="text-[17px] font-medium md:text-[19px]">{c.name}</span>
                    <span className="label col-start-1 text-dim-ink md:col-start-auto">{c.issuer}</span>
                    <span className="label row-start-1 text-right text-dim-ink md:row-start-auto">{c.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
