'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCurtain } from './ClientLayout';
import { PageTransition } from './motion';
import type {
  CreaTuneTrack,
  CreaTuneAlbum,
  CreaTuneLinks,
  CreaTuneNews,
  CreaTuneNextRelease,
} from './creatune-types';

export const LOGO_FALLBACK = '/images/creatune-logo.png';

export function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Icons (shared across views) ──────────────────────────────────────
export const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);
export const PauseIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);
export const SoundCloudIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.56 8.87V17h8.76c1.85-.13 3.18-1.65 3.18-3.44 0-1.9-1.54-3.44-3.44-3.44-.5 0-.97.11-1.39.29-.28-3.14-2.92-5.6-6.13-5.6-.79 0-1.55.15-2.24.43-.27.1-.34.21-.34.42v2.97l1.6.24zM10.3 9.24c-.1 0-.18.08-.19.18l-.36 3.76.36 3.63c.01.1.09.18.19.18s.18-.08.19-.18l.41-3.63-.41-3.76c-.01-.1-.09-.18-.19-.18zM8.83 9.89c-.1 0-.17.07-.18.17l-.31 3.12.31 3.04c.01.1.08.17.18.17.09 0 .17-.07.18-.17l.36-3.04-.36-3.12c-.01-.1-.09-.17-.18-.17zM7.36 10.42c-.09 0-.16.07-.17.16l-.27 2.6.27 2.56c.01.09.08.16.17.16s.16-.07.17-.16l.31-2.56-.31-2.6c-.01-.09-.08-.16-.17-.16zM5.9 10.87c-.08 0-.15.06-.16.15l-.23 2.16.23 2.13c.01.09.08.15.16.15s.15-.06.16-.15l.27-2.13-.27-2.16c-.01-.09-.08-.15-.16-.15zM4.45 11.51c-.08 0-.14.06-.15.14l-.19 1.53.19 1.5c.01.08.07.14.15.14s.14-.06.15-.14l.22-1.5-.22-1.53c-.01-.08-.07-.14-.15-.14zM3.02 12.06c-.07 0-.13.05-.14.13l-.16.99.16.96c.01.08.07.13.14.13s.13-.05.14-.13l.18-.96-.18-.99c-.01-.08-.07-.13-.14-.13z" />
  </svg>
);
export const YouTubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.42V8.58L15.83 12 9.6 15.42z" />
  </svg>
);

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
  const { navigateWithCurtain } = useCurtain();
  const pathname = usePathname();

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
  const vizRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  const current = queueIndex !== null ? queue[queueIndex] : null;

  const coverFor = useCallback(
    (track: CreaTuneTrack | null | undefined): string => {
      if (!track) return LOGO_FALLBACK;
      if (track.cover) return track.cover;
      const album = albums.find((a) => a.id === track.albumId);
      return album?.cover || LOGO_FALLBACK;
    },
    [albums]
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

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
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
    [countPlay, ensureAnalyser]
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
          audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
        return;
      }
      startPlayback(list, index);
    },
    [current, isPlaying, ensureAnalyser, startPlayback]
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
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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

  // Visualizer loop — bars follow the actual audio signal
  useEffect(() => {
    const bars = vizRef.current?.children;
    if (!isPlaying || !analyserRef.current || !bars || bars.length === 0) {
      cancelAnimationFrame(rafRef.current);
      if (bars) {
        for (let i = 0; i < bars.length; i++) {
          (bars[i] as HTMLElement).style.transform = 'scaleY(0.08)';
        }
      }
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      for (let i = 0; i < bars.length; i++) {
        const bin = Math.floor(2 + (i * (data.length - 2)) / bars.length);
        const v = data[bin] / 255;
        (bars[i] as HTMLElement).style.transform = `scaleY(${Math.max(0.08, v)})`;
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

  return (
    <PlayerContext.Provider
      value={{ studio, tagline, links, albums, news, nextRelease, tracks, current, isPlaying, playFrom, toggleMain, isCurrent, coverFor }}
    >
      <div className="ct-scope relative min-h-screen bg-black text-[#EDEBF4] font-[family-name:var(--font-inter)] selection:bg-[#A9A3CE] selection:text-black flex flex-col">
        {/* Ambient blue/purple glow over solid black */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(65% 45% at 50% -5%, rgba(124,92,255,0.22), transparent 70%),' +
              'radial-gradient(45% 40% at 8% 25%, rgba(59,74,214,0.16), transparent 70%),' +
              'radial-gradient(50% 45% at 92% 70%, rgba(169,163,206,0.14), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <header className="relative z-40 border-b border-[#1C1D2A] sticky top-0 bg-black/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/music" className="flex items-center gap-3 min-w-0">
              <Image src={LOGO_FALLBACK} alt="" width={40} height={40} className="rounded-full border border-[#3B3E52] shrink-0" />
              <span className="hidden sm:inline text-2xl font-[family-name:var(--font-script)] text-[#EDEBF4]">{studio}</span>
            </Link>
            <nav className="flex items-center gap-3 md:gap-5 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)] shrink-0">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-[#9BA0B4] hover:text-[#C9A9C0] transition-colors duration-200">
                  <Icon />
                  {label}
                </a>
              ))}
              <Link href="/music/admin" className="text-[#9BA0B4] hover:text-[#EDEBF4] transition-colors duration-200">
                Admin
              </Link>
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithCurtain('/');
                }}
                className="rounded-full border border-[#3B3E52] px-3 py-1.5 md:px-4 md:py-2 hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors duration-200 whitespace-nowrap"
              >
                ← Portfolio
              </Link>
            </nav>
          </div>
          {/* Sub-nav */}
          <div className="border-t border-white/[0.05]">
            <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center gap-1">
              {navItems.map((item) => {
                const active = item.href === '/music' ? pathname === '/music' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)] border-b-2 -mb-px transition-colors duration-200 ${
                      active
                        ? 'border-[#A9A3CE] text-[#EDEBF4]'
                        : 'border-transparent text-[#9BA0B4] hover:text-[#EDEBF4]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-10 flex-1 w-full pb-40">
          <PageTransition preset="smooth">{children}</PageTransition>
        </main>

        {/* Lyrics panel */}
        {showLyrics && (
          <div className="fixed bottom-[76px] left-0 right-0 z-40 border-t border-[#262838] bg-[#101119]/97 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 max-h-[40vh] overflow-y-auto">
              <div className="flex items-baseline justify-between border-b border-[#262838] pb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A9C0] font-[family-name:var(--font-display)]">Lyrics</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9BA0B4]">{current ? current.title : '—'}</p>
              </div>
              <pre className="mt-4 whitespace-pre-wrap font-[family-name:var(--font-inter)] text-sm leading-7 text-[#CFCDDE]">
                {current ? current.lyrics?.trim() || 'No lyrics available for this track.' : 'Play a track to see its lyrics.'}
              </pre>
            </div>
          </div>
        )}

        {/* Player bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-[#1C1D2A] z-40">
          {/* Live visualizer */}
          <div className="border-b border-white/[0.04]">
            <div ref={vizRef} className="ct-viz max-w-6xl mx-auto px-4 md:px-8 h-9" aria-hidden="true">
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 md:py-3">
            <div className="flex items-center gap-3 md:gap-6">
              {/* Left: art + meta */}
              <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-[28%]">
                <Image src={coverFor(current)} alt="" width={44} height={44} className="rounded-[10px] border border-white/10 shrink-0 w-11 h-11 object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{current ? current.title : '—'}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-[#9BA0B4] truncate">{current ? current.artist : ''}</p>
                </div>
              </div>

              {/* Center: transport + progress */}
              <div className="flex flex-col items-center gap-1.5 md:flex-1">
                <div className="flex items-center gap-3">
                  <button onClick={handlePrev} aria-label="Previous track" className="w-9 h-9 rounded-full flex items-center justify-center text-[#9BA0B4] hover:text-[#EDEBF4] transition-colors duration-200 cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
                    </svg>
                  </button>
                  <button onClick={toggleMain} aria-label={isPlaying ? 'Pause' : 'Play'} className="w-11 h-11 rounded-full bg-[#A9A3CE] text-black flex items-center justify-center hover:bg-[#EDEBF4] hover:scale-105 transition-all duration-200 cursor-pointer">
                    {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                  </button>
                  <button onClick={handleNext} aria-label="Next track" className="w-9 h-9 rounded-full flex items-center justify-center text-[#9BA0B4] hover:text-[#EDEBF4] transition-colors duration-200 cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                    </svg>
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-2 w-full max-w-md">
                  <span className="text-[11px] tabular-nums font-medium w-9 text-right text-[#9BA0B4]">{formatTime(currentTime)}</span>
                  <input type="range" min={0} max={duration || 0} step={1} value={Math.min(currentTime, duration || 0)} onChange={(e) => handleSeek(Number(e.target.value))} aria-label="Seek" className="flex-1 h-1 accent-[#A9A3CE] cursor-pointer" />
                  <span className="text-[11px] tabular-nums font-medium w-9 text-[#9BA0B4]">{duration > 0 ? formatTime(duration) : current?.duration ?? '0:00'}</span>
                </div>
              </div>

              {/* Right: lyrics + volume */}
              <div className="flex items-center gap-3 justify-end md:w-[28%]">
                <button
                  onClick={() => setShowLyrics((v) => !v)}
                  aria-label={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
                  aria-pressed={showLyrics}
                  className={`h-9 px-4 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer font-[family-name:var(--font-display)] ${
                    showLyrics ? 'border-[#C9A9C0] text-[#C9A9C0] bg-[#14121F]' : 'border-[#3B3E52] text-[#9BA0B4] hover:border-[#C9A9C0] hover:text-[#C9A9C0]'
                  }`}
                >
                  Lyrics
                </button>
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" className="hidden md:block w-20 h-1 accent-[#EDEBF4] cursor-pointer" />
              </div>
            </div>

            {/* Mobile progress row */}
            <div className="mt-2 flex md:hidden items-center gap-2">
              <span className="text-[11px] tabular-nums font-medium w-9 text-right text-[#9BA0B4]">{formatTime(currentTime)}</span>
              <input type="range" min={0} max={duration || 0} step={1} value={Math.min(currentTime, duration || 0)} onChange={(e) => handleSeek(Number(e.target.value))} aria-label="Seek" className="flex-1 h-1 accent-[#A9A3CE] cursor-pointer" />
              <span className="text-[11px] tabular-nums font-medium w-9 text-[#9BA0B4]">{duration > 0 ? formatTime(duration) : current?.duration ?? '0:00'}</span>
            </div>
          </div>
        </div>

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
