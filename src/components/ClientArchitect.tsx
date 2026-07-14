'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Education, Experience, SkillLevel, Certification } from '@/types/portfolio';
import { Reveal, RevealGroup, RevealItem } from './motion';

interface ClientArchitectProps {
  education: Education[];
  experience: Experience[];
  skillsAcquired: SkillLevel[];
  certifications: Certification[];
}

export default function ClientArchitect({
  education,
  experience,
  skillsAcquired,
  certifications
}: ClientArchitectProps) {
  const [showWipe, setShowWipe] = useState(true);

  useEffect(() => {
    // Trigger scanline wipe animation on mount
    const timer = setTimeout(() => {
      setShowWipe(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden print:bg-white print:text-black">
      {/* Page Load scanline wipe */}
      {showWipe && <div className="scanline-wipe print:hidden"></div>}
      
      {/* Background Watermark */}
      <div className="watermark print:hidden">CONFIDENTIAL</div>

      {/* CSS injection to handle high-fidelity printing overrides */}
      <style jsx global>{`
        @media print {
          nav, aside, footer, .scanline, .crt-overlay, .watermark, .print-btn-container, .scanline-wipe {
            display: none !important;
          }
          main, .print-content {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            color: black !important;
            background: white !important;
          }
          .ruled-border, border {
            border-color: #000 !important;
          }
          h1, h2, h3, p, span, li {
            color: black !important;
          }
          .xp-bar-bg {
            background-color: #ddd !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .xp-bar-fill {
            background-color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Main Content Layout */}
      <Reveal as="div" preset="fade" className="flex-1 p-4 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 relative pb-32 print:p-0 print:gap-4 print:pb-0">

        {/* Page Header */}
        <div className="col-span-1 md:col-span-12 border border-brand-ruled p-6 relative bg-brand-dark/80 backdrop-blur-sm print:bg-white print:border-black">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-headline-xl-mobile md:text-headline-xl font-headline-xl text-primary uppercase tracking-widest blinking-cursor print:text-black print:before:content-none">
                ARCHITECT_CV
              </h1>
              <div className="flex items-center gap-2 mt-2 text-code-sm font-code-sm text-secondary print:text-black">
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>PERSONNEL_FILE · CLEARANCE: PUBLIC</span>
              </div>
            </div>
            <div className="border-2 border-brand-amber text-brand-amber px-4 py-2 transform rotate-12 opacity-80 flex items-center gap-2 print:text-black print:border-black print:rotate-0">
              <span className="material-symbols-outlined">verified</span>
              <span className="font-headline-md font-bold uppercase tracking-widest text-lg">APPROVED</span>
            </div>
          </div>
        </div>

        {/* ACADEMY_LOG (Education) */}
        <section className="col-span-1 md:col-span-6 border border-brand-ruled bg-surface p-6 print:bg-white print:border-black">
          <h2 className="text-headline-md font-headline-md text-primary border-b border-brand-ruled pb-4 mb-6 uppercase flex items-center gap-3 print:text-black print:border-black">
            <span className="material-symbols-outlined text-brand-amber print:text-black">school</span>
            ACADEMY_LOG
          </h2>
          <RevealGroup preset="fade" className="relative pl-6 border-l-2 border-brand-amber space-y-8 print:border-black">
            {education.map((edu, idx) => (
              <RevealItem key={idx} preset="fade" className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 bg-brand-dark border-2 border-brand-amber print:bg-white print:border-black"></div>
                <div className="text-code-sm font-code-sm text-brand-amber mb-1 print:text-black">{edu.yearRange}</div>
                <h3 className="text-body-lg font-headline-md text-primary font-bold print:text-black">{edu.institution}</h3>
                <p className="text-body-md font-body-md text-secondary mt-1 print:text-black">{edu.degree}</p>
                <ul className="mt-3 space-y-1 text-code-sm font-code-sm text-on-surface-variant print:text-black">
                  {edu.bullets && edu.bullets.map((bullet: string, bIdx: number) => (
                    <li key={bIdx} className="flex gap-2 items-start">
                      <span className="text-brand-amber print:text-black">-</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* FIELD_EXPERIENCE (Work History) */}
        <section className="col-span-1 md:col-span-6 border border-brand-ruled bg-surface p-6 print:bg-white print:border-black">
          <h2 className="text-headline-md font-headline-md text-primary border-b border-brand-ruled pb-4 mb-6 uppercase flex items-center gap-3 print:text-black print:border-black">
            <span className="material-symbols-outlined text-brand-amber print:text-black">work</span>
            FIELD_EXPERIENCE
          </h2>
          <RevealGroup preset="fade" className="relative pl-6 border-l-2 border-brand-amber space-y-8 print:border-black">
            {experience.map((exp, idx) => (
              <RevealItem key={idx} preset="fade" className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 bg-brand-dark border-2 border-brand-amber print:bg-white print:border-black"></div>
                <div className="text-code-sm font-code-sm text-brand-amber mb-1 print:text-black">{exp.yearRange}</div>
                <h3 className="text-body-lg font-headline-md text-primary font-bold print:text-black">{exp.role}</h3>
                <p className="text-body-md font-body-md text-secondary mt-1 print:text-black">{exp.company}</p>
                <ul className="mt-3 space-y-1 text-code-sm font-code-sm text-on-surface-variant print:text-black">
                  {exp.bullets && exp.bullets.map((bullet: string, bIdx: number) => (
                    <li key={bIdx} className="flex gap-2 items-start">
                      <span className="text-brand-amber print:text-black">&gt;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* ACQUIRED_SKILLS (XP Skill Bars) */}
        <section className="col-span-1 md:col-span-8 border border-brand-ruled bg-surface p-6 print:bg-white print:border-black">
          <h2 className="text-headline-md font-headline-md text-primary border-b border-brand-ruled pb-4 mb-6 uppercase flex items-center gap-3 print:text-black print:border-black">
            <span className="material-symbols-outlined text-brand-amber print:text-black">memory</span>
            ACQUIRED_SKILLS
          </h2>
          <RevealGroup preset="fade" className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Split skills list into two columns dynamically */}
            {skillsAcquired.map((skill, idx) => (
              <RevealItem key={idx} preset="fade">
                <div className="flex items-center gap-4">
                  <span className="text-code-sm font-code-sm text-primary w-24 truncate print:text-black">{skill.name}</span>
                  <div className="flex-1 h-3 xp-bar-bg flex bg-[#333333]">
                    <div
                      className="h-full xp-bar-fill border-r border-brand-dark bg-brand-amber"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                    <div style={{ width: `${100 - skill.level}%` }}></div>
                  </div>
                  <span className="text-pixel-label font-pixel-label text-brand-amber w-8 text-right text-[10px] print:text-black">{skill.level}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* CERTIFICATIONS */}
        <section className="col-span-1 md:col-span-4 border border-brand-ruled bg-surface-container p-6 flex flex-col items-center justify-center min-h-[250px] print:bg-white print:border-black">
          <h2 className="text-headline-md font-headline-md text-primary w-full border-b border-brand-ruled pb-4 mb-auto uppercase flex items-center gap-3 print:text-black print:border-black">
            <span className="material-symbols-outlined print:text-black">workspace_premium</span>
            CERTIFICATIONS
          </h2>
          {certifications.length === 0 ? (
            <div className="flex flex-col items-center gap-4 mt-8 mb-auto opacity-60 print:opacity-100">
              <div className="w-16 h-16 relative">
                <Image 
                  alt="No Certs Found" 
                  src="/images/empty_certs.png"
                  width={64}
                  height={64}
                  className="object-contain grayscale mix-blend-luminosity opacity-50 print:opacity-100"
                />
              </div>
              <p className="text-code-sm font-code-sm text-secondary uppercase tracking-widest text-center border border-dashed border-outline p-2 print:text-black print:border-solid">
                NO_RECORDS_FOUND
              </p>
            </div>
          ) : (
            <RevealGroup preset="fade" className="w-full flex flex-col gap-4 mt-4 mb-auto">
              {certifications.map((cert, idx) => (
                <RevealItem key={idx} preset="fade" className="border border-brand-ruled p-3 bg-surface-container-low flex flex-col gap-1 print:bg-white print:border-black">
                  <span className="text-code-sm font-bold text-primary print:text-black">{cert.name}</span>
                  <span className="text-[10px] font-code-sm text-secondary print:text-black">{cert.issuer} ({cert.year})</span>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </section>
      </Reveal>

      {/* Floating Action Button (Print to PDF) */}
      <div className="fixed bottom-16 right-4 md:right-12 z-40 print-btn-container pointer-events-none">
        <button 
          onClick={handlePrint}
          className="btn-brutal text-headline-sm font-headline-md px-8 py-4 pointer-events-auto shadow-lg flex items-center gap-3 bg-brand-dark"
        >
          <span className="material-symbols-outlined">picture_as_pdf</span>
          [ EXPORT_FILE.PDF ]
        </button>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-surface-container-lowest border-t border-outline-variant w-full px-4 md:px-12 py-2 flex justify-between items-center z-40 fixed bottom-0 left-0 lg:left-64 lg:w-[calc(100%-16rem)] print:hidden">
        <div className="flex items-center gap-4 text-code-sm font-code-sm">
          <span className="animate-pulse text-brand-amber">●</span>
          <span className="uppercase tracking-widest text-secondary truncate">
            ARCHITECT: VIEWING: PERSONNEL_FILE · CLEARANCE PUBLIC
          </span>
        </div>
        <div className="text-pixel-label font-pixel-label uppercase text-secondary text-[10px] hidden md:block">
          SYSTEM_OK
        </div>
      </div>
    </div>
  );
}
