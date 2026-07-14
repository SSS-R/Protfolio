import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

// Constant-time string compare so the admin check can't be probed via timing.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Gate a mutating API route on the admin passphrase (sent in x-admin-password).
 * Returns a NextResponse to short-circuit with when unauthorized/misconfigured,
 * or null when the caller is authorized.
 *
 * Fail-closed: if ADMIN_PASSWORD is unset the route returns 500, never open.
 */
export function requireAdmin(request: Request): NextResponse | null {
  const provided = request.headers.get('x-admin-password') || '';
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' }, { status: 500 });
  }
  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
  }
  return null;
}
