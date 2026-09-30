import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdmin } from '@/lib/auth';
import { uploadRules } from '@/lib/uploadTypes';

// Vercel Functions reject request bodies over 4.5MB (413), which is smaller than
// a normal MP3. In production the browser uploads straight to Blob instead; this
// route only hands out a short-lived token for ONE file.

// GET /api/upload/token - does this server upload to Blob (production) or to
// public/uploads (local dev)? Reveals nothing secret.
export async function GET() {
  return NextResponse.json({ blob: !!process.env.BLOB_READ_WRITE_TOKEN });
}

// POST /api/upload/token - issue a client token (Admin only)
export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const rules = uploadRules(pathname);
        if (!rules) throw new Error('Invalid file name or type');
        return { ...rules, addRandomSuffix: false, allowOverwrite: true };
      },
      // No onUploadCompleted: nothing to do after the upload, and leaving it out
      // means Blob never calls this route back (the callback has no admin header).
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error issuing upload token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload rejected' },
      { status: 400 }
    );
  }
}
