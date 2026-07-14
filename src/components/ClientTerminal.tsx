'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Reveal } from './motion';

interface TerminalCommand {
  command: string;
  response: string;
}

interface ClientTerminalProps {
  initialCommands: TerminalCommand[];
}

export default function ClientTerminal({ initialCommands }: ClientTerminalProps) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [latency, setLatency] = useState(12);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert array of commands to a key-value map for quick lookup
  const commandMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    initialCommands.forEach((cmd) => {
      map[cmd.command.toLowerCase().trim()] = cmd.response;
    });
    // Add default fallback clear helper if not defined
    if (!map['/clear']) map['/clear'] = '';
    return map;
  }, [initialCommands]);

  useEffect(() => {
    // Initial boot sequence
    const bootLines = [
      'INITIALIZING BOOT SEQUENCE...',
      'KERNEL LOADED.',
      'CONNECTION ESTABLISHED. TYPE help FOR COMMANDS.',
    ];
    
    bootLines.forEach((line, idx) => {
      setTimeout(() => {
        setHistory((prev) => [...prev, line]);
      }, (idx + 1) * 300);
    });

    // Latency simulator updates every 2 seconds
    const latencyInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 20 + 5));
    }, 2000);

    return () => {
      clearInterval(latencyInterval);
    };
  }, []);

  useEffect(() => {
    // Scroll only the terminal's own output panel, never the page itself.
    // (scrollIntoView bubbles to the outer viewport too, which was yanking
    // the whole page down to the terminal on every boot line.)
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim().toLowerCase();
    if (!cmd) return;

    // Add command to history
    setHistory((prev) => [...prev, `SULTAN@PORTFOLIO:~$ ${inputValue}`]);

    // Handle command responses
    if (cmd === '/clear' || cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'help') {
      const helpMsg = commandMap['help'] || 'AVAILABLE COMMANDS:\n  /goto [home | cv | projects | contact]\n  /contact\n  /social\n  /whoami\n  /clear';
      setHistory((prev) => [...prev, helpMsg]);
    } else if (cmd.startsWith('/goto ')) {
      const page = cmd.replace('/goto ', '').trim();
      if (page === 'home' || page === 'hud_stats') {
        setHistory((prev) => [...prev, 'REDIRECTING TO HUD_STATS...']);
        setTimeout(() => router.push('/'), 800);
      } else if (page === 'cv' || page === 'architect') {
        setHistory((prev) => [...prev, 'REDIRECTING TO ARCHITECT_CV...']);
        setTimeout(() => router.push('/architect'), 800);
      } else if (page === 'projects' || page === 'inventory') {
        setHistory((prev) => [...prev, 'REDIRECTING TO INVENTORY...']);
        setTimeout(() => router.push('/inventory'), 800);
      } else if (page === 'contact' || page === 'terminal') {
        setHistory((prev) => [...prev, 'STAYING IN CURRENT TERMINAL.']);
      } else {
        setHistory((prev) => [...prev, `UNKNOWN DESTINATION: ${page}. Valid targets: home, cv, projects, contact.`]);
      }
    } else if (commandMap[cmd] !== undefined) {
      setHistory((prev) => [...prev, commandMap[cmd]]);
    } else {
      setHistory((prev) => [...prev, `COMMAND NOT FOUND: ${inputValue}. TYPE help FOR LIST.`]);
    }

    setInputValue('');
  };

  return (
    <Reveal as="div" preset="hud" className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative z-20 min-h-[calc(100vh-64px)]">
      {/* Main Terminal Container */}
      <div 
        onClick={handleTerminalClick}
        className="flex-1 border border-outline-variant bg-[#111111] p-6 font-code-sm text-code-sm flex flex-col relative overflow-hidden cursor-text"
      >
        {/* Output lines */}
        <div ref={outputRef} className="flex-1 overflow-y-auto flex flex-col gap-2 text-brand-amber pb-4">
          {history.map((line, idx) => (
            <div
              key={idx}
              className={line.startsWith('SULTAN@PORTFOLIO:~$') ? 'text-white' : 'opacity-90'}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Input prompt line */}
        <form 
          onSubmit={handleCommandSubmit}
          className="flex items-center gap-2 text-brand-amber border-t border-[#333333] pt-4"
        >
          <span className="shrink-0">SULTAN@PORTFOLIO:~$</span>
          <input 
            ref={inputRef}
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-brand-amber p-0 m-0 font-code-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="blinking-cursor shrink-0">_</span>
        </form>
      </div>

      {/* Fallback Interface links */}
      <div className="mt-4 border border-outline-variant bg-surface-container-low p-4">
        <div className="text-pixel-label font-pixel-label text-on-surface-variant mb-4 uppercase text-[10px]">
          FALLBACK_INTERFACE
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/SSS-R"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-outline-variant px-4 py-2 font-pixel-label text-[10px] text-primary hover:bg-[#F5A623] hover:text-[#0A0A0A] hover:border-[#F5A623] uppercase"
          >
            [ GITHUB ]
          </a>
          <a
            href="https://www.linkedin.com/in/sultan-sajed-shahriar-a71478288/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-outline-variant px-4 py-2 font-pixel-label text-[10px] text-primary hover:bg-[#F5A623] hover:text-[#0A0A0A] hover:border-[#F5A623] uppercase"
          >
            [ LINKEDIN ]
          </a>
          <a
            href="mailto:sultan.txt.official@gmail.com"
            className="border border-outline-variant px-4 py-2 font-pixel-label text-[10px] text-primary hover:bg-[#F5A623] hover:text-[#0A0A0A] hover:border-[#F5A623] uppercase"
          >
            [ EMAIL ]
          </a>
        </div>
      </div>

      {/* Latency / Connection status bar */}
      <div className="mt-4 border-t border-outline-variant pt-2 flex justify-between items-center text-pixel-label font-pixel-label text-on-surface-variant text-[10px]">
        <span>TERMINAL: CONNECTION: ESTABLISHED</span>
        <span>LATENCY: {latency}ms</span>
      </div>
    </Reveal>
  );
}
