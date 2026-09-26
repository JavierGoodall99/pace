# Pace — current features

What's in the app as of 26 September 2026. Pace is a dating and training-partner app for single
athletes in Cape Town, built with Expo / React Native (`mobile/`).

> **No backend yet.** Accounts, matches, chats and training are stored on the phone. Features
> marked **(simulated)** look real but aren't connected to a service yet. What's waiting on a
> server is listed in [`backend-todo.md`](backend-todo.md).

### Switches (`mobile/src/config.ts`)

| Flag | Default | What it does |
|---|---|---|
| `LAUNCH_MODE` | on | Decks include people without a selfie check or recent training; those rank lower instead of being hidden. |
| `RANK_WEIGHTS` | verified +15, active +10 (fades to 0 by 28 days) | Added to the "% in sync" score in launch mode. |
| `DEMO_DATA` | on in dev builds only | 10 demo profiles, chats, plans, moments and notifications. Off = real empty states. |
| `FEATURES.moments / passport / voiceNotes` | off | Parked for v1; every entry point is hidden. |
| `PRO_EXTRA_PICKS` | 5 | Extra daily picks with Pro (entitlement `pro`). |

## Contents

1. [Getting started](#1-getting-started)
2. [Today](#2-today)
3. [Pacers — daily picks](#3-pacers--daily-picks)
4. [Explore](#4-explore)
5. [Chats, matches and likes](#5-chats-matches-and-likes)
6. [Sessions and invites](#6-sessions-and-invites)
7. [You — profile](#7-you--profile)
8. [Training, streaks and races](#8-training-streaks-and-races)
9. [Trust and verification](#9-trust-and-verification)
10. [Safety](#10-safety)
11. [Settings](#11-settings)
12. [Pro and paywall](#12-pro-and-paywall)
13. [Notifications and analytics](#13-notifications-and-analytics)

---

## 1. Getting started

### Onboarding (21 screens)

Welcome → Meet Pip → City → Age → Sports → Your week → Level → Time → Here for → Goal race →
**Account** → Name → Gender → Lifestyle → Photos → Sync → Verify → Building → Reveal →
**Paywall** → Launch.

- **Pip**, the mascot, asks one question per screen and reacts to each answer.
- **Progress bar** across the question screens (City → Verify); "Profile strength %" on the
  launch screen.
- **Cape Town only.** Other cities can join a waitlist by email and can't continue.
- **18+ only.** Under-18s can't continue.
- **Account screen** ("Save your profile") shows a summary of the answers so far; tap any row
  to change it. Sign up with **Apple** (iPhone), **Google**, or **email and password** (8+
  characters). Skipped if already signed in.
- **Resume where you left off.** Closing the app mid-way reopens at the next unfinished step,
  before or after the account.
- **Reveal**: your top 3 matches and best "% in sync".
- **Launch**: confetti, badge tier (Bronze, Silver with a synced app, Gold with a live selfie
  check) and a preview of your profile card.
- First finish seeds a demo set of matches and likes that fits your gender.

### Accounts

- Sign in with email, Apple or Google; forgot-password screen **(simulated)**.
- Sign out keeps your account on the phone so you can sign back in.
- Delete account wipes everything on the phone.
- Routing: first launch → onboarding; signed out → sign-in; unfinished → resume; done → Today.

## 2. Today

- Greeting and "Ready to move, *name*?"
- **Streak badge** next to the bell: weeks in a row with at least one session. Filled when this
  week counts, outlined when at risk. Tap to learn more or log a session.
- **Notification bell** with an unread dot.
- **This week**: your planned and joined sessions, with Pip's tip of the day.
- **"Did you train today?"** card: one tap to log, with streak status.
- Shortcuts to races and the Safety centre.

## 3. Pacers — daily picks

- **5 picks a day** (10 with Pro), chosen at 07:00 and kept all day. Liking or passing doesn't pull in more;
  "New picks in 9h" when you're done.
- Each card has **one reason line**, e.g. "Training for Ultra-Trail Cape Town too · Also runs
  with Running Late Club" (shared race, crew, training days or time of day).
- Swipe right to like, left to pass; **undo** the last pass; bring back people you passed.
- Cards are photo stories: tap through photos, prompts and a "you & them" page with **% in
  sync** and your weekly rhythms side by side.
- **Like a photo or prompt**, optionally with a comment. **10 likes a day**; liking needs a live
  selfie check. Likes can also be sent from profiles opened via events, sessions, races and
  notifications.
- **Filters**: age range (mutual), distance, time of day.
- **Who you see**:
  - Launch mode: everyone who fits, with people who passed the live selfie check and trained
    recently ranked first; others are labelled "Not verified yet". Outside launch mode, only
    people with a live selfie check who trained in the last 14 days.
  - Dates are women with men.
  - Same-gender profiles appear only as **training partners**, when both people chose
    "training partner" or "open to both".
  - Cards show "Training partner" where that applies.
- Honest empty state when nobody fits, pointing to Explore.

## 4. Explore

Tabs (scroll sideways): **This week · Spots · Crews**.

- **This week**: open group sessions and **singles run clubs** (equal spots for women and men),
  real Cape Town events, conditions, and who from Pace is going.
- **Spots**: Cape Town training spots by type, with best times, safety notes and crews that
  meet there. Who trains there is a count ("12 Pacers train here"); only your matches are named.
- **Crews**: real Cape Town clubs from their public pages (marked as not affiliated). Follow
  crews; members are a count, and only your matches are named or pictured.
- **Events** and group sessions show who's going before you RSVP (people opted in by saying
  they're going; "Show me on events I join" can turn that off).
- **Parked for v1**: Pace passport and spot check-in stamps. (Challenges were removed.)

## 5. Chats, matches and likes

- **Chats** tab:
  - "Liked you" and "Matches" cards at the top.
  - A **New matches** row, with a countdown for silent matches.
  - Conversations with real timestamps and "Your turn" markers.
- **Likes inbox**: like back (instant match) or pass. Verification required to like back.
- **Matches** list.
- **Silent matches expire** after 3 days if nobody says hi.
- **Match screen**: "It's a match" or "Training partners", with shared training days.
- **Chat thread**:
  - Text and photo messages (voice notes are parked).
  - Liked photos and prompts shown as quotes.
  - Session invite cards you can accept or decline.
- **Women-first** option: after matching, she sends the first message.
- You can only message active matches.

### Moments (parked for v1)

Post one photo from today's session for your matches, with kudos and delete. Off for launch
(`FEATURES.moments`), along with kudos and comment notifications.

## 6. Sessions and invites

- **Invite a match to train**: suggested day (shared days marked), time, activity and public
  meeting spot, plus a note.
- **Host a group session**: public spots only, with spot count and level.
- **Join group sessions**; see who's going first.
- **Relationship stages**: Match → Train → Coffee → Date. Date is never automatic.
- **After a session**: a private check-in ("How was it?"); answers are shared only if mutual.
- Sessions you've done together show on their profile and in your chat.

## 7. You — profile

- Your card as others see it, with photos, name, age, city and sports.
- Profile tip from Pip, e.g. "Add an Off the clock photo".
- Your week (rhythm strip), training heatmap and "sessions this week".
- **Goal race** card with countdown.
- **Personal bests** (you see your times; others see which PBs you have, not the times) and
  **favourite routes**.
- **Prompts** (up to 3) and an "Add a prompt" entry point.
- **Your crews** (the Pace passport is parked).
- **Invite a training friend** (share sheet).
- Hidden-from-decks warning when you haven't trained in 14 days (not shown in launch mode).

### Edit profile

- Photos (2–6, labelled: In action / Post-session / Race day / Off the clock).
- Name, age (18+), bio, gender and "Here for".
- Prompts, lifestyle (drinking, diet, rest day), and links to Training and PBs & routes.
- Everything saves on **Save**; leaving with unsaved changes asks first.

## 8. Training, streaks and races

- **Log training**: sport, day (up to 6 days back), duration, distance and note. Delete manual
  entries.
- **Activity rule**: you're shown in other people's decks only if you trained in the last 14
  days (logged, synced or a Pace session).
- **Weekly streaks**: rest days never break them. The confirmation after logging announces a
  growing streak.
- **Connect a training app** **(simulated)**, after a short consent screen (health data):
  - Strava and Garmin.
  - **Apple Health** on iPhone, **Samsung Health** on Android.
  - Imports 4 weeks of activity and marks PBs as verified.
- **Races**:
  - A list of races.
  - Each race page has a countdown, who's on the same start line, and **build-up long runs**
    (next 4 Saturdays; host or join).
  - Also a race-weekend meetup spot, and "I'm training for this".

## 9. Trust and verification

- **Live selfie check**: after a short consent screen, blink / smile / turn in random order,
  processed on the phone; nothing uploaded, only pass/fail kept. It checks that a real person is
  holding the phone, not that they match the photos. Shows as "Live selfie check" (Gold tier).
- **Photos must show you**: the main photo exactly one face, and at least two photos with a
  face (checked on the phone when added).
- **Adding a photo removes the badge** until the selfie check is redone.
- Face-matching the selfie against photos (to earn "Photo verified") needs a server.
- **Consent** for health and biometric processing is recorded on the phone (what, when,
  wording version).
- **Scam warnings** in chat: asking for money, or moving off the app early.

## 10. Safety

- **Safety centre**: tips for meeting outdoors and emergency numbers (10111 / 112).
- On every session:
  - **Share plan with a friend** (share sheet).
  - **Check-in timer**: a notification 90 minutes after the start ("All good?") that opens the
    Safety centre.
- Public meeting spots suggested for invites and required for hosted sessions.
- **Report** (money, fake, inappropriate, harassment, safety, underage, other), **block**
  (they aren't told) and **unmatch**; blocked people disappear everywhere.
- Favourite routes are shown only to matches; spots and crews name only your matches.
- No leaderboards or pace comparisons; level is used for matching only.

## 11. Settings

- **Appearance**: System / Light / Dark.
- **Training preferences**: sports, days, time, level, goal race.
- **Notifications**: push (likes, messages, matches, invites, training reminders) and email.
- **Privacy**: who can see your profile (everyone / matches only), card options (effort level,
  city, public training photos), **show me on events I join**, **spot check-ins visible to**
  (matches only / nobody), women-first, and the blocked list.
- **Connected apps**: connect, or disconnect (deletes what was imported).
- **Safety centre**, **Race mode**, **Subscription**.
- **Invite a training friend**.
- **Legal**: Terms, Privacy Policy, Community Code (drafts, pending legal review).
- Sign out and delete account.

## 12. Pro and paywall

- **Pace Pro**: 5 extra daily picks (10 a day). Price and purchase come from RevenueCat;
  "Manage subscription" opens the store's settings.
- **Always free**: every message, who liked you, unlimited invites, safety tools and singles
  run clubs.
- **Onboarding paywall**: shown once after Reveal, with a clear "Not now". Uses RevenueCat's
  `onboarding_end` placement. It skips itself until RevenueCat keys are set.

## 13. Notifications and analytics

- **In-app notifications** feed (likes, messages, matches, invites) with read state
  remembered, and an empty state **(demo content in dev)**.
- **Local reminders**: streak at risk (Saturday 09:00, or Sunday 17:00), and safety check-ins.
  Push for likes and messages needs a server.
- **Analytics** events for onboarding, account creation, sync (connect, skip, disconnect),
  verify, reveal, paywall, consent (shown / accepted / declined) and privacy setting changes.
  They go to the console until an analytics provider is added (`mobile/src/lib/analytics.ts`).
