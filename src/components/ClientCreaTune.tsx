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
}

interface ClientCreaTuneProps {
  studio: string;
  tagline: string;
  initialTracks: CreaTuneTrack[];
}

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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

export default function ClientCreaTune({ studio, tagline, initialTracks }: ClientCreaTuneProps) {
  const { navigateWithCurtain } = useCurtain();
  const [tracks, setTracks] = useState<CreaTuneTrack[]>(initialTracks);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

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

  return (
    <div className="min-h-screen bg-[#F4F2ED] text-[#111111] font-[family-name:var(--font-inter)] selection:bg-[#111111] selection:text-[#F4F2ED] flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[#111111] sticky top-0 bg-[#F4F2ED] z-40">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight italic">
            {studio}<sup className="not-italic text-[10px] align-super">®</sup>
          </span>
          <nav className="flex items-center gap-3 md:gap-6 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link href="/music/admin" className="hover:underline underline-offset-4">
              Admin
            </Link>
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateWithCurtain('/');
              }}
              className="border border-[#111111] px-3 md:px-4 py-2 hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors"
            >
              ← Portfolio
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full pb-40">
        {/* Hero */}
        <section className="border-b border-[#111111]">
          <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-10">
            <h1 className="font-extrabold tracking-tighter leading-[0.85] text-[18vw] md:text-[9rem] uppercase">
              Crea<span className="text-[#4F3DED]">Tune</span>
            </h1>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#111111] border border-[#111111]">
              <div className="bg-[#F4F2ED] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666]">Studio</p>
                <p className="mt-2 text-sm font-medium leading-snug">{tagline}</p>
              </div>
              <div className="bg-[#F4F2ED] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666]">Base</p>
                <p className="mt-2 text-sm font-medium">Dhaka, Bangladesh</p>
                <p className="text-sm font-medium">Est. 2026</p>
              </div>
              <div className="bg-[#111111] text-[#4F3DED] p-5 h-28 md:h-auto">
                <div className={`ct-eq ${isPlaying ? '' : 'ct-eq-paused'}`} aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Track list */}
        <section className="max-w-6xl mx-auto px-5 md:px-8 mt-12">
          <div className="flex items-baseline justify-between border-b-2 border-[#111111] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Tracks</h2>
            <span className="text-xs font-bold tabular-nums">({tracks.length.toString().padStart(2, '0')})</span>
          </div>

          {tracks.length === 0 ? (
            <p className="py-12 text-sm text-[#666]">No tracks published yet. Check back soon.</p>
          ) : (
            <ol>
              {tracks.map((track, index) => {
                const isCurrent = currentIndex === index;
                return (
                  <li key={track.id} className="border-b border-[#c9c5ba]">
                    <button
                      onClick={() => playTrack(index)}
                      className={`w-full grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[4rem_1fr_8rem_5rem_3rem] items-center gap-3 md:gap-6 py-5 text-left group transition-colors cursor-pointer ${
                        isCurrent ? 'bg-[#111111] text-[#F4F2ED] px-4 -mx-4' : 'hover:bg-[#e9e6de] px-4 -mx-4'
                      }`}
                    >
                      <span className={`text-2xl md:text-4xl font-extrabold tabular-nums tracking-tighter ${isCurrent ? 'text-[#4F3DED]' : 'text-[#c9c5ba] group-hover:text-[#111111]'}`}>
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base md:text-xl font-bold tracking-tight truncate">{track.title}</span>
                        <span className={`block text-xs uppercase tracking-[0.2em] mt-1 ${isCurrent ? 'text-[#9a94ff]' : 'text-[#666]'}`}>
                          {track.artist}
                        </span>
                      </span>
                      <span className={`hidden md:block text-xs font-medium tabular-nums ${isCurrent ? 'text-[#9a94ff]' : 'text-[#666]'}`}>
                        {track.plays.toLocaleString()} listens
                      </span>
                      <span className="hidden md:block text-xs font-medium tabular-nums">{track.duration}</span>
                      <span className="justify-self-end" aria-hidden="true">
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
        <section className="max-w-6xl mx-auto px-5 md:px-8 mt-16 text-[11px] uppercase tracking-[0.2em] text-[#666] flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 {studio} — All sound, one desk.</span>
          <span>A studio by Sultan Sajed Shahriar</span>
        </section>
      </main>

      {/* Player bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F4F2ED] border-t border-[#111111] z-40">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Now playing */}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666]">Now Playing</p>
            <p className="text-sm font-bold truncate">
              {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'Select a track'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous track"
              className="w-9 h-9 border border-[#111111] flex items-center justify-center hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={() => (currentIndex === null ? playTrack(0) : playTrack(currentIndex))}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-12 h-12 bg-[#111111] text-[#F4F2ED] flex items-center justify-center hover:bg-[#4F3DED] transition-colors cursor-pointer"
            >
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={handleNext}
              aria-label="Next track"
              className="w-9 h-9 border border-[#111111] flex items-center justify-center hover:bg-[#111111] hover:text-[#F4F2ED] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
              </svg>
            </button>
          </div>

          {/* Progress + volume */}
          <div className="hidden md:flex items-center gap-4 justify-end">
            <span className="text-xs tabular-nums font-medium w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              aria-label="Seek"
              className="w-48 accent-[#4F3DED] cursor-pointer"
            />
            <span className="text-xs tabular-nums font-medium w-10">{formatTime(duration)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-20 accent-[#111111] cursor-pointer"
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
