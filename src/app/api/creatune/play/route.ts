import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

interface CreaTuneData {
  tracks: { id: string; plays?: number }[];
  [k: string]: unknown;
}

// POST /api/creatune/play - Count a listen (public)
export async function POST(request: Request) {
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
