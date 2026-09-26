// Terms, Privacy Policy and Community Code shown in the app.
//
// DRAFT: written to describe what the app actually does today (local
// storage, on-device selfie check, optional activity sync). It has not
// been reviewed by a lawyer. Have it checked against POPIA (South Africa)
// and the App Store / Play Store rules before launch, and update it when
// a real backend starts storing data.

export type LegalDoc = 'terms' | 'privacy' | 'community';

export interface LegalSection {
  heading: string;
  body: string;
}

export const LEGAL_UPDATED = '26 September 2026';

export const LEGAL: Record<LegalDoc, { title: string; intro: string; sections: LegalSection[] }> = {
  terms: {
    title: 'Terms of *use*',
    intro: 'The ground rules for using Pace. By creating an account you agree to them.',
    sections: [
      {
        heading: 'Who can use Pace',
        body: 'You must be 18 or older and able to agree to these terms. One account per person, and the details on it must be true — your name, age, photos and training.',
      },
      {
        heading: 'Your account',
        body: 'Keep your password to yourself. You are responsible for what happens on your account. You can delete it at any time in Settings → Delete account.',
      },
      {
        heading: 'Your content',
        body: 'You own the photos, prompts and messages you add. You let Pace show them to other members as part of the service, and nothing more. Only post what you have the right to share.',
      },
      {
        heading: 'Meeting up',
        body: 'Pace helps you find people to train with and date. You decide who to meet. Meet in public places, tell a friend where you are going, and use the safety tools in the app. Pace does not run background checks.',
      },
      {
        heading: 'What is not allowed',
        body: 'Anything that breaks the Community Code: harassment, fake profiles, scams, asking for money, spam, or sharing someone else’s private information. We may remove content or close accounts that break these rules.',
      },
      {
        heading: 'Subscriptions',
        body: 'Paid features, when offered, are billed through the App Store or Google Play and follow their refund rules. You can cancel in your store account settings.',
      },
      {
        heading: 'Changes',
        body: 'We may update these terms. If the change matters, we will tell you in the app before it takes effect.',
      },
    ],
  },
  privacy: {
    title: 'Privacy *policy*',
    intro: 'What Pace collects, why, and what you can do about it.',
    sections: [
      {
        heading: 'What we collect',
        body: 'What you give us: name, email, age, gender, city, photos, prompts, training preferences, personal bests and routes. What you do: likes, matches, messages, sessions and training you log.',
      },
      {
        heading: 'Selfie check',
        body: 'Verification uses your front camera to check you are a real, live person. Profile photos are checked for a face when you add them. Both checks run on your phone; nothing is uploaded or kept.',
      },
      {
        heading: 'Activity and health data',
        body: 'If you connect Strava, Garmin, Apple Health or Samsung Health, Pace reads your workouts (type, date, duration, distance) to show you are active and to verify your personal bests. We never read other health data, never sell it, and never use it for advertising. You can disconnect at any time.',
      },
      {
        heading: 'Where it is stored',
        body: 'Right now your profile and activity are stored on your phone. When Pace moves to online accounts, this policy will be updated to say where data is stored and for how long.',
      },
      {
        heading: 'Who can see what',
        body: 'Other members see your card: photos, first name, age, city, sports, prompts and training rhythm. Your email, exact location and messages with others are never shown. Privacy settings control the rest.',
      },
      {
        heading: 'Your rights',
        body: 'You can see and edit your profile at any time, and delete your account and data in Settings. Deleting removes everything Pace has stored on this device.',
      },
      {
        heading: 'Contact',
        body: 'Questions about your data: privacy@pace.fit.',
      },
    ],
  },
  community: {
    title: 'Community *code*',
    intro: 'Pace works because people show up as themselves. Five rules keep it that way.',
    sections: [
      {
        heading: 'Be real',
        body: 'Recent photos of you, your real age, your actual training. No fake profiles, no catfishing, no borrowed PBs.',
      },
      {
        heading: 'Be respectful',
        body: 'No harassment, hate, threats or unwanted sexual messages. A pass is a pass — don’t chase it.',
      },
      {
        heading: 'Keep it safe',
        body: 'Meet in public. Never ask for or send money, gift cards or crypto. Don’t pressure anyone to move off Pace or share their address.',
      },
      {
        heading: 'Keep it legal',
        body: 'Adults only. Nothing illegal, no selling, no spam or promotion.',
      },
      {
        heading: 'Speak up',
        body: 'If someone breaks these rules, report them from their profile or your chat. Reports are private. We review every one and remove people who put others at risk.',
      },
    ],
  },
};

export function isLegalDoc(v: unknown): v is LegalDoc {
  return v === 'terms' || v === 'privacy' || v === 'community';
}
