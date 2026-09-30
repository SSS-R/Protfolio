'use client';

import { useSyncExternalStore } from 'react';
import { SITE } from '@/lib/site';

const format = new Intl.DateTimeFormat('en-GB', { timeZone: SITE.timeZone, hour: '2-digit', minute: '2-digit' });

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

/** Live local time in Dhaka. Renders a blank slot on the server (no hydration mismatch). */
export default function Clock({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, () => format.format(new Date()), () => '');
  return (
    <span className={className} suppressHydrationWarning>
      <span className="tabular-nums">{time || '--:--'}</span> GMT+6
    </span>
  );
}
