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

    // Raster images and audio only (SVG excluded: it can carry scripts)
    const IMAGE_TYPES: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const AUDIO_TYPES: Record<string, string> = {
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/wav': '.wav',
      'audio/x-wav': '.wav',
      'audio/ogg': '.ogg',
      'audio/mp4': '.m4a',
      'audio/x-m4a': '.m4a',
      'audio/flac': '.flac',
    };
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_AUDIO_SIZE = 30 * 1024 * 1024; // 30MB

    const isAudio = file.type in AUDIO_TYPES;
    const extension = IMAGE_TYPES[file.type] || AUDIO_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPEG, WebP, GIF, MP3, WAV, OGG, M4A, FLAC' }, { status: 400 });
    }
    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Maximum size is ${isAudio ? '30MB' : '5MB'}` }, { status: 400 });
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
