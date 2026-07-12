import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/creatune.json');

// POST /api/creatune/play - Count a listen (public)
export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(content);

    const track = data.tracks.find((t: any) => t.id === id);
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    track.plays = (track.plays || 0) + 1;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, plays: track.plays });
  } catch (error) {
    console.error('Error counting play:', error);
    return NextResponse.json({ error: 'Failed to count play' }, { status: 500 });
  }
}
