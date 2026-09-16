# Testing & CI Infrastructure — Design

## Context

The `mobile/` Expo app has zero automated testing, linting, formatting, or CI
today. `package.json` has no `test`/`lint` scripts, there is no ESLint or
Prettier config, and no `.github/workflows` exist. This spec stands up that
infrastructure from scratch. It is scoped to unit testing only (no
component/screen rendering tests, no E2E) — a deliberate first step, per the
user's choice, that can be extended later.

## Goals

- Unit-test the two data modules carrying real logic today —
  `src/data/social.ts` and `src/data/session.ts` — which currently have no
  coverage despite driving Discover, Chat, Matches, Likes, and auth.
- Enforce consistent code style via ESLint + Prettier, both locally
  (pre-commit) and in CI.
- Fail a pull request automatically if type-checking, linting, or tests
  regress.

## Non-goals

- Component/screen rendering tests (e.g. mounting `discover.tsx` with mocked
  navigation) — explicitly deferred; can be added later with
  `@testing-library/react-native` once the harness exists.
- E2E testing (Detox/Maestro) — deferred, heavier setup, separate task.
- EAS build/submit steps in CI — belongs with app-store-readiness work, not
  this spec.

## Testing stack

- **`jest-expo`** as the Jest preset. This is Expo's official preset for SDK
  57+; it wraps `babel-jest` with `babel-preset-expo` and mocks core Expo
  native modules (`expo-font`, `expo-splash-screen`, etc.). It does **not**
  automatically mock `@react-native-async-storage/async-storage` — that
  package ships its own official Jest mock which must be wired in
  explicitly (see `jest.config.js` below).
- **`@testing-library/react-native`** added as a dependency now even though
  no component tests are written yet, so the harness is ready when
  screen-level tests are added later. Not exercised by the initial test
  files.
- **`jest.config.js`** at `mobile/jest.config.js`:
  ```js
  module.exports = {
    preset: 'jest-expo',
    setupFiles: [
      './node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
    ],
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
  };
  ```
  (The `transformIgnorePatterns` override is `jest-expo`'s documented pattern
  for projects with additional RN-ecosystem deps like `react-native-svg` and
  `@expo-google-fonts/*` that ship untranspiled ESM. The implementation step
  must confirm the async-storage-mock path matches what the installed
  version of the package actually ships — verify with a directory listing
  before wiring it in, rather than assuming the path above is exact.)
- `package.json` gets `"test": "jest"`.

### Initial test files

- `mobile/src/data/social.test.ts` — covers `likeBack`, `passOn`, and
  `blockAthlete`: liking back moves an id from `likes` to `matches`;
  passing removes it from `likes` only; blocking removes the id from both
  `likes` and `matches` and adds it to `blocked` exactly once (no
  duplicates on repeated calls).
- `mobile/src/data/session.test.ts` — covers `signUp` and `signIn`
  validation paths: empty name, invalid email, short password, duplicate
  sign-up while already signed in, wrong credentials on sign-in, and the
  success path for both.

Both modules hold module-level mutable state (`let state = ...`) that
persists for the lifetime of the module instance — it does not reset
between `it()` blocks in the same file just because a new test starts. To
keep tests isolated without adding test-only exports to production code,
each test file uses `jest.resetModules()` in `beforeEach`, then
dynamically re-imports the module under test so every test starts from a
fresh `DEFAULT_STATE`:

```ts
let social: typeof import('../social');

beforeEach(async () => {
  jest.resetModules();
  social = await import('../social');
});
```

This is the one piece of test-harness mechanics specific to this
codebase's state-module pattern (also used by `filters.ts` and would apply
to any future tests of it) — worth calling out explicitly in the
implementation plan rather than leaving it implicit.

## Linting & formatting

- **`eslint-config-expo`** — Expo's official ESLint config, built on
  `@typescript-eslint` and RN/React rules, matching SDK 57's expectations.
- **`prettier`** + **`eslint-config-prettier`** to turn off ESLint stylistic
  rules that would conflict with Prettier's formatting.
- Config files: `mobile/eslint.config.js` (flat config, matching what
  `eslint-config-expo` ships for SDK 57) and `mobile/.prettierrc`.
- `package.json` scripts: `"lint": "eslint ."`, `"format": "prettier --write ."`.

## Pre-commit hook

- **`husky`** + **`lint-staged`**, configured at the repo root (`.husky/`)
  since git hooks are repo-wide even though the app lives in `mobile/`.
- `lint-staged` config (in `mobile/package.json`) runs on staged
  `*.{ts,tsx}` files under `mobile/`: `eslint --fix` then `prettier --write`.
- Husky's `pre-commit` hook invokes `npx lint-staged`.

## CI

- New file: `.github/workflows/ci.yml`.
- Triggers: `push` to `main`, and `pull_request` (any branch).
- Single job, `ubuntu-latest`, with `defaults.run.working-directory: mobile`
  (git repo root is `pace/`, the app is in `pace/mobile/`):
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `node-version: 20` and
     `cache: 'npm'` / `cache-dependency-path: mobile/package-lock.json`
  3. `npm ci`
  4. `npm run lint`
  5. `npx tsc --noEmit`
  6. `npm test -- --ci`
- No build or device/simulator steps — this workflow is fast (should run in
  well under a minute) since it's lint + typecheck + unit tests only.

## Error handling / edge cases

- With the official `AsyncStorage` Jest mock wired into `setupFiles`,
  `social.ts`/`session.ts`'s module-load-time `AsyncStorage.getItem(...)`
  calls resolve to `null` (no stored data), so both modules start from
  their coded `DEFAULT_STATE` on every fresh import — matching a fresh
  install, which is the scenario the new tests exercise.
- CI must fail (non-zero exit) on lint errors, type errors, or test
  failures — no `continue-on-error` on any step.

## Testing the infrastructure itself

- After setup: run `npm test`, `npm run lint`, and `npx tsc --noEmit`
  locally in `mobile/` to confirm all three pass clean on the current
  codebase before relying on CI.
- Make one throwaway commit locally to confirm the pre-commit hook actually
  fires and runs lint-staged.
- Push a branch and open a PR (or push directly to a test branch) to confirm
  the GitHub Actions workflow triggers and reports status checks.
