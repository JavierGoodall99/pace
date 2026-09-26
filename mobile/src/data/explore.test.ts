import {
  CHALLENGES,
  CT_EVENTS,
  eventById,
  nextOccurrence,
  sunTimes,
  upcomingEvents,
} from './capeTown';
import {
  challengeProgress,
  getExploreState,
  pacersAmong,
  passport,
  resetExplore,
  stampSpot,
  toggleGoing,
} from './explore';
import { weekDigest } from './pip';
import { freshMe } from './session';

beforeEach(() => resetExplore());

test('weekly events roll to the next occurrence', () => {
  const parkrun = eventById('green-point-parkrun')!;
  const fri = new Date(2026, 8, 25, 12, 0); // Friday
  expect(nextOccurrence(parkrun, fri)!.getDate()).toBe(26); // Saturday 08:00
  const satAfter = new Date(2026, 8, 26, 9, 0);
  expect(nextOccurrence(parkrun, satAfter)!.getDate()).toBe(3); // next Saturday
});

test('one-off races disappear once they are over', () => {
  const utct = eventById('utct-2026')!;
  expect(nextOccurrence(utct, new Date(2026, 10, 21))).not.toBeNull(); // mid race weekend
  expect(nextOccurrence(utct, new Date(2026, 10, 23))).toBeNull();
  const list = upcomingEvents(new Date(2026, 8, 26));
  expect(list.map((x) => x.at.getTime())).toEqual(
    [...list.map((x) => x.at.getTime())].sort((a, b) => a - b)
  );
  expect(list.length).toBe(CT_EVENTS.length);
});

test('Cape Town sunrise and sunset look right', () => {
  // Known SAST times: midsummer ~05:32 / 19:57, midwinter ~07:51 / 17:44.
  const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const summer = sunTimes(new Date(2026, 11, 21));
  const winter = sunTimes(new Date(2026, 5, 21));
  expect(Math.abs(mins(summer.sunrise) - (5 * 60 + 32))).toBeLessThan(6);
  expect(Math.abs(mins(summer.sunset) - (19 * 60 + 57))).toBeLessThan(6);
  expect(Math.abs(mins(winter.sunrise) - (7 * 60 + 51))).toBeLessThan(6);
  expect(Math.abs(mins(winter.sunset) - (17 * 60 + 44))).toBeLessThan(6);
});

test('passport stamps count once per spot per day and feed challenges', () => {
  const day = new Date(2026, 9, 3, 7, 0);
  expect(stampSpot('lions-head', day)).toBe(true);
  expect(stampSpot('lions-head', day)).toBe(false);
  stampSpot('lions-head', new Date(2026, 9, 5, 7, 0));
  stampSpot('camps-bay-tidal-pool', new Date(2026, 9, 5, 8, 0));
  const s = getExploreState();
  const lions = CHALLENGES.find((c) => c.id === 'lions-head-4')!;
  const hopper = CHALLENGES.find((c) => c.id === 'spot-hopper')!;
  const cold = CHALLENGES.find((c) => c.id === 'cold-water-4')!;
  expect(challengeProgress(lions, s, day)).toBe(2);
  expect(challengeProgress(hopper, s, day)).toBe(2);
  expect(challengeProgress(cold, s, day)).toBe(1);
  expect(passport(s).visited).toBe(2);
});

test('"pacers you might like" only counts people you would actually see', () => {
  const woman = { ...freshMe('Ana', 'a@x.co'), gender: 'woman' as const, age: '29' };
  // Lerato (woman), Kagiso (man), Sipho (man), Dean (man, inactive).
  const names = pacersAmong(woman, [1, 8, 2, 6], [], false).map((a) => a.name);
  expect(names).toEqual(['Kagiso', 'Sipho']);
  expect(pacersAmong(woman, [8], [8])).toHaveLength(0);
});

test('Pip’s weekly digest counts events and pacers going', () => {
  const woman = { ...freshMe('Ana', 'a@x.co'), gender: 'woman' as const, age: '29' };
  toggleGoing('green-point-parkrun');
  const line = weekDigest(woman, getExploreState(), [], new Date(2026, 8, 25, 12, 0));
  expect(line.text).toMatch(/things on in Cape Town this week/);
  expect(line.text).toMatch(/pacers? you might like/);
});
