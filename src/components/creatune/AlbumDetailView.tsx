'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlayer, PlayIcon, LOGO_FALLBACK } from '../CreaTunePlayer';
import TrackList from './TrackList';

export default function AlbumDetailView({ albumId }: { albumId: string }) {
  const { albums, tracks, playFrom } = usePlayer();
  const album = albums.find((a) => a.id === albumId);
  const albumTracks = tracks.filter((t) => t.albumId === albumId);

  if (!album) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 text-center">
        <p className="text-lg font-bold">Album not found.</p>
        <Link href="/music/albums" className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#A9A3CE] hover:text-[#EDEBF4]">
          ← Back to albums
        </Link>
      </div>
    );
  }

  const totalListens = albumTracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10">
      <Link href="/music/albums" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9BA0B4] hover:text-[#A9A3CE] transition-colors">
        ← Albums
      </Link>

      {/* Album header */}
      <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-end gap-6 border-b border-white/10 pb-8">
        <Image src={album.cover || LOGO_FALLBACK} alt="" width={200} height={200} className="rounded-2xl border border-white/10 object-cover w-40 h-40 md:w-52 md:h-52 shrink-0" style={{ boxShadow: '0 0 60px rgba(169,163,206,0.25)' }} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A9C0] font-[family-name:var(--font-display)]">Album</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] font-bold text-3xl md:text-5xl tracking-tight break-words">{album.title}</h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#9BA0B4]">
            {album.year ? `${album.year} · ` : ''}{albumTracks.length} track{albumTracks.length === 1 ? '' : 's'} · {totalListens.toLocaleString()} listens
          </p>
          {albumTracks.length > 0 && (
            <button
              onClick={() => playFrom(albumTracks, 0)}
              className="mt-5 rounded-full bg-[#A9A3CE] text-black pl-5 pr-6 py-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)] hover:bg-[#EDEBF4] transition-colors duration-200 cursor-pointer"
              style={{ boxShadow: '0 0 32px rgba(169,163,206,0.35)' }}
            >
              <PlayIcon className="w-4 h-4" />
              Play album
            </button>
          )}
        </div>
      </div>

      {/* Album tracks */}
      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        {albumTracks.length === 0 ? (
          <p className="px-6 py-12 text-sm text-[#9BA0B4]">No tracks assigned to this album yet.</p>
        ) : (
          <TrackList list={albumTracks} />
        )}
      </div>
    </div>
  );
}
