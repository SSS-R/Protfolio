# Design — "Signal from noise" (v3)

Portfolio + CreaTune redesign, 2026-10. Only the two admin panels (`/admin`, `/music/admin`) keep the v2 styling.

## Thesis
Rafi's work turns noise into signal: ciphertext → plaintext (quantum-crypto thesis),
agent chatter → one plan (Code Shepherd), telemetry → diagnosis (Master Sentinel),
sound → music (CreaTune). The site performs that: a particle field resolves from scatter
into structure, and labels decrypt from cipher glyphs into words.

## System
| | |
|---|---|
| Ink / ink-2 | `#0B0B0C` / `#141416` — dark sections, the "signal field" |
| Bone / bone-2 | `#ECE7DF` / `#DDD7CC` — "paper" sections that slide over the field |
| Dim / dim-ink | `#8C877F` on ink · `#5C5750` on bone (both ≥ 5:1) |
| Signal | `#FF5A1F` on ink · `#C2410C` (`signal-deep`) for text on bone |
| Display | Archivo variable, `wdth` 62–125 — condensed caps for the name |
| Accent | Instrument Serif italic — one or two words per heading, never body |
| Labels | JetBrains Mono, uppercase, 11–12px, tracked |

## Sequence (home)
Preloader (first visit/session) → Hero (sphere) → Statement (scrubbed words) →
Selected work (paper, pinned horizontal) → Focus (lattice) → Journey (paper, drawn line) →
Sound / CreaTune (wave) → Contact (ring) → Footer.

## Motion
- GSAP + ScrollTrigger drive only scroll-linked motion (pins, scrubs, marquee, formations).
- Lenis is the only smooth-scroll engine; off under `prefers-reduced-motion`.
- Reveals are declarative: `data-split`, `data-fade`, `data-clip`, `data-scramble`,
  `data-scrub-words`, `data-line`, `data-marquee` — wired once in `src/components/site/motion.ts`.
  One-shot reveals are an IntersectionObserver adding `.is-in` + CSS transitions (no style
  reads at load); the hero intro is the same pattern (`.hero-split` / `.hero-in`).
- WebGL: one fixed point-cloud canvas on the home page (`SignalField`), plain WebGL — one
  program, one draw call, no 3D library. Sections declare `data-formation="sphere|lattice|wave|ring"`.
  Starts on idle; DPR ≤ 1.5; fewer points at 30 fps on software WebGL; paused when
  hidden/offscreen; single still frame under reduced motion; removed on WebGL failure.
- Anything GSAP pins needs a React-owned wrapper element (the pin moves it into a
  `.pin-spacer`; React must never have to remove the pinned node itself).
- Route changes: an ink panel rises with a leading edge that frays into cipher-glyph tiles,
  the destination name decrypts in the centre ("Resolving signal — /work"), then the ink
  lifts off upward like the preloader. One canvas + one label (`Transitions.tsx`).

## Assets
- Particle field + project covers are code-drawn *data graphics* (graphs, telemetry,
  Voronoi, lanes) — not illustrations. An uploaded project `image` (admin) replaces the
  generated cover; the legacy pixel icons are ignored.
- Portrait: `profile.avatar` is used when it is a real photo (not the legacy pixel avatar).
- Icons: Solar (CC BY 4.0, via Iconify), inlined in `src/components/site/Icon.tsx`.
- Fonts: Google Fonts (OFL) via `next/font`.

## CreaTune (`/music`) — the same system, the other axis
- Same ink / bone / mono / serif system; Archivo at **wdth 125** (`.display-wide`) where the
  portfolio uses 62 — the banner's wide caps. Accent = the logo's mauve `#C9A9C0` /
  lavender `#A9A3CE` / dusk `#565C7E` instead of signal orange.
- Hero: `Spectrum.tsx`, a ridgeline plot fed by the player's real `AnalyserNode` (mirrored,
  bass in the middle); a synthetic pulse while idle. 2D canvas, no WebGL needed.
- Player: `CreaTunePlayer.tsx` — seek/volume hairlines (`.ct-range`), level meter, lyrics
  sheet, Media Session (lock-screen / media keys), Space to play/pause.
- Transition into CreaTune: the same ink panel, its edge frayed into level-meter blocks
  (▁▃▅▇) in lavender; the wide wordmark "tunes in" (letter-spacing tightens). Internal
  CreaTune links stay instant so the player bar is never covered.
- Tracks without art show the logo mark at native size — never an upscaled blur.
