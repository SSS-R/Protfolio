import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="site flex min-h-screen flex-col justify-between px-5 py-6 md:px-10 md:py-8">
      <div className="label flex justify-between text-dim">
        <Link href="/" className="u-link text-bone">
          {SITE.name}
        </Link>
        <span>Error 404</span>
      </div>

      <main>
        <p className="label text-signal">Signal lost</p>
        <h1 className="display mt-4 text-[42vw] leading-[0.75] md:text-[30vw]">404</h1>
        <p className="mt-8 max-w-[34ch] text-[19px] leading-relaxed text-dim">
          Nothing is transmitting on this address. It may have moved in the redesign.
        </p>
        <div className="label mt-10 flex flex-wrap gap-4">
          <Link href="/" className="rounded-full bg-bone px-6 py-4 text-ink transition-colors hover:bg-signal">
            Back to the index
          </Link>
          <Link href="/work" className="rounded-full border border-bone px-6 py-4 transition-colors hover:bg-bone hover:text-ink">
            See the work
          </Link>
        </div>
      </main>

      <p className="label text-dim">{SITE.coords}</p>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
