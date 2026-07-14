'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Reveal } from './motion';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  tech: string[];
  image: string;
  status: string;
  category: string;
  link: string;
}

interface ClientInventoryProps {
  projects: Project[];
}

export default function ClientInventory({ projects }: ClientInventoryProps) {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'SHIPPED' | 'TBD'>('ACTIVE');

  // Filter projects by active category tab
  const filteredProjects = projects.filter(
    (p) => p.category.toUpperCase() === activeTab
  );

  // We always show a grid of at least 6 items. If filtered list is less, fill up to 6 with Locked Slots.
  const minimumSlots = 6;
  const lockedSlotsCount = Math.max(2, minimumSlots - filteredProjects.length);
  const lockedSlots = Array(lockedSlotsCount).fill(null);

  const tabs: ('ACTIVE' | 'SHIPPED' | 'TBD')[] = ['ACTIVE', 'SHIPPED', 'TBD'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header / Top Bar */}
      <header className="border-b border-outline-variant px-4 md:px-12 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111111] z-10">
        <div>
          <h1 className="text-headline-xl-mobile md:text-headline-xl font-headline-xl uppercase text-primary">INVENTORY</h1>
          <p className="text-code-sm font-code-sm text-secondary mt-2">
            BUILDS: {filteredProjects.length.toString().padStart(2, '0')} / ?? DISCOVERED
          </p>
        </div>
        <div className="flex gap-4 font-code-sm text-code-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 uppercase transition-none border-b-2 font-bold cursor-pointer ${
                activeTab === tab
                  ? 'text-primary border-brand-amber'
                  : 'text-secondary hover:text-primary border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Inventory Grid */}
      <section className="flex-1 p-4 md:p-12 z-10">
        <Reveal key={activeTab} as="div" preset="hud" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant border border-outline-variant">

          {/* Render projects */}
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="group-hover-rotateY-180 group h-64 bg-background relative perspective-1000"
            >
              <div className="card-inner w-full h-full absolute transition-transform duration-500">
                {/* Front Side of Card */}
                <div className="card-front w-full h-full absolute border border-brand-amber p-4 flex flex-col justify-between bg-background">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 border border-[#333333] bg-[#111111] flex items-center justify-center relative overflow-hidden">
                      <Image 
                        alt={`${project.title} logo`} 
                        src={project.image}
                        width={32}
                        height={32}
                        className="object-contain pixelated"
                      />
                    </div>
                    <span className="text-pixel-label font-pixel-label text-brand-amber text-[10px]">
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-headline-md font-headline-md text-primary mb-2 uppercase">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-pixel-label font-pixel-label text-secondary text-[8px]">
                      {project.tech.map((t) => (
                        <span key={t}>[{t.toUpperCase()}]</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Back Side of Card */}
                <div className="card-back w-full h-full absolute border border-brand-amber p-4 bg-[#111111] flex flex-col justify-center gap-4 text-center">
                  <p className="text-code-sm font-code-sm text-primary">
                    {project.desc}
                  </p>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="border border-brand-amber text-brand-amber px-4 py-2 hover:bg-brand-amber hover:text-background font-pixel-label text-[10px] mx-auto mt-2 inline-block transition-none"
                  >
                    DEPLOY &gt;&gt;
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Render locked slots */}
          {lockedSlots.map((_, idx) => (
            <div 
              key={`locked-${idx}`} 
              className="h-64 bg-background relative border border-[#333333] p-4 flex flex-col justify-center items-center opacity-30 select-none hover:opacity-40 transition-opacity"
            >
              <Image 
                alt="Locked Slot Padlock" 
                src="/images/padlock.png"
                width={48}
                height={48}
                className="object-contain pixelated mb-4"
              />
              <span className="text-headline-md font-headline-md text-secondary">???</span>
              <span className="text-pixel-label font-pixel-label text-secondary mt-2 text-[10px]">LOCKED</span>
            </div>
          ))}

        </Reveal>

        <div className="mt-12 text-center text-code-sm font-code-sm text-secondary">
          MORE ITEMS LOADING<span className="blinking-cursor">_</span>
        </div>
      </section>

      {/* Footer Status Bar */}
      <footer className="mt-auto border-t border-outline-variant bg-[#0A0A0A] px-4 md:px-12 py-2 flex justify-between items-center text-pixel-label font-pixel-label text-secondary text-[10px] z-10">
        <span>INVENTORY: VIEWING: {activeTab}_BUILDS · {filteredProjects.length} PROJECTS LOADED</span>
        <span>SYSTEM_OK</span>
      </footer>
    </div>
  );
}
