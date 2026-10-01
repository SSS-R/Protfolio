'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { setAdminPassword } from '@/hooks/useAdminSession';
import type { TerminalCommand } from '@/types/portfolio';
import { SITE } from '@/lib/site';
import { gsap, getLenis } from './motion';
import { useTransitionNav } from './Transitions';
import Icon from './Icon';

// The v2 site *was* a terminal; in v3 it lives on as a palette you can open
// anywhere with ` or Ctrl/⌘+K. It also carries the admin login.

type Line = { kind: 'in' | 'out' | 'err'; text: string };

const PAGES: Record<string, string> = {
  home: '/',
  index: '/',
  work: '/work',
  projects: '/work',
  inventory: '/work',
  about: '/about',
  cv: '/about',
  architect: '/about',
  contact: '/contact',
  music: '/music',
  sound: '/music',
  creatune: '/music',
};

const BOOT: Line[] = [
  { kind: 'out', text: 'signal terminal v3 — connection established.' },
  { kind: 'out', text: "type 'help' to list commands." },
];

export default function Terminal({ commands }: { commands: TerminalCommand[] }) {
  const { navigate } = useTransitionNav();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(BOOT);
  const [value, setValue] = useState('');
  const [secret, setSecret] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);

  // Admin-editable responses (keys stored as "/whoami" etc.; the slash is optional).
  const custom = new Map(
    commands.filter((c) => c.command.trim().toLowerCase() !== 'help').map((c) => [c.command.trim().toLowerCase().replace(/^\//, ''), c.response]),
  );

  const print = (...add: Line[]) => setLines((prev) => [...prev, ...add]);

  const show = useCallback((command?: string) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    if (command === 'login') {
      setSecret(true);
      setLines((prev) => [...prev, { kind: 'out', text: 'admin login — enter passphrase:' }]);
    }
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setSecret(false);
    returnFocus.current?.focus?.();
  }, []);

  // Global shortcuts + the sss:terminal event (header button, footer, menu).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable="true"]');
      const combo = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
      if (combo || (e.key === '`' && !typing)) {
        e.preventDefault();
        if (open) hide();
        else show();
      } else if (e.key === 'Escape' && open) {
        hide();
      }
    };
    const onEvent = (e: Event) => show((e as CustomEvent<string | undefined>).detail);
    window.addEventListener('keydown', onKey);
    window.addEventListener('sss:terminal', onEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('sss:terminal', onEvent);
    };
  }, [open, show, hide]);

  // Scroll is locked only while open. The unlock lives in the cleanup: the panel
  // unmounts on close, so a check on panel.current would skip it and leave the
  // page unscrollable.
  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    if (panel.current) {
      gsap.fromTo(panel.current, { opacity: 0, y: 16, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' });
    }
    input.current?.focus();
    return () => {
      getLenis()?.start();
    };
  }, [open]);

  useEffect(() => {
    output.current?.scrollTo({ top: output.current.scrollHeight });
  }, [lines]);

  async function login(passphrase: string) {
    print({ kind: 'out', text: 'verifying…' });
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': passphrase },
        body: JSON.stringify({ ping: true }),
      });
      // 400 = authorised but the ping isn't a valid document: that's the success signal.
      if (res.status === 400 || res.ok) {
        setAdminPassword(passphrase);
        setSecret(false);
        print({ kind: 'out', text: 'access granted. opening admin…' });
        window.location.assign('/admin');
      } else if (res.status === 401) {
        print({ kind: 'err', text: 'access denied. the cat is still asleep.' });
      } else {
        print({ kind: 'err', text: `auth error ${res.status}.` });
      }
    } catch {
      print({ kind: 'err', text: 'connection error.' });
    }
  }

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    setHistory((h) => [cmd, ...h].slice(0, 30));
    setCursor(-1);
    print({ kind: 'in', text: cmd });

    const [head, ...rest] = cmd.toLowerCase().replace(/^\//, '').split(/\s+/);
    const arg = rest.join(' ');

    if (head === 'clear' || head === 'cls') return setLines([]);
    if (head === 'exit' || head === 'close' || head === 'q') return hide();
    if (head === 'help') {
      const extra = [...custom.keys()].filter((k) => !['clear'].includes(k));
      return print({
        kind: 'out',
        text: [
          'goto <home|work|about|contact|music>',
          ...extra.map((k) => k),
          'email        copy my email address',
          'date         local time in Dhaka',
          'login        admin access',
          'clear · exit',
        ].join('\n'),
      });
    }
    if (head === 'goto' || head === 'cd' || head === 'open') {
      const target = PAGES[arg];
      if (!target) return print({ kind: 'err', text: `unknown destination '${arg}'. try: home, work, about, contact, music.` });
      print({ kind: 'out', text: `routing to ${target}…` });
      hide();
      return navigate(target);
    }
    if (PAGES[head]) {
      hide();
      return navigate(PAGES[head]);
    }
    if (head === 'email' || head === 'mail') {
      navigator.clipboard?.writeText(SITE.email).catch(() => {});
      return print({ kind: 'out', text: `${SITE.email} — copied to clipboard.` });
    }
    if (head === 'date' || head === 'time') {
      const t = new Date().toLocaleString('en-GB', { timeZone: SITE.timeZone, dateStyle: 'full', timeStyle: 'short' });
      return print({ kind: 'out', text: `${t} (Dhaka)` });
    }
    if (head === 'login' || head === 'sudo' || head === 'admin') {
      setSecret(true);
      return print({ kind: 'out', text: 'admin login — enter passphrase:' });
    }
    const response = custom.get(head);
    if (response !== undefined) return print({ kind: 'out', text: response.toLowerCase() });
    print({ kind: 'err', text: `command not found: ${head}. type 'help'.` });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = value;
    setValue('');
    if (secret) {
      print({ kind: 'in', text: '•'.repeat(Math.min(v.length, 16)) });
      if (v) void login(v);
      return;
    }
    run(v);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (secret || !history.length) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(-1, Math.min(history.length - 1, cursor + (e.key === 'ArrowUp' ? 1 : -1)));
      setCursor(next);
      setValue(next === -1 ? '' : history[next]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-ink/70 p-3 backdrop-blur-[2px] md:items-center md:p-6" onClick={hide}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        onClick={(e) => {
          e.stopPropagation();
          input.current?.focus();
        }}
        className="flex h-[70vh] w-full max-w-2xl flex-col border border-line bg-ink-2 text-bone shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] md:h-[60vh]"
      >
        <div className="label flex items-center justify-between border-b border-line px-4 py-3 text-dim">
          <span>sss@portfolio — ~</span>
          <button type="button" onClick={hide} className="flex items-center gap-1.5 hover:text-bone" aria-label="Close terminal">
            esc <Icon name="close" className="size-4" />
          </button>
        </div>

        <div ref={output} data-lenis-prevent className="flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed" aria-live="polite">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap ${line.kind === 'in' ? 'text-bone' : line.kind === 'err' ? 'text-signal' : 'text-dim'}`}
            >
              {line.kind === 'in' ? <span className="text-signal">❯ </span> : null}
              {line.text}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-[13px]">
          <span className="text-signal" aria-hidden="true">
            {secret ? '🔒' : '❯'}
          </span>
          <label htmlFor="terminal-input" className="sr-only">
            {secret ? 'Admin passphrase' : 'Command'}
          </label>
          <input
            ref={input}
            id="terminal-input"
            type={secret ? 'password' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete={secret ? 'current-password' : 'off'}
            spellCheck={false}
            className="flex-1 bg-transparent text-bone caret-signal outline-none placeholder:text-dim/60 focus-visible:outline-none"
            placeholder={secret ? 'passphrase' : "try 'help'"}
          />
        </form>
      </div>
    </div>
  );
}
