import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { readData } from '@/lib/store';
import type { Project, Skill } from '@/types/portfolio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getPortfolioData();

  const profile = data?.profile || {
    name: "SULTAN SAJED SHAHRIAR",
    avatar: "/images/developer_avatar.png",
    class: "SOFTWARE_ENGINEER",
    base: "DHAKA, BD",
    guild: "BRAC_UNIVERSITY",
    status: "READY_FOR_QUESTS",
    level: "LVL_99_DEV"
  };

  const nowBuilding = data?.nowBuilding || "Master Sentinel v1.0 · Code Shepherd · PC Lagbe";

  const skills = data?.skills || [
    { "name": "PY", "equipped": true },
    { "name": "TS", "equipped": true },
    { "name": "REACT", "equipped": true },
    { "name": "CLAUDE", "equipped": true },
    { "name": "NODE", "equipped": true }
  ];

  // Grid has 12 slots, fill the rest with empty slots if needed
  const totalGridSlots = 12;
  const filledSlots = skills.slice(0, totalGridSlots);
  const emptySlotsCount = Math.max(0, totalGridSlots - filledSlots.length);
  const emptySlots = Array(emptySlotsCount).fill(null);

  const activeProjects = (data?.projects || []).filter((p: Project) => p.category === 'ACTIVE');

  return (
    <div className="flex flex-col min-h-screen">
      {/* HUD Status Bar */}
      <div className="w-full bg-brand-amber text-background border-b border-outline-variant py-2 px-4 md:px-8 z-10">
        <p className="font-pixel-label text-pixel-label uppercase tracking-widest text-center md:text-left text-[10px]">
          CURRENTLY BUILDING: {nowBuilding}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 flex flex-col gap-12 w-full">
        {/* Hero Section */}
        <section className="ruled-border p-6 md:p-12 bg-surface-container-lowest relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 flex flex-col gap-6">
              <h1 className="text-headline-xl-mobile md:text-headline-xl font-headline-xl text-primary uppercase tracking-wider leading-none">
                SULTAN SAJED<br/>SHAHRIAR
              </h1>
              <p className="text-body-lg font-code-sm text-on-surface-variant blinking-cursor">
                CS Student · Freelance Web Dev · AI Systems Builder
              </p>
              {profile.intro && (
                <p className="text-body-md text-secondary max-w-2xl leading-relaxed mt-2">
                  {profile.intro}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-4">
                <Link href="/inventory" className="btn-brutalist px-6 py-3 font-code-sm text-code-sm font-bold tracking-widest text-center">
                  VIEW WORK
                </Link>
                <Link href="/architect" className="btn-brutalist px-6 py-3 font-code-sm text-code-sm font-bold tracking-widest text-center">
                  DOWNLOAD CV
                </Link>
              </div>
            </div>
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="w-48 h-48 ruled-border bg-[#111111] relative overflow-hidden flex items-center justify-center">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={profile.avatar}
                  aria-label="Animated developer avatar typing at a retro computer"
                  className="object-cover w-full h-full"
                >
                  <source src="/videos/hero-loop.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          {/* Grid background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
        </section>

        {/* Grid Layout for About & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* RPG Stat Block (About) */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <h2 className="text-headline-md font-headline-md text-primary uppercase border-b border-outline-variant pb-2">CHARACTER_SHEET</h2>
            <div className="ruled-border bg-[#111111] p-0 flex flex-col">
              <div className="flex justify-between items-center border-b border-outline-variant p-4">
                <span className="text-secondary font-code-sm">CLASS</span>
                <span className="text-primary font-code-sm font-bold">{profile.class}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant p-4">
                <span className="text-secondary font-code-sm">BASE</span>
                <span className="text-primary font-code-sm">{profile.base}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant p-4">
                <span className="text-secondary font-code-sm">GUILD</span>
                <span className="text-primary font-code-sm">{profile.guild}</span>
              </div>
              <div className="flex justify-between items-center p-4">
                <span className="text-secondary font-code-sm">STATUS</span>
                <span className="text-brand-amber font-code-sm blinking-cursor">{profile.status}</span>
              </div>
            </div>
          </section>

          {/* Skills Inventory */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            <h2 className="text-headline-md font-headline-md text-primary uppercase border-b border-outline-variant pb-2">INVENTORY (SKILLS)</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-px bg-[#333333] border border-[#333333]">
              {/* Skill Slots */}
              {filledSlots.map((skill: Skill, idx: number) => (
                <div 
                  key={idx} 
                  className="aspect-square bg-background flex flex-col items-center justify-center p-2 hover:bg-[#111111] border-2 border-transparent hover:border-brand-amber transition-none cursor-pointer group"
                >
                  <span className={`font-code-sm text-xs font-bold ${
                    skill.equipped ? 'text-brand-amber' : 'text-secondary group-hover:text-brand-amber'
                  }`}>
                    {skill.name}
                  </span>
                </div>
              ))}
              {emptySlots.map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square bg-[#111111] flex flex-col items-center justify-center p-2"></div>
              ))}
            </div>
          </section>
        </div>

        {/* Projects Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-outline-variant pb-2">
            <h2 className="text-headline-md font-headline-md text-primary uppercase">ACTIVE_PROJECTS</h2>
            <span className="text-secondary font-code-sm text-xs">PAGE 01 / 01</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProjects.map((project: Project) => (
              <article 
                key={project.id} 
                className="ruled-border bg-surface-container-lowest flex flex-col group hover:border-brand-amber transition-none"
              >
                <div className="h-48 border-b border-outline-variant bg-[#111111] relative overflow-hidden flex items-center justify-center">
                  <Image
                    alt={project.title}
                    src={project.image || '/images/network_nodes.png'}
                    width={128}
                    height={128}
                    className="object-contain opacity-80 group-hover:opacity-100 transition-opacity pixelated"
                  />
                  <div className="absolute top-2 right-2 bg-brand-amber text-background font-pixel-label text-[8px] px-2 py-1 uppercase font-bold">
                    {project.subtitle}
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <h3 className="text-headline-md font-headline-md text-primary uppercase">
                    {project.title}
                  </h3>
                  <p className="text-body-md font-code-sm text-on-surface-variant flex-1">
                    {project.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-outline-variant">
                    {project.tech.map((t: string) => (
                      <span 
                        key={t} 
                        className="text-[10px] font-code-sm text-brand-amber border border-brand-amber px-2 py-1 uppercase"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
