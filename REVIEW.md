# Code Review & Findings — Portfolio + CreaTune

**Reviewed:** 2026-07-14 · branch `main` (15 commits ahead of origin)
**Scope:** Security audit + senior-SWE code review + customer/product read
**Tooling:** `/security-review`, `tsc --noEmit`, `eslint`, manual source review

---

## Executive Summary

| Area | Result |
|---|---|
| **Security** | ✅ No HIGH/MEDIUM vulnerabilities. Above-average security posture. |
| **TypeScript** | ✅ `tsc --noEmit` clean — 0 type errors. |
| **Lint** | ⚠️ 62 errors / 12 warnings (mostly `any` + React 19 rules). |
| **Architecture** | ⚠️ Solid storage layer; duplicated auth + oversized components. |
| **Product / UX** | ✅ Strong concept, real second app (CreaTune), good a11y touches. |

**Overall verdict:** Solid early-career / junior-professional level. Standout security
instincts and systems thinking. Main gap is *discipline* (dedup, file size, `any`),
not capability.

---

## 1. Security Audit

Reviewed all 7 API routes, the storage layer (`src/lib/store.ts`), the upload handler,
and the client auth flow. **No exploitable HIGH or MEDIUM findings.**

### What is handled correctly

| Threat | Mitigation | Location |
|---|---|---|
| Malicious file upload | SVG excluded; extension **forced** from validated MIME allowlist; size-capped (5MB img / 30MB audio) | `src/app/api/upload/route.ts` |
| Path traversal | `replace(/[^a-zA-Z0-9_.-]/g, '_')` neutralizes `/` and `\`, extension re-appended | `src/app/api/upload/route.ts:60` |
| XSS (stored/reflected) | No `dangerouslySetInnerHTML` / `eval`; all user content via React auto-escaping | all `.tsx` |
| CSRF | Auth via `x-admin-password` header (not cookies) → can't be forged cross-site | all mutating routes |
| Auth on writes | Every `POST/PATCH/DELETE` is `checkAuth`-gated and **fail-closed** (missing env → 500) | all API routes |
| Secret exposure | Password server-only; `.env*`, `messages.json`, `uploads/` gitignored | `.gitignore` |

### Lower-severity notes (defense-in-depth, not exploitable today)

- **S1 — Non-constant-time password compare.** `headerPassword !== systemPassword` is a
  theoretical timing side-channel. Prefer `crypto.timingSafeEqual`.
  *Files: every route + `upload/route.ts:15`, `portfolio/route.ts:26`, `messages/route.ts:32`.*
- **S2 — Single shared plaintext password, no hashing / lockout.** Acceptable for a personal
  admin panel; revisit (hashed creds + real session) if the app grows.
- **S3 — Raw password in `sessionStorage`.** Harmless *unless* an XSS is ever introduced —
  then it becomes full admin compromise. Not exploitable now (no XSS exists).
  *Files: `ClientLayout.tsx:68`, `ClientCreaTuneAdmin.tsx:10`, `admin/page.tsx`.*

---

## 2. Lint Findings (62 errors / 12 warnings)

Run: `npx eslint .` — TypeScript itself compiles clean; these are code-quality rules.

### By rule

| Count | Rule | Meaning / Fix |
|---|---|---|
| 56 | `@typescript-eslint/no-explicit-any` | Replace `any` with the real types (you already have `CreaTuneData`; do the same for portfolio/messages). |
| 11 | `@typescript-eslint/no-unused-vars` | Remove unused vars (e.g. `err` in `ContactForm.tsx:48`). |
| 3 | `react-hooks/set-state-in-effect` | `setState` synchronously in `useEffect` causes cascading renders (`ClientLayout.tsx:70`). |
| 2 | `react-hooks/immutability` | Don't mutate props/state in place. |
| 1 | `@next/next/no-page-custom-font` | Move custom `<font>` link into `app/layout` metadata / `next/font`. |
| 1 | `react-hooks/purity` | Impure call in render — `Date.now()` inside `filename` template (`ClientCreaTuneAdmin.tsx:529`). |

### By file (worst offenders)

| Errors | File | Note |
|---|---|---|
| 49 | `src/app/admin/page.tsx` | 1,231 lines — monolith; most `any`s live here. |
| 6 | `src/app/status/page.tsx` | `any` usage. |
| 5 | `src/app/api/messages/route.ts` | `data: any[]`, `msg: any`. |
| 4 | `src/components/ClientArchitect.tsx` | `any`. |
| 3 | `src/app/page.tsx` | `p: any`, `skill: any` in `.map`. |
| 2 | `src/components/ClientCreaTuneAdmin.tsx` | purity + immutability. |
| 2 | `src/components/ClientLayout.tsx` | `any` + set-state-in-effect. |
| 1 | `src/app/architect/page.tsx` | — |
| 1 | `src/app/layout.tsx` | custom font link. |
| 1 | `src/components/ContactForm.tsx` | unused `err`. |

---

## 3. Architecture / Senior-SWE Findings

### Strengths
- **`src/lib/store.ts` is the strongest code in the repo.** Blob-in-prod / fs-in-dev split,
  first-read seeding from committed JSON, warm-lambda URL cache. Correctly designed around
  Vercel's read-only serverless filesystem.
- **`next.config.ts`** — `outputFileTracingIncludes` for the `src/data` dir shows real
  understanding of Next's file tracing.
- Sensible data modeling (orphaned tracks preserved on album delete).

### Issues to fix (priority order)

- **A1 — `checkAuth` is duplicated across 6 places.** Identical logic in
  `creatune/route.ts`, `creatune/meta/route.ts`, `creatune/album/route.ts`, and inline in
  `upload/route.ts`, `portfolio/route.ts`, `messages/route.ts`.
  **Fix:** extract one `requireAdmin(request)` into `src/lib/auth.ts`. *(Highest ROI.)*
- **A2 — Oversized components.** `admin/page.tsx` (1,231 lines) and
  `ClientCreaTuneAdmin.tsx` (885 lines). Split into upload form / track editor / album manager.
- **A3 — `any` in the data layer.** Define interfaces for portfolio + messages like
  `CreaTuneData` already does.
- **A4 — React 19 correctness patterns.** Fix `set-state-in-effect` (`ClientLayout.tsx:70`)
  and the `purity` violation — these are what the React Compiler will punish.
- **A5 — Dead-on-serverless path.** `/api/messages` writes to the local FS, which silently
  no-ops on Vercel. The Formspree fallback already covers prod; remove or guard the FS path.

---

## 4. Product / Customer-Eye Read

*(From a close source read — not a live browser session.)*

### Lands well
- **Committed concept** — the retro RPG/terminal "personnel dossier" theme
  (CHARACTER_SHEET, INVENTORY, `[ TRANSMIT_MESSAGE.SH ]`) is consistent and memorable.
- **CreaTune is the differentiator** — a full second Spotify-style app with a persistent
  cross-navigation player, real Web Audio visualizer, and an admin CMS. Proves you can ship
  a real product, not just a static resume.
- **Accessibility touches** most people skip: `aria-label` on hero video, `role="status"` +
  `aria-live="polite"` on form feedback, `poster` fallback, `playsInline`, reduced-motion
  handling on the visualizer.
- Responsive from source (12-col → single-column; recent mobile header/nav fixes).

### A picky client would notice
- **Readability vs. theme** — amber-on-black + blinking cursors + all-caps mono everywhere is
  heavily styled; make sure substance survives a 20-second recruiter skim.
- **Copy reads as flavor** — `PROJECT_SULTAN_2077`, "Master Sentinel v1.0", "PC Lagbe". Pair
  each active project with a plain what-it-does line + a real link (PDF Tools → live demo is
  the right pattern; apply everywhere).

---

## 5. Suggested Fix Order

1. **A1** — extract `requireAdmin` (removes 6× duplication, improves security maintainability).
2. **Lint sweep** — kill the 56 `any`s and 11 unused vars (types you mostly already have).
3. **A4** — fix `set-state-in-effect` + `purity` (React 19 correctness).
4. **A2** — split `admin/page.tsx` and `ClientCreaTuneAdmin.tsx`.
5. **S1** — swap `!==` for `crypto.timingSafeEqual` in the shared helper from step 1.
6. **A5** — remove/guard the FS write in `/api/messages`.

---

*Generated by Claude Code security-review + manual audit.*
