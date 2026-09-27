# Pace — codebase map for AI agents

Read this first; it should save you from exploring the repo. Only open files you need to change.

**What it is:** Pace is a dating + training-partner app for single athletes in Cape Town.
Expo / React Native app in `mobile/`. **No backend**: all data lives on the phone
(AsyncStorage) and in mock data. Server work is listed in `docs/backend-todo.md`; don't build it
unless asked. Feature-level behaviour is documented in `docs/features.md` (read that for "how
does X work for the user").

> **Keep this file current.** When you add, remove or rename a screen, store, lib/component
> module, config switch or storage key, or change a convention described here, update the
> matching section of this file in the same change. A Stop hook
> (`.claude/hooks/claudemd-check.sh`) reminds you if structural files changed and this file didn't.

> `mobile/README.md` and `mobile/design/readme.md` are **stale** (old tab names, old fonts
> Anton/Archivo). Trust this file and the code.

## Repo layout

```
CLAUDE.md               this file
docs/features.md        user-facing feature spec (source of truth for behaviour)
docs/backend-todo.md    everything waiting on a server
docs/superpowers/       old plan/spec for testing + CI
mobile/                 THE APP — nearly all work happens here
Pace App.dc.html, support.js, image-slot.js, _ds/, assets/
                        original design mockup + its runtime. Reference only; don't edit.
.github/workflows/ci.yml  CI: lint → tsc --noEmit → jest (in mobile/)
.husky/pre-commit       runs lint-staged (eslint --fix + prettier) in mobile/
```

## Stack

Expo SDK 57, Expo Router (file-based), React 19, RN 0.86, TypeScript strict, **Tamagui v2**
(UI), react-native-svg, AsyncStorage, RevenueCat (`react-native-purchases`), VisionCamera +
ML Kit face detector (selfie check), expo-notifications (local only), Apple/Google sign-in.
Fonts: Plus Jakarta Sans (body) + Instrument Serif (display).

## Commands (run in `mobile/`)

```
npm start | npm run ios | npm run android | npm run web
npm test                # jest (jest-expo preset, AsyncStorage mocked)
npm run lint            # eslint (expo config + prettier)
npx tsc --noEmit        # type check — CI runs this
```

Before claiming done: `npm run lint && npx tsc --noEmit && npm test` should pass.

## Architecture in one screen

```
mobile/
  app/                 screens (Expo Router). Thin-ish: read hooks from src/data, render UI.
  src/config.ts        app-wide switches (LAUNCH_MODE, DEMO_DATA, FEATURES, Pro constants)
  src/data/            ALL state + business logic. One module = one store. Tests live here.
  src/components/      shared UI (ui.tsx = primitives kit; others are feature components)
  src/lib/             platform wrappers (purchases, auth, notifications, haptics, analytics…)
  src/theme/           tokens.ts (palettes, fonts, spacing, radius) + appearance.ts (light/dark)
  tamagui.config.ts    Tamagui config built from src/theme/tokens.ts
  tamagui-prompt.md    Tamagui rules for this project — read before writing styled UI
  design/              design-system bundle (reference; ignored by eslint)
```

### The store pattern (used by every stateful `src/data/*.ts`)

Hand-rolled global stores, no Redux/Zustand/Context:

```ts
let state = DEFAULT;                      // module-level
const listeners = new Set<() => void>();
function setState(patch) { state = {...state, ...patch}; listeners.forEach(l => l()); persist(); }
export function useThing() { return useSyncExternalStore(subscribe, () => state); } // React hook
export function getThingState() { return state; }   // non-React read (used by other stores/tests)
export function resetThing() { ... }                // used by account deletion + tests
AsyncStorage.getItem('pace.thing.v1').then(hydrate) // hydrate once at module load
```

- Mutations are plain exported functions (`sendMessage`, `likeBack`, `logTraining`, `updateMe`…).
- Storage keys: `pace.<store>.v<N>`. Bump N (or add a migrate fn, like `session.ts` does) when
  the persisted shape changes incompatibly.
- **Adding a new store?** Add its `reset*()` to `deleteAccountAndData()` in `src/data/account.ts`,
  or deleted accounts leak data to the next sign-up (there's a test for this).
- Cross-store actions live in their own module to avoid import cycles: `account.ts` (delete/seed),
  `safety.ts` (unmatch/block/report touch social + chat + plans).
- Some stores export a `*Ready` promise (`settingsReady`, `trainingReady`, `waitlistReady`) for
  awaiting hydration. Session exposes `loading`.

### Config switches (`src/config.ts`)

- `LAUNCH_MODE` — deck includes unverified/inactive people, ranked lower (`RANK_WEIGHTS`).
- `DEMO_DATA` — on in dev by default (`EXPO_PUBLIC_DEMO_DATA` overrides). Use
  `demo(value, empty)` for any seed/mock content so real builds show empty states.
- `FEATURES.{moments,passport,voiceNotes}` — parked (false). Code stays; gate entry points.
- `PRO_EXTRA_PICKS`, `PRO_ENTITLEMENT = 'pro'`.

## Navigation (`mobile/app/`)

- `index.tsx` — routing gate: no account → `/onboarding`; account but signed out → `/sign-in`;
  not onboarded → `/onboarding`; else `/(tabs)/today`.
- `_layout.tsx` — fonts, Tamagui provider + theme, root `Stack` (lists every route and whether
  it's a modal), `PipToastHost`. **Register new routes here** if they need modal presentation.
- `(tabs)/_layout.tsx` — 5 tabs, custom `FloatingTabBar`. Also runs streak/check-in reminders and
  pushes `/match/[athleteId]` when an invite is accepted.

| Tab file | Label | Purpose |
|---|---|---|
| `today.tsx` | Today | home: week's sessions, streak, check-ins, Pip tip |
| `discover.tsx` | Pacers | daily picks swipe deck |
| `sessions.tsx` | Explore | Cape Town events, crews, spots, open sessions |
| `chat.tsx` | Chats | matches + threads |
| `profile.tsx` | You | own card, edit, settings entry |

Other routes: `onboarding.tsx` (**1,580 lines**, all 21 steps in one file; step order in
`src/data/onboardingFlow.ts` `STEPS`, Pip copy in `pipLine()` switch), `(auth)/sign-in|sign-up|forgot-password`,
`athlete/[id]` (profile modal), `thread/[athleteId]` (chat), `match/[athleteId]` (match
celebration), `invite/[athleteId]` + `session-new` + `session/[id]` (training sessions),
`likes`, `matches`, `verify` (selfie liveness), `connect/[provider]` (simulated Strava/Garmin/
Health sync), `log-training`, `races`, `race/[id]`, `event/[id]`, `spot/[id]`, `crew/[id]`,
`moment/[id]`, `moment-new`, `edit-profile`, `edit-highlights`, `discover-filters`,
`notifications`, `safety`, `settings*` (preferences, notifications, privacy, subscription),
`legal/[doc]`.

## `src/data/` — where to find logic

| Module | Owns |
|---|---|
| `session.ts` | account + `MeProfile` (own profile), sign up/in/out, `updateMe`, `useMe`. Mock auth (password stored locally). |
| `account.ts` | `deleteAccountAndData` (resets every store), `seedDemoFor(gender)` |
| `onboardingFlow.ts` | step list, pre/post-account steps, progress/resume, `saveProfileStep` |
| `mockData.ts` | `ATHLETES`, `Discipline`, demo threads/notifications (ported from the mockup) |
| `athleteDepth.ts` | per-athlete extras keyed by id (`depthFor`): level, gender, PBs, prompts, last trained |
| `photos.ts` | maps athlete slotIds → bundled images |
| `pacers.ts` | deck eligibility (`isEligible`, `wantEachOther`), `rankScore`, `pacerDeck`, session suggestions |
| `deck.ts` | `usePacerDeck(now)` — today's remaining picks after filters/passes (shared by Today + Pacers) |
| `picks.ts` | daily picks chosen at 07:00 drop (5, +5 Pro), `pickReason` |
| `filters.ts` | Discover filters (in memory only, not persisted) |
| `compat.ts` | "% in sync" score: days/time/pace/distance factors |
| `rhythm.ts` | weekly training-day patterns, `syncScore`, `sharedDays` |
| `social.ts` | likes, matches, passes (cooldown), blocks, reports; demo graph |
| `chat.ts` | threads, messages, first-move likes, daily like budget, composer lock (women-first) |
| `safety.ts` | unmatch / block / report (cross-store) |
| `plans.ts` | training sessions between matches: invites, accept, cancel, check-ins, open sessions, `celebrate` |
| `training.ts` | training log (manual / synced / from sessions), weekly streak, heatmap |
| `sync.ts` | provider types + mock activity import |
| `trust.ts` | trust rules: active days, likes/day, match expiry, scam/contact-sharing detection |
| `identity.ts` | gender, intent, lifestyle, photo labels, `photoProblem` validation |
| `liveness.ts` | pure state machine for the blink/smile/turn selfie check |
| `consent.ts` | biometric/health consent records (versioned) |
| `capeTown.ts` | real CT spots, communities, events, sun times, conditions |
| `explore.ts` | events going, crews followed, passport stamps |
| `places.ts` | cities, launch city, public meeting spots, distances |
| `races.ts` | races, build-up runs, who's training for what |
| `moments.ts` | 24h post-workout photos (feature-flagged off) |
| `notifications.ts` | in-app feed read state |
| `settings.ts` | privacy / push / email prefs |
| `pro.ts` | Pro flag (set from RevenueCat), `picksPerDay` |
| `pip.ts` | mascot copy (`todayLine`, `profileTip`, `weekDigest`) |
| `highlights.ts` | PB + route editing rules |
| `dates.ts` | date helpers (Monday-first weeks, `dropKey`, `formatWhen`) |
| `waitlist.ts` | non-Cape-Town email waitlist |
| `legal.ts` | Terms / Privacy / Community Code text (draft) |

## `src/lib/`

Platform wrappers. Several have a **`.web.ts(x)` twin** that stubs native-only features (Metro
picks it automatically): `purchases`, `socialAuth`, `photoFaces`, `FaceScanner` (in components).
Change both files when changing the API.
Others: `analytics.ts` (`track()`, console sink), `dialogs.ts` (use `confirmAction`/`notify`
instead of `Alert.alert` — Alert is a no-op on web), `haptics.ts`, `reminders.ts` (local
notifications), `photoStore.ts` (copy picked photos out of the temp cache), `useNow.ts`
(minute-ticking clock; use it instead of `new Date()` in mounted screens), `inviteFriend.ts`.

## UI conventions

- Primitives: import from `src/components/ui.tsx` — `Button, Chip, Badge, IconButton, Input,
  SegmentedControl, ProgressBar, Toggle, ToggleRow, DisplayTitle, ScreenHeader, SectionTitle,
  TextAction, Card, Callout, EmptyState`. Don't re-create these.
- Icons: `<Icon name=… />` (`Icon.tsx`, add paths there). Illustrations: `<Illo name=… />`
  (no emoji in UI; use Illo). Mascot: `Mascot`, `PipTip`, `showPip()` toast.
- Layout: Tamagui `YStack`/`XStack`/`Text`/`ScrollView`. **`onlyAllowShorthands: true`**: write
  `bg`, `items`, `justify`, `px`, `rounded`, `mt`… not `backgroundColor`, `alignItems`, etc.
  See `mobile/tamagui-prompt.md`.
- Colors: theme keys `$text`, `$card`, `$accent`, `$muted`, `$canvas`… in Tamagui props; in JS
  (SVG, Animated, RN styles) use `const colors = useColors()`. Never hardcode hex. Both light
  and dark must work.
- Screens in tabs add bottom padding with `useTabBarSpace()`; use `useSafeAreaInsets()` for top.
- Imports are relative (`../../src/...`); there's no path alias.
- Comments: short "why" comments at the top of modules and before non-obvious logic; match that.

## Domain vocabulary

- **Pacer** = another athlete in your deck. **Picks** = the daily handful (07:00 "drop").
- **Match** = mutual like. Only matches can chat or invite to a **session** (a planned
  training meet-up). Accepting an invite triggers the match celebration.
- **Check-in** = post-session "did it happen / how was it"; also a 90-min safety check-in.
- **Sync / % in sync** = compatibility score (`compat.ts`, `rhythm.ts`).
- **Verified** = passed on-device live selfie check (not a face match; see backend-todo).
- **Level** 1–4 = effort level comparable across sports. **Intent** = love / partner / both.
- **Streak** = consecutive weeks with ≥1 training entry.
- **Pip** = the mascot and the app's voice.
- Athletes are referenced by numeric `id` (`athleteById`, `depthFor`), photos by `slotId`.

## Tests

- Jest tests are colocated in `src/data/*.test.ts` (+ `TabBar.test.tsx`). Mostly pure logic.
- Stores are module singletons: tests use `jest.resetModules()` + `require('./module')` in
  `beforeEach`, or call the `reset*()` functions, for a clean state.
- Pass an explicit `now: Date` to time-dependent functions instead of mocking the clock; most
  logic functions accept `now` for this reason.
- Regression tests go in `regressions.test.ts` / `bugfixes.test.ts`.

## Gotchas

- Lint has some React-19 hook rules downgraded to warnings (see `eslint.config.js`); warnings
  are known debt, errors fail CI.
- Pro/purchases and Apple/Google sign-in don't work on web or Expo Go; web falls back to stubs.
- Google sign-in iOS client id in `app.json` is a placeholder (`REPLACE_WITH_IOS_CLIENT_ID`).
- Cape Town only: other cities are sent to the waitlist. Users must be 18+.
- When you change user-visible behaviour, update `docs/features.md`; when you add something
  that really needs a server, note it in `docs/backend-todo.md`.
