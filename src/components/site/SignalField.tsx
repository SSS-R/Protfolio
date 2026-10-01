'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, onIntro, prefersReducedMotion } from './motion';

// The home page's one WebGL layer. A point cloud that starts as noise and
// resolves into a formation per section — sphere (a Bloch-sphere qubit), lattice
// (lattice cryptography), wave (sound), ring (an open channel). Sections opt in
// with data-formation="<state>"; paper sections simply cover the canvas.
//
// Plain WebGL (one program, one draw call): camera, rotation and projection are
// done in the vertex shader, so no 3D library ships to the browser.

type Formation = 'sphere' | 'lattice' | 'wave' | 'ring';
type State = { f: Formation; x: number; y: number; s: number; o: number };

const STATES: Record<string, State> = {
  hero: { f: 'sphere', x: 1.85, y: 0.15, s: 1, o: 1 },
  statement: { f: 'sphere', x: 2.9, y: -0.7, s: 1.25, o: 0.3 },
  focus: { f: 'lattice', x: 2.5, y: 0, s: 1, o: 0.6 },
  sound: { f: 'wave', x: 0, y: -1.15, s: 1, o: 0.75 },
  contact: { f: 'ring', x: 1.9, y: 0.25, s: 1, o: 0.9 },
};

const WEIGHTS: Record<Formation, [number, number, number, number]> = {
  sphere: [1, 0, 0, 0],
  lattice: [0, 1, 0, 0],
  wave: [0, 0, 1, 0],
  ring: [0, 0, 0, 1],
};

