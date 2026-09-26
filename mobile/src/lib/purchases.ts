import { Platform } from 'react-native';
import Purchases, { type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';

// RevenueCat. Configured with our own user id when the account exists
// (or lazily for a returning signed-in user) — never with an anonymous
// id at launch, so purchases always belong to a Pace account.
//
// Keys come from EXPO_PUBLIC_REVENUECAT_IOS_KEY / _ANDROID_KEY. Without
// them (or on web) purchases are unavailable and the paywall skips itself.

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

export const ONBOARDING_PLACEMENT = 'onboarding_end';

let configuredFor: string | null = null;

export function purchasesAvailable(): boolean {
  return Platform.OS !== 'web' && !!API_KEY;
}

// Points RevenueCat at this user. Safe to call repeatedly.
export async function configurePurchases(userId: string): Promise<boolean> {
  if (!purchasesAvailable()) return false;
  try {
    if (configuredFor === null) {
      Purchases.configure({ apiKey: API_KEY!, appUserID: userId });
    } else if (configuredFor !== userId) {
      await Purchases.logIn(userId);
    }
    configuredFor = userId;
    return true;
  } catch (e) {
    console.warn('RevenueCat setup failed:', e);
    return false;
  }
}

// The offering for a placement, or null when there's nothing to show.
export async function offeringFor(
  placement: string,
  userId: string
): Promise<PurchasesOffering | null> {
  if (!(await configurePurchases(userId))) return null;
  try {
    const offering = await Purchases.getCurrentOfferingForPlacement(placement);
    return offering && offering.availablePackages.length > 0 ? offering : null;
  } catch (e) {
    console.warn('Could not load offering:', e);
    return null;
  }
}

export type PurchaseResult = 'purchased' | 'cancelled' | 'failed';

export async function buy(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    await Purchases.purchasePackage(pkg);
    return 'purchased';
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return 'cancelled';
    console.warn('Purchase failed:', e);
    return 'failed';
  }
}
