# Portfolio + CreaTune

Personal portfolio (retro RPG/terminal theme) plus **CreaTune**, a Swiss-modern
music site with a persistent Spotify-style player and a studio admin panel.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a `.env.local` (see [`.env.example`](.env.example)) — at minimum:

```
ADMIN_PASSWORD=your-strong-passphrase
```

In dev, all content and uploads persist to the local filesystem
(`src/data/*.json`, `public/uploads/`). No cloud services needed.

## Deploying to Vercel

The app is built to run on Vercel's serverless (read-only) filesystem by using
**Vercel Blob** for both uploaded media and the JSON content store, and
**Formspree** for the contact form.

### 1. Push to a Git repo and import it into Vercel

### 2. Create a Blob store
Vercel dashboard → your project → **Storage → Create → Blob → Connect**.
This auto-adds `BLOB_READ_WRITE_TOKEN` to the project. With it present, every
admin edit, track/cover upload, and play-count increment persists to Blob.
On first request the current committed `src/data/*.json` is seeded into Blob.

### 3. Set environment variables
Project → **Settings → Environment Variables**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `ADMIN_PASSWORD` | ✅ | Admin login for `/admin` and `/music/admin` |
| `BLOB_READ_WRITE_TOKEN` | auto | Added by connecting the Blob store |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | for contact form | Your `https://formspree.io/f/xxxx` endpoint |
| `NEXT_PUBLIC_SITE_URL` | optional | Custom domain for OG image URLs |

### 4. Contact form (Formspree)
Create a free form at [formspree.io](https://formspree.io), copy its endpoint
(`https://formspree.io/f/xxxx`), and set `NEXT_PUBLIC_FORMSPREE_ENDPOINT`.
Submissions arrive in your email — no server storage required.

### 5. Deploy
Vercel builds with `next build`. After the first deploy, log into
`/music/admin` and `/admin` to manage content live; changes persist to Blob.

## Notes
- The three seeded demo tracks' audio is committed under `public/uploads/` so
  music plays immediately. New uploads go to Blob.
- `src/data/messages.json` and future local uploads are gitignored.
- Storage logic lives in [`src/lib/store.ts`](src/lib/store.ts) — Blob in
  production, filesystem in dev, chosen automatically by `BLOB_READ_WRITE_TOKEN`.
