import { resetChat } from './chat';
import { resetExplore } from './explore';
import { resetFilters } from './filters';
import { resetMoments } from './moments';
import { resetNotifications } from './notifications';
import { resetOnboardingProgress } from './onboardingFlow';
import { getPlansState, removePlansWith, resetPlans } from './plans';
import type { Gender } from './identity';
import { deleteAccount } from './session';
import { resetSettings } from './settings';
import { getSocialState, resetSocial, seedSocialFor } from './social';
import { resetTraining } from './training';
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
