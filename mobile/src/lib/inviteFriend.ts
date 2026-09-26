import { Share } from 'react-native';

// "Invite a friend": training partners bring their friends, which is how
// a community app grows (and why people keep it after they match).
// The link is a placeholder until the app has a store listing.
export const APP_LINK = 'https://pace.fit';

export function inviteFriend() {
  Share.share({
    message: `I’m on Pace — find people in Cape Town to run, ride and train with. ${APP_LINK}`,
  }).catch(() => {});
}
