import React from 'react';
import ContactForm from '@/components/ContactForm';
import { Reveal } from '@/components/motion';

export const metadata = {
  title: 'CONTACT | SULTAN SAJED SHAHRIAR',
  description: 'Send a direct encrypted message to Sultan Sajed Shahriar.',
};

export default function ContactPage() {
  return (
    <div className="p-4 md:p-12 relative pb-32">
      {/* Background watermark */}
      <div className="watermark">SYS_CONTACT</div>

      <Reveal as="div" preset="hud" className="max-w-xl mx-auto relative z-10">
        <ContactForm />
      </Reveal>
    </div>
  );
}
