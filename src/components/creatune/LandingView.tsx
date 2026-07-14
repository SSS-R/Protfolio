'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlayer, PlayIcon, PauseIcon, SoundCloudIcon, YouTubeIcon, LOGO_FALLBACK } from '../CreaTunePlayer';
import TrackList from './TrackList';
import { Reveal, RevealGroup, RevealItem } from '../motion';
import type { CreaTuneTrack } from '../creatune-types';

// Deterministic waveform silhouette (hydration-safe)
const WAVE_BARS = Array.from({ length: 72 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 0.55 + 0.4));
  const b = Math.abs(Math.sin(i * 0.13 + 1.2));
  const mid = Math.exp(-Math.pow((i - 36) / 22, 2));
  return Math.round(6 + 88 * a * (0.25 + 0.75 * b) * (0.3 + 0.7 * mid));
});
function waveColor(i: number, alpha: string) {
  if (i % 7 === 0) return `linear-gradient(180deg, #C9A9C0${alpha}, #C9A9C000)`;
  if (i % 3 === 0) return `linear-gradient(180deg, #A9A3CE${alpha}, #A9A3CE00)`;
  return `linear-gradient(180deg, #565C7E${alpha}, #565C7E00)`;
}

export default function LandingView() {
  const { studio, tagline, links, tracks, albums, news, nextRelease, playFrom, toggleMain, isPlaying, current, coverFor } = usePlayer();

  const socialLinks = [
    { label: 'SoundCloud', href: links.soundcloud, icon: SoundCloudIcon },
    { label: 'YouTube', href: links.youtube, icon: YouTubeIcon },
  ].filter((l) => l.href) as { label: string; href: string; icon: typeof SoundCloudIcon }[];

  const latest = tracks[tracks.length - 1] as CreaTuneTrack | undefined;
  const totalListens = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  // Admin-picked featured, else top-played
  const picked = tracks.filter((t) => t.featured);
  const featured = (picked.length ? picked : [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0))).slice(0, 5);

  const hasNextRelease = nextRelease && (nextRelease.title || nextRelease.note);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#262838]">
        <div className="absolute inset-x-0 bottom-0 h-64 flex items-end gap-[3px] px-2 pointer-events-none blur-2xl" aria-hidden="true">
          {WAVE_BARS.map((h, i) => (
            <span key={i} className={`flex-1 rounded-full ${i % 2 === 1 ? 'hidden sm:block' : ''}`} style={{ height: `${h * 2.6}px`, background: waveColor(i, 'AA') }} />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-64 flex items-end gap-[3px] px-2 pointer-events-none" aria-hidden="true">
          {WAVE_BARS.map((h, i) => (
            <span key={i} className={`flex-1 rounded-full ${i % 2 === 1 ? 'hidden sm:block' : ''}`} style={{ height: `${h * 2.2}px`, background: waveColor(i, '99') }} />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" aria-hidden="true" />

        <RevealGroup preset="smooth" className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-36 md:pb-44 relative flex flex-col items-center">
          <RevealItem preset="smooth" className="rounded-full p-[3px] bg-gradient-to-b from-[#A9A3CE66] to-transparent">
            <Image src={LOGO_FALLBACK} alt={`${studio} logo`} width={140} height={140} priority className="rounded-full border border-[#EDEBF4]/15" style={{ boxShadow: '0 0 60px rgba(169,163,206,0.4), 0 0 140px rgba(201,169,192,0.2)' }} />
          </RevealItem>
          <RevealItem preset="smooth">
            <h1 className="mt-10 text-center font-[family-name:var(--font-display)] font-semibold uppercase text-[9vw] md:text-6xl lg:text-7xl tracking-[0.4em] md:tracking-[0.5em] -mr-[0.4em] leading-none" style={{ textShadow: '0 0 36px rgba(169,163,206,0.4), 0 0 90px rgba(201,169,192,0.2)' }}>
              {studio}
            </h1>
          </RevealItem>
          <RevealItem preset="smooth">
            <p className="mt-6 text-center text-[11px] uppercase tracking-[0.35em] text-[#9BA0B4] font-[family-name:var(--font-display)] max-w-xl">{tagline}</p>
          </RevealItem>
          <RevealItem preset="smooth" className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button onClick={toggleMain} className="rounded-full bg-[#A9A3CE] text-black pl-5 pr-6 py-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)] hover:bg-[#EDEBF4] transition-colors duration-200 cursor-pointer" style={{ boxShadow: '0 0 32px rgba(169,163,206,0.35)' }}>
              {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Listen now'}
            </button>
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#3B3E52] px-5 py-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)] text-[#9BA0B4] hover:border-[#C9A9C0] hover:text-[#C9A9C0] transition-colors duration-200">
                <Icon />
                {label}
              </a>
            ))}
          </RevealItem>
        </RevealGroup>
      </section>

      {/* CATALOGUE + LATEST RELEASE */}
      {tracks.length > 0 && (
        <RevealGroup as="section" preset="smooth" className="max-w-6xl mx-auto px-5 md:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <RevealItem preset="smooth" className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 md:p-6 flex items-center gap-4 md:gap-5">
            <Image src={coverFor(latest)} alt="" width={72} height={72} className="rounded-[14px] border border-white/10 shrink-0 w-14 h-14 md:w-[72px] md:h-[72px] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A9C0] font-[family-name:var(--font-display)]">Latest release</p>
              <p className="mt-1 text-lg md:text-2xl font-bold tracking-tight truncate">{latest?.title}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9BA0B4] mt-0.5 truncate">
                {latest?.artist} · {latest?.plays.toLocaleString()} listens · {latest?.duration}
              </p>
            </div>
            {latest && (
              <button
                onClick={() => playFrom([latest], 0)}
                aria-label={`Play ${latest.title}`}
                className="w-12 h-12 rounded-full bg-[#A9A3CE] text-black flex items-center justify-center hover:bg-[#EDEBF4] hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
                style={{ boxShadow: '0 0 24px rgba(169,163,206,0.3)' }}
              >
                {current?.id === latest.id && isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>
            )}
          </RevealItem>

          <RevealItem preset="smooth" className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9BA0B4] font-[family-name:var(--font-display)]">Catalogue</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-[family-name:var(--font-display)] font-bold tabular-nums text-[#A9A3CE] leading-none">{tracks.length.toString().padStart(2, '0')}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9BA0B4] mt-1.5">Tracks</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-[family-name:var(--font-display)] font-bold tabular-nums text-[#EDEBF4] leading-none">{totalListens.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9BA0B4] mt-1.5">Total listens</p>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      )}

      {/* NEWS + NEXT RELEASE */}
      {(news?.title || news?.body || hasNextRelease) && (
        <RevealGroup as="section" preset="smooth" className="max-w-6xl mx-auto px-5 md:px-8 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(news?.title || news?.body) && (
            <RevealItem preset="smooth" className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 md:p-6 ${hasNextRelease ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A9C0] font-[family-name:var(--font-display)]">News</p>
              {news?.title && <p className="mt-2 text-xl font-bold tracking-tight">{news.title}</p>}
              {news?.body && <p className="mt-2 text-sm leading-7 text-[#CFCDDE] whitespace-pre-wrap">{news.body}</p>}
            </RevealItem>
          )}
          {hasNextRelease && (
            <RevealItem preset="smooth" className="rounded-2xl border border-[#A9A3CE]/25 bg-[#A9A3CE]/[0.05] backdrop-blur-sm p-5 md:p-6 flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A9A3CE] font-[family-name:var(--font-display)]">Next release</p>
              <div className="mt-3 flex items-center gap-4">
                <Image src={nextRelease?.cover || LOGO_FALLBACK} alt="" width={64} height={64} className="rounded-xl border border-white/10 object-cover w-16 h-16 shrink-0" />
                <div className="min-w-0">
                  {nextRelease?.title && <p className="text-lg font-bold tracking-tight truncate">{nextRelease.title}</p>}
                  {nextRelease?.date && <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A9C0] mt-0.5">{nextRelease.date}</p>}
                </div>
              </div>
              {nextRelease?.note && <p className="mt-3 text-sm leading-6 text-[#CFCDDE] whitespace-pre-wrap">{nextRelease.note}</p>}
            </RevealItem>
          )}
        </RevealGroup>
      )}

      {/* FEATURED / TOP SONGS */}
      {featured.length > 0 && (
        <Reveal as="section" preset="smooth" className="max-w-6xl mx-auto px-5 md:px-8 mt-10">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <div className="flex items-baseline justify-between px-5 md:px-6 pt-5 pb-3 border-b border-white/[0.06]">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] font-[family-name:var(--font-display)]">
                {picked.length ? 'Featured' : 'Top songs'}
              </h2>
              <Link href="/music/tracks" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BA0B4] hover:text-[#A9A3CE] transition-colors">
                All songs →
              </Link>
            </div>
            <TrackList list={featured} />
          </div>
        </Reveal>
      )}

      {/* ALBUMS PREVIEW */}
      {albums.length > 0 && (
        <Reveal as="section" preset="smooth" className="max-w-6xl mx-auto px-5 md:px-8 mt-10">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] font-[family-name:var(--font-display)]">Albums</h2>
            <Link href="/music/albums" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BA0B4] hover:text-[#A9A3CE] transition-colors">
              All albums →
            </Link>
          </div>
          <RevealGroup preset="smooth" className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.slice(0, 4).map((a) => (
              <RevealItem key={a.id} preset="smooth">
                <Link href={`/music/albums/${a.id}`} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                    <Image src={a.cover || LOGO_FALLBACK} alt="" width={300} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="mt-2 font-bold truncate">{a.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#9BA0B4]">{a.year || 'Album'}</p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      )}

      {/* Footer */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 mt-16 pt-8 border-t border-[#1C1D2A] text-[11px] uppercase tracking-[0.2em] text-[#9BA0B4] flex items-center justify-between gap-2 font-[family-name:var(--font-display)]">
        <span>© 2026 {studio} — All sound, one desk.</span>
        <Image src={LOGO_FALLBACK} alt="" width={32} height={32} className="rounded-full border border-[#3B3E52] opacity-80" />
      </section>
    </>
  );
}
