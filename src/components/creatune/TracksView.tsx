'use client';

import React from 'react';
import { usePlayer, PlayIcon } from '../CreaTunePlayer';
import TrackList from './TrackList';
import { Reveal } from '../motion';

export default function TracksView() {
  const { tracks, playFrom } = usePlayer();
  const totalListens = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10">
      <Reveal preset="smooth" className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-[family-name:var(--font-display)] font-semibold uppercase text-3xl md:text-5xl tracking-tight">All songs</h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#9BA0B4]">
            {tracks.length} tracks · {totalListens.toLocaleString()} total listens
          </p>
        </div>
        {tracks.length > 0 && (
          <button
            onClick={() => playFrom(tracks, 0)}
            className="rounded-full bg-[#A9A3CE] text-black pl-5 pr-6 py-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)] hover:bg-[#EDEBF4] transition-colors duration-200 cursor-pointer"
            style={{ boxShadow: '0 0 32px rgba(169,163,206,0.35)' }}
          >
            <PlayIcon className="w-4 h-4" />
            Play all
          </button>
        )}
      </Reveal>
      <Reveal preset="smooth" delay={0.08} className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <TrackList list={tracks} />
      </Reveal>
    </div>
  );
}
