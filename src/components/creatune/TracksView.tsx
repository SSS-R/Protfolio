'use client';

import { usePlayer, PlayIcon, PRIMARY_BUTTON } from '../CreaTunePlayer';
import TrackList from './TrackList';

export default function TracksView() {
  const { tracks, playFrom } = usePlayer();
  const totalListens = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  return (
    <div className="px-5 pt-36 md:px-10 md:pt-44">
      <p className="label text-mauve" data-scramble>
        (Catalogue)
      </p>
      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <h1 data-split className="display-wide text-[19vw] md:text-[12vw]">
          Songs
        </h1>
        <div className="flex flex-wrap items-center gap-6 md:mb-3" data-fade>
          <p className="label text-dim">
            {String(tracks.length).padStart(2, '0')} tracks — {totalListens.toLocaleString()} listens
          </p>
          {tracks.length > 0 ? (
            <button type="button" onClick={() => playFrom(tracks, 0)} data-magnetic className={PRIMARY_BUTTON}>
              <PlayIcon className="size-4" />
              Play all
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-14 md:mt-20">
        <TrackList list={tracks} />
      </div>
    </div>
  );
}
