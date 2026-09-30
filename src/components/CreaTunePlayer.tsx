'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSiteMotion, fireIntro, gsap } from './site/motion';
import Cursor from './site/Cursor';
import type { CreaTuneTrack, CreaTuneAlbum, CreaTuneLinks, CreaTuneNews, CreaTuneNextRelease } from './creatune-types';

export const LOGO_FALLBACK = '/images/creatune-logo.png';

const YEAR = new Date().getFullYear();

export function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Icons (shared across views) ──────────────────────────────────────
export const PlayIcon = ({ className = 'size-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);
export const PauseIcon = ({ className = 'size-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);
export const SoundCloudIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.56 8.87V17h8.76c1.85-.13 3.18-1.65 3.18-3.44 0-1.9-1.54-3.44-3.44-3.44-.5 0-.97.11-1.39.29-.28-3.14-2.92-5.6-6.13-5.6-.79 0-1.55.15-2.24.43-.27.1-.34.21-.34.42v2.97l1.6.24zM10.3 9.24c-.1 0-.18.08-.19.18l-.36 3.76.36 3.63c.01.1.09.18.19.18s.18-.08.19-.18l.41-3.63-.41-3.76c-.01-.1-.09-.18-.19-.18zM8.83 9.89c-.1 0-.17.07-.18.17l-.31 3.12.31 3.04c.01.1.08.17.18.17.09 0 .17-.07.18-.17l.36-3.04-.36-3.12c-.01-.1-.09-.17-.18-.17zM7.36 10.42c-.09 0-.16.07-.17.16l-.27 2.6.27 2.56c.01.09.08.16.17.16s.16-.07.17-.16l.31-2.56-.31-2.6c-.01-.09-.08-.16-.17-.16zM5.9 10.87c-.08 0-.15.06-.16.15l-.23 2.16.23 2.13c.01.09.08.15.16.15s.15-.06.16-.15l.27-2.13-.27-2.16c-.01-.09-.08-.15-.16-.15zM4.45 11.51c-.08 0-.14.06-.15.14l-.19 1.53.19 1.5c.01.08.07.14.15.14s.14-.06.15-.14l.22-1.5-.22-1.53c-.01-.08-.07-.14-.15-.14zM3.02 12.06c-.07 0-.13.05-.14.13l-.16.99.16.96c.01.08.07.13.14.13s.13-.05.14-.13l.18-.96-.18-.99c-.01-.08-.07-.13-.14-.13z" />
  </svg>
);
export const YouTubeIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.42V8.58L15.83 12 9.6 15.42z" />
  </svg>
);

export const PRIMARY_BUTTON =
  'label inline-flex items-center gap-2 rounded-full bg-lavender px-6 py-4 text-ink transition-colors duration-300 hover:bg-bone';
export const GHOST_BUTTON =
  'label inline-flex items-center gap-2 rounded-full border border-line px-5 py-4 transition-colors duration-300 hover:border-mauve hover:text-mauve';

/** Square cover art. Tracks without art get the logo mark, never an upscaled blur. */
export function Cover({ src, title, className = '', sizes }: { src: string; title: string; className?: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden bg-ink-2 ${className}`}>
      {src && src !== LOGO_FALLBACK ? (
        <Image src={src} alt={`${title} — cover art`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center border border-line">
          <Image src={LOGO_FALLBACK} alt="" width={160} height={160} className="w-[70%] max-w-[160px] rounded-full" />
        </div>
      )}
    </div>
  );
}

// ── Context ──────────────────────────────────────────────────────────
interface PlayerContextValue {
  studio: string;
  tagline: string;
  links: CreaTuneLinks;
  albums: CreaTuneAlbum[];
  news: CreaTuneNews | null;
  nextRelease: CreaTuneNextRelease | null;
  tracks: CreaTuneTrack[];
  current: CreaTuneTrack | null;
  isPlaying: boolean;
  playFrom: (list: CreaTuneTrack[], index: number) => void;
  toggleMain: () => void;
  isCurrent: (id: string) => boolean;
  coverFor: (t: CreaTuneTrack | null | undefined) => string;
  /** Fills `buf` with the live FFT of what's playing; false when nothing is. */
  readSpectrum: (buf: Uint8Array<ArrayBuffer>) => boolean;
  openLyrics: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within CreaTunePlayerProvider');
  return ctx;
}

interface ProviderProps {
  studio: string;
  tagline: string;
  links: CreaTuneLinks;
  initialTracks: CreaTuneTrack[];
  albums: CreaTuneAlbum[];
  news: CreaTuneNews | null;
  nextRelease: CreaTuneNextRelease | null;
  children: React.ReactNode;
}

export default function CreaTunePlayerProvider({
  studio,
  tagline,
  links,
  initialTracks,
  albums,
  news,
  nextRelease,
  children,
}: ProviderProps) {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  useSiteMotion(root);

  const [tracks, setTracks] = useState<CreaTuneTrack[]>(initialTracks);
  const [queue, setQueue] = useState<CreaTuneTrack[]>(initialTracks);
  const [queueIndex, setQueueIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showLyrics, setShowLyrics] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountedRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playingRef = useRef(false);
  const vizRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  const current = queueIndex !== null ? queue[queueIndex] : null;

  // CreaTune has no preloader; entering here counts as the session's intro.
  useEffect(() => {
    try {
      sessionStorage.setItem('sss-intro', '1');
    } catch {}
    document.documentElement.dataset.intro = 'seen';
    fireIntro();
  }, []);

  const coverFor = useCallback(
    (track: CreaTuneTrack | null | undefined): string => {
      if (!track) return LOGO_FALLBACK;
      if (track.cover) return track.cover;
      const album = albums.find((a) => a.id === track.albumId);
      return album?.cover || LOGO_FALLBACK;
    },
    [albums],
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  const countPlay = useCallback((track: CreaTuneTrack) => {
    if (lastCountedRef.current === track.id) return;
    lastCountedRef.current = track.id;
    setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, plays: t.plays + 1 } : t)));
    fetch('/api/creatune/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: track.id }),
    }).catch(() => {});
  }, []);

  const ensureAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      try {
        const ctx = new Ctx();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      } catch {
        /* progressive enhancement */
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, []);

  const readSpectrum = useCallback((buf: Uint8Array<ArrayBuffer>) => {
    const analyser = analyserRef.current;
    if (!analyser || !playingRef.current) return false;
    analyser.getByteFrequencyData(buf);
    return true;
  }, []);

  const startPlayback = useCallback(
    (list: CreaTuneTrack[], index: number) => {
      const audio = audioRef.current;
      const track = list[index];
      if (!audio || !track) return;
      setQueue(list);
      setQueueIndex(index);
      audio.src = track.url;
      audio.load();
      ensureAnalyser();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          countPlay(track);
        })
        .catch(() => setIsPlaying(false));
    },
    [countPlay, ensureAnalyser],
  );

  const playFrom = useCallback(
    (list: CreaTuneTrack[], index: number) => {
      const audio = audioRef.current;
      const track = list[index];
      if (!audio || !track) return;
      // Same track already loaded → toggle
      if (current?.id === track.id) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          ensureAnalyser();
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        return;
      }
      startPlayback(list, index);
    },
    [current, isPlaying, ensureAnalyser, startPlayback],
  );

  const toggleMain = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (queueIndex === null) {
      if (queue.length > 0) startPlayback(queue, 0);
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      ensureAnalyser();
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [queue, queueIndex, isPlaying, ensureAnalyser, startPlayback]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    const next = queueIndex === null ? 0 : (queueIndex + 1) % queue.length;
    startPlayback(queue, next);
  }, [queue, queueIndex, startPlayback]);

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    const prev = queueIndex === null ? 0 : (queueIndex - 1 + queue.length) % queue.length;
    startPlayback(queue, prev);
  }, [queue, queueIndex, startPlayback]);

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Level meter in the player bar follows the actual audio signal.
  useEffect(() => {
    const bars = vizRef.current?.children;
    if (!isPlaying || !analyserRef.current || !bars || bars.length === 0) {
      cancelAnimationFrame(rafRef.current);
      if (bars) for (let i = 0; i < bars.length; i++) (bars[i] as HTMLElement).style.transform = 'scaleY(0.06)';
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      for (let i = 0; i < bars.length; i++) {
        const bin = Math.floor(2 + (i * (data.length - 2)) / bars.length);
        (bars[i] as HTMLElement).style.transform = `scaleY(${Math.max(0.06, data[bin] / 255)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // Lock-screen / media-key controls and metadata.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: studio,
      artwork: [{ src: new URL(coverFor(current), window.location.href).href }],
    });
  }, [current, coverFor, studio]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    const actions: [MediaSessionAction, () => void][] = [
      ['play', toggleMain],
      ['pause', toggleMain],
      ['previoustrack', handlePrev],
      ['nexttrack', handleNext],
    ];
    actions.forEach(([a, fn]) => ms.setActionHandler(a, fn));
    return () => actions.forEach(([a]) => ms.setActionHandler(a, null));
  }, [toggleMain, handlePrev, handleNext]);

  // Space plays / pauses anywhere a control doesn't already own it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if ((e.target as HTMLElement).closest?.('input, textarea, select, button, a, [contenteditable="true"]')) return;
      e.preventDefault();
      toggleMain();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleMain]);

  // Lyrics sheet slides in from the right.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (showLyrics) {
      gsap.set(el, { display: 'flex' });
      gsap.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: reduce ? 0 : 0.8, ease: 'expo.out' });
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowLyrics(false);
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    if (getComputedStyle(el).display !== 'none') {
      gsap.to(el, { xPercent: 100, duration: reduce ? 0 : 0.6, ease: 'expo.inOut', onComplete: () => gsap.set(el, { display: 'none' }) });
    }
  }, [showLyrics]);

  const openLyrics = useCallback(() => setShowLyrics(true), []);
  const isCurrent = useCallback((id: string) => current?.id === id, [current]);

  const socialLinks = [
    { label: 'SoundCloud', href: links.soundcloud, icon: SoundCloudIcon },
    { label: 'YouTube', href: links.youtube, icon: YouTubeIcon },
  ].filter((l) => l.href) as { label: string; href: string; icon: typeof SoundCloudIcon }[];

  const navItems = [
    { label: 'Home', href: '/music' },
    { label: 'Songs', href: '/music/tracks' },
    { label: 'Albums', href: '/music/albums' },
  ];

  const total = duration > 0 ? duration : 0;
  const progress = total ? (Math.min(currentTime, total) / total) * 100 : 0;

  return (
    <PlayerContext.Provider
      value={{
        studio,
        tagline,
        links,
        albums,
        news,
        nextRelease,
        tracks,
        current,
        isPlaying,
        playFrom,
        toggleMain,
        isCurrent,
        coverFor,
        readSpectrum,
        openLyrics,
      }}
    >
      <div ref={root} className="site ct relative flex min-h-screen flex-col">
        <a
          href="#main"
          className="label fixed left-4 top-4 z-[120] -translate-y-24 bg-lavender px-3 py-2 text-ink focus:translate-y-0"
        >
          Skip to content
        </a>

        {/* Header */}
        <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-ink via-ink/85 to-transparent px-5 pb-8 pt-4 md:px-10 md:pt-5">
          <div className="label grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8">
            <Link href="/music" className="flex items-center gap-3" aria-label={`${studio}, home`}>
              <Image src={LOGO_FALLBACK} alt="" width={40} height={40} className="size-9 rounded-full md:size-10" />
              <span className="display-wide hidden text-[13px] tracking-[0.28em] md:inline">{studio}</span>
            </Link>
            <nav aria-label="CreaTune" className="flex justify-center gap-5 md:gap-8">
              {navItems.map((item) => {
                const active = item.href === '/music' ? pathname === '/music' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="group flex items-center gap-2"
                  >
                    <span
                      className={`size-1.5 rounded-full bg-mauve transition-transform duration-500 ${active ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}
                    />
                    <span data-hover-scramble>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center justify-end gap-6">
              {socialLinks.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="u-link hidden text-dim hover:text-bone lg:inline">
                  {label} ↗
                </a>
              ))}
              <Link
                href="/"
                className="whitespace-nowrap rounded-full border border-line px-3 py-2 transition-colors duration-300 hover:border-bone md:px-4"
              >
                ← <span className="hidden sm:inline">Portfolio</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="relative z-10 w-full flex-1 outline-none">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 px-5 pb-40 pt-28 md:px-10 md:pt-40">
          <p
            aria-hidden="true"
            className="display-wide select-none text-center text-[13vw] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgb(201_169_192/0.45)]"
          >
            {studio}
          </p>
          <div className="label mt-12 flex flex-col gap-6 border-t border-line pt-6 text-dim md:flex-row md:items-center md:justify-between">
            <span>
              © {YEAR} {studio} — All sound, one desk.
            </span>
            <span className="flex flex-wrap gap-x-6 gap-y-2">
              {socialLinks.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="u-link hover:text-bone">
                  {label} ↗
                </a>
              ))}
              <Link href="/" className="u-link hover:text-bone">
                Portfolio
              </Link>
              <Link href="/music/admin" className="u-link hover:text-bone">
                Studio admin
              </Link>
            </span>
          </div>
        </footer>

        {/* Lyrics sheet */}
        <aside
          ref={sheetRef}
          aria-label="Lyrics"
          aria-hidden={!showLyrics}
          className="fixed bottom-0 right-0 top-0 z-30 hidden w-full flex-col border-l border-line bg-ink-2 px-6 pb-40 pt-24 md:w-[460px] md:px-10"
        >
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <p className="label text-mauve">Lyrics</p>
            <button type="button" onClick={() => setShowLyrics(false)} className="label text-dim hover:text-bone">
              Close
            </button>
          </div>
          <p className="mt-6 text-[26px] font-medium leading-tight tracking-[-0.03em]">{current ? current.title : 'Nothing playing'}</p>
          <div data-lenis-prevent className="mt-6 flex-1 overflow-y-auto">
            <p className="whitespace-pre-wrap text-[17px] leading-[1.9] text-dim">
              {current ? current.lyrics?.trim() || 'No lyrics for this track yet.' : 'Play a track to see its lyrics.'}
            </p>
          </div>
        </aside>

        {/* Player bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur-sm" role="region" aria-label="Player">
          <div ref={vizRef} className="ct-viz h-5 px-5 opacity-80 md:px-10" aria-hidden="true">
            {Array.from({ length: 64 }).map((_, i) => (
              <span key={i} className={i % 2 ? 'hidden md:block' : ''} />
            ))}
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <Cover src={coverFor(current)} title={current?.title ?? studio} className="size-11 shrink-0" sizes="44px" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{current ? current.title : 'Nothing playing'}</p>
                <p className="label mt-0.5 flex items-center gap-2 truncate text-dim">
                  {isPlaying ? (
                    <span className="ct-eq text-mauve" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : null}
                  {current ? current.artist : `${tracks.length} tracks — press play`}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 md:gap-3">
                <button type="button" onClick={handlePrev} aria-label="Previous track" className="grid size-9 place-items-center text-dim transition-colors hover:text-bone">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={toggleMain}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  aria-keyshortcuts="Space"
                  className="grid size-11 place-items-center rounded-full bg-lavender text-ink transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-bone"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button type="button" onClick={handleNext} aria-label="Next track" className="grid size-9 place-items-center text-dim transition-colors hover:text-bone">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                  </svg>
                </button>
              </div>
              <div className="label hidden w-[min(34vw,460px)] items-center gap-3 text-dim md:flex">
                <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={total}
                  step={1}
                  value={Math.min(currentTime, total)}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  aria-label="Seek"
                  className="ct-range flex-1"
                  style={{ '--p': `${progress}%` } as React.CSSProperties}
                />
                <span className="w-10 tabular-nums">{total ? formatTime(total) : (current?.duration ?? '0:00')}</span>
              </div>
            </div>

            <div className="hidden items-center justify-end gap-5 md:flex">
              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                aria-pressed={showLyrics}
                className="label rounded-full border border-line px-4 py-2 transition-colors duration-300 hover:border-mauve hover:text-mauve aria-pressed:border-mauve aria-pressed:text-mauve"
              >
                Lyrics
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="ct-range w-24"
                style={{ '--p': `${volume * 100}%` } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Mobile: progress + lyrics */}
          <div className="label flex items-center gap-3 px-5 pb-3 text-dim md:hidden">
            <span className="tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={total}
              step={1}
              value={Math.min(currentTime, total)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              aria-label="Seek"
              className="ct-range flex-1"
              style={{ '--p': `${progress}%` } as React.CSSProperties}
            />
            <span className="tabular-nums">{total ? formatTime(total) : (current?.duration ?? '0:00')}</span>
            <button type="button" onClick={() => setShowLyrics((v) => !v)} aria-pressed={showLyrics} className="aria-pressed:text-mauve">
              Lyrics
            </button>
          </div>
        </div>

        <Cursor />
        <div className="grain" aria-hidden="true" />

        {/* The one persistent audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={handleNext}
        />
      </div>
    </PlayerContext.Provider>
  );
}
