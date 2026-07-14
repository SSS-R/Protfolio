import { NextResponse } from 'next/server';
import { readData as readStore, writeData as writeStore } from '@/lib/store';
import { requireAdmin } from '@/lib/auth';

interface CreaTuneData {
  studio: string;
  tagline: string;
  links?: Record<string, string>;
  news?: Record<string, unknown>;
  nextRelease?: Record<string, unknown>;
  albums: unknown[];
  tracks: Record<string, unknown>[];
}

const EMPTY: CreaTuneData = { studio: 'CreaTune', tagline: '', albums: [], tracks: [] };

async function readData(): Promise<CreaTuneData> {
  const data = await readStore<CreaTuneData>('creatune', EMPTY);
  return { ...EMPTY, ...data };
}

async function writeData(data: CreaTuneData) {
  await writeStore('creatune', data);
}

// GET /api/creatune - Public catalogue (tracks + albums)
export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

// POST /api/creatune - Add a track (Admin only)
export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, artist, duration, url, lyrics, cover, albumId } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and audio URL are required' }, { status: 400 });
    }

    const data = await readData();
    const newTrack = {
      id: `trk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title,
      artist: artist || 'CreaTune',
      duration: duration || '--:--',
      url,
      plays: 0,
      lyrics: typeof lyrics === 'string' ? lyrics : '',
      cover: typeof cover === 'string' ? cover : '',
      albumId: typeof albumId === 'string' ? albumId : '',
    };
    data.tracks.push(newTrack);
    await writeData(data);

    return NextResponse.json({ success: true, track: newTrack });
  } catch (error) {
    console.error('Error adding track:', error);
    return NextResponse.json({ error: 'Failed to add track' }, { status: 500 });
  }
}

// PATCH /api/creatune - Edit a track's metadata (Admin only)
export async function PATCH(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, title, artist, lyrics, cover, albumId, featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    const data = await readData();
    const track = data.tracks.find((t) => t.id === id);
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Only overwrite fields that were actually provided
    if (typeof title === 'string' && title.trim()) track.title = title.trim();
    if (typeof artist === 'string') track.artist = artist.trim() || 'CreaTune';
    if (typeof lyrics === 'string') track.lyrics = lyrics;
    if (typeof cover === 'string') track.cover = cover;
    if (typeof albumId === 'string') track.albumId = albumId;
    if (typeof featured === 'boolean') track.featured = featured;

    await writeData(data);
    return NextResponse.json({ success: true, track });
  } catch (error) {
    console.error('Error editing track:', error);
    return NextResponse.json({ error: 'Failed to edit track' }, { status: 500 });
  }
}

// DELETE /api/creatune?id=... - Remove a track (Admin only)
export async function DELETE(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    const data = await readData();
    data.tracks = data.tracks.filter((t) => t.id !== id);
    await writeData(data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}
