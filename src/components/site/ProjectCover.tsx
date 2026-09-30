'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { isRealImage } from '@/lib/site';

// Project covers. A real screenshot uploaded through the admin (project.image)
// always wins. Until then each project gets a live data graphic of its own
// mechanism — telemetry, an agent graph, pitch control — never an illustration.

type Draw = (g: CanvasRenderingContext2D, w: number, h: number, t: number, s: Scratch) => void;
type Scratch = { rnd: number[]; font: string; ys?: number[]; px?: HTMLCanvasElement };

const BG = '#141416';
const LINE = 'rgba(236,231,223,0.14)';
const DIM = 'rgba(236,231,223,0.5)';
const BONE = '#ece7df';
const SIG = '#ff5a1f';
const smooth = (x: number) => x * x * (3 - 2 * x);

function mono(g: CanvasRenderingContext2D, s: Scratch, size = 10) {
  g.font = `${size}px ${s.font}`;
  g.textBaseline = 'middle';
}

const telemetry =
  (labels: string[]): Draw =>
  (g, w, h, t, s) => {
    const rows = labels.length;
    const top = 44;
    const rowH = (h - top - 24) / rows;
    const x0 = 64;
    const x1 = w - 60;
    mono(g, s);
    g.fillStyle = DIM;
    g.fillText('LIVE — SAMPLING', 20, 22);
    labels.forEach((label, r) => {
      const y = top + r * rowH;
      const ph = s.rnd[r] * 10;
      const n = 64;
      const vals: number[] = [];
      for (let i = 0; i <= n; i++) {
        const k = i * 0.32 + t * 1.5;
        vals.push(0.5 + 0.28 * Math.sin(k + ph) + 0.16 * Math.sin(k * 2.7 - ph) + 0.06 * Math.sin(k * 7.1));
      }
      g.strokeStyle = LINE;
      g.beginPath();
      g.moveTo(20, y + rowH);
      g.lineTo(w - 20, y + rowH);
      g.stroke();
      g.beginPath();
      vals.forEach((v, i) => {
        const x = x0 + ((x1 - x0) * i) / n;
        const yy = y + rowH - 10 - v * (rowH - 22);
        if (i) g.lineTo(x, yy);
        else g.moveTo(x, yy);
      });
      const hot = r === 1;
      g.strokeStyle = hot ? SIG : BONE;
      g.lineWidth = 1.25;
      g.stroke();
      g.lineTo(x1, y + rowH);
      g.lineTo(x0, y + rowH);
      g.fillStyle = hot ? 'rgba(255,90,31,0.10)' : 'rgba(236,231,223,0.05)';
      g.fill();
      g.lineWidth = 1;
      g.fillStyle = DIM;
      g.fillText(label, 20, y + rowH / 2);
      g.fillStyle = hot ? SIG : BONE;
      g.fillText(`${Math.round(vals[n] * 100)}%`, x1 + 10, y + rowH / 2);
    });
  };

