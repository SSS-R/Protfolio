import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/creatune.json');

interface CreaTuneData {
  studio: string;
  tagline: string;
  links?: Record<string, string>;
  news?: Record<string, unknown>;
  nextRelease?: Record<string, unknown>;
  albums: unknown[];
  tracks: Record<string, unknown>[];
}

async function readData(): Promise<CreaTuneData> {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return { albums: [], tracks: [], studio: 'CreaTune', tagline: '', ...parsed };
  } catch {
    return { studio: 'CreaTune', tagline: '', albums: [], tracks: [] };
  }
}

async function writeData(data: CreaTuneData) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function checkAuth(request: Request): NextResponse | null {
  const headerPassword = request.headers.get('x-admin-password');
  const systemPassword = process.env.ADMIN_PASSWORD;

  if (!systemPassword) {
    return NextResponse.json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' }, { status: 500 });
  }
  if (headerPassword !== systemPassword) {
    return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
  }
  return null;
}

// GET /api/creatune - Public catalogue (tracks + albums)
export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

// POST /api/creatune - Add a track (Admin only)
export async function POST(request: Request) {
  const authError = checkAuth(request);
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
  const authError = checkAuth(request);
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
  const authError = checkAuth(request);
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
