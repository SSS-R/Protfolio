'use client';

import React from 'react';
import Image from 'next/image';
import { usePlayer, PlayIcon, PauseIcon } from '../CreaTunePlayer';
import { RevealGroup, RevealItem } from '../motion';
import type { CreaTuneTrack } from '../creatune-types';

// A reusable list of tracks. Playing a row queues the whole `list`,
// so next/prev follow this context (full catalogue, album, featured, …).
export default function TrackList({
  list,
  showNumbers = true,
}: {
  list: CreaTuneTrack[];
  showNumbers?: boolean;
}) {
  const { playFrom, isPlaying, isCurrent, coverFor } = usePlayer();

  if (list.length === 0) {
    return <p className="py-12 text-sm text-[#9BA0B4]">No tracks here yet.</p>;
  }

  return (
    <RevealGroup as="ol" preset="smooth">
      {list.map((track, index) => {
        const active = isCurrent(track.id);
        return (
          <RevealItem as="li" key={track.id} preset="smooth" className="border-b border-white/[0.04] last:border-0">
            <button
              onClick={() => playFrom(list, index)}
              className={`w-full grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3.5rem_1fr_8rem_5rem_3rem] items-center gap-3 md:gap-6 py-4 px-4 md:px-6 text-left group transition-colors duration-200 cursor-pointer ${
                active ? 'bg-[#7C5CFF]/[0.08]' : 'hover:bg-white/[0.03]'
              }`}
            >
              {active && isPlaying ? (
                <span className="ct-mini-eq text-[#A9A3CE]" aria-label="Now playing">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <span
                  className={`text-xl md:text-3xl font-[family-name:var(--font-display)] font-bold tabular-nums tracking-tight ${
                    active ? 'text-[#A9A3CE]' : 'text-[#31334A] group-hover:text-[#9BA0B4]'
                  } ${showNumbers ? '' : 'opacity-0 md:opacity-100'}`}
                >
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              )}
              <span className="min-w-0 flex items-center gap-3 md:gap-4">
                <Image
                  src={coverFor(track)}
                  alt=""
                  width={44}
                  height={44}
                  className={`rounded-[10px] border shrink-0 w-11 h-11 object-cover ${active ? 'border-[#A9A3CE]/60' : 'border-white/10'}`}
                />
                <span className="min-w-0">
                  <span className="block text-base md:text-xl font-bold tracking-tight truncate">{track.title}</span>
                  <span className={`block text-xs uppercase tracking-[0.2em] mt-1 ${active ? 'text-[#C9A9C0]' : 'text-[#9BA0B4]'}`}>
                    {track.artist}
                  </span>
                </span>
              </span>
              <span className="hidden md:block text-xs font-medium tabular-nums text-[#9BA0B4]">
                {track.plays.toLocaleString()} listens
              </span>
              <span className="hidden md:block text-xs font-medium tabular-nums text-[#9BA0B4]">{track.duration}</span>
              <span
                className={`justify-self-end w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  active ? 'bg-[#A9A3CE] text-black' : 'border border-[#3B3E52] text-[#9BA0B4] group-hover:border-[#A9A3CE] group-hover:text-[#A9A3CE]'
                }`}
                aria-hidden="true"
              >
                {active && isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </span>
            </button>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
