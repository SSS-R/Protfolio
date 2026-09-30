'use client';

import Link from 'next/link';
import { usePlayer, Cover } from '../CreaTunePlayer';

export default function AlbumsView() {
  const { albums, tracks } = usePlayer();
  const countFor = (albumId: string) => tracks.filter((t) => t.albumId === albumId).length;

  return (
    <div className="px-5 pt-36 md:px-10 md:pt-44">
      <p className="label text-mauve" data-scramble>
        (Releases)
      </p>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 data-split className="display-wide text-[19vw] md:text-[12vw]">
          Albums
        </h1>
        <p className="label text-dim md:mb-4" data-fade>
          {String(albums.length).padStart(2, '0')} releases
        </p>
      </div>

      {albums.length === 0 ? (
        <div className="mt-14 border-t border-line pt-10 md:mt-20" data-fade>
          <p className="max-w-[24ch] text-[8vw] font-medium leading-[1] tracking-[-0.04em] text-dim md:text-[3.2vw]">
            No albums yet. Every release so far is a single.
          </p>
          <Link href="/music/tracks" className="label u-link mt-8 inline-block">
            Browse the songs ↗
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:mt-20 lg:grid-cols-4">
          {albums.map((a) => (
            <Link key={a.id} href={`/music/albums/${a.id}`} className="group" data-fade>
              <Cover src={a.cover || ''} title={a.title} className="aspect-square w-full transition-transform duration-700 group-hover:scale-[0.98]" sizes="(min-width: 1024px) 25vw, 50vw" />
              <p className="mt-4 truncate text-[20px] font-medium tracking-[-0.02em]">{a.title}</p>
              <p className="label mt-1 text-dim">
                {a.year || 'Album'} — {countFor(a.id)} track{countFor(a.id) === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
