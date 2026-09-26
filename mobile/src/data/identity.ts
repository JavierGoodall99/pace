// Who you are and who you want to meet — the dating basics that sit
// next to the training data. Kept as plain options + formatters so
// onboarding, edit profile, filters and profile cards share one source.

export type Gender = 'woman' | 'man' | 'nonbinary';

export const GENDERS: { id: Gender; label: string; plural: string }[] = [
  { id: 'woman', label: 'Woman', plural: 'Women' },
  { id: 'man', label: 'Man', plural: 'Men' },
  { id: 'nonbinary', label: 'Non-binary', plural: 'Non-binary people' },
];

export function genderLabel(g: Gender | null | undefined): string {
  return GENDERS.find((x) => x.id === g)?.label ?? '';
}

// "Show me" as a sentence: ['woman'] → "Women", all three → "Everyone".
export function showMeLabel(showMe: Gender[] | null | undefined): string {
  if (!showMe || showMe.length === 0) return 'Not set';
  if (showMe.length === GENDERS.length) return 'Everyone';
  return showMe.map((g) => GENDERS.find((x) => x.id === g)!.plural).join(' & ');
}

export const HEIGHT_RANGE = { min: 145, max: 210 };

export function formatHeight(cm: number | null | undefined): string {
  return cm ? `${cm} cm` : '';
}

// Lifestyle — the deal-breakers athletes actually screen for.
export type Drinks = 'never' | 'social' | 'offseason';
export type Diet = 'anything' | 'vegetarian' | 'vegan' | 'highprotein';
export type RestDay = 'couch' | 'brunch' | 'adventure';

export interface Lifestyle {
  drinks: Drinks | null;
  diet: Diet | null;
  restDay: RestDay | null;
}

export const EMPTY_LIFESTYLE: Lifestyle = { drinks: null, diet: null, restDay: null };

export const DRINKS: { id: Drinks; label: string }[] = [
  { id: 'never', label: 'Doesn’t drink' },
  { id: 'social', label: 'Social drinker' },
  { id: 'offseason', label: 'Off-season only' },
];

export const DIETS: { id: Diet; label: string }[] = [
  { id: 'anything', label: 'Eats anything' },
  { id: 'highprotein', label: 'High protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
];

export const REST_DAYS: { id: RestDay; label: string; detail: string }[] = [
  { id: 'couch', label: 'Couch & series', detail: 'Rest means rest' },
  { id: 'brunch', label: 'Long brunch', detail: 'Refuel with friends' },
  { id: 'adventure', label: 'Easy adventure', detail: 'A walk, a swim, a new spot' },
];

export function lifestyleChips(l: Lifestyle | null | undefined): string[] {
  if (!l) return [];
  return [
    DRINKS.find((x) => x.id === l.drinks)?.label,
    DIETS.find((x) => x.id === l.diet)?.label,
    REST_DAYS.find((x) => x.id === l.restDay)?.label,
  ].filter((x): x is string => !!x);
}

// Every profile photo carries a label so people see both sides of you:
// training and off the clock. At least one "Off the clock" is required.
export type PhotoLabel = 'action' | 'post' | 'race' | 'offclock';

export const PHOTO_LABELS: { id: PhotoLabel; label: string }[] = [
  { id: 'action', label: 'In action' },
  { id: 'post', label: 'Post-session' },
  { id: 'race', label: 'Race day' },
  { id: 'offclock', label: 'Off the clock' },
];

export function photoLabel(id: PhotoLabel | null | undefined): string {
  return PHOTO_LABELS.find((x) => x.id === id)?.label ?? 'Photo';
}

// "Photos updated 3 weeks ago" — keeps people honest as bodies change
// with training.
export function freshnessLabel(daysAgo: number): string {
  if (daysAgo <= 1) return 'Photos updated today';
  if (daysAgo < 7) return `Photos updated ${daysAgo} days ago`;
  if (daysAgo < 30) {
    const w = Math.round(daysAgo / 7);
    return `Photos updated ${w} week${w === 1 ? '' : 's'} ago`;
  }
  const m = Math.round(daysAgo / 30);
  return `Photos updated ${m} month${m === 1 ? '' : 's'} ago`;
}

export function daysSince(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000));
}
