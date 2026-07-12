'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCurtain } from './ClientLayout';

export interface CreaTuneTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  plays: number;
  lyrics?: string;
}

export interface CreaTuneLinks {
  soundcloud?: string;
  youtube?: string;
  album?: string;
}

interface ClientCreaTuneProps {
  studio: string;
  tagline: string;
  links: CreaTuneLinks;
  initialTracks: CreaTuneTrack[];
}

/* Palette lifted from the CreaTune logos:
   ink #0C0D13 · surface #13141D · line #262838 · text #EDEBF4
   muted #9BA0B4 · lavender #A9A3CE · dusty pink #C9A9C0 · blue-grey #565C7E */

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Deterministic waveform silhouette (same on server & client — hydration safe)
const WAVE_BARS = Array.from({ length: 72 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 0.55 + 0.4));
  const b = Math.abs(Math.sin(i * 0.13 + 1.2));
  const mid = Math.exp(-Math.pow((i - 36) / 22, 2)); // swell toward the center
  return Math.round(6 + 88 * a * (0.25 + 0.75 * b) * (0.3 + 0.7 * mid));
});

function waveColor(i: number, alpha: string) {
  if (i % 7 === 0) return `linear-gradient(180deg, #C9A9C0${alpha}, #C9A9C011)`; // dusty pink
  if (i % 3 === 0) return `linear-gradient(180deg, #A9A3CE${alpha}, #A9A3CE11)`; // lavender
  return `linear-gradient(180deg, #565C7E${alpha}, #565C7E11)`; // blue-grey
}

const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

const SoundCloudIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.56 8.87V17h8.76c1.85-.13 3.18-1.65 3.18-3.44 0-1.9-1.54-3.44-3.44-3.44-.5 0-.97.11-1.39.29-.28-3.14-2.92-5.6-6.13-5.6-.79 0-1.55.15-2.24.43-.27.1-.34.21-.34.42v2.97l1.6.24zM10.3 9.24c-.1 0-.18.08-.19.18l-.36 3.76.36 3.63c.01.1.09.18.19.18s.18-.08.19-.18l.41-3.63-.41-3.76c-.01-.1-.09-.18-.19-.18zM8.83 9.89c-.1 0-.17.07-.18.17l-.31 3.12.31 3.04c.01.1.08.17.18.17.09 0 .17-.07.18-.17l.36-3.04-.36-3.12c-.01-.1-.09-.17-.18-.17zM7.36 10.42c-.09 0-.16.07-.17.16l-.27 2.6.27 2.56c.01.09.08.16.17.16s.16-.07.17-.16l.31-2.56-.31-2.6c-.01-.09-.08-.16-.17-.16zM5.9 10.87c-.08 0-.15.06-.16.15l-.23 2.16.23 2.13c.01.09.08.15.16.15s.15-.06.16-.15l.27-2.13-.27-2.16c-.01-.09-.08-.15-.16-.15zM4.45 11.51c-.08 0-.14.06-.15.14l-.19 1.53.19 1.5c.01.08.07.14.15.14s.14-.06.15-.14l.22-1.5-.22-1.53c-.01-.08-.07-.14-.15-.14zM3.02 12.06c-.07 0-.13.05-.14.13l-.16.99.16.96c.01.08.07.13.14.13s.13-.05.14-.13l.18-.96-.18-.99c-.01-.08-.07-.13-.14-.13z" />
  </svg>
);

const YouTubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.42V8.58L15.83 12 9.6 15.42z" />
  </svg>
);

const AlbumIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 14.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>
);

