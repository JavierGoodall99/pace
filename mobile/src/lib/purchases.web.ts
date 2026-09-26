// Web has no in-app purchases; the paywall skips itself.
export const ONBOARDING_PLACEMENT = 'onboarding_end';
export type PurchaseResult = 'purchased' | 'cancelled' | 'failed';

export function purchasesAvailable(): boolean {
  return false;
}
export async function configurePurchases(_userId: string): Promise<boolean> {
  return false;
}
export async function offeringFor(_placement: string, _userId: string): Promise<null> {
  return null;
}
export async function buy(_pkg: unknown): Promise<PurchaseResult> {
  return 'failed';
}
export async function currentOffering(_userId: string): Promise<null> {
  return null;
}
export async function manageSubscription() {}
