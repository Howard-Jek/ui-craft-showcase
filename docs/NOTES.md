# NOTES — EchoNote landing page

A single self-contained `index.html`, deployable to GitHub Pages by URL (no build step, no
bundler). All libraries load from CDN; everything else is inline.

## Deploy
Drop `index.html` at the root (or any path) of a GitHub Pages repo and open the URL. Nothing to
compile. No local asset files are required — the waveform is drawn with the Canvas 2D API, so
there is no `.lottie`/`.json`/image dependency to ship alongside it.

## Libraries used — what, how loaded, why it earns its place, and its fallback

The restraint rule (motion-and-effects.md): **one orchestrated signature moment, not a pile of
libraries.** The signature is "The Resolve" — a hero waveform that, on scroll, collapses and
settles a raw transcript into a structured note. That is scroll-linked timeline choreography,
which is exactly what these three earn:

| Library | Version / load | Why it earns its place | Fallback |
|---|---|---|---|
| **GSAP core** | 3.13.0, CDN `<script>` (cdnjs) | The one animation engine on the page. Drives the scrubbed Resolve timeline, the reveal-on-scroll, and the step-bar lights. GSAP is the correct pick for precise, cross-browser scroll-scrubbed timing. | Content is plain DOM and fully visible without JS; if GSAP fails to load, a guard reveals everything and the note card stays visible (progressive enhancement). |
| **ScrollTrigger** | 3.13.0, CDN `<script>` (cdnjs) | Pins the Resolve stage and scrubs the timeline to scroll; fires the once-only reveals. The signature literally *is* scroll-driven, so this is load-bearing, not decoration. | Behind `prefers-reduced-motion`: no pin, no scrub — the note renders in its finished state and reveals are shown immediately. |
| **SplitText** | 3.13.0, CDN `<script>` (cdnjs) — now free in GSAP 3.13 | Splits the hero headline into lines for the staggered editorial entrance (the "headline animates in" signature from the toolkit). | Wrapped in try/catch and gated on reduced-motion; the headline text is in the DOM, so if SplitText is absent or motion is off, the full headline shows instantly (no content hidden behind an animation). |
| **Lenis** | 1.1.14, CDN `<script>` (jsDelivr, UMD global) | Smooth scroll, *earned* because the signature is scroll-linked: Lenis syncs DOM scroll to the scrubbed GSAP timeline frame-for-frame via `gsap.ticker`, which keeps the Resolve buttery. Anchor links route through `lenis.scrollTo`. | Disabled entirely under `prefers-reduced-motion` (native scroll); anchor links fall back to native `scrollIntoView`. Keyboard/scrollbar/anchor behavior is preserved — smooth, never hijacked. |

### Deliberately NOT used (restraint)
No three.js / React Three Fiber / OGL / ShaderGradient / tsParticles / Cobe / Lottie. The
waveform flourish is a **hand-written Canvas 2D renderer** (no library): lighter than any 3D
payload, on-concept (it's literally an audio level meter), and it doubles as the Resolve's
"energy" control so one piece of code serves both the live hero and the scroll transformation.
Adding a WebGL/3D library here would have violated "max quality, not max libraries."

## Accessibility & performance floors (built silently, not sold as features)
- **Everything non-essential is behind `prefers-reduced-motion`**: Lenis off, ScrollTrigger
  pin/scrub off, SplitText off, canvases draw a single static poster frame, the typewriter
  transcript prints in full, reveals show immediately, and the Resolve renders its finished
  end-state. The page is fully composed with motion off.
- **Canvas has a static poster + lazy behavior**: both waveforms draw an immediate poster frame
  (never blank), animate only while on-screen (IntersectionObserver pauses them offscreen), and
  degrade to static CSS bars if `getContext('2d')` is unavailable.
- **Core content and actions work with all motion/canvas/JS absent** — the markup is complete and
  readable on its own; JS only enhances.
- **Focus** is a visible amber ring on every interactive element (`:focus-visible`), verified.
- **Mobile menu** is a real accessible dropdown: `aria-expanded`, closes on link-click / Escape /
  outside-click, 44px+ tap targets. Email inputs have `aria-label` + `aria-describedby` to their
  live-region error message. Forms validate with a plain-language message.
- **Contrast**: role-based tokens; muted text is a solid hex (`--text-muted #9A958C`, ~6.7:1 on
  `--bg`), not low-opacity ink. Audit found 0 contrast failures in dark scheme.

## Design system (tokens live at the top of index.html)
- **Type** (2 families + 1 utility): **Fraunces** (expressive serif display), **Hanken Grotesk**
  (grotesk body/UI), **JetBrains Mono** (utility only — timestamps, transcript, eyebrows, data).
  None are on the banned "AI-default" list. The mono is the subject's own vocabulary (transcripts,
  level readouts), sanctioned by aesthetic-direction.md as a utility/data face.
- **Color**: studio-ink dark bg, one scarce warm accent `--signal #FF8A4C` (the live voice), and a
  restrained `--clarity #7FE3C6` mint used only as the "structured/done" marker — never as a
  competing button. 8px spacing scale; radii 8/12/20/full; hairline borders as the primary
  elevation language.

## Verification tooling
The shared Browser pane was contended and `localhost` is blocked in this environment, so the
mechanical audit + screenshots ran via **headless Chromium through playwright-core@1.60.1** (which
matched the machine's cached Chromium revision 1223). Runner scripts live in the session
scratchpad; outputs (`audit-results.json`, `shot-*.png`) are in this directory.

## Final result
- **Mechanical audit (`ui_audit.js`)**: **0 errors** at 375 / 768 / 1280 in both normal and
  `prefers-reduced-motion` (dark scheme). 0 console errors. Only warnings = 4 zero-size on the
  collapsed mobile-menu links (display:none until opened — standard collapsed-menu pattern).
- **LLM judge**: **PASS**, mean **8.7/10**, dimensions 1:7 2:9 3:9 4:9 5:9 6:9 7:8 8:9 9:9, zero
  blockers. Its one High (mobile CTA orphaned in header) + all three Mediums + two Nits were
  applied and re-audited clean. See `judge-report.md`.

## Files in this directory
- `index.html` — the deliverable (self-contained).
- `design/BRIEF.md` — design brief.
- `GATES.md` — gate decisions + rationale (non-interactive session).
- `audit-results.json` — mechanical audit output (5 configs).
- `judge-report.md` — judge verdict + fix disposition.
- `NOTES.md` — this file.
- `shot-*.png`, `diag-mobile-full.png` — evidence screenshots (desktop + mobile + states).