export default function ClientCreaTune({ studio, tagline, links, initialTracks }: ClientCreaTuneProps) {
  const { navigateWithCurtain } = useCurtain();
  const [tracks, setTracks] = useState<CreaTuneTrack[]>(initialTracks);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showLyrics, setShowLyrics] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountedRef = useRef<string | null>(null);

  const currentTrack = currentIndex !== null ? tracks[currentIndex] : null;

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

  const playTrack = useCallback(
    (index: number) => {
      const audio = audioRef.current;
      const track = tracks[index];
      if (!audio || !track) return;

      if (currentIndex === index) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
        return;
      }

      setCurrentIndex(index);
      audio.src = track.url;
      audio.load();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          countPlay(track);
        })
        .catch(() => setIsPlaying(false));
    },
    [tracks, currentIndex, isPlaying, countPlay]
  );

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    const next = currentIndex === null ? 0 : (currentIndex + 1) % tracks.length;
    playTrack(next);
  }, [tracks.length, currentIndex, playTrack]);

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prev = currentIndex === null ? 0 : (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(prev);
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const socialLinks = [
    { label: 'SoundCloud', href: links.soundcloud, icon: SoundCloudIcon },
    { label: 'YouTube', href: links.youtube, icon: YouTubeIcon },
    { label: 'Album', href: links.album, icon: AlbumIcon },
  ].filter((l) => l.href);

  return (
    <div className="ct-scope min-h-screen bg-[#0C0D13] text-[#EDEBF4] font-[family-name:var(--font-inter)] selection:bg-[#A9A3CE] selection:text-[#0C0D13] flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[#262838] sticky top-0 bg-[#0C0D13]/95 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <span className="text-2xl font-[family-name:var(--font-script)] text-[#EDEBF4]">
            {studio}
          </span>
          <nav className="flex items-center gap-2 md:gap-5 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)]">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-[#9BA0B4] hover:text-[#C9A9C0] transition-colors duration-200"
              >
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
              className="border border-[#3B3E52] px-3 md:px-4 py-2 hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors duration-200"
            >
              ← Portfolio
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full pb-44">
        {/* Hero — banner recreation: spaced caps over the glowing waveform */}
        <section className="border-b border-[#262838] relative overflow-hidden bg-[radial-gradient(ellipse_at_center,#15161f_0%,#0C0D13_70%)]">
          {/* Waveform glow layer (soft, blurred — like the banner) */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-[3px] px-2 pointer-events-none blur-xl opacity-70"
            aria-hidden="true"
          >
            {WAVE_BARS.map((h, i) => (
              <span key={i} className="flex-1 rounded-full" style={{ height: `${h * 2.4}px`, background: waveColor(i, '66') }} />
            ))}
          </div>
          {/* Waveform sharp layer */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-[3px] px-2 pointer-events-none opacity-55"
            aria-hidden="true"
          >
            {WAVE_BARS.map((h, i) => (
              <span key={i} className="flex-1 rounded-full" style={{ height: `${h * 2.2}px`, background: waveColor(i, '55') }} />
            ))}
          </div>

          {/* Ring logo mark (signature-in-a-circle, like the avatar) */}
          <div
            className="hidden md:flex absolute top-10 right-10 w-28 h-28 rounded-full border border-[#EDEBF4]/30 items-center justify-center rotate-[-8deg] pointer-events-none"
            aria-hidden="true"
          >
            <span className="font-[family-name:var(--font-script)] text-3xl text-[#EDEBF4]/75">{studio}</span>
          </div>

          <div className="max-w-6xl mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-28 relative">
            <h1
              className="text-center font-[family-name:var(--font-display)] font-semibold uppercase text-[9vw] md:text-6xl lg:text-7xl tracking-[0.4em] md:tracking-[0.5em] -mr-[0.4em] leading-none"
              style={{ textShadow: '0 0 36px rgba(169,163,206,0.35), 0 0 90px rgba(201,169,192,0.18)' }}
            >
              {studio}
            </h1>
            <p className="mt-7 text-center text-[11px] uppercase tracking-[0.35em] text-[#9BA0B4] font-[family-name:var(--font-display)]">
              {tagline}
            </p>
          </div>
        </section>

        {/* Studio strip: links + catalogue + live EQ */}
        <section className="border-b border-[#262838]">
          <div className="max-w-6xl mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262838] border-x border-[#262838]">
            <div className="bg-[#0C0D13] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9BA0B4] font-[family-name:var(--font-display)]">
                Listen elsewhere
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {socialLinks.length > 0 ? (
                  socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-bold hover:text-[#C9A9C0] transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                      <span className="ml-auto text-[#3B3E52]">↗</span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-[#9BA0B4]">Links coming soon.</p>
                )}
              </div>
            </div>
            <div className="bg-[#0C0D13] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9BA0B4] font-[family-name:var(--font-display)]">Catalogue</p>
              <p className="mt-3 text-5xl font-[family-name:var(--font-display)] font-bold tracking-tight tabular-nums text-[#A9A3CE]">
                {tracks.length.toString().padStart(2, '0')}
              </p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#9BA0B4] mt-1 font-[family-name:var(--font-display)]">Original tracks</p>
            </div>
            <div className="bg-[#13141D] text-[#A9A3CE] p-5 h-32 md:h-auto">
              <div className={`ct-eq ${isPlaying ? '' : 'ct-eq-paused'}`} aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Track list */}
        <section className="max-w-6xl mx-auto px-5 md:px-8 mt-12">
          <div className="flex items-baseline justify-between border-b-2 border-[#EDEBF4] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] font-[family-name:var(--font-display)]">Tracks</h2>
            <span className="text-xs font-bold tabular-nums">({tracks.length.toString().padStart(2, '0')})</span>
          </div>

          {tracks.length === 0 ? (
            <p className="py-12 text-sm text-[#9BA0B4]">No tracks published yet. Check back soon.</p>
          ) : (
            <ol>
              {tracks.map((track, index) => {
                const isCurrent = currentIndex === index;
                return (
                  <li key={track.id} className="border-b border-[#262838]">
                    <button
                      onClick={() => playTrack(index)}
                      className={`w-full grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[4rem_1fr_8rem_5rem_3rem] items-center gap-3 md:gap-6 py-5 text-left group transition-colors duration-200 cursor-pointer px-4 -mx-4 ${
                        isCurrent ? 'bg-[#13141D] border-l-2 border-[#A9A3CE]' : 'hover:bg-[#101119]'
                      }`}
                    >
                      <span
                        className={`text-2xl md:text-4xl font-[family-name:var(--font-display)] font-bold tabular-nums tracking-tight ${
                          isCurrent ? 'text-[#A9A3CE]' : 'text-[#31334A] group-hover:text-[#9BA0B4]'
                        }`}
                      >
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base md:text-xl font-bold tracking-tight truncate">{track.title}</span>
                        <span className={`block text-xs uppercase tracking-[0.2em] mt-1 ${isCurrent ? 'text-[#C9A9C0]' : 'text-[#9BA0B4]'}`}>
                          {track.artist}
                        </span>
                      </span>
                      <span className="hidden md:block text-xs font-medium tabular-nums text-[#9BA0B4]">
                        {track.plays.toLocaleString()} listens
                      </span>
                      <span className="hidden md:block text-xs font-medium tabular-nums text-[#9BA0B4]">{track.duration}</span>
                      <span className={`justify-self-end ${isCurrent ? 'text-[#A9A3CE]' : ''}`} aria-hidden="true">
                        {isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Footer note */}
        <section className="max-w-6xl mx-auto px-5 md:px-8 mt-16 text-[11px] uppercase tracking-[0.2em] text-[#9BA0B4] flex flex-col md:flex-row justify-between gap-2 font-[family-name:var(--font-display)]">
          <span>© 2026 {studio} — All sound, one desk.</span>
          <span className="font-[family-name:var(--font-script)] normal-case tracking-normal text-base text-[#EDEBF4]/60">{studio}</span>
        </section>
      </main>

      {/* Lyrics panel */}
      {showLyrics && (
        <div className="fixed bottom-[76px] left-0 right-0 z-40 border-t border-[#262838] bg-[#101119]/97 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 max-h-[40vh] overflow-y-auto">
            <div className="flex items-baseline justify-between border-b border-[#262838] pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A9C0] font-[family-name:var(--font-display)]">Lyrics</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#9BA0B4]">
                {currentTrack ? currentTrack.title : '—'}
              </p>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-[family-name:var(--font-inter)] text-sm leading-7 text-[#CFCDDE]">
              {currentTrack
                ? currentTrack.lyrics?.trim() || 'No lyrics available for this track.'
                : 'Play a track to see its lyrics.'}
            </pre>
          </div>
        </div>
      )}

      {/* Player bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#101119] border-t border-[#262838] z-40">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Now playing */}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9BA0B4] font-[family-name:var(--font-display)]">Now Playing</p>
            <p className="text-sm font-bold truncate">
              {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'Select a track'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous track"
              className="w-9 h-9 border border-[#3B3E52] flex items-center justify-center hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={() => (currentIndex === null ? playTrack(0) : playTrack(currentIndex))}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-12 h-12 bg-[#A9A3CE] text-[#0C0D13] flex items-center justify-center hover:bg-[#EDEBF4] transition-colors duration-200 cursor-pointer"
              style={{ boxShadow: '0 0 24px rgba(169,163,206,0.35)' }}
            >
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={handleNext}
              aria-label="Next track"
              className="w-9 h-9 border border-[#3B3E52] flex items-center justify-center hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
              </svg>
            </button>
            <button
              onClick={() => setShowLyrics((v) => !v)}
              aria-label={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
              aria-pressed={showLyrics}
              className={`h-9 px-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer font-[family-name:var(--font-display)] ${
                showLyrics
                  ? 'border-[#C9A9C0] text-[#C9A9C0] bg-[#13141D]'
                  : 'border-[#3B3E52] text-[#9BA0B4] hover:border-[#C9A9C0] hover:text-[#C9A9C0]'
              }`}
            >
              Lyrics
            </button>
          </div>

          {/* Progress + volume */}
          <div className="hidden md:flex items-center gap-4 justify-end">
            <span className="text-xs tabular-nums font-medium w-10 text-right text-[#9BA0B4]">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              aria-label="Seek"
              className="w-48 accent-[#A9A3CE] cursor-pointer"
            />
            <span className="text-xs tabular-nums font-medium w-10 text-[#9BA0B4]">{formatTime(duration)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-20 accent-[#EDEBF4] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleNext}
      />
    </div>
  );
}
