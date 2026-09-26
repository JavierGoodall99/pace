import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { SocialProfile } from '../data/session';

// Sign in with Apple (iPhone only) and Google. There's no server yet, so
// the provider's user id becomes the account key on this phone; a
// backend must verify the identity token instead (docs/backend-todo.md).
//
// Google needs OAuth client ids in EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and
// EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (plus the iosUrlScheme in app.json).

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Configured builds show the button; dev builds show it too so the flow
// can be seen before the ids exist.
export const googleEnabled = !!GOOGLE_WEB_CLIENT_ID || __DEV__;

let googleConfigured = false;
function configureGoogle() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID });
  googleConfigured = true;
}

export type SocialResult =
  { ok: true; profile: SocialProfile } | { ok: false; cancelled: boolean; error?: string };

export function useAppleAvailable(): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);
  return available;
}

export async function signInWithApple(): Promise<SocialResult> {
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    // Apple only sends the name (and email) the first time someone signs
    // in to the app; later sign-ins come back without them.
    const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
    return {
      ok: true,
      profile: { method: 'apple', providerId: cred.user, email: cred.email, name: name || null },
    };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'ERR_REQUEST_CANCELED') return { ok: false, cancelled: true };
    return { ok: false, cancelled: false, error: 'Sign in with Apple didn’t work. Try again.' };
  }
}

export async function signInWithGoogle(): Promise<SocialResult> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    return { ok: false, cancelled: false, error: 'Google sign-in isn’t set up yet.' };
  }
  try {
    configureGoogle();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await GoogleSignin.signIn();
    if (res.type !== 'success') return { ok: false, cancelled: true };
    const u = res.data.user;
    return {
      ok: true,
      profile: {
        method: 'google',
        providerId: u.id,
        email: u.email,
        name: u.givenName ?? u.name,
      },
    };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, cancelled: false, error: 'Google sign-in didn’t work. Try again.' };
  }
}

// Apple's own button: Apple requires its styling.
export function AppleButton({ onPress, dark }: { onPress: () => void; dark: boolean }) {
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={
        dark
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={14}
      style={{ width: '100%', height: 52 }}
      onPress={onPress}
    />
  );
}
