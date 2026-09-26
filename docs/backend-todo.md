# Backend to-do

Pace has no server yet: accounts, matches, chats and training all live on the
phone. This lists the work that is waiting on a backend. Not started, on
purpose — noted 26 Sep 2026.

## 1. Photo verification (priority)

Members report fake profiles: photos of objects, downloaded pictures and
AI-generated faces.

**Done on the phone already** (see `mobile/src/lib/photoFaces.ts`,
`photoProblem` in `mobile/src/data/identity.ts`, `updateMe` in
`mobile/src/data/session.ts`):

- The selfie check (`mobile/src/data/liveness.ts`) proves a live person is holding the phone:
  a random blink / smile / turn sequence.
- Profile photos are scanned for faces when added: the main photo must show exactly one face,
  and at least two photos must show one.
- Adding a photo after verifying removes the verified badge until the selfie check is redone.
- The badge says "Live selfie check" (short: "Selfie checked"), because it only proves a live
  person is holding the phone; nothing compares faces yet.

**Still needs a server:**

1. **Face match** — compare the live selfie with each profile photo; only then set `verified`
   (server-side, so it can't be faked by editing local storage). This is the one that stops
   catfishing. Options: AWS Rekognition (Face Liveness + CompareFaces), or similar.
2. **Reverse image search** — flag photos that already exist online (stolen or downloaded).
3. **AI-image detection** — flag generated faces (e.g. Hive, Sightengine).
4. **Human review** — a moderation queue for anything flagged, plus the existing "Fake profile"
   report reason (`ReportReason` in `mobile/src/data/social.ts`).

**Server-side face match between the selfie and the profile photos** — once this exists, the
badge can become "Photo verified". The privacy policy (`mobile/src/data/legal.ts`) and the
biometric consent wording (`mobile/src/components/Consent.tsx`, bump its version in
`mobile/src/data/consent.ts`) must then say what is uploaded and for how long.

## 2. Other work waiting on a backend

- **Accounts and auth** — `mobile/src/data/session.ts` stores the password on the phone. Replace
  with real sign-up / sign-in; account deletion must delete server data too.
- **Apple / Google sign-in** — the provider's user id is stored on the phone as the account key.
  The server must verify the identity token (Apple / Google) and own the account.
- **Onboarding saves** — `saveProfileStep` in `mobile/src/data/onboardingFlow.ts` is where each
  post-account step (name → verify) should be written to the server; pre-account answers should
  be sent in one go when the account is created, then the local draft cleared.
- **RevenueCat user id** — accounts get a local id (`u-…`) used as the RevenueCat app user id.
  When server accounts exist, switch to the server id with `Purchases.logIn` so purchases carry
  over.
- **Shared data** — likes, matches, chats, sessions, moments and reports are local mocks; move
  them to the server so two people actually see each other.
- **Push notifications** — likes, messages, matches and invites need server push. (Streak
  reminders already work as local notifications.)
- **Activity sync** — Strava / Garmin OAuth and Apple Health (HealthKit) / Samsung Health (Health
  Connect) are simulated in `mobile/app/connect/[provider].tsx`.
- **Card privacy for other people** — "Show my effort level" and "Show my city" apply to the
  card preview; "Public training photos" and hiding stats from other people's view need the
  server to filter what it sends.
- **Safety check-in escalation** — the 90-minute check-in is a local notification that opens
  the Safety centre. Alerting a trusted contact when there's no answer needs a server.
- **Daily picks** — chosen on the phone from the local deck; the server should pick them so
  everyone gets a fair share of attention in a small city.
- **Invite link** — `mobile/src/lib/inviteFriend.ts` shares a placeholder (`https://pace.fit`);
  swap for the store / referral link.
- **Privacy settings for other people's view** — "Show me on events I join" and "Spot check-ins
  visible to" are saved on the phone; the server must leave people out of other members'
  "who's going" lists and spot views accordingly. Names on spots and crews are already limited to
  matches on the phone.
- **Consent records** — health and biometric consent (what, when, wording version) are stored on
  the phone in `mobile/src/data/consent.ts`; migrate them to the account when it exists.
- **Disconnect** — Settings → Connected apps deletes imported data on the phone; the server must
  also revoke the provider token and delete server copies.
- **Launch mode and feature flags** — `LAUNCH_MODE`, `FEATURES` and `DEMO_DATA` live in
  `mobile/src/config.ts` and need an app release to change; a remote config would let them flip
  without one.
- **Location** — distances come from mock data, not the phone's location.
- **Waitlist** — sign-ups for other cities are stored on the phone
  (`mobile/src/data/waitlist.ts`).
- **Activity rule** — "trained in the last 14 days" must be computed server-side so it can't be
  faked (`mobile/src/data/training.ts`).
- **Legal** — the Terms, Privacy Policy and Community Code drafts need a lawyer's review
  (POPIA, app store rules) and the `privacy@pace.fit` contact address is a placeholder.
