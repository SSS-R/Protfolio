import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// POST /api/upload
export async function POST(request: Request) {
  try {
    // Password validation
    const headerPassword = request.headers.get('x-admin-password');
    const systemPassword = process.env.ADMIN_PASSWORD;

    if (!systemPassword) {
      return NextResponse.json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' }, { status: 500 });
    }

    if (headerPassword !== systemPassword) {
      return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only raster images are allowed (SVG excluded: it can carry scripts)
    const ALLOWED_TYPES: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPEG, WebP, GIF' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Normalize filename and force an extension matching the validated type
    const filename = (formData.get('filename') as string) || `upload_${Date.now()}_${(file as File).name || 'image'}`;
    const baseName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/\.[^.]*$/, '');
    const sanitizedFilename = `${baseName}${extension}`;
    
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, sanitizedFilename);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${sanitizedFilename}`;
    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
