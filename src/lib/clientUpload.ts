import { upload } from '@vercel/blob/client';
import { uploadPath } from './uploadTypes';

// Does the server store uploads in Blob (production) or on disk (local dev)?
let blobMode: Promise<boolean> | null = null;
const isBlobMode = () =>
  (blobMode ??= fetch('/api/upload/token')
    .then((r) => r.json())
    .then((j) => !!j.blob)
    .catch(() => false));

/** Upload a file from the admin UI and return its public URL. */
export async function uploadFile(file: File, filename: string, pass: string): Promise<string> {
  if (await isBlobMode()) {
    // Straight to Blob, so Vercel's 4.5MB function body cap never applies.
    const pathname = uploadPath(filename, file.type);
    if (!pathname) throw new Error('Invalid file type. Allowed: PNG, JPEG, WebP, GIF, MP3, WAV, OGG, M4A, FLAC');
    const blob = await upload(pathname, file, {
      access: 'public',
      contentType: file.type,
      handleUploadUrl: '/api/upload/token',
      headers: { 'x-admin-password': pass },
    });
    return blob.url;
  }

  // Local dev: through the server route into public/uploads.
  const fd = new FormData();
  fd.append('file', file);
  fd.append('filename', filename);
  const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-password': pass }, body: fd });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Upload failed (${res.status})`);
  }
  return (await res.json()).url as string;
}
