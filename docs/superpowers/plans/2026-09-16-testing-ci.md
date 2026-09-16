# Testing & CI Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up unit testing (Jest + React Native Testing Library), linting/formatting (ESLint + Prettier), a pre-commit hook (Husky + lint-staged), and a GitHub Actions CI pipeline for the `mobile/` Expo app, which currently has none of these.

**Architecture:** `jest-expo` (Expo's official Jest preset, version-matched to the installed Expo SDK) provides the test runner config; two new unit test files cover the two data modules with real logic (`social.ts`, `session.ts`). `eslint-config-expo` + `prettier` handle style. Husky + lint-staged gate commits locally; a single-job GitHub Actions workflow gates pushes/PRs by running lint, typecheck, and tests.

**Tech Stack:** jest-expo, @testing-library/react-native, eslint-config-expo, prettier, husky, lint-staged, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-16-testing-ci-design.md`

## Global Constraints

- Repo root is `pace/`; the Expo app lives in `pace/mobile/`. Every npm command in this plan runs with `mobile/` as the working directory unless stated otherwise. The GitHub Actions workflow must set `defaults.run.working-directory: mobile`.
- Installed Expo SDK is `57.0.22` (confirmed via `npm ls expo`). Use `npx expo install <package> --dev` for any Expo-ecosystem package (this resolves the SDK-57-compatible version automatically — e.g. `jest-expo@57.0.5`) rather than hand-picking a version.
- No component/screen rendering tests, no E2E (Detox/Maestro), and no EAS build step in CI — all explicitly out of scope per the spec.
- Node version for CI: 20.
- Every CI step must be able to fail the job — no `continue-on-error`.

---

### Task 1: Install Jest and verify the test harness boots

**Files:**
- Create: `mobile/jest.config.js`
- Create: `mobile/src/data/__tests__/testHarness.smoke.test.ts`
- Modify: `mobile/package.json` (devDependencies, `"test"` script)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a working `npm test` command in `mobile/` that later tasks' test files run under. Produces the verified on-disk path to the AsyncStorage Jest mock, which Task 1's `jest.config.js` wires into `setupFiles` and which later tasks rely on being already configured (they do not reconfigure it).

- [ ] **Step 1: Install the test runner packages**

Run from `mobile/`:
```bash
npx expo install jest-expo --dev
npm install --save-dev jest @types/jest @testing-library/react-native react-test-renderer
```
`npx expo install jest-expo --dev` resolves the version matching the installed Expo SDK (57.0.22 → jest-expo 57.0.5 as of this plan). `@testing-library/react-native` must be v13+ for React 19 compatibility (this project uses React 19.2.3) — if `npm install` resolves an older major version or reports a peer-dependency conflict, re-run with `npm install --save-dev @testing-library/react-native@latest` and confirm the installed version is 13.x or higher via `npm ls @testing-library/react-native`.

- [ ] **Step 2: Find the exact AsyncStorage Jest mock path**

Run:
```bash
ls mobile/node_modules/@react-native-async-storage/async-storage/jest/
```
Record the exact filename (expected: `async-storage-mock.js`, but confirm rather than assume — package versions have changed this path before). Use the confirmed filename in Step 5.

- [ ] **Step 3: Write the smoke test**

Create `mobile/src/data/__tests__/testHarness.smoke.test.ts`:
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

test('AsyncStorage mock is wired up', async () => {
  await AsyncStorage.setItem('smoke-key', 'smoke-value');
  await expect(AsyncStorage.getItem('smoke-key')).resolves.toBe('smoke-value');
});
```

- [ ] **Step 4: Run the test to verify it fails without config**

Run: `cd mobile && npx jest`
Expected: FAIL. With no `jest.config.js`, Jest has no preset for RN/TypeScript transforms and no AsyncStorage mock wired in, so this either errors on the TypeScript/JSX syntax or throws a native-module invariant violation from the real `AsyncStorage` implementation. Either failure mode confirms configuration is required — that's the point of this step.

- [ ] **Step 5: Write the Jest config**

Create `mobile/jest.config.js` (replace `async-storage-mock.js` below with the filename confirmed in Step 2 if different):
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

- [ ] **Step 6: Add the test script**

In `mobile/package.json`, add to `"scripts"`:
```json
"test": "jest"
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd mobile && npm test`
Expected: PASS — 1 test, `AsyncStorage mock is wired up`.

- [ ] **Step 8: Commit**

```bash
git add mobile/package.json mobile/package-lock.json mobile/jest.config.js mobile/src/data/__tests__/testHarness.smoke.test.ts
git commit -m "test: add Jest test harness with jest-expo and AsyncStorage mock"
```

---

### Task 2: Unit tests for `social.ts`

**Files:**
- Create: `mobile/src/data/social.test.ts`
- Read (no changes): `mobile/src/data/social.ts`

**Interfaces:**
- Consumes: the working `npm test` command from Task 1. Consumes `social.ts`'s existing public exports: `useSocial(): SocialState` (a hook returning `{ likes: number[]; matches: number[]; blocked: number[] }`), `likeBack(athleteId: number): Promise<void>`, `passOn(athleteId: number): Promise<void>`, `blockAthlete(athleteId: number): Promise<void>`, and the seed constants `LIKES_IDS = [2, 4, 6, 8]`, `MATCH_IDS = [1, 3, 5, 7]`.
- Produces: nothing consumed by later tasks (Task 3 is independent).

**Design note carried from the spec:** `social.ts` holds module-level mutable state that persists across `it()` blocks in the same file. Each test resets it via `jest.resetModules()` + dynamic `import()` in `beforeEach`, rather than adding a test-only export to production code. Reading the effect of a mutation requires rendering the `useSocial()` hook via `@testing-library/react-native`'s `renderHook`, since there is no plain state getter.

- [ ] **Step 1: Write the failing tests**

Create `mobile/src/data/social.test.ts`:
```ts
import { act, renderHook } from '@testing-library/react-native';

type SocialModule = typeof import('./social');

let social: SocialModule;

beforeEach(async () => {
  jest.resetModules();
  social = await import('./social');
});

test('likeBack moves an id from likes to matches', async () => {
  const { result } = renderHook(() => social.useSocial());

  expect(result.current.likes).toContain(2);
  expect(result.current.matches).not.toContain(2);

  await act(async () => {
    await social.likeBack(2);
  });

  expect(result.current.likes).not.toContain(2);
  expect(result.current.matches).toContain(2);
});

test('passOn removes an id from likes without adding it to matches', async () => {
  const { result } = renderHook(() => social.useSocial());

  await act(async () => {
    await social.passOn(4);
  });

  expect(result.current.likes).not.toContain(4);
  expect(result.current.matches).not.toContain(4);
});

test('blockAthlete removes the id from both likes and matches and adds it to blocked', async () => {
  const { result } = renderHook(() => social.useSocial());

  expect(result.current.matches).toContain(1);

  await act(async () => {
    await social.blockAthlete(1);
  });

  expect(result.current.likes).not.toContain(1);
  expect(result.current.matches).not.toContain(1);
  expect(result.current.blocked).toEqual([1]);
});

test('blockAthlete does not add a duplicate id when called twice', async () => {
  const { result } = renderHook(() => social.useSocial());

  await act(async () => {
    await social.blockAthlete(3);
    await social.blockAthlete(3);
  });

  expect(result.current.blocked).toEqual([3]);
});
```

- [ ] **Step 2: Run the tests to verify they fail or pass for the right reasons**

Run: `cd mobile && npx jest social.test.ts -v`
Expected at this point: PASS. These tests exercise existing, already-correct behavior in `social.ts` — there is no implementation step because the feature under test already ships (this task is characterization/regression coverage, not TDD for new behavior). If any test fails, that indicates either a misunderstanding of `social.ts`'s current behavior (re-read `mobile/src/data/social.ts` and fix the test) or a real bug (stop and report it — do not change `social.ts` as part of this testing task).

- [ ] **Step 3: Commit**

```bash
git add mobile/src/data/social.test.ts
git commit -m "test: add unit tests for social.ts like/pass/block behavior"
```

---

### Task 3: Unit tests for `session.ts`

**Files:**
- Create: `mobile/src/data/session.test.ts`
- Read (no changes): `mobile/src/data/session.ts`

**Interfaces:**
- Consumes: the working `npm test` command from Task 1. Consumes `session.ts`'s existing exports: `signUp(name: string, email: string, password: string): Promise<AuthResult>`, `signIn(email: string, password: string): Promise<AuthResult>`, where `AuthResult = { ok: true } | { ok: false; error: string }`.
- Produces: nothing consumed by later tasks.

**Design note:** unlike `social.ts`, no hook rendering is needed — `signUp`/`signIn` return their result directly. Module state still needs resetting between tests (a signed-up account persists in module state and `signUp` refuses a second sign-up while one exists), so this file uses the same `jest.resetModules()` + dynamic `import()` pattern as Task 2.

- [ ] **Step 1: Write the tests**

Create `mobile/src/data/session.test.ts`:
```ts
type SessionModule = typeof import('./session');

let session: SessionModule;

beforeEach(async () => {
  jest.resetModules();
  session = await import('./session');
});

describe('signUp', () => {
  test('rejects an empty name', async () => {
    const result = await session.signUp('', 'a@example.com', 'password1');
    expect(result).toEqual({ ok: false, error: 'Enter your name.' });
  });

  test('rejects an invalid email', async () => {
    const result = await session.signUp('Ada', 'not-an-email', 'password1');
    expect(result).toEqual({ ok: false, error: 'Enter a valid email.' });
  });

  test('rejects a password under 6 characters', async () => {
    const result = await session.signUp('Ada', 'a@example.com', '123');
    expect(result).toEqual({
      ok: false,
      error: 'Password must be at least 6 characters.',
    });
  });

  test('rejects signing up a second time while already signed in', async () => {
    await session.signUp('Ada', 'a@example.com', 'password1');
    const second = await session.signUp('Bea', 'b@example.com', 'password2');
    expect(second).toEqual({ ok: false, error: 'You are already signed in.' });
  });

  test('succeeds with valid input', async () => {
    const result = await session.signUp('Ada', 'a@example.com', 'password1');
    expect(result).toEqual({ ok: true });
  });
});

describe('signIn', () => {
  test('rejects when no account exists yet', async () => {
    const result = await session.signIn('a@example.com', 'password1');
    expect(result).toEqual({
      ok: false,
      error: 'No account for this email yet. Create one first.',
    });
  });

  test('rejects the wrong password for an existing account', async () => {
    await session.signUp('Ada', 'a@example.com', 'password1');
    const result = await session.signIn('a@example.com', 'wrong-password');
    expect(result).toEqual({ ok: false, error: 'Incorrect email or password.' });
  });

  test('succeeds with the correct email and password', async () => {
    await session.signUp('Ada', 'a@example.com', 'password1');
    const result = await session.signIn('a@example.com', 'password1');
    expect(result).toEqual({ ok: true });
  });

  test('email matching is case-insensitive', async () => {
    await session.signUp('Ada', 'a@example.com', 'password1');
    const result = await session.signIn('A@Example.com', 'password1');
    expect(result).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `cd mobile && npx jest session.test.ts -v`
Expected: PASS, 9 tests. As with Task 2, this is characterization coverage of existing behavior — a failure means either the test's expectation is wrong (re-check `mobile/src/data/session.ts`) or there's a real bug (report it, do not silently "fix" production code as part of this task).

- [ ] **Step 3: Commit**

```bash
git add mobile/src/data/session.test.ts
git commit -m "test: add unit tests for session.ts sign-up/sign-in validation"
```

---

### Task 4: ESLint + Prettier

**Files:**
- Create: `mobile/eslint.config.js`
- Create: `mobile/.prettierrc`
- Create: `mobile/.prettierignore`
- Modify: `mobile/package.json` (devDependencies, `"lint"` and `"format"` scripts)

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces: a working `npm run lint` command in `mobile/` that Task 5 (lint-staged) and Task 6 (CI) both invoke by name — later tasks must not reference a different script name.

- [ ] **Step 1: Install ESLint, Prettier, and Expo's config**

Run from `mobile/`:
```bash
npx expo install eslint-config-expo --dev
npm install --save-dev eslint prettier eslint-config-prettier
```
This resolves `eslint-config-expo@57.0.2` (SDK-57-aligned, confirmed against the npm registry while writing this plan) and requires `eslint >=8.10` as a peer — installing latest `eslint` (v9+) satisfies this and is required for flat config anyway.

- [ ] **Step 2: Write the ESLint flat config**

`eslint-config-expo/flat` (verified present in the `57.0.2` package contents) exports a ready-to-spread flat config array via `module.exports = defineConfig([...])`, so spreading it directly works as shown below.

Create `mobile/eslint.config.js`:
```js
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
];
```

- [ ] **Step 3: Write the Prettier config**

Create `mobile/.prettierrc`:
```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Create `mobile/.prettierignore`:
```
node_modules
.expo
dist
package-lock.json
```

