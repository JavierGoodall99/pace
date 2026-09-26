import type { SocialProfile } from '../data/session';

// Web: no native Apple / Google sign-in; email and password only.
export const googleEnabled = false;

export type SocialResult =
  { ok: true; profile: SocialProfile } | { ok: false; cancelled: boolean; error?: string };

export function useAppleAvailable(): boolean {
  return false;
}
export async function signInWithApple(): Promise<SocialResult> {
  return { ok: false, cancelled: false, error: 'Not available on web.' };
}
export async function signInWithGoogle(): Promise<SocialResult> {
  return { ok: false, cancelled: false, error: 'Not available on web.' };
}
export function AppleButton(_: { onPress: () => void; dark: boolean }) {
  return null;
}
