import React from 'react';
import { readData } from '@/lib/store';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';
import type { RoadmapNode } from '@/types/portfolio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const data = await getPortfolioData();
  const roadmap = data?.roadmap || [];

  const completedQuests = roadmap.filter((node: RoadmapNode) => node.status === 'completed');
  const activeQuests = roadmap.filter((node: RoadmapNode) => node.status === 'active');
  const lockedQuests = roadmap.filter((node: RoadmapNode) => node.status === 'locked');

  const totalQuests = roadmap.length;
  const progressPercent = totalQuests > 0 ? Math.round((completedQuests.length / totalQuests) * 100) : 0;

  // Icon mapping for quest node types
  const getIconName = (type: string) => {
    switch (type) {
      case 'education': return 'school';
      case 'career': return 'work';
      case 'aim':
      default: return 'my_location';
    }
  };

  return (
    <div className="p-4 md:p-12 relative pb-32">
      {/* Background conf watermark */}
      <div className="watermark">SYS_STATUS</div>

      <Reveal as="div" preset="hud" className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Header Block */}
        <div className="lg:col-span-12 border border-brand-ruled p-6 bg-brand-dark/85 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-headline-xl-mobile md:text-headline-xl font-headline-xl text-primary uppercase tracking-widest blinking-cursor">
                QUEST_LOG
              </h1>
              <div className="flex items-center gap-2 mt-2 text-code-sm font-code-sm text-secondary">
                <span className="material-symbols-outlined text-[16px]">timeline</span>
                <span>SYSTEM ROADMAP & ACTIVE CRITICAL PATHS</span>
              </div>
            </div>
            <div className="border border-brand-amber px-4 py-2 font-pixel-label text-[10px] text-brand-amber bg-brand-amber-dim/5">
              XP_MULTIPLIER: ACTIVE
            </div>
          </div>
        </div>

        {/* Quest tree display (Left/Main col) */}
        <section className="lg:col-span-8 border border-brand-ruled bg-surface p-6">
          <h2 className="text-headline-md font-headline-md text-primary border-b border-brand-ruled pb-4 mb-8 uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-brand-amber">account_tree</span>
            LIFE_ACTIVITY_TREE
          </h2>

          <RevealGroup preset="hud" className="relative pl-8 border-l border-brand-ruled space-y-12">
            {roadmap.map((node: RoadmapNode) => {
              const isCompleted = node.status === 'completed';
              const isActive = node.status === 'active';
              const isLocked = node.status === 'locked';

              return (
                <RevealItem
                  key={node.id}
                  preset="hud"
                  className={`relative flex flex-col md:flex-row gap-4 md:items-start transition-opacity duration-300 ${
                    isLocked ? 'opacity-40 hover:opacity-60' : 'opacity-100'
                  }`}
                >
                  {/* Tree connector node dot */}
                  <div className={`absolute -left-[45px] top-1.5 w-6 h-6 flex items-center justify-center bg-background border rounded-none ${
                    isCompleted ? 'border-brand-amber text-brand-amber' : 
                    isActive ? 'border-brand-amber text-brand-amber animate-pulse bg-brand-amber/10' :
                    'border-[#333] text-secondary'
                  }`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : isActive ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin-slow">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                    )}
                  </div>

                  {/* Year log stamp */}
                  <div className="md:w-28 shrink-0">
                    <span className={`font-pixel-label text-[9px] border px-2 py-1 uppercase ${
                      isCompleted ? 'border-brand-amber text-brand-amber' :
                      isActive ? 'border-brand-amber text-brand-amber animate-pulse' :
                      'border-brand-ruled text-secondary'
                    }`}>
                      {node.year}
                    </span>
                  </div>

                  {/* Quest content box */}
                  <div className={`flex-1 border p-4 bg-[#111] ${
                    isActive ? 'border-brand-amber' : 'border-brand-ruled'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline-md text-primary font-bold uppercase text-sm md:text-base">
                        {node.title}
                      </h3>
                      <span className="material-symbols-outlined text-secondary text-sm shrink-0 pl-2">
                        {getIconName(node.type)}
                      </span>
                    </div>
                    <p className="text-code-sm text-secondary leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </section>

        {/* Quest HUD dashboard (Right col) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Progress Tracker */}
          <div className="border border-brand-ruled bg-surface p-6 flex flex-col gap-4">
            <h3 className="text-code-sm font-code-sm text-secondary uppercase border-b border-brand-ruled pb-2">
              QUEST PROGRESSION
            </h3>
            
            <div className="flex justify-between items-end font-code-sm">
              <span className="text-secondary text-xs">TOTAL XP PATHWAY:</span>
              <span className="text-brand-amber font-pixel-label text-[10px]">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-4 bg-[#333333] border border-brand-dark flex">
              <div className="h-full bg-brand-amber" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px] font-pixel-label uppercase">
              <div className="border border-brand-ruled p-2">
                <span className="text-brand-amber block text-xs">{completedQuests.length}</span>
                <span className="text-secondary text-[8px] mt-1 block">DONE</span>
              </div>
              <div className="border border-brand-amber p-2 bg-brand-amber-dim/5 animate-pulse">
                <span className="text-brand-amber block text-xs">{activeQuests.length}</span>
                <span className="text-secondary text-[8px] mt-1 block">ACTIVE</span>
              </div>
              <div className="border border-brand-ruled p-2 opacity-50">
                <span className="text-secondary block text-xs">{lockedQuests.length}</span>
                <span className="text-secondary text-[8px] mt-1 block">LOCKED</span>
              </div>
            </div>
          </div>

          {/* Icon Legend */}
          <div className="border border-brand-ruled bg-[#111111] p-6 flex flex-col gap-4">
            <h3 className="text-code-sm font-code-sm text-secondary uppercase border-b border-brand-ruled pb-2">
              QUEST CATEGORIES
            </h3>
            
            <div className="flex flex-col gap-3 font-code-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-amber text-lg">school</span>
                <div>
                  <p className="text-primary font-bold uppercase text-xs">ACADEMIC PATHWAY</p>
                  <p className="text-secondary text-[11px]">Schooling, University milestones, thesis.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-amber text-lg">work</span>
                <div>
                  <p className="text-primary font-bold uppercase text-xs">FIELD EXPERIENCE</p>
                  <p className="text-secondary text-[11px]">Corporate job roles, industry tasks.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-amber text-lg">my_location</span>
                <div>
                  <p className="text-primary font-bold uppercase text-xs">AIMS & FUTURE RESEARCH</p>
                  <p className="text-secondary text-[11px]">Cyber security, post-quantum objectives.</p>
                </div>
              </div>
            </div>
          </div>

        </section>

      </Reveal>

      {/* Floating Status Bar */}
      <div className="bg-surface-container-lowest border-t border-outline-variant w-full px-4 md:px-12 py-2 flex justify-between items-center z-40 fixed bottom-0 left-0 lg:left-64 lg:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4 text-code-sm font-code-sm">
          <span className="animate-pulse text-brand-amber">●</span>
          <span className="uppercase tracking-widest text-secondary truncate">
            LOGS: ROADMAP TREE GENERATED SUCCESSFULLY
          </span>
        </div>
        <div className="text-pixel-label font-pixel-label uppercase text-secondary text-[10px] hidden md:block">
          SYS_OK
        </div>
      </div>
    </div>
  );
}