- [ ] **Step 4: Add the scripts**

In `mobile/package.json`, add to `"scripts"`:
```json
"lint": "eslint .",
"format": "prettier --write ."
```

- [ ] **Step 5: Run lint and confirm it passes on the current codebase**

Run: `cd mobile && npm run lint`
Expected: exits 0 with no errors. If it reports errors on existing files, fix only what's needed to reach a clean baseline (e.g. straightforward auto-fixable issues via `npx eslint . --fix`) — do not restructure unrelated code. If a rule surfaces a large number of pre-existing style violations that would require broad unrelated changes, stop and report the count/nature of violations rather than mass-editing the codebase as a side effect of this task.

- [ ] **Step 6: Commit**

```bash
git add mobile/package.json mobile/package-lock.json mobile/eslint.config.js mobile/.prettierrc mobile/.prettierignore
git commit -m "chore: add ESLint and Prettier configuration"
```

---

### Task 5: Husky + lint-staged pre-commit hook

**Files:**
- Create: `.husky/pre-commit` (repo root — git hooks are repo-wide, not per-package)
- Modify: `mobile/package.json` (devDependencies, `"lint-staged"` config, `"prepare"` script)
- Modify (if needed): root `package.json` — create one if it doesn't exist, since Husky's install step (`husky init`) expects to run from the git repo root and needs a `package.json` there to attach a `"prepare"` script to.

