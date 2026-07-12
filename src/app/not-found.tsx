import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="bg-background text-on-background min-h-screen overflow-hidden selection:bg-brand-amber selection:text-background flex flex-col items-center justify-center relative font-code-sm grid-bg">
      {/* Ambient Effects */}
      <div className="scanline"></div>
      <div className="crt-overlay"></div>
      <div className="absolute inset-0 bg-background/80 z-0"></div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-4xl px-4 md:px-12 flex flex-col items-center">
        {/* Error Block Container */}
        <div className="border border-brand-ruled bg-surface-container-lowest p-8 w-full flex flex-col items-center gap-8 relative overflow-hidden">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-on-surface"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-on-surface"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-on-surface"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-on-surface"></div>
          
          {/* Top Status Bar */}
          <div className="w-full flex justify-between items-center border-b border-brand-ruled pb-4 mb-4">
            <div className="flex items-center gap-2 text-error font-pixel-label text-[10px]">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>SYS.ERR_404</span>
            </div>
            <div className="text-on-surface-variant font-code-sm text-code-sm flex gap-4">
              <span>CONNECTION: LOST</span>
              <span className="hidden md:inline">TGT: NULL</span>
            </div>
          </div>

          {/* Illustration & Glitch Typography Area */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full py-8">
            {/* The Illustration */}
            <div className="w-64 h-64 border border-brand-ruled bg-surface-variant/30 flex items-center justify-center p-2 relative group shrink-0">
              <div className="absolute inset-0 border border-brand-amber/20 scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image 
                alt="Broken computer 404 illustration" 
                src="/images/404_character.png"
                width={256}
                height={256}
                className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity pixelated"
              />
              {/* Overlay to enforce dark/amber brutalist tone on the image */}
              <div className="absolute inset-0 bg-brand-amber mix-blend-overlay opacity-20"></div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary tracking-tighter uppercase flex items-end gap-2">
                404<span className="text-brand-amber animate-pulse">_</span>
              </h1>
              <h2 className="font-pixel-label text-pixel-label text-on-surface-variant tracking-widest text-center md:text-left mt-2 leading-loose text-[10px]">
                PAGE_NOT_FOUND<br/>
                &gt; DESTINATION UNREACHABLE<br/>
                &gt; DATA CORRUPTED OR MOVED
              </h2>
            </div>
          </div>

          {/* Action Area */}
          <div className="w-full border-t border-brand-ruled pt-8 mt-4 flex justify-center">
            <Link 
              href="/" 
              className="group relative inline-flex items-center justify-center border border-brand-amber bg-transparent px-8 py-4 text-brand-amber font-code-sm text-code-sm uppercase tracking-wider hover:bg-brand-amber hover:text-background transition-none"
            >
              <span className="mr-3 material-symbols-outlined text-[16px]">terminal</span>
              [ RETURN TO MAIN MENU ]
              
              {/* Decorative button brackets */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-amber -translate-x-1 -translate-y-1"></span>
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-amber translate-x-1 translate-y-1"></span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
