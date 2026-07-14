import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';
import { requireAdmin } from '@/lib/auth';

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
    const authError = requireAdmin(request);
    if (authError) return authError;

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
