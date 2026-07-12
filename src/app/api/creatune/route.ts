import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/creatune.json');

async function readData() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { studio: 'CreaTune', tagline: '', tracks: [] };
  }
}

async function writeData(data: any) {
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

// GET /api/creatune - Public track list
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
    const { title, artist, duration, url, lyrics } = body;

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
    };
    data.tracks.push(newTrack);
    await writeData(data);

    return NextResponse.json({ success: true, track: newTrack });
  } catch (error) {
    console.error('Error adding track:', error);
    return NextResponse.json({ error: 'Failed to add track' }, { status: 500 });
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
    data.tracks = data.tracks.filter((t: any) => t.id !== id);
    await writeData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}
