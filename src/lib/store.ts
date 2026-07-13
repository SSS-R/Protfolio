import fs from 'fs/promises';
import path from 'path';

/**
 * Storage layer. In production on Vercel (BLOB_READ_WRITE_TOKEN present) it uses
 * Vercel Blob for both JSON data and file uploads. In local dev (no token) it
 * falls back to the filesystem, so nothing changes while developing.
 *
 * Only *public* data lives in Blob (portfolio content, music catalogue). Contact
 * messages are never stored in Blob — in production the form posts to Formspree.
 */

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

// Warm-lambda cache of resolved blob URLs so reads skip the list() call.
const urlCache = new Map<string, string>();

const dataPath = (key: string) => path.join(process.cwd(), 'src/data', `${key}.json`);

async function readLocalJSON<T>(key: string): Promise<T | null> {
  try {
    const content = await fs.readFile(dataPath(key), 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function writeLocalJSON(key: string, data: unknown): Promise<void> {
  await fs.writeFile(dataPath(key), JSON.stringify(data, null, 2), 'utf-8');
}

async function resolveBlobUrl(key: string): Promise<string | null> {
  if (urlCache.has(key)) return urlCache.get(key)!;
  const { list } = await import('@vercel/blob');
  const pathname = `data/${key}.json`;
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const found = blobs.find((b) => b.pathname === pathname);
  if (found) {
    urlCache.set(key, found.url);
    return found.url;
  }
  return null;
}

/**
 * Read a JSON document by key (e.g. "portfolio", "creatune").
 * On Blob: fetches the stored blob; if absent, seeds it from the bundled
 * src/data/<key>.json so the first deploy carries current content forward.
 */
export async function readData<T>(key: string, fallback: T): Promise<T> {
  if (useBlob) {
    try {
      const url = await resolveBlobUrl(key);
      if (url) {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return (await res.json()) as T;
      }
      // Not in Blob yet — seed from the committed file, then persist.
      const seed = (await readLocalJSON<T>(key)) ?? fallback;
      await writeData(key, seed);
      return seed;
    } catch (err) {
      console.error(`readData(${key}) blob error, using bundled copy:`, err);
      return (await readLocalJSON<T>(key)) ?? fallback;
    }
  }
  return (await readLocalJSON<T>(key)) ?? fallback;
}

/** Persist a JSON document by key. */
export async function writeData(key: string, data: unknown): Promise<void> {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const { url } = await put(`data/${key}.json`, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    urlCache.set(key, url);
    return;
  }
  await writeLocalJSON(key, data);
}

/**
 * Store an uploaded file and return the URL to reference it by.
 * Blob → absolute CDN URL. Local → "/uploads/<filename>".
 */
export async function saveUpload(filename: string, body: Buffer, contentType: string): Promise<string> {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const { url } = await put(`uploads/${filename}`, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    });
    return url;
  }
  const dir = path.join(process.cwd(), 'public/uploads');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), body);
  return `/uploads/${filename}`;
}
