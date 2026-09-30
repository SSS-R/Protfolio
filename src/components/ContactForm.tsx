'use client';

import { useState } from 'react';
import Icon from './site/Icon';

type Status = { kind: 'idle' | 'sending' | 'sent' | 'error'; text?: string };

const FIELD =
  'peer w-full border-0 border-b border-line bg-transparent pb-3 pt-7 text-[19px] text-bone outline-none transition-colors placeholder:text-transparent focus:border-bone disabled:opacity-50';
const LABEL =
  'label pointer-events-none absolute left-0 top-7 text-dim transition-all duration-300 peer-focus:top-0 peer-focus:text-signal peer-[:not(:placeholder-shown)]:top-0';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // In production, post to Formspree (email delivery, no server storage needed).
  // In local dev with no endpoint set, fall back to the /api/messages inbox.
  const formspree = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus({ kind: 'sending' });

    try {
      const res = formspree
        ? await fetch(formspree, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...body, subject: body.subject || 'No Subject' }),
          })
        : await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      if (res.ok) {
        form.reset();
        setStatus({ kind: 'sent' });
      } else {
        const err = await res.json().catch(() => ({}));
        setStatus({ kind: 'error', text: err.error || `Something went wrong (${res.status}).` });
      }
    } catch {
      setStatus({ kind: 'error', text: 'Network error — check your connection and try again.' });
    }
  }

  const busy = status.kind === 'sending';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative">
          <input id="contact-name" name="name" type="text" autoComplete="name" required disabled={busy} placeholder="Name" className={FIELD} />
          <label htmlFor="contact-name" className={LABEL}>
            Your name *
          </label>
        </div>
        <div className="relative">
          <input id="contact-email" name="email" type="email" autoComplete="email" required disabled={busy} placeholder="Email" className={FIELD} />
          <label htmlFor="contact-email" className={LABEL}>
            Email *
          </label>
        </div>
      </div>
      <div className="relative">
        <input id="contact-subject" name="subject" type="text" disabled={busy} placeholder="Subject" className={FIELD} />
        <label htmlFor="contact-subject" className={LABEL}>
          Subject
        </label>
      </div>
      <div className="relative">
        <textarea id="contact-message" name="message" required disabled={busy} rows={5} placeholder="Message" className={`${FIELD} resize-none`} />
        <label htmlFor="contact-message" className={LABEL}>
          Message *
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={busy}
          data-magnetic
          className="label inline-flex items-center gap-2 rounded-full bg-bone px-7 py-4 text-ink transition-colors duration-300 hover:bg-signal disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send message'} <Icon name="arrow-up-right" className="size-4" />
        </button>
        <p role="status" aria-live="polite" className={`label ${status.kind === 'error' ? 'text-signal' : 'text-dim'}`}>
          {status.kind === 'sent' ? 'Sent — thank you. I’ll reply by email.' : status.kind === 'error' ? status.text : ''}
        </p>
      </div>
    </form>
  );
}