**Interfaces:**
- Consumes: the `npm run lint` script from Task 4 (lint-staged invokes `eslint --fix` and `prettier --write` directly on staged files, not through the `lint`/`format` scripts, since it needs to pass specific filenames).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Check for a root `package.json`**

Run: `ls "package.json"` from the repo root (`pace/`).
If it does not exist, create a minimal one:
```json
{
  "name": "pace-repo-root",
  "private": true
}
```
This exists only to give Husky's root-level git hooks a place to attach `npm`/`npx` tooling; it is not the app's package manifest (that remains `mobile/package.json`).

- [ ] **Step 2: Install Husky and lint-staged**

Run from the repo root (`pace/`):
```bash
npm install --save-dev husky
npx husky init
```
`husky init` creates `.husky/pre-commit` (with a default `npm test` placeholder) and adds a `"prepare": "husky"` script to the root `package.json`.

Run from `mobile/`:
```bash
npm install --save-dev lint-staged
```

- [ ] **Step 3: Configure lint-staged**

In `mobile/package.json`, add a top-level `"lint-staged"` key:
```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

- [ ] **Step 4: Point the pre-commit hook at the mobile app**

Replace the contents of `.husky/pre-commit` (created in Step 2) with:
```sh
cd mobile && npx lint-staged
```

- [ ] **Step 5: Verify the hook fires**

Make a trivial, intentionally-poorly-formatted throwaway change (e.g. add an extra blank line) to a tracked file inside `mobile/`, stage it, and commit:
```bash
git add -A
git commit -m "test: verify pre-commit hook runs lint-staged"
```
Expected: the commit output shows lint-staged running (`eslint --fix` / `prettier --write` messages) before the commit completes. Confirm the file's formatting was normalized by the hook (check `git show HEAD` if unsure). If the hook does not fire, check `.husky/pre-commit` is executable (`chmod +x .husky/pre-commit` if needed) and that git's `core.hooksPath` is unset or pointed at `.husky` (Husky's init sets this).

- [ ] **Step 6: Commit the setup**

```bash
git add package.json .husky mobile/package.json mobile/package-lock.json
git commit -m "chore: add Husky pre-commit hook running lint-staged"
```

---

### Task 6: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run lint` (Task 4), `npm test` (Task 1), and `tsc` via the existing `typescript` devDependency already in `mobile/package.json` — no new interface produced, this is the last task.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

