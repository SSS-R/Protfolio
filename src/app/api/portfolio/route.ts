import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/portfolio.json');

// GET /api/portfolio
export async function GET() {
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
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

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: 'Portfolio data updated successfully' });
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    return NextResponse.json({ error: 'Failed to save portfolio data' }, { status: 500 });
  }
}