function buildFormations(count: number) {
  const sphere = new Float32Array(count * 3);
  const lattice = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const R = 2.1;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const cols = Math.ceil(Math.sqrt(count * 1.8));

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    seed[i] = Math.random();
    let x: number, y: number, z: number;

    // Sphere: Fibonacci shell + equator & meridian rings + z-axis + state vector.
    if (r < 0.76) {
      y = 1 - (i / (count - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      x = Math.cos(th) * rad * R;
      z = Math.sin(th) * rad * R;
      y *= R;
    } else if (r < 0.88) {
      const a = Math.random() * Math.PI * 2;
      const meridian = Math.random() < 0.5;
      x = Math.cos(a) * R;
      y = meridian ? Math.sin(a) * R : (Math.random() - 0.5) * 0.02;
      z = meridian ? (Math.random() - 0.5) * 0.02 : Math.sin(a) * R;
    } else if (r < 0.93) {
      x = (Math.random() - 0.5) * 0.02;
      y = (Math.random() * 2 - 1) * R * 1.25;
      z = (Math.random() - 0.5) * 0.02;
    } else {
      const t = Math.random();
      x = t * R * 0.55;
      y = t * R * 0.72;
      z = t * R * 0.42;
    }
    sphere.set([x, y, z], i * 3);

    // Lattice: points along the edges of a skewed 6×6×6 lattice (basis b1,b2,b3).
    const n = 6;
    const gi = Math.floor(Math.random() * n);
    const gj = Math.floor(Math.random() * n);
    const gk = Math.floor(Math.random() * n);
    const axis = Math.floor(Math.random() * 3);
    const t = Math.random() < 0.18 ? 0 : Math.random();
    const u = gi + (axis === 0 ? t : 0) - (n - 1) / 2;
    const v = gj + (axis === 1 ? t : 0) - (n - 1) / 2;
    const w = gk + (axis === 2 ? t : 0) - (n - 1) / 2;
    const s = 0.62;
    lattice.set([(u + 0.22 * v) * s, (0.18 * u + v + 0.2 * w) * s, (0.1 * v + w) * s], i * 3);

    // Wave: a flat field; displacement happens in the shader.
    const cx = i % cols;
    const cz = Math.floor(i / cols);
    wave.set([(cx / cols - 0.5) * 11, 0, (cz / (count / cols) - 0.5) * 5.2], i * 3);

    // Ring: a thin torus with a sparse halo.
    const a = Math.random() * Math.PI * 2;
    const halo = Math.random() < 0.15;
    const rr = halo ? 2.3 + Math.random() * 1.4 : 2.3 + (Math.random() - 0.5) * 0.14;
    ring.set([Math.cos(a) * rr, Math.sin(a) * rr, (Math.random() - 0.5) * (halo ? 0.6 : 0.14)], i * 3);
  }
  return { sphere, lattice, wave, ring, seed };
}

const vertex = /* glsl */ `
  attribute vec3 aSphere;
  attribute vec3 aLattice;
  attribute vec3 aWave;
  attribute vec3 aRing;
  attribute float aSeed;
  uniform float uTime;
  uniform float uIntro;
  uniform float uChaos;
  uniform float uSize;
  uniform float uAspect;
  uniform float uFocal;   // 1 / tan(fov / 2)
  uniform vec2 uMouse;
  uniform vec4 uW;
  uniform vec3 uRot;      // euler x, y, z (applied z → y → x)
  uniform vec3 uPlace;    // offset x, offset y, scale
  varying float vObserve;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 wave = aWave;
    float h = sin(wave.x * 1.1 + uTime * 1.3) * 0.34 + sin(wave.z * 2.1 - uTime * 0.9 + wave.x * 0.4) * 0.16;
    h *= smoothstep(5.8, 2.0, abs(wave.x));
    // tilt the field toward the camera
    wave = vec3(wave.x, h * 0.93 - wave.z * 0.36, h * 0.36 + wave.z * 0.93);

    vec3 p = aSphere * uW.x + aLattice * uW.y + wave * uW.z + aRing * uW.w;

    vec3 jitter = vec3(
      sin(aSeed * 91.7 + uTime * 0.9),
      cos(aSeed * 53.3 + uTime * 0.7),
      sin(aSeed * 27.1 + uTime * 1.1)
    );
    p += jitter * (0.015 + uChaos * 0.55);

    // Intro: every point starts scattered far out and converges.
    vec3 scatter = normalize(jitter + vec3(0.001)) * (7.0 + aSeed * 6.0);
    p = mix(scatter, p, uIntro);

    // Model: scale, rotate (z, y, x), translate; view: camera at z = 9.5.
    vec3 q = p * uPlace.z;
    float c = cos(uRot.z), s = sin(uRot.z);
    q = vec3(c * q.x - s * q.y, s * q.x + c * q.y, q.z);
    c = cos(uRot.y); s = sin(uRot.y);
    q = vec3(c * q.x + s * q.z, q.y, -s * q.x + c * q.z);
    c = cos(uRot.x); s = sin(uRot.x);
    q = vec3(q.x, c * q.y - s * q.z, s * q.y + c * q.z);
    vec3 mv = q + vec3(uPlace.xy, -9.5);

    gl_Position = vec4(mv.x * uFocal / uAspect, mv.y * uFocal, 0.0, -mv.z);

    // Observation: near the pointer, points brighten, turn signal-orange, part slightly.
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
    float observe = smoothstep(0.34, 0.0, length(d));
    gl_Position.xy += normalize(d + 1e-5) * observe * 0.035 * gl_Position.w;

    vObserve = observe;
    vSeed = aSeed;
    vAlpha = smoothstep(-15.0, -6.0, mv.z);
    gl_PointSize = uSize * (1.0 + observe * 1.6) / -mv.z;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  varying float vObserve;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float accent = max(vObserve, step(vSeed, 0.035));
    vec3 col = mix(vec3(0.925, 0.906, 0.875), vec3(1.0, 0.353, 0.122), accent);
    gl_FragColor = vec4(col, a * (0.35 + 0.5 * vAlpha + 0.4 * vObserve) * uOpacity);
  }
`;

function program(gl: WebGLRenderingContext) {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

export default function SignalField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Start once the page is idle: hydration, first paint and the reveals come
    // first; the field fades in behind them.
    const begin = () => {
      if (cancelled) return;
      const gl = el.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'high-performance' });
      const prog = gl && program(gl);
      if (!gl || !prog) {
        el.remove();
        return;
      }

      // Without a GPU (software WebGL) the same scene costs whole CPU frames:
      // draw fewer points at a lower frame rate there.
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const software = /swiftshader|llvmpipe|software|basic render/i.test(
        info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '',
      );
      const reduce = prefersReducedMotion();
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const count = software ? 6000 : mobile ? 8000 : 16000;
      const dpr = software ? 1 : Math.min(window.devicePixelRatio, 1.5);
      const frameMs = software ? 1000 / 30 : 0;

      gl.useProgram(prog);
      const f = buildFormations(count);
      const attrs: [string, Float32Array, number][] = [
        ['aSphere', f.sphere, 3],
        ['aLattice', f.lattice, 3],
        ['aWave', f.wave, 3],
        ['aRing', f.ring, 3],
        ['aSeed', f.seed, 1],
      ];
      const buffers = attrs.map(([name, data, size]) => {
        const buf = gl.createBuffer();
        const loc = gl.getAttribLocation(prog, name);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        return buf;
      });
      const u = (name: string) => gl.getUniformLocation(prog, name);
      const loc = {
        time: u('uTime'),
        intro: u('uIntro'),
        chaos: u('uChaos'),
        size: u('uSize'),
        aspect: u('uAspect'),
        focal: u('uFocal'),
        mouse: u('uMouse'),
        w: u('uW'),
        rot: u('uRot'),
        place: u('uPlace'),
        opacity: u('uOpacity'),
      };
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive
      gl.clearColor(0, 0, 0, 0);
      gl.uniform1f(loc.focal, 1 / Math.tan((35 * Math.PI) / 360));
      gl.uniform1f(loc.size, (mobile ? 30 : 28) * dpr);

      // Animated values, tweened by GSAP and uploaded each frame.
      const v = { intro: reduce ? 1 : 0, chaos: 0, opacity: 1, time: 0 };
      const weights = { x: 1, y: 0, z: 0, w: 0 };
      const place = { x: 0, y: 0, s: 1 };
      let current = STATES.hero;
      let aspect = 1;

      const apply = (state: State, immediate = false) => {
        current = state;
        const narrow = window.matchMedia('(max-width: 767px)').matches;
        // Narrower desktop windows pull the cloud in and shrink it so it clears the copy.
        const fit = narrow ? 0 : Math.min(1, Math.max(0.68, window.innerWidth / window.innerHeight / 1.75));
        const target = { x: state.x * fit, y: state.y + (narrow ? 1.1 : 0), s: state.s * (narrow ? 0.66 : fit) };
        const [a, b, c, d] = WEIGHTS[state.f];
        const dur = immediate ? 0 : 1.7;
        gsap.to(place, { ...target, duration: dur, ease: 'power3.inOut', overwrite: true });
        gsap.to(weights, { x: a, y: b, z: c, w: d, duration: dur, ease: 'power3.inOut', overwrite: true });
        gsap.to(v, { opacity: state.o * (narrow ? 0.6 : 1), duration: dur, overwrite: 'auto' });
        if (!immediate) {
          // The signal breaks into noise mid-morph, then re-forms.
          gsap.timeline().to(v, { chaos: 1, duration: 0.7, ease: 'power2.in' }).to(v, { chaos: 0, duration: 1.1, ease: 'power2.out' });
        }
      };
      apply(STATES.hero, true);

      const size = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
        gl.viewport(0, 0, el.width, el.height);
        aspect = w / h;
      };
      size();

      // x/y: the shader's "observed" point (far away = none); px/py: gentle parallax.
      const mouse = { x: 9, y: 9, tx: 9, ty: 9, px: 0, py: 0, inside: false };
      let spin = 0;
      let raf = 0;
      let visible = true;
      let last = performance.now();
      let lastDraw = 0;

      const render = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        v.time += dt;
        mouse.x += (mouse.tx - mouse.x) * 0.08;
        mouse.y += (mouse.ty - mouse.y) * 0.08;
        mouse.px += ((mouse.inside ? mouse.tx : 0) - mouse.px) * 0.04;
        mouse.py += ((mouse.inside ? mouse.ty : 0) - mouse.py) * 0.04;
        spin += dt * 0.09;
        const still = weights.z; // the wave field doesn't spin
        gl.uniform1f(loc.time, v.time);
        gl.uniform1f(loc.intro, v.intro);
        gl.uniform1f(loc.chaos, v.chaos);
        gl.uniform1f(loc.opacity, v.opacity);
        gl.uniform1f(loc.aspect, aspect);
        gl.uniform2f(loc.mouse, mouse.x, mouse.y);
        gl.uniform4f(loc.w, weights.x, weights.y, weights.z, weights.w);
        gl.uniform3f(loc.rot, 0.18 * (1 - still) - mouse.py * 0.09, spin * (1 - still) + mouse.px * 0.14, weights.w * 0.5);
        gl.uniform3f(loc.place, place.x, place.y, place.s);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, count);
      };
      const loop = (now: number) => {
        if (now - lastDraw >= frameMs) {
          lastDraw = now;
          render(now);
        }
        raf = visible ? requestAnimationFrame(loop) : 0;
      };
      const start = () => {
        if (!raf && visible && !reduce) {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      };

      if (reduce) render(performance.now());
      else start();

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
        if (!mouse.inside) {
          mouse.inside = true;
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
        }
      };
      const onLeave = () => {
        mouse.inside = false;
        mouse.x = mouse.tx = 9;
        mouse.y = mouse.ty = 9;
      };
      const onResize = () => {
        size();
        apply(current, true);
        if (reduce) render(performance.now());
      };
      const onLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        raf = 0;
        visible = false;
        el.style.display = 'none';
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
      window.addEventListener('resize', onResize);
      el.addEventListener('webglcontextlost', onLost);

      // Pause whenever no section that shows the field is on screen.
      const onScreen = new Set<Element>();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
        visible = onScreen.size > 0 && el.style.display !== 'none';
        start();
      });
      const sections = document.querySelectorAll<HTMLElement>('[data-formation]');
      sections.forEach((s) => io.observe(s));

      const ctx = gsap.context(() => {
        if (reduce) return;
        gsap.to(el, { opacity: 1, duration: 0.8 });
        onIntro(() => gsap.to(v, { intro: 1, duration: 1.8, ease: 'expo.out' }));
        sections.forEach((s) => {
          const state = STATES[s.dataset.formation ?? ''];
          if (!state) return;
          ScrollTrigger.create({
            trigger: s,
            start: 'top 55%',
            end: 'bottom 45%',
            refreshPriority: -1, // may be created after the work pin; measure after it
            onEnter: () => apply(state),
            onEnterBack: () => apply(state),
          });
        });
      });

      cleanup = () => {
        ctx.revert();
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('blur', onLeave);
        window.removeEventListener('resize', onResize);
        el.removeEventListener('webglcontextlost', onLost);
        gsap.killTweensOf([place, weights, v]);
        buffers.forEach((b) => gl.deleteBuffer(b));
        gl.deleteProgram(prog);
      };
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(begin, { timeout: 1200 })
      : window.setTimeout(begin, 200);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen opacity-0 motion-reduce:opacity-100"
    />
  );
}
