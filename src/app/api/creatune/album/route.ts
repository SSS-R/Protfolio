import { NextResponse } from 'next/server';
import { readData as readStore, writeData as writeStore } from '@/lib/store';

interface CreaTuneData {
  studio: string;
  tagline: string;
  links?: Record<string, string>;
  albums: Record<string, unknown>[];
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

// POST /api/creatune/album - Create an album (Admin only)
export async function POST(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, year, cover } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Album title is required' }, { status: 400 });
    }

    const data = await readData();
    const newAlbum = {
      id: `alb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: title.trim(),
      year: typeof year === 'string' ? year.trim() : '',
      cover: typeof cover === 'string' ? cover : '',
    };
    data.albums.push(newAlbum);
    await writeData(data);

    return NextResponse.json({ success: true, album: newAlbum });
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
  }
}

// PATCH /api/creatune/album - Edit an album (Admin only)
export async function PATCH(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, title, year, cover } = body;

    if (!id) {
      return NextResponse.json({ error: 'Album ID required' }, { status: 400 });
    }

    const data = await readData();
    const album = data.albums.find((a) => a.id === id);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    if (typeof title === 'string' && title.trim()) album.title = title.trim();
    if (typeof year === 'string') album.year = year.trim();
    if (typeof cover === 'string') album.cover = cover;

    await writeData(data);
    return NextResponse.json({ success: true, album });
  } catch (error) {
    console.error('Error editing album:', error);
    return NextResponse.json({ error: 'Failed to edit album' }, { status: 500 });
  }
}

// DELETE /api/creatune/album?id=... - Delete an album; orphaned tracks are unassigned
export async function DELETE(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Album ID required' }, { status: 400 });
    }

    const data = await readData();
    data.albums = data.albums.filter((a) => a.id !== id);
    // Detach tracks that pointed at the deleted album (tracks are never deleted here)
    data.tracks.forEach((t) => {
      if (t.albumId === id) t.albumId = '';
    });
    await writeData(data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
