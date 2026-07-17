# Design Brief — EchoNote

## Subject (concrete)
EchoNote turns rambling voice memos into structured, searchable notes. A person talks for
three unfiltered minutes in the car, on a walk, between meetings — and gets back a clean note:
a one-line summary, the decisions, the action items, the people named, all searchable later.
The product's core magic is a **transformation**: messy spoken signal → ordered written
structure. The page's job is to *show* that transformation, not just claim it.

## Audience
Busy knowledge workers, founders, researchers, PMs, writers — people whose best thinking
happens out loud and away from a keyboard, and who currently lose it or spend evenings
retyping. They are design-literate and skeptical of "AI notes" hype; they want to see it work.

## One feeling to leave with
**Relief.** The specific relief of watching chaos resolve into clarity — "oh, I can just talk,
and it becomes *this*." Confident, calm, a little bit magic; never noisy or gimmicky.

## The subject's own world (palette / texture / vocabulary)
Audio studios and recording apps: dark consoles, level meters, waveforms, the warm glow of a
"REC" light, timestamps, transcript monospace. Against that, the "structured" world is calm,
paper-clean, ordered — cards, checklists, tags. The page lives at the seam between these two
worlds and the design should physically move from one to the other.

## Emotional target adjective
Assured. (Not playful, not brutalist, not corporate-safe.)

## Stack / constraints
- Single self-contained `index.html`, **no build step**, deployable to GitHub Pages by URL.
- Libraries via CDN/ESM only; everything else inline.
- Accessibility + performance are floors, not features: all non-essential motion behind
  `prefers-reduced-motion` with immediate static fallback; the canvas hero needs a static
  poster fallback, lazy-loads, and pauses offscreen; core content + actions work with all
  motion/canvas absent.

## Signature move (one, orchestrated)
**"The Resolve."** A live audio waveform in the hero — warm, restless, alive. As the visitor
scrolls into the second section, a pinned, scroll-scrubbed sequence collapses that chaotic
waveform and settles the raw transcript words into a clean structured note (summary → action
items → tags). Voice becomes structure, driven by the visitor's own scroll. This *is* the
product demonstrated, not decorated.

## Uniqueness test
Swap this onto a generic "AI notes" competitor and the scroll-resolve of waveform→note would
feel wrong, because it's built around EchoNote's specific claim (rambling → structured). The
warm-signal-on-studio-ink palette and the serif/grotesk editorial voice separate it from the
blue-gradient SaaS default that every transcription app ships.
