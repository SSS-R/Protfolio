'use client';

import { useSyncExternalStore } from 'react';

// Client-side admin session, backed by sessionStorage. Using an external store
// (instead of useState + a hydration effect) is the React 19-correct way to read
// browser-only state without a synchronous setState-in-effect.

const KEY = 'admin_password';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getAdminPassword(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEY);
}

export function setAdminPassword(pw: string | null) {
  if (typeof window === 'undefined') return;
  if (pw) sessionStorage.setItem(KEY, pw);
  else sessionStorage.removeItem(KEY);
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

/** Reactive boolean: is an admin passphrase currently stored for this session? */
export function useAdminAuthed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !!getAdminPassword(),
    () => false // server snapshot: never authed during SSR
  );
}
