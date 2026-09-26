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
- The badge says "Selfie verified", not "Selfie matches photos", because nothing compares faces
  yet.

**Still needs a server:**

1. **Face match** — compare the live selfie with each profile photo; only then set `verified`
   (server-side, so it can't be faked by editing local storage). This is the one that stops
   catfishing. Options: AWS Rekognition (Face Liveness + CompareFaces), or similar.
2. **Reverse image search** — flag photos that already exist online (stolen or downloaded).
3. **AI-image detection** — flag generated faces (e.g. Hive, Sightengine).
4. **Human review** — a moderation queue for anything flagged, plus the existing "Fake profile"
   report reason (`ReportReason` in `mobile/src/data/social.ts`).

Once this exists, the badge can go back to saying the selfie matches the photos, and the
privacy policy (`mobile/src/data/legal.ts`) must say what is uploaded and for how long.

## 2. Other work waiting on a backend

- **Accounts and auth** — `mobile/src/data/session.ts` stores the password on the phone. Replace
  with real sign-up / sign-in; account deletion must delete server data too.
- **Shared data** — likes, matches, chats, sessions, moments and reports are local mocks; move
  them to the server so two people actually see each other.
- **Push notifications** — likes, messages, matches and invites need server push. (Streak
  reminders already work as local notifications.)
- **Activity sync** — Strava / Garmin OAuth and Apple Health (HealthKit) / Samsung Health (Health
  Connect) are simulated in `mobile/app/connect/[provider].tsx`.
- **Location** — distances come from mock data, not the phone's location.
- **Waitlist** — sign-ups for other cities are stored on the phone
  (`mobile/src/data/waitlist.ts`).
- **Activity rule** — "trained in the last 14 days" must be computed server-side so it can't be
  faked (`mobile/src/data/training.ts`).
- **Legal** — the Terms, Privacy Policy and Community Code drafts need a lawyer's review
  (POPIA, app store rules) and the `privacy@pace.fit` contact address is a placeholder.
