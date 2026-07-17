# Gate decisions — EchoNote landing page

Session is **non-interactive**. The ui-craft pipeline has three human gates. With no human at
the gate, I make the thoughtful-user choice and log the rationale here, per the task
instruction ("Record gate decisions — make the thoughtful-user choice and log rationale").

## Gate 1 — Direction (normally: user picks from 2–3 directions)

**Directions considered**

- **A. "Signal & Structure" (chosen).** Dark recording-studio ink with a single warm amber
  "signal" accent; expressive serif (Fraunces) display over a clean grotesk (Hanken Grotesk).
  Signature move: **The Resolve** — a live hero waveform that, on scroll, collapses and settles
  a raw transcript into a clean structured note. The design lives at the seam between the
  "voice" world (dark console, waveform, REC light, timestamps) and the "structured" world
  (paper-clean cards, checklist, tags), and physically moves from one to the other.
- **B. "Paper Desk."** Light, warm-cream editorial; the memo as a sheet of paper with hand-note
  margins. Rejected: lands squarely in the "cream + serif + terracotta" clustered default
  (aesthetic-direction.md), and a bright paper page fights the subject's own dark-studio
  vocabulary — it would undersell the *transformation*, which is the whole product.
- **C. "Console Blue."** The literal transcription-SaaS default (near-black + electric blue,
  Space Grotesk). Rejected: this is the exact look every competitor (Otter, etc.) already ships;
  fails the uniqueness test on sight.

**Rationale for A:** It is the only direction where the signature move *is* the product claim
(rambling → structured), so a scroll-scrubbed waveform→note resolve is honest, not decoration.
The warm-signal-on-ink palette + serif/grotesk voice separate it from the blue-gradient default.
This is an open, greenfield brief, so per SKILL.md I spend the verification budget accordingly.

## Gate 2 — Mockup acceptance (normally: user accepts static mockup)

Collapsed into the build. Because the signature is a scroll/canvas motion sequence, a static
mockup can't represent it — the honest artifact is the working page. I run the full quality loop
(mechanical audit at 375/1280 to zero errors → fresh-context LLM judge → apply fixes → re-audit)
directly on the real build, which is what Phase 3 requires anyway. Thoughtful-user choice: a
reviewer would rather approve the moving thing than a still that lies about it.

## Gate 3 — Final acceptance / deploy

Deliverable is handed back for the human to accept and deploy to GitHub Pages. I do **not**
auto-deploy (no repo/permission in scope, and "silence is not acceptance"). The file is
deploy-ready: single self-contained `index.html`, CDN libraries, no build step.

## Library restraint decision (motion-and-effects.md governs)

One orchestrated signature moment, not a pile of libraries:
- **GSAP + ScrollTrigger + SplitText** — the one animation engine (timeline + scroll scrub +
  headline reveal). GSAP is the correct pick for precise scroll-scrubbed choreography.
- **Lenis** — smooth scroll, *earned* because the signature is scroll-linked and Lenis syncs
  DOM scroll to the scrubbed timeline frame-for-frame. Disabled under reduced-motion.
- **Canvas 2D (no library)** for the waveform flourish — deliberately NOT three.js/OGL. A 2D
  canvas waveform is lighter, on-concept, and needs no 155KB 3D payload. Max quality, not max
  libraries.

Rejected on purpose: three.js/R3F, ShaderGradient, tsParticles, Cobe, Lottie — none earns its
weight here, and adding them would violate the skill's restraint rule.
