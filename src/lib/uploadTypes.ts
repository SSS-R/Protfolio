// Upload rules shared by the server routes and the admin UI so they can't drift.

// Raster images and audio only (SVG excluded: it can carry scripts)
export const IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
export const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/flac': '.flac',
};
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AUDIO_SIZE = 30 * 1024 * 1024; // 30MB

/** "uploads/<safe-name><ext>" for a declared MIME type, or null if the type isn't allowed. */
export function uploadPath(filename: string, mime: string): string | null {
  const ext = IMAGE_TYPES[mime] || AUDIO_TYPES[mime];
  if (!ext) return null;
  const base = filename.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/\.[^.]*$/, '');
  return `uploads/${base}${ext}`;
}

/**
 * What the token route enforces for a pathname the browser asks to write, or
 * null to reject it. Only flat `uploads/<name>.<ext>` keys with a known
 * extension: a client token can never reach `data/*.json` (the content store).
 */
export function uploadRules(
  pathname: string
): { allowedContentTypes: string[]; maximumSizeInBytes: number } | null {
  const m = /^uploads\/[a-zA-Z0-9_.-]+(\.[a-z0-9]+)$/.exec(pathname);
  if (!m) return null;
  const typesFor = (map: Record<string, string>) => Object.keys(map).filter((t) => map[t] === m[1]);
  const audio = typesFor(AUDIO_TYPES);
  if (audio.length) return { allowedContentTypes: audio, maximumSizeInBytes: MAX_AUDIO_SIZE };
  const image = typesFor(IMAGE_TYPES);
  if (image.length) return { allowedContentTypes: image, maximumSizeInBytes: MAX_IMAGE_SIZE };
  return null;
}