const graph: Draw = (g, w, h, t, s) => {
  const cx = w / 2;
  const cy = h / 2;
  const agents = 6;
  mono(g, s, 9);
  for (let a = 0; a < agents; a++) {
    const ang = (a / agents) * Math.PI * 2 + t * 0.12;
    const ax = cx + Math.cos(ang) * w * 0.27;
    const ay = cy + Math.sin(ang) * h * 0.3;
    g.strokeStyle = LINE;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(ax, ay);
    g.stroke();
    for (let k = 0; k < 3; k++) {
      const ta = ang + (k - 1) * 0.28;
      const tx = cx + Math.cos(ta) * w * 0.42;
      const ty = cy + Math.sin(ta) * h * 0.45;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(tx, ty);
      g.stroke();
      g.fillStyle = DIM;
      g.fillRect(tx - 1.5, ty - 1.5, 3, 3);
    }
    // a task packet travelling hub → agent → back
    const p = (t * 0.45 + s.rnd[a]) % 1;
    const q = p < 0.5 ? smooth(p * 2) : smooth(2 - p * 2);
    g.fillStyle = SIG;
    g.beginPath();
    g.arc(cx + (ax - cx) * q, cy + (ay - cy) * q, 2.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = BG;
    g.strokeStyle = BONE;
    g.beginPath();
    g.arc(ax, ay, 9, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = DIM;
    g.fillText(`agent.0${a + 1}`, ax + 14, ay);
  }
  g.strokeStyle = SIG;
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(cx, cy, 18 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 1;
  g.fillStyle = SIG;
  g.beginPath();
  g.arc(cx, cy, 5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = BONE;
  g.textAlign = 'center';
  g.fillText('CONTROL PLANE', cx, cy + 34);
  g.textAlign = 'left';
};

const converge: Draw = (g, w, h, t, s) => {
  const x0 = 44;
  const x1 = w - 24;
  const y0 = 30;
  const y1 = h - 34;
  const Y = (score: number) => y1 - ((score - 3) / 7) * (y1 - y0);
  const N = 18;
  const shown = Math.min(N, ((t % 7) / 5.5) * N);
  mono(g, s, 9);
  g.strokeStyle = LINE;
  for (let v = 4; v <= 10; v += 2) {
    g.beginPath();
    g.moveTo(x0, Y(v));
    g.lineTo(x1, Y(v));
    g.stroke();
    g.fillStyle = DIM;
    g.fillText(String(v), 18, Y(v));
  }
  g.setLineDash([4, 4]);
  g.strokeStyle = SIG;
  g.beginPath();
  g.moveTo(x0, Y(8.5));
  g.lineTo(x1, Y(8.5));
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = SIG;
  g.fillText('TARGET 8.5', x1 - 64, Y(8.5) - 10);
  const series = [
    { start: 4.2, color: BONE, name: 'OPTIMIZER' },
    { start: 9.8, color: DIM, name: 'LLM' },
  ];
  series.forEach(({ start, color, name }, k) => {
    g.strokeStyle = color;
    g.beginPath();
    let last = [x0, Y(start)];
    for (let i = 0; i <= shown; i++) {
      const damp = Math.exp(-i / 5);
      const v = 8.9 + (start - 8.9) * damp * Math.cos(i * 0.9 + k);
      last = [x0 + ((x1 - x0) * i) / N, Y(v)];
      if (i) g.lineTo(last[0], last[1]);
      else g.moveTo(last[0], last[1]);
    }
    g.stroke();
    g.fillStyle = color;
    g.beginPath();
    g.arc(last[0], last[1], 3, 0, Math.PI * 2);
    g.fill();
    g.fillText(name, x0 + k * 90, h - 14);
  });
  g.fillStyle = DIM;
  g.fillText(`ITERATION ${String(Math.floor(shown)).padStart(2, '0')}`, x1 - 84, h - 14);
};

const pages: Draw = (g, w, h, t, s) => {
  const n = 10;
  const pw = Math.min(w / 10, 84);
  const ph = pw * 1.36;
  const cycle = (Math.sin(t * 0.8) + 1) / 2;
  const split = smooth(Math.min(1, Math.max(0, cycle * 1.4 - 0.2)));
  const groups = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
  const y = h / 2 - ph / 2;
  mono(g, s, 9);
  for (let i = 0; i < n; i++) {
    const merged = w / 2 - (n * pw * 0.38) / 2 + i * pw * 0.38;
    const spread = w / 2 - (n * pw * 0.62 + 2 * pw * 0.9) / 2 + i * pw * 0.62 + groups[i] * pw * 0.9;
    const x = merged + (spread - merged) * split;
    const hot = groups[i] === 1;
    g.fillStyle = BG;
    g.strokeStyle = hot && split > 0.5 ? SIG : 'rgba(236,231,223,0.6)';
    g.fillRect(x, y - groups[i] * 6 * split, pw, ph);
    g.strokeRect(x + 0.5, y - groups[i] * 6 * split + 0.5, pw, ph);
    g.fillStyle = DIM;
    for (let l = 0; l < 5; l++) g.fillRect(x + 7, y - groups[i] * 6 * split + 10 + l * 7, pw * (l === 4 ? 0.4 : 0.7), 1.5);
  }
  g.globalAlpha = split;
  g.fillStyle = BONE;
  g.textAlign = 'center';
  ['PP. 1–3', 'PP. 4–7', 'PP. 8–10'].forEach((label, k) => {
    const first = [0, 3, 7][k];
    const count = [3, 4, 3][k];
    const x = w / 2 - (n * pw * 0.62 + 2 * pw * 0.9) / 2 + (first + count / 2) * pw * 0.62 + k * pw * 0.9 + pw * 0.2;
    g.fillText(label, x, y + ph + 26);
  });
  g.textAlign = 'left';
  g.globalAlpha = 1;
  g.fillStyle = DIM;
  g.fillText(split > 0.5 ? 'SPLIT — ON DEVICE' : 'MERGE — ON DEVICE', 20, 22);
};

const matrix: Draw = (g, w, h, t, s) => {
  const parts = ['CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'CASE'];
  const vendors = 8;
  const x0 = 64;
  const y0 = 46;
  const cw = (w - x0 - 24) / vendors;
  const ch = (h - y0 - 22) / parts.length;
  const scan = (t * 0.6) % vendors;
  mono(g, s, 9);
  g.fillStyle = DIM;
  for (let v = 0; v < vendors; v++) g.fillText(`V${v + 1}`, x0 + v * cw + cw / 2 - 6, 26);
  parts.forEach((p, r) => {
    g.fillStyle = DIM;
    g.fillText(p, 20, y0 + r * ch + ch / 2);
    let best = -1;
    let bestPrice = 9;
    for (let v = 0; v < vendors; v++) {
      const phase = s.rnd[(r * vendors + v) % s.rnd.length] * 20;
      const inStock = Math.sin(phase + t * 0.35) > -0.2;
      const price = (Math.sin(phase * 1.7) + 1) / 2;
      if (inStock && v <= scan && price < bestPrice) {
        bestPrice = price;
        best = v;
      }
      const x = x0 + v * cw + 4;
      const y = y0 + r * ch + 4;
      g.fillStyle = inStock ? `rgba(236,231,223,${0.12 + price * 0.28})` : 'rgba(236,231,223,0.03)';
      g.fillRect(x, y, cw - 8, ch - 8);
    }
    if (best >= 0) {
      g.strokeStyle = SIG;
      g.strokeRect(x0 + best * cw + 3.5, y0 + r * ch + 3.5, cw - 7, ch - 7);
    }
  });
  g.fillStyle = 'rgba(255,90,31,0.14)';
  g.fillRect(x0 + Math.floor(scan) * cw, y0, cw, h - y0 - 22);
};

const leaderboard: Draw = (g, w, h, t, s) => {
  const n = 6;
  const vals = Array.from({ length: n }, (_, i) => 0.45 + 0.35 * Math.sin(t * 0.5 + s.rnd[i] * 9) + 0.15 * Math.sin(t * 1.3 + i));
  const order = vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
  const top = 44;
  const rowH = (h - top - 16) / n;
  s.ys ??= Array.from({ length: n }, (_, i) => i);
  mono(g, s, 9);
  g.fillStyle = DIM;
  g.fillText('LEADERBOARD — LIVE', 20, 22);
  order.forEach((player, rank) => {
    s.ys![player] += (rank - s.ys![player]) * 0.08;
  });
  for (let p = 0; p < n; p++) {
    const y = top + s.ys![p] * rowH;
    const lead = order[0] === p;
    g.fillStyle = DIM;
    g.fillText(`P${p + 1}`, 20, y + rowH / 2);
    g.fillStyle = lead ? SIG : 'rgba(236,231,223,0.22)';
    g.fillRect(56, y + 5, (w - 130) * vals[p], rowH - 10);
    g.fillStyle = lead ? SIG : BONE;
    g.fillText(String(Math.round(vals[p] * 1000)).padStart(3, '0'), w - 56, y + rowH / 2);
  }
};

const pitch: Draw = (g, w, h, t, s) => {
  const gw = 80;
  const gh = 50;
  if (!s.px) {
    s.px = document.createElement('canvas');
    s.px.width = gw;
    s.px.height = gh;
  }
  const pc = s.px.getContext('2d')!;
  const img = pc.createImageData(gw, gh);
  const players: [number, number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const team = i < 10 ? 0 : 1;
    const bx = team ? 0.3 + (i % 5) * 0.14 : 0.14 + (i % 5) * 0.14;
    const by = 0.2 + ((i % 10) >= 5 ? 0.55 : 0.2) + (s.rnd[i] - 0.5) * 0.2;
    players.push([
      (bx + Math.sin(t * 0.4 + s.rnd[i] * 9) * 0.07) * gw,
      (by + Math.cos(t * 0.33 + s.rnd[i + 1] * 7) * 0.08) * gh,
      team,
    ]);
  }
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      let best = 1e9;
      let team = 0;
      for (const [px, py, tm] of players) {
        const d = (px - x) ** 2 + (py - y) ** 2;
        if (d < best) {
          best = d;
          team = tm;
        }
      }
      const o = (y * gw + x) * 4;
      if (team) {
        img.data[o] = 255;
        img.data[o + 1] = 90;
        img.data[o + 2] = 31;
        img.data[o + 3] = 46;
      } else {
        img.data[o] = img.data[o + 1] = img.data[o + 2] = 236;
        img.data[o + 3] = 22;
      }
    }
  }
  pc.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(s.px, 0, 0, w, h);
  g.strokeStyle = 'rgba(236,231,223,0.35)';
  g.strokeRect(12.5, 12.5, w - 25, h - 25);
  g.beginPath();
  g.moveTo(w / 2, 12);
  g.lineTo(w / 2, h - 12);
  g.stroke();
  g.beginPath();
  g.arc(w / 2, h / 2, h * 0.14, 0, Math.PI * 2);
  g.stroke();
  g.strokeRect(12.5, h * 0.3, w * 0.12, h * 0.4);
  g.strokeRect(w - 12.5 - w * 0.12, h * 0.3, w * 0.12, h * 0.4);
  for (const [px, py, tm] of players) {
    g.fillStyle = tm ? SIG : BONE;
    g.beginPath();
    g.arc((px / gw) * w, (py / gh) * h, 3, 0, Math.PI * 2);
    g.fill();
  }
};

const lanes: Draw = (g, w, h, t, s) => {
  const vx = w / 2;
  const vy = h * 0.34;
  const laneW = w * 0.26;
  g.strokeStyle = 'rgba(236,231,223,0.45)';
  for (let k = -1.5; k <= 1.5; k++) {
    g.beginPath();
    g.moveTo(vx, vy);
    g.lineTo(vx + k * laneW * 1.6, h);
    g.stroke();
  }
  const depth = (z: number) => vy + (h - vy) * (1 / z);
  for (let i = 0; i < 14; i++) {
    const z = 1 + ((i - t * 2.2) % 14 + 14) % 14;
    const y = depth(z * 0.6);
    const half = ((y - vy) / (h - vy)) * laneW * 1.6 * 1.5;
    g.strokeStyle = `rgba(236,231,223,${0.08 + 0.25 * (1 / z)})`;
    g.beginPath();
    g.moveTo(vx - half, y);
    g.lineTo(vx + half, y);
    g.stroke();
  }
  for (let o = 0; o < 4; o++) {
    const z = 1 + ((o * 3.4 - t * 2.2) % 14 + 14) % 14;
    const lane = Math.floor(s.rnd[o] * 3) - 1;
    const y = depth(z * 0.6);
    const scale = (y - vy) / (h - vy);
    const x = vx + lane * laneW * scale * 1.6;
    const bw = laneW * scale * 0.9;
    g.strokeStyle = BONE;
    g.strokeRect(x - bw / 2, y - bw * 0.7, bw, bw * 0.7);
  }
  const lanePick = [0, 1, 0, -1][Math.floor(t / 1.6) % 4];
  s.ys ??= [0];
  s.ys[0] += (lanePick - s.ys[0]) * 0.12;
  const py = h - 30;
  const px = vx + s.ys[0] * laneW * 1.45;
  const jump = Math.max(0, Math.sin(t * 3.2)) * 10;
  g.fillStyle = SIG;
  g.fillRect(px - 9, py - 18 - jump, 18, 18);
  mono(g, s, 9);
  g.fillStyle = DIM;
  g.fillText(`SPEED ×${(1 + (t % 20) / 10).toFixed(1)}`, 20, 22);
};

const waves: Draw = (g, w, h, t, s) => {
  for (let k = 0; k < 6; k++) {
    g.strokeStyle = k === 2 ? SIG : `rgba(236,231,223,${0.15 + k * 0.08})`;
    g.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin(x * 0.012 * (1 + k * 0.2) + t * (1 + k * 0.15) + s.rnd[k] * 6) * h * 0.08 * (k + 1) * 0.5;
      if (x) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.stroke();
  }
};

const KINDS: Record<string, Draw> = {
  'master-sentinel': telemetry(['CPU', 'GPU', 'RAM', 'DISK']),
  'code-shepherd': graph,
  'zenfa-ai': converge,
  'pc-lagbe': matrix,
  'pdf-tools': pages,
  'wrestle-rumble': leaderboard,
  'upi-fifa-paradox': pitch,
  'subway-surfer-3d': lanes,
};

function seeded(id: string) {
  let a = [...id].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 7);
  return Array.from({ length: 64 }, () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  });
}

function CoverCanvas({ id }: { id: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    const draw = KINDS[id] ?? waves;
    const scratch: Scratch = {
      rnd: seeded(id),
      font: getComputedStyle(document.documentElement).getPropertyValue('--font-jetbrains-mono') || 'monospace',
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const t0 = performance.now() - scratch.rnd[0] * 5000;

    const frame = (now: number) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = BG;
      g.fillRect(0, 0, w, h);
      g.lineWidth = 1;
      draw(g, w, h, reduce ? 4 : (now - t0) / 1000, scratch);
    };
    const loop = (now: number) => {
      frame(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      frame(performance.now());
    };
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
  }, [id]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

export default function ProjectCover({ id, image, title, sizes }: { id: string; image?: string; title: string; sizes: string }) {
  if (isRealImage(image)) {
    return <Image src={image} alt={`${title} — screenshot`} fill sizes={sizes} className="object-cover" />;
  }
  return <CoverCanvas id={id} />;
}
