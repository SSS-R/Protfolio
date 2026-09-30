'use client';

import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from 'three';
import { gsap, ScrollTrigger, onIntro, prefersReducedMotion } from './motion';

// The home page's one WebGL layer. A point cloud that starts as noise and
// resolves into a formation per section — sphere (a Bloch-sphere qubit), lattice
// (lattice cryptography), wave (sound), ring (an open channel). Sections opt in
// with data-formation="<state>"; paper sections simply cover the canvas.

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
  attribute vec3 aLattice;
  attribute vec3 aWave;
  attribute vec3 aRing;
  attribute float aSeed;
  uniform float uTime;
  uniform float uIntro;
  uniform float uChaos;
  uniform float uSize;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec4 uW;
  varying float vObserve;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 wave = aWave;
    float h = sin(wave.x * 1.1 + uTime * 1.3) * 0.34 + sin(wave.z * 2.1 - uTime * 0.9 + wave.x * 0.4) * 0.16;
    h *= smoothstep(5.8, 2.0, abs(wave.x));
    // tilt the field toward the camera
    wave = vec3(wave.x, h * 0.93 - wave.z * 0.36, h * 0.36 + wave.z * 0.93);

    vec3 p = position * uW.x + aLattice * uW.y + wave * uW.z + aRing * uW.w;

    vec3 jitter = vec3(
      sin(aSeed * 91.7 + uTime * 0.9),
      cos(aSeed * 53.3 + uTime * 0.7),
      sin(aSeed * 27.1 + uTime * 1.1)
    );
    p += jitter * (0.015 + uChaos * 0.55);

    // Intro: every point starts scattered far out and converges.
    vec3 scatter = normalize(jitter + vec3(0.001)) * (7.0 + aSeed * 6.0);
    p = mix(scatter, p, uIntro);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

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
  uniform vec3 uBone;
  uniform vec3 uSignal;
  uniform float uOpacity;
  varying float vObserve;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float accent = max(vObserve, step(vSeed, 0.035));
    vec3 col = mix(uBone, uSignal, accent);
    gl_FragColor = vec4(col, a * (0.35 + 0.5 * vAlpha + 0.4 * vObserve) * uOpacity);
  }
`;

export default function SignalField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas: el, antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch {
      el.remove();
      return;
    }

    const reduce = prefersReducedMotion();
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const count = mobile ? 9000 : 22000;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(dpr);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 9.5;

    const f = buildFormations(count);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(f.sphere, 3));
    geometry.setAttribute('aLattice', new BufferAttribute(f.lattice, 3));
    geometry.setAttribute('aWave', new BufferAttribute(f.wave, 3));
    geometry.setAttribute('aRing', new BufferAttribute(f.ring, 3));
    geometry.setAttribute('aSeed', new BufferAttribute(f.seed, 1));

    const uniforms = {
      uTime: { value: 0 },
      uIntro: { value: reduce ? 1 : 0 },
      uChaos: { value: 0 },
      uSize: { value: (mobile ? 30 : 26) * dpr },
      uAspect: { value: 1 },
      uMouse: { value: new Vector2(9, 9) },
      uW: { value: new Vector4(1, 0, 0, 0) },
      uOpacity: { value: 1 },
      uBone: { value: new Color('#ece7df') },
      uSignal: { value: new Color('#ff5a1f') },
    };
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    // Where the cloud sits and how it looks, tweened between section states.
    const place = { x: 0, y: 0, s: 1 };
    let current = STATES.hero;
    const apply = (state: State, immediate = false) => {
      current = state;
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      // Narrower desktop windows pull the cloud in and shrink it so it clears the copy.
      const fit = mobile ? 0 : Math.min(1, Math.max(0.68, window.innerWidth / window.innerHeight / 1.75));
      const target = { x: state.x * fit, y: state.y + (mobile ? 1.1 : 0), s: state.s * (mobile ? 0.66 : fit) };
      const [a, b, c, d] = WEIGHTS[state.f];
      const dur = immediate ? 0 : 1.7;
      gsap.to(place, { ...target, duration: dur, ease: 'power3.inOut', overwrite: true });
      gsap.to(uniforms.uW.value, { x: a, y: b, z: c, w: d, duration: dur, ease: 'power3.inOut', overwrite: true });
      gsap.to(uniforms.uOpacity, { value: state.o * (mobile ? 0.6 : 1), duration: dur, overwrite: true });
      if (!immediate) {
        // The signal breaks into noise mid-morph, then re-forms.
        gsap.timeline().to(uniforms.uChaos, { value: 1, duration: 0.7, ease: 'power2.in' }).to(uniforms.uChaos, { value: 0, duration: 1.1, ease: 'power2.out' });
      }
    };
    apply(STATES.hero, true);

    const size = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = w / h;
    };
    size();

    // x/y: the shader's "observed" point (far away = none); px/py: gentle parallax.
    const mouse = { x: 9, y: 9, tx: 9, ty: 9, px: 0, py: 0, inside: false };
    let spin = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      uniforms.uTime.value += dt;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.px += ((mouse.inside ? mouse.tx : 0) - mouse.px) * 0.04;
      mouse.py += ((mouse.inside ? mouse.ty : 0) - mouse.py) * 0.04;
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      spin += dt * 0.09;
      const still = uniforms.uW.value.z; // the wave field doesn't spin
      points.rotation.y = spin * (1 - still) + mouse.px * 0.14;
      points.rotation.x = 0.18 * (1 - still) - mouse.py * 0.09;
      points.rotation.z = uniforms.uW.value.w * 0.5;
      points.position.set(place.x, place.y, 0);
      points.scale.setScalar(place.s);
      renderer.render(scene, camera);
    };
    const loop = (now: number) => {
      render(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && visible && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    if (reduce) {
      render(performance.now());
    } else {
      start();
    }

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
      onIntro(() => gsap.to(uniforms.uIntro, { value: 1, duration: 2.6, ease: 'expo.out' }));
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

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('webglcontextlost', onLost);
      gsap.killTweensOf([place, uniforms.uW.value, uniforms.uOpacity, uniforms.uChaos, uniforms.uIntro]);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-screen w-screen" />;
}
