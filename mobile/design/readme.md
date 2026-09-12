
# Pace Design System

**Pace** is a dating app for active singles in South Africa — "the dating app for athletes." The pitch: mainstream dating apps waste your time with people who don't live like you; PACE matches you by discipline, training cadence and pace so a first date can be a sunrise trail run instead of an awkward coffee. It's currently pre-launch, running a city-by-city "Founding Cohort" waitlist (Cape Town, Johannesburg, Durban, Pretoria).

Two surfaces exist today:
- **Marketing / waitlist website** — a single-page React site (hero, manifesto, stats, features, how-it-works, closing CTA, waitlist modal). Fully built in code.
- **Mobile app onboarding** — an 8-step onboarding flow (auth → identity → disciplines → cadence → pace calibration → photos → activity-sync verification → launch hub) and a swipe-based match stack. Specified in detail in `mobiledesign.md` but not yet built in code — this design system's mobile UI kit is a recreation from that spec.

## Sources
- Local codebase: `athletes/` (mounted, read-only) — Vite + React + TypeScript + Tailwind CSS v4 + Framer Motion + lucide-react.
  - `athletes/design.md` — the web visual design system spec (colors, type, spacing, components, motion).
  - `athletes/mobiledesign.md` — the mobile onboarding UX/UI spec.
  - `athletes/src/index.css`, `athletes/src/components/*.tsx`, `athletes/index.html` — actual implementation.
- No Figma file, slide deck, or logo asset was attached. `athletes/public/logos/` exists in the codebase but is empty.

## Index
- `styles.css` — root stylesheet, `@import`s everything below.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css` (radii, layout, motion), `fonts.css`, `base.css` (global resets/scrollbar/grain/selection).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand groups) shown in the Design System tab.
- `components/core/` — Button, IconButton, Chip, SegmentedControl, Input, Badge, ProgressBar, Card, Avatar, Modal.
- `ui_kits/website/` — click-through recreation of the marketing/waitlist site (Nav, Hero + swipe stack, Stats, Manifesto, Features, How It Works, Final CTA, Footer, waitlist modal).
- `ui_kits/mobile-onboarding/` — click-through recreation of the 8-step onboarding flow (Welcome → Basics → Disciplines → Cadence → Pace Calibration → Photos → Verify → Launch Hub) in a phone frame, built from `mobiledesign.md` (no mobile code existed in source).
- `assets/` — icons (lucide) and stock photography references. No logo file exists (see Iconography/Brand notes).
- `SKILL.md` — Claude Code / Agent Skill wrapper for this design system.

### Intentional additions
No component library existed in the source beyond page-level sections built directly with Tailwind utility classes — so per the from-scratch rules, a standard core primitive set was authored (Button, IconButton, Chip, SegmentedControl, Input, Badge, ProgressBar, Card, Avatar, Modal), sized only to patterns actually observed in `design.md`/`mobiledesign.md`/the components. Nothing was invented beyond that: no Tabs, Toast, Tooltip, Select, etc. exist because the source never uses them.

---

## Content fundamentals

**Voice**: direct, a little blunt, coach-like. Short declarative sentences, often fragments. Second person ("you") addressing the user, contrasted against a dismissive "dating apps" as the antagonist third party — never "we" as a soft brand voice. Example from the hero: *"Dating apps waste your time with people who don't live like you."*

**Casing**: headlines and UI labels are aggressively **UPPERCASE** (Anton display type and JetBrains Mono labels/buttons/eyebrows are always uppercase, tracked out 0.18–0.35em). Body/paragraph copy is the one place sentence case survives, e.g. *"We pair you with athletes whose workout windows match yours."*

**Punctuation as rhythm**: hero headline is three one-word lines each ending in a period — `MATCH.` / `TRAIN.` / `DATE.` — like a countdown or a chronograph readout. Interpunct (·) separates metadata clusters instead of commas or pipes: `FOUNDING COHORT · BATCH 01`, `01 / 08`.

**No emoji in the web product.** The mobile spec (`mobiledesign.md`) is the one place emoji appear, as leading glyphs on discipline chips (🏃 RUNNING, 🚴 CYCLING) and time-of-day pills (🌅 EARLY MORNING) — treat this as mobile-only shorthand from the spec doc, not a confirmed final decision; flag before shipping literal emoji glyphs in UI.

**Numbers over adjectives**: copy leans on counted, verifiable specifics rather than vague claims — "94% COMPATIBLE," "100% training-verified," "±15% variance window," "3.8× more quality matches" — reinforcing the athletic/telemetry framing.

**Vibe**: track-and-field timing equipment, night-run intensity, zero fluff. No "spark joy," no soft pastel dating-app language. CTAs read like commands: `GET EARLY ACCESS`, `ENTER PACE`, `CONTINUE`, `SYNC YOUR TRAINING`.

---

## Visual foundations

**Color**: obsidian dark canvas (`--color-ink #0a0a0d`) with two lighter dark layers (`coal`, `ash`) for elevation — no light theme. One accent does all the work: `ember` (#ff4d2e), a hot orange-red, on solid buttons, progress fills, active chip states and focus rings; `flare` (#ff8a6b) is its lighter hover/press tint, never used standalone as a base color. `bone` (#f4f1ea, warm off-white, not pure white) is primary text/inverse-button fill; `fog` is muted secondary text. Max one accent hue in the whole system — resist adding a second brand color.

