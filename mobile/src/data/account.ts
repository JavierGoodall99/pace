import { track } from '../lib/analytics';
import { resetChat } from './chat';
import { resetConsents } from './consent';
import { resetExplore } from './explore';
import { resetFilters } from './filters';
import { resetMoments } from './moments';
import { resetNotifications } from './notifications';
import { resetOnboardingProgress } from './onboardingFlow';
import { resetPicks } from './picks';
import { getPlansState, removePlansWith, resetPlans } from './plans';
import type { Gender } from './identity';
import { deleteAccount, getMe, updateMe } from './session';
import { resetSettings } from './settings';
import { getSocialState, resetSocial, seedSocialFor } from './social';
import type { Provider } from './sync';
import { removeSynced, resetTraining } from './training';
import { resetWaitlist } from './waitlist';

// Deleting an account clears storage, but every store also keeps its
// data in memory. Reset them all too, or whoever signs up next on this
// device inherits the old account's matches, chats and training until
// the app restarts. Lives here, not in session.ts, so the stores don't
// import each other in a cycle.
export async function deleteAccountAndData() {
  await deleteAccount();
  resetSocial();
  resetChat();
  resetPlans();
  resetTraining();
  resetMoments();
  resetExplore();
  resetFilters();
  resetSettings();
  resetWaitlist();
  resetNotifications();
  resetOnboardingProgress();
  resetPicks();
  resetConsents();
}

// When onboarding finishes: give the new account a demo cast that fits
// who they are, and drop demo plans with anyone outside it. Chats and
// moments already only show matches, so they follow.
export async function seedDemoFor(gender: Gender | null) {
  await seedSocialFor(gender);
  const { matches } = getSocialState();
  new Set(getPlansState().plans.map((p) => p.athleteId)).forEach((id) => {
    if (!matches.includes(id)) removePlansWith(id);
  });
}

// Settings → Connected apps → Disconnect: drop the connection and delete
// what it imported (training entries, the sync summary, "verified by"
// marks on PBs). A real build also revokes the provider token.
export async function disconnectProvider(provider: Provider) {
  const me = getMe();
  removeSynced(provider);
  await updateMe({
    connected: me.connected.filter((p) => p !== provider),
    sync: me.sync?.provider === provider ? null : me.sync,
    pbs: me.pbs.map((pb) => (pb.source === provider ? { label: pb.label, value: pb.value } : pb)),
  });
  track('sync_disconnected', { provider });
}
