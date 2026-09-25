import * as Haptics from 'expo-haptics';

// Fire-and-forget haptics. No-ops where unsupported (web, simulators).

function safely(run: () => Promise<void>) {
  try {
    run().catch(() => {});
  } catch {
    // Native module missing — nothing to do.
  }
}

export function tapHaptic() {
  safely(() => Haptics.selectionAsync());
}

export function successHaptic() {
  safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function bumpHaptic() {
  safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}
