'use client';

import Link from 'next/link';
import { usePlayer, PlayIcon, PauseIcon, Cover, PRIMARY_BUTTON, GHOST_BUTTON, SoundCloudIcon, YouTubeIcon } from '../CreaTunePlayer';
import TrackList from './TrackList';
import Spectrum from './Spectrum';

export default function LandingView() {
  const { studio, tagline, links, tracks, albums, news, nextRelease, playFrom, toggleMain, isPlaying, current, coverFor, openLyrics } =
    usePlayer();

  const socialLinks = [
    { label: 'SoundCloud', href: links.soundcloud, icon: SoundCloudIcon },
    { label: 'YouTube', href: links.youtube, icon: YouTubeIcon },
  ].filter((l) => l.href) as { label: string; href: string; icon: typeof SoundCloudIcon }[];

  const latest = tracks[tracks.length - 1];
  const latestPlaying = !!latest && current?.id === latest.id && isPlaying;
  const totalListens = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  // Admin-picked featured, else top-played
  const picked = tracks.filter((t) => t.featured);
  const featured = (picked.length ? picked : [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0))).slice(0, 5);
  const hasNews = !!(news?.title || news?.body);
  const hasNextRelease = !!(nextRelease && (nextRelease.title || nextRelease.note));

  return (
    <>
      {/* Hero: the live spectrum under the wordmark */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-32 pt-28 md:px-10 md:pb-36" aria-labelledby="ct-title">
        <Spectrum className="absolute inset-x-0 top-[9vh] h-[46svh] w-full md:top-[4vh] md:h-[74svh]" />

        <div className="relative">
          <p className="label mx-auto flex w-fit items-center justify-center gap-2 bg-ink px-3 py-1.5 text-mauve" aria-live="polite">
            <span className={`size-1.5 rounded-full bg-mauve ${isPlaying ? 'animate-pulse' : 'opacity-50'}`} />
            {isPlaying && current ? `Live spectrum — ${current.title}` : 'Idle — press play to see the sound'}
          </p>
          <h1 id="ct-title" data-split className="display-wide mt-5 text-center text-[12.4vw] md:text-[11.2vw]">
            {studio}
          </h1>
          <div className="mt-8 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end" data-fade>
            <p className="max-w-[36ch] text-center text-[17px] leading-relaxed text-dim md:text-left">{tagline}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={toggleMain} data-magnetic className={PRIMARY_BUTTON}>
                {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                {isPlaying ? 'Pause' : 'Listen now'}
              </button>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={GHOST_BUTTON}>
                  <Icon />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue band */}
      {tracks.length > 0 ? (
        <div className="label grid grid-cols-2 border-y border-line px-5 md:grid-cols-4 md:px-10" data-fade>
          {[
            ['Tracks', String(tracks.length).padStart(2, '0')],
            ['Listens', totalListens.toLocaleString()],
            ['Albums', String(albums.length).padStart(2, '0')],
            ['Latest', latest?.title ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-line py-5 odd:pr-5 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0">
              <span className="text-dim">{k}</span>
              <span className="truncate text-bone">{v}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Latest release */}
      {latest ? (
        <section className="grid gap-10 px-5 py-28 md:grid-cols-12 md:gap-6 md:px-10 md:py-40" aria-labelledby="latest-title">
          <button
            type="button"
            onClick={() => playFrom([latest], 0)}
            data-cursor={latestPlaying ? 'Pause' : 'Play'}
            aria-label={`${latestPlaying ? 'Pause' : 'Play'} ${latest.title}`}
            className="group relative block md:col-span-5"
          >
            <div data-clip>
              <Cover src={coverFor(latest)} title={latest.title} className="aspect-square w-full" sizes="(min-width: 768px) 40vw, 100vw" />
            </div>
            <span className="absolute bottom-5 left-5 grid size-14 place-items-center rounded-full bg-lavender text-ink transition-transform duration-500 group-hover:scale-110">
              {latestPlaying ? <PauseIcon /> : <PlayIcon />}
            </span>
          </button>
          <div className="flex flex-col justify-end md:col-span-6 md:col-start-7">
            <p className="label text-mauve" data-scramble>
              (Latest release)
            </p>
            <h2 id="latest-title" data-split className="mt-5 text-[13vw] font-medium leading-[0.92] tracking-[-0.05em] md:text-[6vw]">
              {latest.title}
            </h2>
            <dl className="label mt-10 grid grid-cols-3 gap-6 border-t border-line pt-6" data-fade>
              <div>
                <dt className="text-dim">Artist</dt>
                <dd className="mt-2">{latest.artist}</dd>
              </div>
              <div>
                <dt className="text-dim">Length</dt>
                <dd className="mt-2 tabular-nums">{latest.duration}</dd>
              </div>
              <div>
                <dt className="text-dim">Listens</dt>
                <dd className="mt-2 tabular-nums">{latest.plays.toLocaleString()}</dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-wrap gap-3" data-fade>
              <button type="button" onClick={() => playFrom([latest], 0)} className={PRIMARY_BUTTON}>
                {latestPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                {latestPlaying ? 'Pause' : 'Play the single'}
              </button>
              {latest.lyrics?.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    if (current?.id !== latest.id) playFrom([latest], 0);
                    openLyrics();
                  }}
                  className={GHOST_BUTTON}
                >
                  Read the lyrics
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured / top songs */}
      {featured.length > 0 ? (
        <section className="px-5 md:px-10" aria-labelledby="featured-title">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="label text-mauve" data-scramble>
                ({picked.length ? 'Featured' : 'Most played'})
              </p>
              <h2 id="featured-title" data-split className="mt-4 text-[11vw] font-medium leading-[0.92] tracking-[-0.05em] md:text-[5vw]">
                On <em className="italic-serif text-mauve">repeat</em>
              </h2>
            </div>
            <Link href="/music/tracks" className="label u-link shrink-0">
              All songs ↗
            </Link>
          </div>
          <div className="mt-12">
            <TrackList list={featured} />
          </div>
        </section>
      ) : null}

      {/* News + next release */}
      {hasNews || hasNextRelease ? (
        <section className="mt-28 grid gap-12 px-5 md:mt-40 md:grid-cols-12 md:gap-6 md:px-10" aria-label="Studio news">
          {hasNews ? (
            <article className={`border-t border-line pt-6 ${hasNextRelease ? 'md:col-span-7' : 'md:col-span-8'}`} data-fade>
              <p className="label text-mauve">(From the studio)</p>
              {news?.title ? <h2 className="mt-5 text-[8vw] font-medium leading-[0.95] tracking-[-0.04em] md:text-[3.4vw]">{news.title}</h2> : null}
              {news?.body ? <p className="mt-6 max-w-[52ch] whitespace-pre-wrap text-[17px] leading-relaxed text-dim">{news.body}</p> : null}
            </article>
          ) : null}
          {hasNextRelease ? (
            <article className="border-t border-mauve/40 pt-6 md:col-span-4 md:col-start-9" data-fade="0.1">
              <p className="label text-mauve">(Next release)</p>
              <div className="mt-5 flex items-center gap-4">
                <Cover src={nextRelease?.cover || ''} title={nextRelease?.title || studio} className="size-20 shrink-0" sizes="80px" />
                <div className="min-w-0">
                  {nextRelease?.title ? <p className="truncate text-[24px] font-medium tracking-[-0.03em]">{nextRelease.title}</p> : null}
                  {nextRelease?.date ? <p className="label mt-1 text-mauve">{nextRelease.date}</p> : null}
                </div>
              </div>
              {nextRelease?.note ? <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-dim">{nextRelease.note}</p> : null}
            </article>
          ) : null}
        </section>
      ) : null}

      {/* Albums */}
      {albums.length > 0 ? (
        <section className="mt-28 px-5 md:mt-40 md:px-10" aria-labelledby="albums-title">
          <div className="flex items-end justify-between border-b border-line pb-6">
            <h2 id="albums-title" data-split className="display-wide text-[9vw] md:text-[4.4vw]">
              Albums
            </h2>
            <Link href="/music/albums" className="label u-link">
              All albums ↗
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {albums.slice(0, 4).map((a) => (
              <Link key={a.id} href={`/music/albums/${a.id}`} className="group" data-fade>
                <Cover src={a.cover || ''} title={a.title} className="aspect-square w-full transition-transform duration-700 group-hover:scale-[0.98]" sizes="25vw" />
                <p className="mt-3 truncate text-[19px] font-medium tracking-[-0.02em]">{a.title}</p>
                <p className="label mt-1 text-dim">{a.year || 'Album'}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
