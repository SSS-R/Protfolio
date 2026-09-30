'use client';

import Link from 'next/link';
import { usePlayer, PlayIcon, Cover, PRIMARY_BUTTON } from '../CreaTunePlayer';
import TrackList from './TrackList';

export default function AlbumDetailView({ albumId }: { albumId: string }) {
  const { albums, tracks, playFrom } = usePlayer();
  const album = albums.find((a) => a.id === albumId);
  const albumTracks = tracks.filter((t) => t.albumId === albumId);

  if (!album) {
    return (
      <div className="px-5 pt-44 md:px-10">
        <p className="label text-mauve">Error 404</p>
        <h1 className="display-wide mt-4 text-[12vw] md:text-[7vw]">No such album</h1>
        <Link href="/music/albums" className="label u-link mt-8 inline-block">
          ← Back to albums
        </Link>
      </div>
    );
  }

  const totalListens = albumTracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  return (
    <div className="px-5 pt-32 md:px-10 md:pt-40">
      <Link href="/music/albums" className="label u-link text-dim hover:text-bone">
        ← Albums
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-6">
        <div data-clip className="md:col-span-5">
          <Cover src={album.cover || ''} title={album.title} className="aspect-square w-full" sizes="(min-width: 768px) 40vw, 100vw" />
        </div>
        <div className="flex flex-col justify-end md:col-span-6 md:col-start-7">
          <p className="label text-mauve">(Album{album.year ? ` — ${album.year}` : ''})</p>
          <h1 data-split className="mt-5 break-words text-[13vw] font-medium leading-[0.92] tracking-[-0.05em] md:text-[6vw]">
            {album.title}
          </h1>
          <p className="label mt-8 text-dim" data-fade>
            {albumTracks.length} track{albumTracks.length === 1 ? '' : 's'} — {totalListens.toLocaleString()} listens
          </p>
          {albumTracks.length > 0 ? (
            <button type="button" onClick={() => playFrom(albumTracks, 0)} data-magnetic className={`${PRIMARY_BUTTON} mt-8 self-start`}>
              <PlayIcon className="size-4" />
              Play album
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-16 md:mt-24">
        <TrackList list={albumTracks} />
      </div>
    </div>
  );
}
