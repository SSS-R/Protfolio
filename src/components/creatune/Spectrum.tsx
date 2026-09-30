'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from '../CreaTunePlayer';

// Ridgeline spectrum: every ~60ms the current FFT (mirrored so the low end sits
// in the middle) becomes a new line at the front; older lines recede upward and
// are hidden behind newer peaks. While nothing plays, a synthetic pulse keeps
// the plot breathing. One 2D canvas, paused offscreen, a still under reduced motion.

const INK = '#0b0b0c';
const PUSH_MS = 60;

export default function Spectrum({ className = '' }: { className?: string }) {
  const { readSpectrum } = usePlayer();
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const LINES = mobile ? 22 : 34;
    const POINTS = mobile ? 64 : 112;
    const rows = Array.from({ length: LINES }, () => new Float32Array(POINTS));
    const freq = new Uint8Array(64);
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    let head = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let lastPush = 0;

    const sample = (row: Float32Array, t: number) => {
      const live = readSpectrum(freq);
      for (let i = 0; i < POINTS; i++) {
        const d = Math.abs(i / (POINTS - 1) - 0.5) * 2; // 0 centre → 1 edge
        let v: number;
        if (live) {
          // Interpolate between bins for smooth ridges; bass is always loud, so
          // tilt the weight toward the mids and soft-limit so peaks never clip.
          const f = 1.5 + Math.pow(d, 0.85) * 38;
          const lo = Math.floor(f);
          const raw = (freq[lo] + (freq[Math.min(lo + 1, freq.length - 1)] - freq[lo]) * (f - lo)) / 255;
          v = 1 - Math.exp(-3 * raw ** 1.3 * (0.45 + 0.8 * d)) + Math.random() * 0.03;
        } else {
          v =
            0.55 * Math.exp(-(((d - 0.1 - 0.07 * Math.sin(t * 0.6)) / 0.09) ** 2)) * (0.55 + 0.45 * Math.sin(t * 1.7)) +
            0.32 * Math.exp(-(((d - 0.34 - 0.05 * Math.cos(t * 0.9)) / 0.07) ** 2)) * (0.5 + 0.5 * Math.sin(t * 2.3 + 1)) +
            Math.random() * 0.05;
        }
        row[i] = Math.max(0, v) * (0.12 + 0.88 * (1 - d * d));
      }
    };

    const draw = (frac: number) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const plotW = Math.min(w * 0.92, h * 1.9);
      const left = (w - plotW) / 2;
      const top = h * 0.14;
      const gap = (h * 0.82) / LINES;
      const amp = gap * 6;
      g.lineWidth = 1.2;
      g.lineJoin = 'round';

      for (let k = 0; k < LINES; k++) {
        const row = rows[(head + 1 + k) % LINES]; // oldest first (back), newest last (front)
        const y0 = top + (k + 1 - frac) * gap;
        g.beginPath();
        g.moveTo(left, y0);
        for (let i = 0; i < POINTS; i++) g.lineTo(left + (plotW * i) / (POINTS - 1), y0 - row[i] * amp);
        g.lineTo(left + plotW, y0);
        // Occlude everything behind this line, then draw it.
        g.lineTo(left + plotW, h);
        g.lineTo(left, h);
        g.closePath();
        g.fillStyle = INK;
        g.fill();

        const front = k === LINES - 1;
        let alpha = 0.18 + 0.72 * (k / (LINES - 1));
        if (k === 0) alpha *= 1 - frac; // the oldest fades out as it leaves
        if (front) alpha *= frac; // the newest fades in as it arrives
        g.beginPath();
        g.moveTo(left, y0);
        for (let i = 0; i < POINTS; i++) g.lineTo(left + (plotW * i) / (POINTS - 1), y0 - row[i] * amp);
        g.strokeStyle = front || k === LINES - 2 ? `rgba(201,169,192,${alpha})` : `rgba(236,231,223,${alpha})`;
        g.stroke();
      }
    };

    const loop = (now: number) => {
      if (now - lastPush >= PUSH_MS) {
        head = (head + 1) % LINES;
        sample(rows[head], now / 1000);
        lastPush = now;
      }
      draw(Math.min(1, (now - lastPush) / PUSH_MS));
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      draw(1);
    };

    // Seed the history so the first frame is already a full plot.
    for (let k = 0; k < LINES; k++) {
      head = k;
      sample(rows[k], k * (PUSH_MS / 1000));
    }

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(c);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [readSpectrum]);

  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}
