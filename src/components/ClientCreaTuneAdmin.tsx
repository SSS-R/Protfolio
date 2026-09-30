'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CreaTuneTrack, CreaTuneAlbum, CreaTuneNews, CreaTuneNextRelease } from './creatune-types';
import { useAdminAuthed, getAdminPassword, setAdminPassword } from '@/hooks/useAdminSession';
import { uploadFile } from '@/lib/clientUpload';

const inputClass =
  'border border-[#3B3E52] bg-[#101119] text-[#EDEBF4] px-3 py-2 text-sm outline-none focus:border-[#A9A3CE] disabled:opacity-50 rounded-lg';
const labelClass = 'text-[10px] font-bold uppercase tracking-[0.25em] text-[#9BA0B4]';
const primaryBtn =
  'bg-[#A9A3CE] text-black px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-[#EDEBF4] transition-colors disabled:opacity-30 cursor-pointer';
const ghostBtn =
  'border border-[#3B3E52] text-[#9BA0B4] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors cursor-pointer';

// Prefix a filename with a timestamp for uniqueness (module scope: not render).
function stampedName(name: string): string {
  return `${Date.now()}_${name}`;
}

// Upload a cover image; returns its public URL
function uploadImage(file: File, pass: string): Promise<string> {
  return uploadFile(file, `cover_${Date.now()}_${file.name}`, pass);
}

const LOGO = '/images/creatune-logo.png';