defaults:
  run:
    working-directory: mobile

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --ci
```

- [ ] **Step 2: Validate the workflow YAML locally**

Run: `python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` (or any available YAML validator) to catch syntax errors before pushing. If no YAML parser is available in the environment, visually re-check indentation against the block above instead.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, typecheck, and tests"
```

- [ ] **Step 4: Confirm the workflow runs**

Push the branch (or push directly if working on `main` per the user's own workflow) and open a PR, or push to `main` directly, then check the Actions tab (`gh run list` or `gh pr checks` if using the `gh` CLI) to confirm the `CI` workflow triggered and its `test` job passed. This is the final verification that the whole pipeline built in Tasks 1–6 actually works end-to-end in GitHub's environment, not just locally.

---

## Self-Review Notes

- **Spec coverage:** Testing stack (Task 1–3), linting/formatting (Task 4), pre-commit hook (Task 5), CI (Task 6) — all four spec sections have a task. The spec's "Testing the infrastructure itself" section maps to the verification steps embedded in Tasks 1, 5, and 6 rather than a separate task, since each is only meaningful once its own task's artifact exists.
- **Root `package.json` for Husky:** the spec didn't originally call out that Husky needs a repo-root `package.json` to install into (the app's `package.json` is nested in `mobile/`) — added explicitly in Task 5, Step 1, since this repo doesn't currently have a root-level one.
- **Task independence:** Tasks 2 and 3 both depend only on Task 1, not on each other — they can run in either order or in parallel. Tasks 4 and 5 must run in that order (lint-staged needs `npm run lint`'s underlying tools installed, though it invokes `eslint`/`prettier` directly). Task 6 depends on Tasks 1 and 4 for the scripts it calls.
