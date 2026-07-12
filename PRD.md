# Project Brief & PRD: Sultan Sajed Shahriar Portfolio

**Project ID:** `PROJECT_SULTAN_2077`  
**Version:** 1.1.0  
**Status:** ACTIVE_DEVELOPMENT  
**Developer:** Sultan Sajed Shahriar  

---

## 1. Executive Summary
A high-fidelity personal portfolio for a CS student and AI developer, blending **Swiss Modernism** (discipline, grids, typography) with **Retro Gaming / Cyberpunk** aesthetics (pixel art, amber terminals, RPG HUDs). The site serves as a technical showcase and a classified "personnel dossier."

---

## 2. Visual Identity & Design System

### 2.1 Color Palette (Monochrome Terminal)
- **Background:** `#0A0A0A` (Near Black)
- **Surface:** `#111111` / `#1A1A1A`
- **Accent:** `#F5A623` (Amber/Orange)
- **Typography Primary:** `#F0F0F0` (High Contrast)
- **Typography Secondary:** `#888888` (Mid-tone)

### 2.2 Typography
- **Headings:** *Space Grotesk Bold* (All caps, wide tracking)
- **Body:** *Inter* / *IBM Plex Sans* (16px base, high line-height)
- **Technical/Labels:** *IBM Plex Mono* / *JetBrains Mono*
- **Decorative:** *Press Start 2P* (Used sparingly for pixel-art labels)

### 2.3 Grid & Structure
- **Grid:** Strict 12-column Swiss grid.
- **Rules:** 1px solid amber/grey dividers. No rounded corners.
- **Sidebar:** Persistent navigation with avatar and level stats (LVL_99_DEV).

---

## 3. Functional Requirements

### 3.1 Core Modules
1. **HUD_STATS (Home):** Hero section with pixel art avatar, character stats block, and "Active Projects" grid.
2. **ARCHITECT (Resume):** Classified personnel dossier.
    - Military-style timeline for education/experience.
    - XP-bar progress indicators for skill proficiency.
    - Embedded PDF export functionality.
3. **INVENTORY (Portfolio):** Game-style equipment grid.
    - Category filtering (ACTIVE / SHIPPED / TBD).
    - Hover-flip cards showing repository links and technical metadata.
4. **TERMINAL (Contact):** Functional terminal emulator.
    - Supports commands: `/goto`, `/contact`, `/social`, `/whoami`, `/clear`.
    - Automated boot sequence on initialization.

### 3.2 Security Feature (Easter Egg)
- **Login Secure:** Top-right button with a "Sleeping Cat" hover state. 
- **Content:** 64x64 pixel art cat with "ACCESS DENIED. CAT IS SLEEPING." text.

---

## 4. Technical Specifications

### 4.1 Interface Guidelines
- **Responsive:** Fluid 12-col grid for desktop; single-column stacked layout for mobile.
- **Performance:** Low-latency transitions (200ms scanline wipe).
- **Interactions:** Subtle scanline overlay, blinking terminal cursors, and amber border glows on hover.

### 4.2 Asset Inventory
- **IMAGE_18:** Bespoke 64x64 pixel art developer avatar.
- **IMAGE_2:** Sleeping cat (security popover).
- **Custom SVG Icons:** Terminal, Shield, Network, PC Tower, Padlock.

---

## 5. Roadmap & Future Builds
- [ ] **Master Sentinel v1.0:** Finalize Python integration.
- [ ] **Code Shepherd:** Implement agent control plane UI.
- [ ] **Music Side Channel:** Integrate pixel-art waveform player for track previews.
- [ ] **Locked Slots:** Unlock 2 additional project builds in Inventory.

---
© 2024 SULTAN_SAJED_SHAHRIAR // BUILD_VER_2.1.0