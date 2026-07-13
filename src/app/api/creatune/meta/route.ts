import { NextResponse } from 'next/server';
import { readData as readStore, writeData as writeStore } from '@/lib/store';

interface CreaTuneData {
  studio: string;
  tagline: string;
  links?: Record<string, string>;
  news?: Record<string, unknown>;
  nextRelease?: Record<string, unknown>;
  albums: unknown[];
  tracks: unknown[];
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

// PATCH /api/creatune/meta - Update landing-page content: news + next release (Admin only)
export async function PATCH(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { news, nextRelease } = body;

    const data = await readData();

    if (news && typeof news === 'object') {
      data.news = {
        title: typeof news.title === 'string' ? news.title : '',
        body: typeof news.body === 'string' ? news.body : '',
      };
    }

    if (nextRelease && typeof nextRelease === 'object') {
      data.nextRelease = {
        title: typeof nextRelease.title === 'string' ? nextRelease.title : '',
        date: typeof nextRelease.date === 'string' ? nextRelease.date : '',
        note: typeof nextRelease.note === 'string' ? nextRelease.note : '',
        cover: typeof nextRelease.cover === 'string' ? nextRelease.cover : '',
      };
    }

    await writeData(data);
    return NextResponse.json({ success: true, news: data.news, nextRelease: data.nextRelease });
  } catch (error) {
    console.error('Error updating meta:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
