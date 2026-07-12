'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Track {
  id: string;
  title: string;
  duration: string;
  url: string;
}

interface MusicPlayerProps {
  initialTracks: Track[];
}

export default function MusicPlayer({ initialTracks }: MusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>(
    initialTracks.length > 0 ? initialTracks : [
      { id: "1", title: "DEFAULT_SYNTH_WAVE.mp3", duration: "03:45", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
    ]
  );
  
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load track change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        setCurrentTime(0);
      }
    }
  }, [currentTrackIdx]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio play blocked:', err);
      });
    }
  };

  const playTrack = (idx: number) => {
    if (idx === currentTrackIdx) {
      togglePlay();
    } else {
      setCurrentTrackIdx(idx);
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    nextTrack();
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border border-brand-ruled bg-surface-container-lowest p-6 md:p-8 flex flex-col gap-6 relative">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-on-surface"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-on-surface"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-on-surface"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-on-surface"></div>

      {/* CSS overrides for animated graphic equalizer */}
      <style jsx>{`
        .eq-bar {
          width: 6px;
          background-color: var(--color-brand-amber, #F5A623);
          height: 10%;
          transition: height 0.15s ease-in-out;
        }
        .eq-bar-1 { animation: eqAnimation 1.2s ease-in-out infinite alternate; }
        .eq-bar-2 { animation: eqAnimation 0.8s ease-in-out infinite alternate 0.1s; }
        .eq-bar-3 { animation: eqAnimation 1.4s ease-in-out infinite alternate 0.3s; }
        .eq-bar-4 { animation: eqAnimation 0.9s ease-in-out infinite alternate 0.2s; }
        .eq-bar-5 { animation: eqAnimation 1.1s ease-in-out infinite alternate 0.4s; }
        .eq-bar-6 { animation: eqAnimation 0.7s ease-in-out infinite alternate 0.15s; }
        .eq-bar-7 { animation: eqAnimation 1.3s ease-in-out infinite alternate 0.25s; }
        .eq-bar-8 { animation: eqAnimation 1.0s ease-in-out infinite alternate 0.35s; }

        @keyframes eqAnimation {
          0% { height: 10%; }
          100% { height: 90%; }
        }
      `}</style>

      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Header */}
      <div className="w-full flex justify-between items-center border-b border-brand-ruled pb-4">
        <div className="flex items-center gap-2 text-brand-amber font-pixel-label text-[10px]">
          <span className="material-symbols-outlined text-[14px]">music_note</span>
          <span>AUDIO_DECK_V2.1</span>
        </div>
        <div className="text-on-surface-variant font-code-sm text-xs uppercase">
          {isPlaying ? 'STREAMING_ONLINE' : 'DECK_STANDBY'}
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Equalizer Panel */}
        <div className="md:col-span-4 h-24 border border-brand-ruled bg-background flex items-end justify-between p-4 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[8px] font-pixel-label text-secondary uppercase">
            SPEC_ANA
          </div>
          <div className="flex gap-2 w-full h-full items-end pt-4 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className={`eq-bar eq-bar-${i + 1}`}
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              />
            ))}
          </div>
        </div>

        {/* Current track information */}
        <div className="md:col-span-8 flex flex-col gap-2 font-code-sm">
          <p className="text-pixel-label font-pixel-label text-secondary text-[8px] uppercase">
            NOW_PLAYING
          </p>
          <h3 className="text-primary font-bold text-sm md:text-base uppercase truncate">
            {currentTrack.title}
          </h3>
          <div className="flex justify-between items-center text-xs text-secondary mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || parseFloat(currentTrack.duration.split(':')[0]) * 60)}</span>
          </div>
        </div>

      </div>

      {/* Progress & Controls Console */}
      <div className="flex flex-col gap-4 border-t border-brand-ruled pt-4">
        
        {/* Progress seek slider */}
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressBarChange}
          className="w-full accent-brand-amber bg-surface-container-high h-1 appearance-none cursor-pointer outline-none"
        />

        {/* Buttons and volume controller */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Deck Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={prevTrack}
              className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:border-brand-amber hover:text-brand-amber transition-none text-secondary cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">skip_previous</span>
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-12 h-10 border border-brand-amber bg-brand-amber text-background flex items-center justify-center transition-none font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button 
              onClick={nextTrack}
              className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:border-brand-amber hover:text-brand-amber transition-none text-secondary cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">skip_next</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 w-full sm:w-auto font-code-sm">
            <span className="material-symbols-outlined text-secondary text-base">
              {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
            </span>
            <input 
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-brand-amber bg-surface-container-high h-1 appearance-none cursor-pointer outline-none"
            />
            <span className="text-[10px] text-secondary font-pixel-label w-8 text-right">
              {Math.round(volume * 100)}
            </span>
          </div>

        </div>

      </div>

      {/* Playlist Selector Grid */}
      <div className="flex flex-col gap-3 border-t border-brand-ruled pt-4">
        <h4 className="text-secondary font-pixel-label text-[8px] uppercase tracking-widest mb-1">
          TRACKLIST_INTEGRATION
        </h4>
        <div className="flex flex-col gap-px bg-[#333]">
          {tracks.map((track, idx) => {
            const isActive = idx === currentTrackIdx;
            return (
              <div 
                key={track.id}
                onClick={() => playTrack(idx)}
                className={`flex justify-between items-center p-3 font-code-sm cursor-pointer select-none text-xs ${
                  isActive 
                    ? 'bg-brand-amber/10 text-brand-amber border-l-2 border-brand-amber' 
                    : 'bg-background text-secondary hover:text-primary hover:bg-[#111]'
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-4">
                  <span className="text-[10px] font-pixel-label text-secondary">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-bold uppercase truncate">{track.title}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-pixel-label text-[8px]">
                  <span>{track.duration}</span>
                  <span className="material-symbols-outlined text-sm">
                    {isActive && isPlaying ? 'equalizer' : 'play_arrow'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
