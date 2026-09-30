import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

interface CreaTuneData {
  tracks: { id: string; plays?: number }[];
  [k: string]: unknown;
}

// POST /api/creatune/play - Count a listen (public)
export async function POST(request: Request) {
  // On Vercel every count would be a Blob put(). The Hobby plan allows 2,000 writes
  // a month and then blocks Blob for 30 days, so anyone hammering this public route
  // could take the music offline. Counts are therefore not persisted in production
  // (the player still bumps the number live for the visitor).
  // ponytail: frozen counts on Vercel; use a Redis counter if they ever matter.
  if (process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ success: true });

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    const data = await readData<CreaTuneData>('creatune', { tracks: [] });
    const track = data.tracks.find((t) => t.id === id);
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    track.plays = (track.plays || 0) + 1;
    await writeData('creatune', data);

    return NextResponse.json({ success: true, plays: track.plays });
  } catch (error) {
    console.error('Error counting play:', error);
    return NextResponse.json({ error: 'Failed to count play' }, { status: 500 });
  }
}
