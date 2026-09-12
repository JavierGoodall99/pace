# Website UI Kit

Click-through recreation of the PACE marketing/waitlist site, built from `athletes/design.md` and the real component code in `athletes/src/components/*.tsx`.

- `Sections.jsx` — Nav, Hero (+ simplified swipe stack), Stats, Manifesto, Features (bento grid), HowItWorks, FinalCTA (rotating word), Footer.
- `WaitlistModal.jsx` — the 2-step + confirmation waitlist form, using the Modal/Input/Chip/Button core components.
- `index.html` — mounts the app; click "GET EARLY ACCESS" anywhere to open the waitlist modal.

Simplifications vs. the real site: no Framer Motion (scroll-linked parallax, masked line-reveals, scroll-progress manifesto opacity) — CSS/React state stands in for those; swipe cards advance on click rather than drag.
