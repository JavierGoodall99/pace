type SocialModule = typeof import('./social');
type RTLPure = typeof import('@testing-library/react-native/pure');

let social: SocialModule;
let act: RTLPure['act'];
let renderHook: RTLPure['renderHook'];

beforeEach(async () => {
  // social.ts holds its state in a module-level `let`, so getting a clean
  // slate for each test means re-executing that file. Two adjustments were
  // needed versus the plan's original snippet, both confined to this test
  // file:
  //
  // 1. `jest.resetModules()` + dynamic `import('./social')` doesn't run
  //    under plain Jest here: jest-expo's babel preset only adds *parser*
  //    support for `import()` (Metro's runtime turns it into an async
  //    require at bundle time; Jest never sees that), so a literal
  //    `import()` throws "invoked without --experimental-vm-modules".
  //    `require('./social')` after `jest.resetModules()` achieves the same
  //    "fresh module instance per test" goal via CommonJS instead.
  //
  // 2. `jest.resetModules()` clears Jest's *entire* module registry, so a
  //    statically-imported `@testing-library/react-native` (bound to the
  //    pre-reset copy of 'react') would end up paired with social.ts's
  //    fresh, separate copy of 'react' picked up post-reset -- React hooks
  //    (`useSyncExternalStore`) break across two copies of react with
  //    "Invalid hook call" / "Cannot read properties of null". Re-requiring
  //    testing-library here, after the same reset, keeps it on the same
  //    fresh 'react' copy as social.ts. Its `/pure` entry point is used
  //    (rather than the package root) because the root entry point runs a
  //    top-level `afterEach(cleanup)` registration as an import side effect,
  //    which Jest forbids once test execution has started ("Hooks cannot be
  //    defined inside tests") -- `/pure` skips that registration, and since
  //    each test gets an entirely fresh, discarded react/renderer pair
  //    anyway, no cross-test cleanup call is needed.
  jest.resetModules();
  social = require('./social') as SocialModule;
  ({ act, renderHook } = require('@testing-library/react-native/pure'));
});

// Note: `renderHook` is awaited below (the brief's snippet calls it
// synchronously). In the installed @testing-library/react-native version
// (14.0.1), `renderHook` is an async function returning a Promise; calling
// it without `await` makes `{ result }` destructure to `undefined`.

test('likeBack moves an id from likes to matches', async () => {
  const { result } = await renderHook(() => social.useSocial());

  expect(result.current.likes).toContain(2);
  expect(result.current.matches).not.toContain(2);

  await act(async () => {
    await social.likeBack(2);
  });

  expect(result.current.likes).not.toContain(2);
  expect(result.current.matches).toContain(2);
});

test('passOn removes an id from likes without adding it to matches', async () => {
  const { result } = await renderHook(() => social.useSocial());

  await act(async () => {
    await social.passOn(4);
  });

  expect(result.current.likes).not.toContain(4);
  expect(result.current.matches).not.toContain(4);
});

test('blockAthlete removes the id from both likes and matches and adds it to blocked', async () => {
  const { result } = await renderHook(() => social.useSocial());

  expect(result.current.matches).toContain(1);

  await act(async () => {
    await social.blockAthlete(1);
  });

  expect(result.current.likes).not.toContain(1);
  expect(result.current.matches).not.toContain(1);
  expect(result.current.blocked).toEqual([1]);
});

test('blockAthlete does not add a duplicate id when called twice', async () => {
  const { result } = await renderHook(() => social.useSocial());

  await act(async () => {
    await social.blockAthlete(3);
    await social.blockAthlete(3);
  });

  expect(result.current.blocked).toEqual([3]);
});
