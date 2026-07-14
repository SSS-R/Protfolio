import React from 'react';
import { readData } from '@/lib/store';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const data = await getPortfolioData();

  const about = data?.about || {
    biography: "Sultan Sajed Shahriar is a Computer Engineering undergraduate at BRAC University and a full-stack developer based in Dhaka, Bangladesh. His ongoing thesis explores quantum cryptography, and his engineering interests span cyber security, AI agent orchestration, and system design.",
    aims: "To complete thesis research in quantum cryptography, ship Master Sentinel v1.0, and grow into security-focused systems engineering.",
    interests: [
      "Cyber Security & Network Defense",
      "Quantum Cryptography",
      "AI Agent Orchestration & Context Engineering",
      "Full-Stack Web Development",
      "System Architecture & Database Design"
    ]
  };

  return (
    <div className="p-4 md:p-12 relative pb-32">
      {/* Background conf watermark */}
      <div className="watermark">SYS_ABOUT</div>

      <Reveal as="div" preset="hud" className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">

        {/* Header Block */}
        <div className="md:col-span-12 border border-brand-ruled p-6 bg-brand-dark/85 backdrop-blur-sm">
          <h1 className="text-headline-xl-mobile md:text-headline-xl font-headline-xl text-primary uppercase tracking-widest blinking-cursor">
            PERSONNEL_DOSSIER
          </h1>
          <div className="flex items-center gap-2 mt-2 text-code-sm font-code-sm text-secondary">
            <span className="material-symbols-outlined text-[16px]">folder_shared</span>
            <span>IDENT: SULTAN_SAJED_SHAHRIAR · SECURITY: CLASSIFIED_PUBLIC</span>
          </div>
        </div>

        {/* Biography Section */}
        <RevealGroup as="section" preset="hud" className="md:col-span-8 border border-brand-ruled bg-surface p-6 flex flex-col gap-6">
          <RevealItem preset="hud">
            <h2 className="text-headline-md font-headline-md text-primary border-b border-brand-ruled pb-4 mb-4 uppercase">
              BIOGRAPHY
            </h2>
            <p className="text-body-md text-secondary leading-relaxed font-code-sm text-justify">
              {about.biography}
            </p>
          </RevealItem>

          <RevealItem preset="hud">
            <h2 className="text-headline-md font-headline-md text-primary border-b border-brand-ruled pb-4 mb-4 uppercase">
              PRIMARY_AIMS
            </h2>
            <p className="text-body-md text-secondary leading-relaxed font-code-sm text-justify">
              {about.aims}
            </p>
          </RevealItem>
        </RevealGroup>

        {/* Specialization HUD Sidebar */}
        <section className="md:col-span-4 flex flex-col gap-6">
          <div className="border border-brand-ruled bg-[#111111] p-6">
            <h3 className="text-code-sm font-code-sm text-brand-amber uppercase border-b border-brand-ruled pb-2 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">security</span>
              AREAS_OF_FOCUS
            </h3>
            <RevealGroup as="ul" preset="hud" className="flex flex-col gap-3 font-code-sm text-secondary">
              {about.interests.map((interest: string, idx: number) => (
                <RevealItem
                  key={idx}
                  as="li"
                  preset="hud"
                  className="flex gap-2 items-start border border-[#333] p-2 bg-background hover:border-brand-amber hover:text-brand-amber cursor-default"
                >
                  <span className="text-brand-amber font-bold">&gt;</span>
                  <span>{interest}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

      </Reveal>

      {/* Floating Status Bar */}
      <div className="bg-surface-container-lowest border-t border-outline-variant w-full px-4 md:px-12 py-2 flex justify-between items-center z-40 fixed bottom-0 left-0 lg:left-64 lg:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4 text-code-sm font-code-sm">
          <span className="animate-pulse text-brand-amber">●</span>
          <span className="uppercase tracking-widest text-secondary truncate">
            DOSSIER: ACCESS AUTHORIZED PUBLIC
          </span>
        </div>
        <div className="text-pixel-label font-pixel-label uppercase text-secondary text-[10px] hidden md:block">
          STATUS: ACTIVE
        </div>
      </div>
    </div>
  );
}
