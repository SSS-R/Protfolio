'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CreaTuneTrack } from './ClientCreaTune';

function getStoredPassword() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('admin_password');
}

export default function ClientCreaTuneAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [tracks, setTracks] = useState<CreaTuneTrack[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('CreaTune');
  const [lyrics, setLyrics] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchTracks = useCallback(async () => {
    try {
      const res = await fetch('/api/creatune');
      if (res.ok) {
        const data = await res.json();
        setTracks(data.tracks || []);
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (getStoredPassword()) {
      setIsAuthenticated(true);
      fetchTracks();
    }
  }, [fetchTracks]);

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
        sessionStorage.setItem('admin_password', password);
        setIsAuthenticated(true);
        setPassword('');
        fetchTracks();
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
    const storedPass = getStoredPassword();
    if (!file || !title || !storedPass) return;

    setIsBusy(true);
    setStatusMessage('Uploading audio…');

    try {
      const duration = await readDuration(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', `${Date.now()}_${file.name}`);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-password': storedPass },
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setStatusMessage(`Upload failed: ${err.error || uploadRes.status}`);
        return;
      }

      const { url } = await uploadRes.json();
      setStatusMessage('Registering track…');

      const trackRes = await fetch('/api/creatune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPass },
        body: JSON.stringify({ title, artist, duration, url, lyrics }),
      });

      if (trackRes.ok) {
        setStatusMessage('Track published.');
        setTitle('');
        setLyrics('');
        setFile(null);
        (e.target as HTMLFormElement).reset();
        fetchTracks();
      } else {
        const err = await trackRes.json();
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
    const storedPass = getStoredPassword();
    if (!storedPass) return;
    if (!window.confirm(`Remove "${trackTitle}" from CreaTune?`)) return;

    const res = await fetch(`/api/creatune?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': storedPass },
    });
    if (res.ok) fetchTracks();
  };

  const totalListens = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  const inputClass =
    'border border-[#3B3E52] bg-[#101119] text-[#EDEBF4] px-3 py-2 text-sm outline-none focus:border-[#A9A3CE] disabled:opacity-50';
  const labelClass = 'text-[10px] font-bold uppercase tracking-[0.25em] text-[#9BA0B4]';

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
            <Image
              src="/images/creatune-logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-full border border-[#3B3E52]"
            />
            <span className="text-2xl font-[family-name:var(--font-script)]">
              CreaTune
              <span className="font-[family-name:var(--font-inter)] text-xs font-bold uppercase tracking-[0.25em] ml-3 text-[#A9A3CE] align-middle">
                Studio Admin
              </span>
            </span>
          </span>
          <Link
            href="/music"
            className="border border-[#3B3E52] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-[#A9A3CE] hover:text-[#A9A3CE] transition-colors"
          >
            ← Player
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-16 border border-[#262838] p-8 bg-[#101119]">
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
              <button
                type="submit"
                className="mt-2 bg-[#A9A3CE] text-[#0C0D13] py-3 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#EDEBF4] transition-colors cursor-pointer"
              >
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
            <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262838] border border-[#262838]">
              <div className="bg-[#101119] p-6">
                <p className={labelClass}>Total listens</p>
                <p className="mt-2 text-5xl font-extrabold tracking-tighter tabular-nums text-[#A9A3CE]">
                  {totalListens.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#101119] p-6">
                <p className={labelClass}>Published tracks</p>
                <p className="mt-2 text-5xl font-extrabold tracking-tighter tabular-nums">{tracks.length}</p>
              </div>
              <div className="bg-[#101119] p-6">
                <p className={labelClass}>Top track</p>
                <p className="mt-2 text-lg font-bold leading-tight">
                  {tracks.length > 0 ? [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0))[0].title : '—'}
                </p>
              </div>
            </section>

            {/* Upload */}
            <section className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] border-b-2 border-[#EDEBF4] pb-3">Upload a track</h2>
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
                    className={`${inputClass} file:mr-4 file:border-0 file:bg-[#A9A3CE] file:text-[#0C0D13] file:px-4 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.2em] file:cursor-pointer`}
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
                  <button
                    type="submit"
                    disabled={isBusy || !file || !title}
                    className="bg-[#A9A3CE] text-[#0C0D13] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#EDEBF4] transition-colors disabled:opacity-30 cursor-pointer"
                  >
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

            {/* Track table */}
            <section className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] border-b-2 border-[#EDEBF4] pb-3">Catalogue</h2>
              {tracks.length === 0 ? (
                <p className="py-8 text-sm text-[#9BA0B4]">No tracks yet — publish your first one above.</p>
              ) : (
                <ul>
                  {tracks.map((track, index) => (
                    <li
                      key={track.id}
                      className="grid grid-cols-[2.5rem_1fr_auto_auto] md:grid-cols-[3rem_1fr_8rem_6rem_6rem] items-center gap-3 md:gap-6 py-4 border-b border-[#262838]"
                    >
                      <span className="text-xl font-extrabold tabular-nums text-[#31334A]">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold truncate">{track.title}</span>
                        <span className="block text-xs uppercase tracking-[0.2em] text-[#9BA0B4] mt-0.5">
                          {track.artist}
                          {track.lyrics && track.lyrics.trim() ? ' · lyrics ✓' : ''}
                        </span>
                      </span>
                      <span className="text-sm tabular-nums font-medium">
                        {(track.plays || 0).toLocaleString()} <span className="text-[#9BA0B4]">listens</span>
                      </span>
                      <span className="hidden md:block text-sm tabular-nums text-[#9BA0B4]">{track.duration}</span>
                      <button
                        onClick={() => handleDelete(track.id, track.title)}
                        className="justify-self-end text-[10px] font-bold uppercase tracking-[0.2em] border border-[#FF6B5E] text-[#FF6B5E] px-3 py-1.5 hover:bg-[#FF6B5E] hover:text-[#0C0D13] transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
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