**Type**: three-family system, strict role separation. **Anton** (condensed, uppercase-only, tight leading 0.85–1.0) for every headline and numeric/stat display — never for body copy. **Archivo** for paragraph/body copy and the one "manifesto lead" treatment (semibold, tight tracking, sentence case). **JetBrains Mono** for everything that reads as UI chrome/metadata: buttons, eyebrows, tags, step counters, timestamps — always uppercase, always tracked out (0.18–0.35em). A body font never carries a button, and a mono font never carries a paragraph.

**Spacing/layout**: single 1440px max-width container, generous section rhythm (112–176px vertical py). Mobile gutter 20px, desktop 40px. Nothing else constrains width — it's a single-column marketing site with a loose bento grid for feature cards.

**Backgrounds**: full-bleed documentary photography (grayscale by default, `grayscale-[0.45]` cross-fading to full color on hover, ~700ms) used in bento cards and the hero collage — never flat illustration, never generic stock-photo gradients. A fixed, near-invisible SVG film-grain overlay (`opacity 0.055`, `mix-blend-mode: overlay`) sits over the entire canvas for analog texture. Soft radial "ambient glow" blobs (ember/flare at 5–12% opacity, 150–170px blur) sit behind hero and CTA sections for depth — always paired with the grain, never a hard gradient mesh.

**Animation**: one easing curve for almost everything — `cubic-bezier(0.16, 1, 0.3, 1)`, a snappy high-end deceleration (no bounce, no elastic overshoot). Micro-interactions (hover/focus) run ~300ms; section/card reveals run 800–1000ms as masked line-reveals (`translateY(112%) → 0`) or fade-up-on-scroll; numeric counters count up over 2200ms; a ticker marquee loops continuously at 38s linear. Scroll-linked parallax (hero collage, sticky CTA) uses spring-smoothed scroll progress, not instant scrubbing.

**Hover states**: ember → flare (lighter, warmer) on solid buttons; borders go from hairline `--color-line` to `border-bone/25` or `border-ember/40`; grayscale photography desaturates to full color; icon badges rotate -8°; card bottom edge-accent bars scale in from `scaleX(0)` to `scaleX(1)`.

**Press states**: `active:scale-[0.97]` on primary buttons / `active:scale-95` on icon buttons — a small shrink, never a color-only change, giving a tactile "pressed" feel.

**Borders**: hairline `1px solid rgba(bone, 9%)` (`--color-line`) is the default structural border everywhere — cards, inputs, dividers. No heavy borders, no colored left-border accent strips.

**Shadows**: used sparingly and only on genuinely elevated/interactive elements (the top swipe card gets a large soft drop shadow; primary/verify buttons sometimes get a soft ember glow-shadow `shadow-ember/20-25`). Static cards and sections carry no shadow — depth comes from the hairline border + subtle surface-color steps (ink → coal → ash), not from shadow systems.

**Corner radii**: `rounded-full` (pill) for every interactive control — buttons, inputs, chips, badges. `24px` for major cards and photo frames. `16px` for secondary/nested cards and inputs on mobile. `8px` only for the small brand-mark badge. No sharp (0px) corners anywhere on interactive surfaces.

**Cards**: `ash` surface, hairline `line` border, `24px` radius, no shadow at rest; on hover the border warms to `ember/40` and the card lifts `-translate-y-1.5`. Media cards instead use a full-bleed photo with a bottom-to-top dark gradient mask (`ink → ink/35 → transparent`) so white text sits directly on the image floor.

**Transparency/blur**: used specifically for "floating over content" moments — the scrolled nav (`bg-ink/80 backdrop-blur-xl`), the waitlist modal panel (`bg-ash/95 backdrop-blur-md`) and its backdrop (`bg-ink/80 backdrop-blur-sm`), and tag pills sitting over photography (`bg-ink/40 backdrop-blur-md`). Not used decoratively elsewhere.

**Imagery color vibe**: warm-neutral documentary sports photography — sweat, chalk, urban dusk running, climbing chalk, trail summits. Grayscale-by-default with a subtle contrast boost (`contrast-1.05`), full color revealed only on hover/interaction. No cool blue color grading, no heavy vignette, no illustration.

---

## Iconography

**System**: [`lucide`](https://lucide.dev) exclusively (`lucide-react` in the web codebase; the mobile spec calls for `lucide-react-native` for 1:1 parity) — outline icons, no filled icon set, no custom icon font. Standard UI icons use stroke-width 2.0–2.5; micro controls/nav chevrons use 3.0.

**Presentation**: icons are almost always housed in a circular or `rounded-2xl` tinted badge — `bg-ember/10 text-ember` for primary/branded icons, `bg-white/5 text-bone` for neutral ones — rather than floating bare.

**Emoji**: not used in the shipped web product. The mobile spec doc uses emoji as informal shorthand on discipline/time-window chips (🏃🚴🏋️🧗 etc.) — treat as a spec placeholder, flag before using literal emoji in a shipped screen.

**This design system** copies `lucide-static` SVGs into `assets/icons/` for the exact glyphs used in the source (activity, arrow-up-right, arrow-right, chevron-left, heart, x, check, badge-check, map-pin, shield-check, users, zap, repeat). Reference these files directly rather than hand-drawing icon replacements.

## Brand mark / logo

**No logo file was provided** — `athletes/public/logos/` is present in the codebase but empty, and no Figma or brand-asset source was attached. The codebase's own "brand mark" is not a logo file at all: it's a small composed lockup in `Nav.tsx` — a `lucide` **Activity** glyph on an ember `rounded-lg` square, next to "PACE" set in Anton uppercase. This design system reproduces that exact lockup (see `guidelines/brand-mark.html` and `assets/`) as the placeholder brand mark. **Do not treat this as an approved logo** — if Pace has (or commissions) a real logotype/mark, replace this lockup and flag the change.

