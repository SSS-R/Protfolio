import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { CopyEmail } from '@/components/site/Footer';
import Clock from '@/components/site/Clock';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send a message to Sultan Sajed Shahriar.',
};

export default function ContactPage() {
  return (
    <section className="relative z-[1] px-5 pb-10 pt-36 md:px-10 md:pt-48" aria-labelledby="contact-title">
      <p className="label text-dim" data-scramble>
        (Contact)
      </p>
      <h1 id="contact-title" data-split className="display mt-6 text-[30vw] leading-[0.78] md:text-[17vw]">
        Let&apos;s talk
      </h1>

      <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-12 md:gap-6">
        <aside className="flex flex-col gap-10 md:col-span-4" data-fade>
          <p className="max-w-[30ch] text-[19px] leading-relaxed text-dim">
            For projects, roles or research — send a message here, or write to me directly.
          </p>
          <div>
            <p className="label text-dim">Email</p>
            <a href={`mailto:${SITE.email}`} className="u-link mt-2 inline-block text-[19px]">
              {SITE.email}
            </a>
            <div className="mt-5">
              <CopyEmail />
            </div>
          </div>
          <div>
            <p className="label text-dim">Elsewhere</p>
            <ul className="mt-2 space-y-1 text-[19px]">
              {SITE.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="u-link">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label text-dim">Local time</p>
            <p className="mt-2 text-[19px]">
              {SITE.location} — <Clock />
            </p>
          </div>
        </aside>

        <div className="md:col-span-7 md:col-start-6" data-fade="0.1">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
