'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // In production, post to Formspree (email delivery, no server storage needed).
  // In local dev with no endpoint set, fall back to the /api/messages inbox.
  const formspree = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    setStatusMessage('ENCRYPTING MESSAGE PACKET...');

    try {
      const res = formspree
        ? await fetch(formspree, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name, email, subject: subject || 'No Subject', message }),
          })
        : await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message }),
          });

      if (res.ok) {
        setStatusMessage('PACKET TRANSMITTED. MESSAGE INBOX UPDATED.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const errData = await res.json();
        setStatusMessage(`TRANSMISSION FAILED: ${errData.error || 'Unknown Error'}`);
      }
    } catch {
      setStatusMessage('TRANSMISSION FAILED: NETWORK TIMEOUT.');
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  return (
    <div className="border border-brand-ruled bg-surface-container-lowest p-6 md:p-8 flex flex-col gap-6 relative">
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-on-surface"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-on-surface"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-on-surface"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-on-surface"></div>

      {/* Terminal Title Header */}
      <div className="w-full flex justify-between items-center border-b border-brand-ruled pb-4">
        <div className="flex items-center gap-2 text-brand-amber font-pixel-label text-[10px]">
          <span className="material-symbols-outlined text-[14px]">send</span>
          <span>DIRECT_MESSAGE_TRANSMITTER</span>
        </div>
        <div className="text-on-surface-variant font-code-sm text-xs">
          SYS.LOG: ONLINE
        </div>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-code-sm text-code-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-name" className="text-secondary uppercase text-xs">YOUR NAME *</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isSending}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border border-brand-ruled text-primary px-3 py-2 outline-none focus:border-brand-amber transition-colors disabled:opacity-50"
              placeholder="e.g. Guest"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-email" className="text-secondary uppercase text-xs">EMAIL ADDRESS *</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border border-brand-ruled text-primary px-3 py-2 outline-none focus:border-brand-amber transition-colors disabled:opacity-50"
              placeholder="e.g. guest@net.org"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-subject" className="text-secondary uppercase text-xs">SUBJECT</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            disabled={isSending}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background border border-brand-ruled text-primary px-3 py-2 outline-none focus:border-brand-amber transition-colors disabled:opacity-50"
            placeholder="e.g. Quest Collaboration Request"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-message" className="text-secondary uppercase text-xs">MESSAGE BODY *</label>
          <textarea
            id="contact-message"
            name="message"
            required
            disabled={isSending}
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-background border border-brand-ruled text-primary px-3 py-2 outline-none focus:border-brand-amber resize-none transition-colors disabled:opacity-50"
            placeholder="Write message content here..."
          />
        </div>

        <button 
          type="submit"
          disabled={isSending || !name || !email || !message}
          className="btn-brutalist w-full py-4 text-center text-code-sm font-bold tracking-widest bg-transparent hover:bg-brand-amber hover:text-background border-brand-border hover:border-brand-amber disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary disabled:hover:border-brand-border"
        >
          [ TRANSMIT_MESSAGE.SH ]
        </button>

        {/* Terminal log status — next to the button so it's visible after submitting */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="border border-brand-amber bg-[#111111] p-3 text-brand-amber font-code-sm uppercase blinking-cursor text-xs"
          >
            &gt; {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
}