// ── Inline track editor ──────────────────────────────────────────────
function TrackEditor({
  track,
  albums,
  pass,
  onSaved,
  onCancel,
}: {
  track: CreaTuneTrack;
  albums: CreaTuneAlbum[];
  pass: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [albumId, setAlbumId] = useState(track.albumId || '');
  const [lyrics, setLyrics] = useState(track.lyrics || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pickCover = (f: File | null) => {
    setCoverFile(f);
    setCoverPreview(f ? URL.createObjectURL(f) : null);
  };

  const save = async () => {
    setBusy(true);
    setErr('');
    try {
      let cover: string | undefined;
      if (coverFile) cover = await uploadImage(coverFile, pass);

      const res = await fetch('/api/creatune', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
        body: JSON.stringify({ id: track.id, title, artist, lyrics, albumId, ...(cover ? { cover } : {}) }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setErr(e.error || `Save failed (${res.status})`);
        return;
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const currentCover = coverPreview || track.cover || LOGO;

  return (
    <div className="mt-2 rounded-xl border border-[#3B3E52] bg-[#0C0D13] p-4 md:p-5">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6">
        {/* Cover column */}
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentCover} alt="" className="w-24 h-24 rounded-xl border border-white/10 object-cover" />
          <label className={`${ghostBtn} text-center`}>
            Change art
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => pickCover(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* Fields column */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} disabled={busy} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Artist</label>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputClass} disabled={busy} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Album</label>
            <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} className={inputClass} disabled={busy}>
              <option value="">— No album (single) —</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                  {a.year ? ` (${a.year})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Lyrics</label>
            <textarea
              rows={5}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className={`${inputClass} resize-y leading-6`}
              placeholder={'Verse 1…\nChorus…'}
              disabled={busy}
            />
          </div>
          {err && <p className="text-sm text-[#FF6B5E]">{err}</p>}
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={busy || !title.trim()} className={primaryBtn}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button onClick={onCancel} disabled={busy} className={ghostBtn}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Landing content editor (news + next release) ─────────────────────
function MetaEditor({
  initialNews,
  initialNext,
  pass,
  onSaved,
}: {
  initialNews: CreaTuneNews | null;
  initialNext: CreaTuneNextRelease | null;
  pass: string;
  onSaved: () => void;
}) {
  const [newsTitle, setNewsTitle] = useState(initialNews?.title || '');
  const [newsBody, setNewsBody] = useState(initialNews?.body || '');
  const [nrTitle, setNrTitle] = useState(initialNext?.title || '');
  const [nrDate, setNrDate] = useState(initialNext?.date || '');
  const [nrNote, setNrNote] = useState(initialNext?.note || '');
  const [nrCover, setNrCover] = useState(initialNext?.cover || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setBusy(true);
    setMsg('Saving…');
    try {
      let cover = nrCover;
      if (coverFile) cover = await uploadImage(coverFile, pass);
      const res = await fetch('/api/creatune/meta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
        body: JSON.stringify({
          news: { title: newsTitle, body: newsBody },
          nextRelease: { title: nrTitle, date: nrDate, note: nrNote, cover },
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setMsg(e.error || `Failed (${res.status})`);
        return;
      }
      setNrCover(cover);
      setCoverFile(null);
      setCoverPreview(null);
      setMsg('Landing content saved.');
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(''), 5000);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-xs font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-3">Landing content</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* News */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A9C0]">News about me</p>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Headline</label>
            <input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className={inputClass} disabled={busy} placeholder="In the studio" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Body</label>
            <textarea rows={5} value={newsBody} onChange={(e) => setNewsBody(e.target.value)} className={`${inputClass} resize-y leading-6`} disabled={busy} placeholder="What you're working on…" />
          </div>
        </div>

        {/* Next release */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A9C0]">Next release (leave title empty to hide)</p>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview || nrCover || LOGO} alt="" className="w-16 h-16 rounded-lg border border-white/10 object-cover" />
              <label className={`${ghostBtn} text-center`}>
                Cover
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setCoverFile(f);
                    setCoverPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </label>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Title</label>
                <input value={nrTitle} onChange={(e) => setNrTitle(e.target.value)} className={inputClass} disabled={busy} placeholder="Upcoming single" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Date</label>
                <input value={nrDate} onChange={(e) => setNrDate(e.target.value)} className={inputClass} disabled={busy} placeholder="Aug 2026" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Note</label>
            <textarea rows={2} value={nrNote} onChange={(e) => setNrNote(e.target.value)} className={`${inputClass} resize-y leading-6`} disabled={busy} placeholder="A teaser line…" />
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <button onClick={save} disabled={busy} className={primaryBtn}>
          {busy ? 'Saving…' : 'Save landing content'}
        </button>
        {msg && (
          <p role="status" aria-live="polite" className="text-sm font-medium text-[#A9A3CE]">
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Album manager ────────────────────────────────────────────────────
function AlbumManager({
  albums,
  pass,
  onChanged,
}: {
  albums: CreaTuneAlbum[];
  pass: string;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setMsg('Creating album…');
    try {
      let cover: string | undefined;
      if (coverFile) cover = await uploadImage(coverFile, pass);
      const res = await fetch('/api/creatune/album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
        body: JSON.stringify({ title, year, ...(cover ? { cover } : {}) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMsg(err.error || `Failed (${res.status})`);
        return;
      }
      setTitle('');
      setYear('');
      setCoverFile(null);
      setCoverPreview(null);
      setMsg('Album created.');
      onChanged();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to create album');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(''), 5000);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete album "${name}"? Its tracks stay, but become singles.`)) return;
    const res = await fetch(`/api/creatune/album?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': pass },
    });
    if (res.ok) onChanged();
  };

  return (
    <section className="mt-12">
      <h2 className="text-xs font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-3">Albums</h2>

      {/* Create form */}
      <form onSubmit={create} className="mt-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview || LOGO}
              alt=""
              className="w-16 h-16 rounded-lg border border-white/10 object-cover"
            />
            <label className={`${ghostBtn} text-center`}>
              Cover
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setCoverFile(f);
                  setCoverPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className={labelClass}>Album title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} disabled={busy} placeholder="e.g. Midnight Frequencies" />
        </div>
        <div className="flex flex-col gap-1.5 w-full md:w-32">
          <label className={labelClass}>Year</label>
          <input value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} disabled={busy} placeholder="2026" />
        </div>
        <button type="submit" disabled={busy || !title.trim()} className={primaryBtn}>
          {busy ? 'Working…' : 'Create'}
        </button>
      </form>
      {msg && (
        <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-[#A9A3CE]">
          {msg}
        </p>
      )}

      {/* Album list */}
      {albums.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {albums.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.cover || LOGO} alt="" className="w-14 h-14 rounded-lg border border-white/10 object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{a.title}</p>
                <p className="text-xs text-[#9BA0B4]">{a.year || 'No year'}</p>
              </div>
              <button
                onClick={() => remove(a.id, a.title)}
                className="text-[10px] font-bold uppercase tracking-[0.2em] border border-[#FF6B5E] text-[#FF6B5E] px-2.5 py-1.5 rounded-full hover:bg-[#FF6B5E] hover:text-black transition-colors cursor-pointer shrink-0"
              >
                Del
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main admin ───────────────────────────────────────────────────────
export default function ClientCreaTuneAdmin() {
  const isAuthenticated = useAdminAuthed();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [tracks, setTracks] = useState<CreaTuneTrack[]>([]);
  const [albums, setAlbums] = useState<CreaTuneAlbum[]>([]);
  const [news, setNews] = useState<CreaTuneNews | null>(null);
  const [nextRelease, setNextRelease] = useState<CreaTuneNextRelease | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Upload form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('CreaTune');
  const [lyrics, setLyrics] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const pass = getAdminPassword() || '';

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/creatune');
      if (res.ok) {
        const data = await res.json();
        setTracks(data.tracks || []);
        setAlbums(data.albums || []);
        setNews(data.news || null);
        setNextRelease(data.nextRelease || null);
        setLoaded(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const toggleFeatured = async (track: CreaTuneTrack) => {
    if (!pass) return;
    // Optimistic flip
    setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, featured: !t.featured } : t)));
    await fetch('/api/creatune', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
      body: JSON.stringify({ id: track.id, featured: !track.featured }),
    }).catch(() => fetchData());
  };

  useEffect(() => {
    // Async server fetch (setState after the response), not a synchronous cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ ping: true }),
      });
      if (res.status === 401) {
        setLoginError('Wrong passphrase.');
        return;
      }
      if (res.status === 400 || res.ok) {
        setAdminPassword(password);
        setPassword('');
      } else {
        setLoginError(`Auth error (${res.status}).`);
      }
    } catch {
      setLoginError('Connection error.');
    }
  };

  const readDuration = (audioFile: File): Promise<string> =>
    new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(audioFile);
      const probe = new Audio(objectUrl);
      probe.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl);
        const secs = probe.duration;
        if (!isFinite(secs)) return resolve('--:--');
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        resolve(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      });
      probe.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        resolve('--:--');
      });
    });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !pass) return;

    setIsBusy(true);
    setStatusMessage('Uploading audio…');

    try {
      const duration = await readDuration(file);

      let url: string;
      try {
        url = await uploadFile(file, stampedName(file.name), pass);
      } catch (err) {
        setStatusMessage(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
        return;
      }

      let cover: string | undefined;
      if (coverFile) {
        setStatusMessage('Uploading cover…');
        cover = await uploadImage(coverFile, pass);
      }

      setStatusMessage('Registering track…');
      const trackRes = await fetch('/api/creatune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
        body: JSON.stringify({ title, artist, duration, url, lyrics, albumId, ...(cover ? { cover } : {}) }),
      });

      if (trackRes.ok) {
        setStatusMessage('Track published.');
        setTitle('');
        setLyrics('');
        setAlbumId('');
        setFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        (e.target as HTMLFormElement).reset();
        fetchData();
      } else {
        const err = await trackRes.json().catch(() => ({}));
        setStatusMessage(`Failed to register track: ${err.error || trackRes.status}`);
      }
    } catch {
      setStatusMessage('Upload failed: network error.');
    } finally {
      setIsBusy(false);
      setTimeout(() => setStatusMessage(''), 6000);
    }
  };

  const handleDelete = async (id: string, trackTitle: string) => {
    if (!pass) return;
    if (!window.confirm(`Remove "${trackTitle}" from CreaTune?`)) return;
    const res = await fetch(`/api/creatune?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': pass },
    });
    if (res.ok) fetchData();
  };

  const totalListens = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const albumTitle = (id?: string) => albums.find((a) => a.id === id)?.title;
  const coverFor = (t: CreaTuneTrack) => t.cover || albums.find((a) => a.id === t.albumId)?.cover || LOGO;

  return (
    <div className="ct-scope relative min-h-screen bg-black text-[#EDEBF4] font-[family-name:var(--font-inter)] selection:bg-[#A9A3CE] selection:text-black">
      {/* Ambient blue/purple glow over solid black */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 45% at 50% -5%, rgba(124,92,255,0.18), transparent 70%),' +
            'radial-gradient(45% 40% at 92% 60%, rgba(59,74,214,0.12), transparent 70%)',
        }}
        aria-hidden="true"
      />
      {/* Top bar */}
      <header className="relative z-40 border-b border-[#1C1D2A] sticky top-0 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <span className="flex items-center gap-3">
            <Image src={LOGO} alt="" width={36} height={36} className="rounded-full border border-[#3B3E52]" />
            <span className="text-2xl font-[family-name:var(--font-script)]">
              CreaTune
              <span className="font-[family-name:var(--font-inter)] text-xs font-bold uppercase tracking-[0.25em] ml-3 text-[#A9A3CE] align-middle">
                Studio Admin
              </span>
            </span>
          </span>
          <Link
            href="/music"
            className="border border-[#3B3E52] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors"
          >
            ← Player
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-16 rounded-2xl border border-[#262838] p-8 bg-[#101119]">
            <h1 className="text-2xl font-extrabold tracking-tight">Studio access</h1>
            <p className="mt-2 text-sm text-[#9BA0B4]">Enter the admin passphrase to manage tracks.</p>
            <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-3">
              <label htmlFor="ct-password" className={labelClass}>
                Passphrase
              </label>
              <input
                id="ct-password"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <button type="submit" className={`${primaryBtn} mt-2 w-full py-3`}>
                Unlock
              </button>
              {loginError && (
                <p role="alert" className="text-sm text-[#FF6B5E]">
                  {loginError}
                </p>
              )}
            </form>
          </div>
        ) : (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#262838] border border-[#262838] rounded-2xl overflow-hidden">
              <div className="bg-[#101119] p-5 md:p-6">
                <p className={labelClass}>Total listens</p>
                <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tighter tabular-nums text-[#A9A3CE]">
                  {totalListens.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#101119] p-5 md:p-6">
                <p className={labelClass}>Tracks</p>
                <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tighter tabular-nums">{tracks.length}</p>
              </div>
              <div className="bg-[#101119] p-5 md:p-6">
                <p className={labelClass}>Albums</p>
                <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tighter tabular-nums">{albums.length}</p>
              </div>
              <div className="bg-[#101119] p-5 md:p-6">
                <p className={labelClass}>Top track</p>
                <p className="mt-2 text-base md:text-lg font-bold leading-tight line-clamp-2">
                  {tracks.length > 0 ? [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0))[0].title : '—'}
                </p>
              </div>
            </section>

            {/* Landing content (news + next release) */}
            {loaded && (
              <MetaEditor
                key="meta"
                initialNews={news}
                initialNext={nextRelease}
                pass={pass}
                onSaved={fetchData}
              />
            )}

            {/* Albums */}
            <AlbumManager albums={albums} pass={pass} onChanged={fetchData} />

            {/* Upload */}
            <section className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-3">Upload a track</h2>
              <form onSubmit={handleUpload} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="ct-title" className={labelClass}>
                    Title *
                  </label>
                  <input
                    id="ct-title"
                    type="text"
                    required
                    disabled={isBusy}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    placeholder="Track title"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="ct-artist" className={labelClass}>
                    Artist
                  </label>
                  <input
                    id="ct-artist"
                    type="text"
                    disabled={isBusy}
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="ct-album" className={labelClass}>
                    Album
                  </label>
                  <select
                    id="ct-album"
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    className={inputClass}
                    disabled={isBusy}
                  >
                    <option value="">— No album (single) —</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                        {a.year ? ` (${a.year})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverPreview || LOGO} alt="" className="w-16 h-16 rounded-lg border border-white/10 object-cover" />
                    <label className={`${ghostBtn} text-center`}>
                      Cover art
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setCoverFile(f);
                          setCoverPreview(f ? URL.createObjectURL(f) : null);
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-[#9BA0B4] pb-1">Optional. Falls back to the album cover, then the logo.</p>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="ct-file" className={labelClass}>
                    Audio file * (MP3 / WAV / OGG / M4A / FLAC, max 30MB)
                  </label>
                  <input
                    id="ct-file"
                    type="file"
                    required
                    disabled={isBusy}
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/x-m4a,audio/flac"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className={`${inputClass} file:mr-4 file:border-0 file:bg-[#A9A3CE] file:text-black file:px-4 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.2em] file:cursor-pointer file:rounded-full`}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="ct-lyrics" className={labelClass}>
                    Lyrics (optional — shown in the player)
                  </label>
                  <textarea
                    id="ct-lyrics"
                    rows={6}
                    disabled={isBusy}
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className={`${inputClass} resize-y leading-6`}
                    placeholder={'Verse 1…\nChorus…'}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-4">
                  <button type="submit" disabled={isBusy || !file || !title} className={primaryBtn}>
                    {isBusy ? 'Working…' : 'Publish track'}
                  </button>
                  {statusMessage && (
                    <p role="status" aria-live="polite" className="text-sm font-medium text-[#A9A3CE]">
                      {statusMessage}
                    </p>
                  )}
                </div>
              </form>
            </section>

            {/* Catalogue */}
            <section className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-3">Catalogue</h2>
              {tracks.length === 0 ? (
                <p className="py-8 text-sm text-[#9BA0B4]">No tracks yet — publish your first one above.</p>
              ) : (
                <ul className="mt-2">
                  {tracks.map((track, index) => (
                    <li key={track.id} className="border-b border-white/[0.06] py-3">
                      <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2rem_auto_1fr_7rem_5rem_auto] items-center gap-3 md:gap-5">
                        <span className="hidden md:block text-lg font-extrabold tabular-nums text-[#31334A]">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverFor(track)} alt="" className="w-12 h-12 rounded-lg border border-white/10 object-cover shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-bold truncate">{track.title}</span>
                          <span className="block text-xs uppercase tracking-[0.2em] text-[#9BA0B4] mt-0.5 truncate">
                            {track.artist}
                            {albumTitle(track.albumId) ? ` · ${albumTitle(track.albumId)}` : ''}
                            {track.lyrics && track.lyrics.trim() ? ' · lyrics ✓' : ''}
                          </span>
                        </span>
                        <span className="hidden md:block text-sm tabular-nums text-[#9BA0B4]">
                          {(track.plays || 0).toLocaleString()} listens
                        </span>
                        <span className="hidden md:block text-sm tabular-nums text-[#9BA0B4]">{track.duration}</span>
                        <span className="flex items-center gap-2 justify-self-end">
                          <button
                            onClick={() => toggleFeatured(track)}
                            aria-label={track.featured ? 'Unfeature track' : 'Feature track'}
                            title={track.featured ? 'Featured on landing' : 'Feature on landing'}
                            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                              track.featured
                                ? 'border-[#C9A9C0] text-[#C9A9C0] bg-[#14121F]'
                                : 'border-[#3B3E52] text-[#31334A] hover:text-[#9BA0B4] hover:border-[#9BA0B4]'
                            }`}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={track.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18.5 5.4 21.2 6.7 14 1.7 9.4l7-.9z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingId(editingId === track.id ? null : track.id)}
                            className={`${ghostBtn} ${editingId === track.id ? 'border-[#A9A3CE] text-[#A9A3CE]' : ''}`}
                          >
                            {editingId === track.id ? 'Close' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDelete(track.id, track.title)}
                            className="text-[10px] font-bold uppercase tracking-[0.2em] border border-[#FF6B5E] text-[#FF6B5E] px-3 py-1.5 rounded-full hover:bg-[#FF6B5E] hover:text-black transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </span>
                      </div>

                      {editingId === track.id && (
                        <TrackEditor
                          track={track}
                          albums={albums}
                          pass={pass}
                          onCancel={() => setEditingId(null)}
                          onSaved={() => {
                            setEditingId(null);
                            fetchData();
                          }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
