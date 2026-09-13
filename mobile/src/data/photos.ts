// Maps mock athletes (by slotId) and the current user to the placeholder
// photo assets under `public/images`. Centralized here so PhotoSlot usages
// across screens can pass a `source` without each screen knowing the path.

export const ATHLETE_PHOTOS: Record<string, ReturnType<typeof require>> = {
  'athlete-1': require('../../public/images/headshots/golden_hour_laugh.jpg'),
  'athlete-2': require('../../public/images/headshots/friendly_headshot_portrait.jpg'),
  'athlete-3': require('../../public/images/headshots/smiling_braided_headshot.jpg'),
  'athlete-4': require('../../public/images/headshots/athletic_man_sweaty_portrait.jpg'),
  'athlete-5': require('../../public/images/headshots/athletic_ponytail_headshot.jpg'),
  'athlete-6': require('../../public/images/headshots/athletic_curly_headshot.jpg'),
  'athlete-7': require('../../public/images/headshots/athletic_woman_padel_court.jpg'),
  'athlete-8': require('../../public/images/headshots/smiling_gym_headshot.jpg'),
};

// Full-bleed "in action" shots used on the Discover swipe cards and the
// athlete detail hero, keyed the same way as ATHLETE_PHOTOS.
export const ATHLETE_ACTION_PHOTOS: Record<string, ReturnType<typeof require>> = {
  'athlete-1': require('../../public/images/activity/sunrise_trail_runner.jpg'),
  'athlete-2': require('../../public/images/activity/coastal_cyclist_action.jpg'),
  'athlete-3': require('../../public/images/activity/mountain_hiker_portrait.jpg'),
  'athlete-4': require('../../public/images/activity/freestyle_swim_splash.jpg'),
  'athlete-5': require('../../public/images/activity/box_jump_midair.jpg'),
  'athlete-6': require('../../public/images/activity/boxing_training_portrait.jpg'),
  'athlete-7': require('../../public/images/activity/padel_jump_smash.jpg'),
  'athlete-8': require('../../public/images/activity/rugby_player_sprint.jpg'),
};

// Full-bleed hero for the onboarding gateway (two runners sprinting at dusk).
export const HERO_RUNNERS = require('../../public/images/onboarding/hero_runners.png');

export const ME_AVATAR = require('../../public/images/headshots/blonde_woman_headshot.jpg');
export const ME_COVER = require('../../public/images/activity/yoga_beach_sunrise.jpg');
export const TRAINING_PHOTOS = [
  require('../../public/images/activity/surfing_wave_action.jpg'),
  require('../../public/images/activity/box_jump_midair.jpg'),
  require('../../public/images/activity/coastal_cyclist_action.jpg'),
];
export const ACTIVITY_PHOTO = require('../../public/images/activity/box_jump_midair.jpg');
