import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

// GET /api/portfolio
export async function GET() {
  try {
    const data = await readData<Record<string, unknown>>('portfolio', {});
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    return NextResponse.json({ error: 'Failed to load portfolio data' }, { status: 500 });
  }
}

// POST /api/portfolio
export async function POST(request: Request) {
  try {
    // Basic password validation
    const headerPassword = request.headers.get('x-admin-password');
    const systemPassword = process.env.ADMIN_PASSWORD;

    if (!systemPassword) {
      return NextResponse.json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' }, { status: 500 });
    }

    if (headerPassword !== systemPassword) {
      return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
    }

    const body = await request.json();
    
    // Simple validation of structure
    if (!body || !body.profile || !body.projects) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 });
    }

    await writeData('portfolio', body);

    return NextResponse.json({ success: true, message: 'Portfolio data updated successfully' });
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    return NextResponse.json({ error: 'Failed to save portfolio data' }, { status: 500 });
  }
}
