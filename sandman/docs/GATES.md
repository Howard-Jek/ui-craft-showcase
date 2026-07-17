# Gate record — SANDMAN single-page site

Pipeline: Phase 0 brief + Phase 1 directions + Gate 1 pick were completed in planning. This
executor covered **Phase 2 → Phase 3**. Non-interactive run: Gates 2 and 3 stop at
"ready for Howard's review." **No self-acceptance of final deploy** — the human reviews the live
page next.

---

## Gate 1 — direction pick  (already decided, upstream)
- **Chosen: D1 "Somnium Draft."** Governing metaphor (Howard, 2026-07-17): *a dream being woven
  together as the night progresses* — organic thread-like strokes, night-hour progression
  (dusk → deep night → daybreak), gate-seals as knots pulled tight, the final Showdown capstone
  graph as a completed weave/tapestry rather than an engineering diagram.
- The approved **style tile** (`tile-somnium-draft.html`) is the token contract (incl. its
  post-planning patches: expanded nav tap target, `a:focus-visible` rule — both preserved).

## Gate 2 — mockup / direction execution
- The approved style tile served as the Phase-2 system-of-record for tokens, type, and the
  signature look. Tokens copied verbatim into `index.html` CSS custom properties; no unexplained
  drift. Real copy throughout (no lorem), realistic data lengths, hostile strings checked.
- Mechanical audit clean and the direction reads as committed (dark near-black night, Newsreader
  dream-italic display vs Geist Mono instrument labels, phosphor as an event color).
- **Status: SATISFIED — ready for Howard's review.**

## Gate 3 — real build  →  **READY FOR HOWARD'S REVIEW (not self-accepted)**

Deliverable: one self-contained `index.html`, GitHub-Pages-ready, no build step. Signature =
persistent Canvas-2D woven agent-graph driven by GSAP ScrollTrigger + Lenis; the capstone weave
is the real, repo-verified Showdown DAG.

**Quality loop:**
- Mechanical audit (`ui_audit.js`), dark scheme, all sections revealed, fresh loads:
  **375 / 768 / 1280 → 0 errors, 0 warnings, 0 console errors.**
  (`audit-before.json` = 8 initial errors; `audit-final.json` = clean.)
- Hostile / edge tests, all passing:
  - **In-place resize 1280→375** (the prior build's stale-geometry trap): debounced
    `resize()` + `ScrollTrigger.refresh()`; canvas re-sizes to 375px, no overflow, **0 audit errors**.
  - **prefers-reduced-motion** → canvas never mounts; static woven tapestry shows immediately;
    native scroll; anchors land under the fixed header.
  - **no-JS** → full content legible; nav links wrap (no overflow); static SVG tapestry present.
  - **Mobile nav** opens/closes with correct ARIA + focus management; keyboard focus rings visible.
  - Longest stat/label strings and the 375 width composed; console clean.
- **Adversarial judge** (fresh subagent): **PASS**, mean 8.2, zero Blockers. One High (no-JS nav)
  + three Mediums + nits applied and re-audited (see `judge-report.md`).

**Data honesty:** every shipped number verified against `github.com/Howard-Jek/sandman`
(23/24 vs 10/24, 0.96 seal, $1.84 Showdown 5/5·3-waves, $1.34 Moonlit 6/6, 0.78 vs 0.52 UI judge,
the exact Showdown DAG + gates, ~$20 spend). Stale "342 tests" dropped for the current
"600+ offline tests"; unverifiable "~18 min" and per-node Showdown costs omitted. Full ledger in
`NOTES.md`.

**Deploy:** NOT performed. Awaiting Howard's explicit Gate-3 acceptance of the live page, then
deploy via the repo's GitHub Pages flow.

### Deliverables in this directory
`index.html` · `GATES.md` · `NOTES.md` · `judge-report.md` ·
`audit-before.json` / `audit-final.json` (before/after) · screenshots
(`shot-{375,768,1280}-final.png`, `reduced-motion-1280.png`, `nojs-{375,1280}.png`,
`mobile-nav-open.png`, `weave-*.png`, `resize-1280to375.png`).
