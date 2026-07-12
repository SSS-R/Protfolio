'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

interface ClientLayoutProps {
  children: React.ReactNode;
  portfolioData: any;
}

export default function ClientLayout({ children, portfolioData }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overridePassword, setOverridePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  // Mobile Burger Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const is404 = pathname === '/_not-found' || pathname === '/404' || pathname === '/not-found';

  // Load state from sessionStorage or similar to check if already authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPass = sessionStorage.getItem('admin_password');
      if (storedPass) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const systemPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (overridePassword === systemPassword) {
      sessionStorage.setItem('admin_password', overridePassword);
      setIsAuthenticated(true);
      setIsCatModalOpen(false);
      setShowOverrideInput(false);
      setOverridePassword('');
      router.push('/admin');
    } else {
      setErrorMessage('DECRYPTION KEY MISMATCH');
    }
  };

  if (is404) {
    return <>{children}</>;
  }

  const profile = portfolioData?.profile || {
    name: "SULTAN SAJED SHAHRIAR",
    avatar: "/images/developer_avatar.png",
    class: "SOFTWARE_ENGINEER",
    base: "DHAKA, BD",
    guild: "BRAC_UNIVERSITY",
    status: "READY_FOR_QUESTS",
    level: "LVL_99_DEV"
  };

  // Top Bar main routes
  const topNavLinks = [
    { label: 'ARCHITECT', href: '/architect' },
    { label: 'INVENTORY', href: '/inventory' },
    { label: 'HUD_STATS', href: '/' },
    { label: 'TERMINAL', href: '/terminal' }
  ];

  // Sidebar new routes
  const sideNavLinks = [
    { label: 'STATUS', href: '/status', icon: 'route' },
    { label: 'ABOUT', href: '/about', icon: 'person' },
    { label: 'CONTACT', href: '/contact', icon: 'alternate_email' },
    { label: 'MUSIC', href: '/music', icon: 'music_note' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-body-md bg-background text-on-background relative select-none">
      {/* CRT Overlay effects */}
      <div className="scanline"></div>
      <div className="crt-overlay"></div>
      
      {/* TopNavBar */}
      <nav className="bg-background border-b border-outline-variant flex justify-between items-center w-full px-4 md:px-12 h-16 sticky top-0 z-50">
        <Link href="/" className="text-headline-md font-headline-md font-bold text-on-background tracking-tighter uppercase cursor-pointer hover:text-brand-amber">
          {profile.name}
        </Link>
        
        {/* Desktop Top Menu */}
        <div className="hidden md:flex gap-8 items-center h-full">
          {topNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-code-sm hover:bg-surface-variant hover:text-primary transition-none py-2 px-3 h-full flex items-center ${
                  isActive ? 'text-primary border-b-2 border-brand-amber' : 'text-on-surface-variant'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCatModalOpen(true)}
            className="btn-brutalist px-4 py-2 font-code-sm text-code-sm uppercase hidden md:block"
          >
            LOGIN_SECURE
          </button>
          
          {/* Mobile Burger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden border border-outline-variant p-2 flex items-center justify-center text-brand-amber hover:bg-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* SideNavBar (Hidden on Mobile) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-lowest border-r border-outline-variant z-40">
        <div className="p-6 border-b border-outline-variant flex flex-col items-center">
          <div className="w-24 h-24 mb-4 ruled-border bg-[#111111] relative overflow-hidden flex items-center justify-center">
            <Image 
              alt="Developer Avatar" 
              src={profile.avatar}
              width={96}
              height={96}
              className="object-cover pixelated"
            />
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface tracking-wider truncate max-w-full uppercase text-center">
            {profile.name.split(' ').slice(1).join(' ') || profile.name}
          </h2>
          <p className="text-pixel-label font-pixel-label text-brand-amber mt-2">
            {profile.level}
          </p>
        </div>
        
        {/* Sidebar Links mapping the newly requested pages */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-2 px-4">
            {sideNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 p-3 text-pixel-label font-pixel-label transition-none ${
                    isActive 
                      ? 'bg-on-tertiary-fixed text-tertiary-fixed border-l-4 border-brand-amber' 
                      : 'text-on-surface-variant opacity-70 hover:bg-surface-container-high hover:opacity-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{link.icon}</span> 
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-outline-variant">
          <nav className="flex flex-col gap-2">
            <Link 
              href={isAuthenticated ? "/admin" : "#"}
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  setIsCatModalOpen(true);
                }
              }}
              className="flex items-center gap-3 p-2 text-on-surface-variant opacity-70 hover:text-primary text-pixel-label font-pixel-label transition-none"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span> SETTINGS
            </Link>
            <button 
              onClick={() => {
                if (isAuthenticated) {
                  sessionStorage.removeItem('admin_password');
                  setIsAuthenticated(false);
                  router.push('/');
                } else {
                  setIsCatModalOpen(true);
                }
              }}
              className="flex items-center gap-3 p-2 text-left w-full text-on-surface-variant opacity-70 hover:text-primary text-pixel-label font-pixel-label transition-none"
            >
              <span className="material-symbols-outlined text-[16px]">power_settings_new</span> 
              {isAuthenticated ? "LOGOUT" : "LOGIN"}
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Responsive Navigation Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-49 bg-background flex flex-col md:hidden p-6 border-t border-brand-ruled">
          {/* Mobile CRT Effect */}
          <div className="crt-overlay"></div>
          
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto">
            {/* Core Pages (Top Bar Items) */}
            <div className="flex flex-col gap-3">
              <span className="text-secondary font-pixel-label text-[10px] uppercase border-b border-[#333] pb-1">Core Modules</span>
              <div className="grid grid-cols-2 gap-3">
                {topNavLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-3 border text-center font-code-sm uppercase ${
                        isActive 
                          ? 'border-brand-amber text-brand-amber bg-brand-amber-dim/10' 
                          : 'border-outline-variant text-secondary hover:text-primary'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Pages (Dock Sections) */}
            <div className="flex flex-col gap-3">
              <span className="text-secondary font-pixel-label text-[10px] uppercase border-b border-[#333] pb-1">Dock Sections</span>
              <div className="grid grid-cols-2 gap-3">
                {sideNavLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-3 border text-center font-code-sm uppercase ${
                        isActive 
                          ? 'border-brand-amber text-brand-amber bg-brand-amber-dim/10' 
                          : 'border-outline-variant text-secondary hover:text-primary'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Admin actions */}
            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-brand-ruled">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCatModalOpen(true);
                }}
                className="btn-brutalist w-full py-3 text-center text-code-sm"
              >
                LOGIN_SECURE
              </button>
              
              <Link
                href={isAuthenticated ? "/admin" : "#"}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (!isAuthenticated) {
                    e.preventDefault();
                    setIsCatModalOpen(true);
                  }
                }}
                className="border border-brand-ruled text-secondary p-3 text-center text-code-sm font-bold uppercase hover:bg-surface-variant hover:text-primary"
              >
                ADMIN DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-h-0 lg:pl-64">
        <main className="flex-1 w-full relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-surface-container-lowest border-t border-outline-variant w-full z-30">
          {/* Arcade Marquee */}
          <div className="marquee-container w-full border-b border-outline-variant bg-[#0a0a0a] py-2 text-brand-amber font-pixel-label text-[10px] tracking-widest uppercase">
            <div className="marquee-content">
              *** HIGH SCORES *** SSS: 999990 *** GUEST: 042069 *** NEW SYSTEM ONLINE *** ERROR 404 NOT FOUND *** INSERT COIN TO CONTINUE *** 
            </div>
          </div>
          <div className="px-4 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-secondary text-pixel-label font-pixel-label uppercase text-[10px]">
              © 2026 SULTAN_SAJED_SHAHRIAR // BUILD_VER_2.1.0
            </span>
            <div className="flex gap-6 text-pixel-label font-pixel-label text-[10px]">
              <a target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary hover:bg-surface-container-highest p-1 uppercase" href="https://github.com/SSS-R">GITHUB</a>
              <a target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary hover:bg-surface-container-highest p-1 uppercase" href="https://www.linkedin.com/in/sultan-sajed-shahriar-a71478288/">LINKEDIN</a>
              {/* TODO: point at the real feed once the account is fixed */}
              <a target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary hover:bg-surface-container-highest p-1 uppercase" href="https://reddit.com">RSS_FEED</a>
            </div>
          </div>
        </footer>
      </div>

      {/* LOGIN_SECURE Popover/Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4">
          <div className="ruled-border p-6 md:p-8 max-w-md w-full bg-[#111111] relative overflow-hidden flex flex-col items-center text-center">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-on-surface"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-on-surface"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-on-surface"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-on-surface"></div>
            
            <div className="w-full flex justify-between items-center border-b border-brand-ruled pb-4 mb-6">
              <span className="text-brand-amber font-pixel-label text-[10px]">SECURE_GATEWAY_V3</span>
              <button 
                onClick={() => {
                  setIsCatModalOpen(false);
                  setShowOverrideInput(false);
                  setErrorMessage('');
                }}
                className="text-secondary hover:text-primary font-code-sm"
              >
                [CLOSE]
              </button>
            </div>

            {/* Sleeping Cat Illustration */}
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-32 h-32 ruled-border bg-surface-variant/30 flex items-center justify-center p-2 relative group cursor-help transition-all duration-300"
            >
              <Image 
                alt="Sleeping Cat Pixel Art" 
                src="/images/sleeping_cat.png"
                width={128}
                height={128}
                className={`object-contain grayscale mix-blend-luminosity transition-all ${
                  isHovered ? 'scale-110 rotate-3' : ''
                }`}
              />
              <div className="absolute inset-0 bg-brand-amber mix-blend-overlay opacity-20"></div>
            </div>

            <h3 className="text-brand-amber font-pixel-label text-[12px] tracking-widest leading-loose mt-6">
              ACCESS DENIED.<br />CAT IS SLEEPING.
            </h3>
            
            <p className="text-code-sm text-secondary mt-4 max-w-xs">
              The credentials database is locked by the feline sentinel. Attempts to bypass will wake the sleeping beast.
            </p>

            {/* Hidden admin override */}
            {!showOverrideInput ? (
              <button 
                onClick={() => setShowOverrideInput(true)}
                className="mt-6 text-[10px] text-secondary/30 hover:text-brand-amber/80 font-code-sm transition-colors border border-transparent hover:border-brand-amber/30 px-3 py-1"
              >
                [ ADMIN_OVERRIDE.BAT ]
              </button>
            ) : (
              <form onSubmit={handleOverrideSubmit} className="w-full mt-6 pt-4 border-t border-brand-ruled flex flex-col gap-3">
                <p className="text-code-sm text-secondary text-left uppercase">ENTER DECRYPT KEY:</p>
                <div className="flex gap-2">
                  <input 
                    type="password"
                    autoFocus
                    value={overridePassword}
                    onChange={(e) => setOverridePassword(e.target.value)}
                    className="flex-1 bg-background border border-brand-ruled text-brand-amber px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                    placeholder="passphrase..."
                  />
                  <button 
                    type="submit" 
                    className="btn-brutalist px-4 py-2 text-code-sm"
                  >
                    SUBMIT
                  </button>
                </div>
                {errorMessage && <p className="text-[10px] text-error text-left mt-1">{errorMessage}</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
