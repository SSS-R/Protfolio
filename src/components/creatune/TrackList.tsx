'use client';

import { usePlayer, PlayIcon, PauseIcon, Cover } from '../CreaTunePlayer';
import type { CreaTuneTrack } from '../creatune-types';

// A reusable list of tracks. Playing a row queues the whole `list`,
// so next/prev follow this context (full catalogue, album, featured, …).
export default function TrackList({ list }: { list: CreaTuneTrack[] }) {
  const { playFrom, isPlaying, isCurrent, coverFor } = usePlayer();

  if (list.length === 0) {
    return <p className="label border-t border-line py-16 text-dim">No tracks here yet.</p>;
  }

  return (
    <ol className="border-b border-line">
      {list.map((track, index) => {
        const active = isCurrent(track.id);
        const playing = active && isPlaying;
        return (
          <li key={track.id} className="border-t border-line" data-fade>
            <button
              type="button"
              onClick={() => playFrom(list, index)}
              aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`}
              className="group grid w-full grid-cols-[1.75rem_3rem_1fr_auto] items-center gap-4 py-4 text-left md:grid-cols-[3rem_3.5rem_1fr_9rem_5rem_3rem] md:gap-6 md:py-5"
            >
              <span className={`label tabular-nums ${active ? 'text-mauve' : 'text-dim'}`}>
                {playing ? (
                  <span className="ct-eq" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
              </span>
              <Cover src={coverFor(track)} title={track.title} className="size-12 md:size-14" sizes="56px" />
              <span className="min-w-0">
                <span
                  className={`block truncate text-[19px] font-medium tracking-[-0.025em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 md:text-[26px] ${
                    active ? 'text-mauve' : ''
                  }`}
                >
                  {track.title}
                </span>
                <span className="label mt-1 block text-dim">{track.artist}</span>
              </span>
              <span className="label hidden tabular-nums text-dim md:block">{track.plays.toLocaleString()} listens</span>
              <span className="label hidden tabular-nums text-dim md:block">{track.duration}</span>
              <span
                aria-hidden="true"
                className={`grid size-10 place-items-center justify-self-end rounded-full transition-colors duration-300 ${
                  active ? 'bg-lavender text-ink' : 'border border-line text-dim group-hover:border-mauve group-hover:text-mauve'
                }`}
              >
                {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
