type SessionModule = typeof import('./session');

let session: SessionModule;

beforeEach(() => {
  jest.resetModules();
  session = require('./session');
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
