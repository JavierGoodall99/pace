// App-wide switches, in one place. Everything else reads from here.

// Launch mode: while the member base is small, decks include people who
// aren't verified yet or haven't trained recently — verification and
// recent training *rank people higher* instead of filtering them out.
// Liking still needs the viewer to be verified. Set false to return to
// the strict rules (verified + trained in the last 14 days only).
export const LAUNCH_MODE = true;

// How the deck is ordered in launch mode. Base is the "% in sync" score
// (40–99). Boosts are added on top:
// - verified: flat bonus for a passed live selfie check;
// - active: full bonus if they trained within ACTIVE_DAYS, fading to 0
//   by `activeFadeDays`.
// Outside launch mode the order is the sync score alone.
export const RANK_WEIGHTS = {
  verified: 15,
  active: 10,
  activeFadeDays: 28,
};

// Demo profiles, chats, plans, moments and notifications for development.
// On by default in dev builds only; EXPO_PUBLIC_DEMO_DATA=true|false
// overrides. With it off every screen shows its real, empty state.
export const DEMO_DATA =
  process.env.EXPO_PUBLIC_DEMO_DATA === undefined
    ? __DEV__
    : process.env.EXPO_PUBLIC_DEMO_DATA === 'true';

// Demo content when DEMO_DATA is on, otherwise the empty value.
export function demo<T>(value: T, empty: T): T {
  return DEMO_DATA ? value : empty;
}

// Parked for v1: code stays, every entry point is hidden while off.
export const FEATURES = {
  moments: false,
  passport: false, // Pace passport + spot check-in stamps
  voiceNotes: false,
};

// Pace Pro: extra daily picks. RevenueCat entitlement id.
export const PRO_EXTRA_PICKS = 5;
export const PRO_ENTITLEMENT = 'pro';
