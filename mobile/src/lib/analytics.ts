// Thin analytics wrapper. There's no analytics provider yet, so events go
// to the console; swap `sink` for the real SDK (Amplitude, PostHog, …)
// in one place when there is one.

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'step_completed'
  | 'city_blocked'
  | 'age_blocked'
  | 'account_created'
  | 'profile_step_saved'
  | 'sync_connected'
  | 'sync_skipped'
  | 'verify_completed'
  | 'verify_skipped'
  | 'reveal_viewed'
  | 'paywall_viewed'
  | 'paywall_skipped'
  | 'purchase_completed'
  | 'onboarding_completed'
  | 'consent_shown'
  | 'consent_accepted'
  | 'consent_declined'
  | 'sync_disconnected'
  | 'privacy_setting_changed';

export type AnalyticsProps = Record<string, string | number | boolean | null>;

type Sink = (event: AnalyticsEvent, props: AnalyticsProps) => void;

let sink: Sink = (event, props) => {
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.log('[analytics]', event, props);
};

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  try {
    sink(event, props);
  } catch {
    // Analytics must never break the app.
  }
}

// For tests, and for plugging in a real provider later.
export function setAnalyticsSink(next: Sink) {
  sink = next;
}
