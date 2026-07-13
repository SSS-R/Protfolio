'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlayer, LOGO_FALLBACK } from '../CreaTunePlayer';

export default function AlbumsView() {
  const { albums, tracks } = usePlayer();
  const countFor = (albumId: string) => tracks.filter((t) => t.albumId === albumId).length;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10">
      <div className="border-b border-white/10 pb-5">
        <h1 className="font-[family-name:var(--font-display)] font-semibold uppercase text-3xl md:text-5xl tracking-tight">Albums</h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#9BA0B4]">{albums.length} releases</p>
      </div>

      {albums.length === 0 ? (
        <p className="py-16 text-sm text-[#9BA0B4]">No albums yet. Singles live under Songs.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {albums.map((a) => (
            <Link key={a.id} href={`/music/albums/${a.id}`} className="group">
              <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                <Image src={a.cover || LOGO_FALLBACK} alt="" width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="mt-3 font-bold truncate">{a.title}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9BA0B4]">
                {a.year || 'Album'} · {countFor(a.id)} track{countFor(a.id) === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
