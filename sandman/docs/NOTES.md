# SANDMAN site — build notes

Direction built: **D1 "Somnium Draft"** (per Gate 1), adapted to the director's governing
metaphor — *a dream being woven together as the night progresses*. One self-contained
`index.html`, deployable to GitHub Pages as-is (no build step).

## Libraries (CDN, progressive enhancement) + why + fallbacks

| Library | Version / CDN | Why | Fallback if it fails to load |
|---|---|---|---|
| **GSAP** core | 3.13.0 · jsdelivr | Timeline + scroll math for the weave scrub | If `gsap`/`ScrollTrigger` is undefined the whole enhancement bails → static tapestry + native scroll (page complete) |
| **ScrollTrigger** | 3.13.0 · jsdelivr | Maps scroll progress 0→1 to the weave scenes | same as above |
| **SplitText** | 3.13.0 · jsdelivr | Word-stagger reveal on the hero headline only | Guarded in try/catch; text is real DOM and stays visible if the plugin is absent |
| **Lenis** | 1.1.13 · jsdelivr | Smooth wheel scroll synced to ScrollTrigger | Independently guarded — canvas + native scroll still run if Lenis is undefined; anchors fall back to native jump |

Canvas is plain **Canvas 2D** (no three.js / WebGL) as required — ~46 dormant knots + a
5-node / 4-edge Showdown DAG, all 1px organic (wavering) strokes.

**The single signature move** is the persistent woven canvas. There are NO per-section
fade-in reveals: an earlier iteration used scroll-triggered opacity reveals, but those (a)
hid content until a trigger fired — fragile, and exactly the "content only appears after
animation" failure the skill warns against — and (b) don't survive programmatic scroll under
Lenis. Removed in favor of sparse, always-visible DOM over the persistent canvas (the intended
alche.studio-style composition). The only load-time entrance is the hero headline, which plays
immediately (not scroll-gated) and degrades to visible text.

## Fallbacks / quality floors (all verified with playwright-core + cached chromium-1223)

- **prefers-reduced-motion: reduce** → canvas never mounts (`canvas-on` class not added);
  the hand-authored inline-SVG **static tapestry** (the finished Showdown weave) shows
  immediately; native scroll; verified `canvasDisplay:none / staticDisplay:block`.
- **no-JS** → full content legible; static tapestry SVG is in the DOM; renders fine (screenshot
  `nojs-1280.png`).
- **Canvas pause** → `visibilitychange` stops the GSAP ticker + Lenis when the tab is hidden.
- **In-place resize edge (1280→375)** → debounced (160 ms) `resize()` re-measures the canvas
  (DPR-aware) AND calls `ScrollTrigger.refresh()`. Verified: after a mid-scroll shrink,
  canvas CSS width = 375, `scrollWidth` = 375, audit errors = 0, console clean. (The prior
  build's stale-geometry-on-resize bug is not reproduced.)
- **Accessibility** — every text/surface pair passes WCAG AA in the mechanical audit (dark
  scheme); `:focus-visible` is a 2px phosphor outline on every interactive element (verified via
  Tab); real mobile nav (native-styled disclosure with `aria-expanded` + `aria-hidden` toggling,
  Escape-to-close, click-outside-close, focus moves to the target section on link click);
  anchors + keyboard work through Lenis (pointer clicks use `lenis.scrollTo` + move focus;
  reduced-motion uses native anchors — verified landing under the fixed header).

## Mechanical audit (`ui_audit.js`)

- Widths 375 / 768 / 1280, dark scheme, **all sections revealed** (content is
  unconditionally visible after the reveal-removal above).
- `audit-before.json` — first pass: 8 errors (skip-link "offscreen" via `left:-9999`; sub-24px
  tap targets on the scroll cue, footer links). `audit-after.json` / `audit-final.json` —
  **0 errors, 0 warnings, 0 console errors at every width.**
- Fixes: skip-link now hides vertically (`top:-100px`, stays `left:8px`); scroll-cue + footer
  links + wordmark padded to ≥44px hit area; collapsed mobile menu `aria-hidden` when closed.

## DATA HONESTY — verified vs dropped

Verified live against `github.com/Howard-Jek/sandman` via `gh api` (STATE.md, README.md,
BENCHMARKS.md, `benchmarks/star1_rates.json`, `scripts/capstone_showdown.py`).

**Verified — shipped:**
- Held-out (dev): **23/24 vs raw Claude Code 10/24** — STATE.md §4 (★1) and §5 ("Combined dev: 23/24 vs 10/24").
- Oracle **seal-rate 0.96** (Nightmare/Warden, **25 runs**; held-out kill-rate 0.00→~0.96, seal 24/25) — STATE.md §4/§5.
- **UI visual-quality judge 0.78 vs 0.52** (same vision judge) — STATE.md §5.
- **Showdown capstone: $1.84 · 5/5 tasks · 3 waves**, then a real gated `docker compose up` with live smoke — STATE.md §5.
- **Showdown DAG structure** (the table): wave 0 `[elo ‖ db ‖ infra]` → wave 1 `app` → wave 2 `ui`, with the exact per-task gates (pytest test_elo.py / test_db.py / docker compose config / pytest test_app.py TestClient / behavior+visual+UX) — verified from `scripts/capstone_showdown.py`.
- **Moonlit Market: 6/6 · $1.34**, gate caught + refused two real issues, clean re-run — STATE.md §5.
- Brownfield gate **"refused the build four times and never shipped it"** — STATE.md §6.
- Napkin = **six plain-English prompts** (wish / show-me / for-real / never-allowed / lazy-genie / vibe) — STATE.md §1, docs/NAPKIN.md.
- Governing law "**autonomy is bounded by verifiability**" and acronym expansion + tagline
  "*Sprinkles ideas; wakes up shipped code.*" — README.md.
- **~$20** cumulative live spend — STATE.md §5.

**Dropped / replaced (could not verify, or stale):**
- **"342 tests"** (planning copy) — STALE. STATE.md (v1.1.0) header says **430 tests**;
  the current README (v1.2.0) says **"600+ tests, all offline."** The count is a moving
  target, so the specific "342" was dropped. Shipped the current, soft, verifiable claim
  **"600+ · all offline · no API calls"** (README).
- **"~18 min" Showdown wall-clock** (BRIEF) — NOT found in the repo; **omitted**.
- **Per-node dollar costs on the Showdown DAG** — not individually recorded for Showdown;
  the table annotates only the real *gates* and the verified **total $1.84**. No invented
  per-edge costs.
- Illustrative night timestamps in section eyebrows (23:00 / 02:14 / 04:40 / 06:41) and the
  terminal's `plan ✓ approve ✓ … sealed` status line are **atmospheric narrative** (the
  "night passing" metaphor), not measured claims — they assert no metric.

## Environment
- Audits/screenshots: `playwright-core@1.55.0` (scratchpad install) driving the pre-cached
  `chromium_headless_shell-1223` via explicit `executablePath` (pinned playwright's own
  browser build differed; pointing at the cache worked). Node v26.
- Design is intentionally **dark-only** (near-black night); `color-scheme: dark`. No light
  mode by design (committed direction).
