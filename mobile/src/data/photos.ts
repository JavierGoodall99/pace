import type { PhotoLabel } from './identity';

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
  'athlete-4': require('../../public/images/activity/box_jump_midair.jpg'),
  'athlete-5': require('../../public/images/activity/boxing_training_portrait.jpg'),
  'athlete-6': require('../../public/images/activity/padel_jump_smash.jpg'),
  'athlete-7': require('../../public/images/activity/freestyle_swim_splash.jpg'),
  'athlete-8': require('../../public/images/activity/rugby_player_sprint.jpg'),
};

// Each athlete's labelled gallery, face first — people decide with
// their eyes before they decide to train. Real profiles hold up to six
// user photos; the mock set is limited to the stock images we ship.
export interface GalleryPhoto {
  source: ReturnType<typeof require>;
  label: PhotoLabel;
  caption?: string;
}

const G = (
  portrait: string,
  action: string,
  labels: [PhotoLabel, PhotoLabel],
  captions: [string?, string?] = []
): GalleryPhoto[] => [
  { source: ATHLETE_PHOTOS[portrait], label: labels[0], caption: captions[0] },
  { source: ATHLETE_ACTION_PHOTOS[action], label: labels[1], caption: captions[1] },
];

export const ATHLETE_GALLERY: Record<string, GalleryPhoto[]> = {
  'athlete-1': G(
    'athlete-1',
    'athlete-1',
    ['offclock', 'race'],
    ['Sunday market', 'Two Oceans build']
  ),
  'athlete-2': G('athlete-2', 'athlete-2', ['offclock', 'action'], [undefined, 'Chapman’s Peak']),
  'athlete-3': G('athlete-3', 'athlete-3', ['post', 'action'], ['After parkrun', 'Summit selfie']),
  'athlete-4': G('athlete-4', 'athlete-4', ['post', 'action'], ['Post-swim glow', 'Dryland day']),
  'athlete-5': G('athlete-5', 'athlete-5', ['offclock', 'action'], [undefined, 'Friday boxing']),
  'athlete-6': G('athlete-6', 'athlete-6', ['offclock', 'action'], [undefined, 'Rest-day padel']),
  'athlete-7': G('athlete-7', 'athlete-7', ['post', 'race'], ['After padel', 'Midmar Mile prep']),
  'athlete-8': G('athlete-8', 'athlete-8', ['post', 'action'], ['Gym floor', 'Sunday touch rugby']),
};

export function galleryFor(slotId: string): GalleryPhoto[] {
  return ATHLETE_GALLERY[slotId] ?? [];
}

// Stock photos members can post as session moments in the demo.
export const MOMENT_PHOTOS = [
  require('../../public/images/activity/sunrise_trail_runner.jpg'),
  require('../../public/images/activity/surfing_wave_action.jpg'),
  require('../../public/images/activity/yoga_beach_sunrise.jpg'),
  require('../../public/images/activity/mountain_hiker_portrait.jpg'),
];

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
