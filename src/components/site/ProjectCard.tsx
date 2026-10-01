import type { Project } from '@/types/portfolio';
import { CATEGORY_LABEL, linkLabel } from '@/lib/site';
import ProjectCover from './ProjectCover';
import Icon from './Icon';

/** A featured-work panel: live cover left, facts right (stacked on mobile). */
export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const label = linkLabel(project.link);
  const n = String(index + 1).padStart(2, '0');
  const cover = <ProjectCover id={project.id} image={project.image} title={project.title} sizes="(min-width: 1024px) 38vw, 100vw" />;

  return (
    <article className="group flex w-full shrink-0 flex-col border border-line-ink bg-bone lg:h-[64vh] lg:w-[66vw] lg:flex-row xl:w-[60vw]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-2 lg:aspect-auto lg:w-[58%]">
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Open"
            aria-label={`${project.title} — ${label}`}
            className="absolute inset-0 block"
          >
            {cover}
          </a>
        ) : (
          cover
        )}
        {/* Outside the link, so the link's accessible name matches what it contains */}
        <span className="label pointer-events-none absolute bottom-4 left-5 text-bone/60" aria-hidden="true">
          Fig. {n} — {project.title}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex items-start justify-between">
          {/* Decorative numeral, drawn by CSS so it isn't text (contrast checks skip it) */}
          <span
            aria-hidden="true"
            data-n={n}
            className="display text-[16vw] text-ink/15 before:content-[attr(data-n)] lg:text-[5.5vw]"
          />
          <span className="label rounded-full border border-ink/25 px-3 py-1.5">
            {project.subtitle || CATEGORY_LABEL[project.category] || project.status}
          </span>
        </div>
        <div className="mt-auto">
          <p className="label text-dim-ink">{CATEGORY_LABEL[project.category] ?? project.category}</p>
          <h3 className="mt-2 text-[8vw] font-medium leading-[0.95] tracking-[-0.04em] lg:text-[2.6vw]">{project.title}</h3>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-dim-ink">{project.desc}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-ink pt-5">
          <ul className="label flex flex-wrap gap-x-4 gap-y-1 text-dim-ink" aria-label="Built with">
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {label ? (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="label u-link flex items-center gap-1">
              {label} <Icon name="arrow-up-right" className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
