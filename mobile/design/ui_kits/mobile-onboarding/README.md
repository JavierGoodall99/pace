# Mobile Onboarding UI Kit

Click-through recreation of the 8-step onboarding flow specified in `athletes/mobiledesign.md` (no mobile code existed in the source — this is built from the spec doc). Shown in a plain phone frame; use the Continue/Back controls to step through Welcome → Basics → Disciplines → Cadence → Pace Calibration → Photos → Verify → Launch Hub.

`Screens.jsx` holds one function per step, composed from the core components (Chip, SegmentedControl, Input, ProgressBar, Badge, Button, IconButton).
