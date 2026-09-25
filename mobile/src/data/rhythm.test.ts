import { rhythmForAthlete, rhythmForMe, sharedDays, sharedDaysLabel, syncScore } from './rhythm';

test('rhythm has one day per weekly session, capped at 7', () => {
  expect(rhythmForAthlete({ id: 1, weekly: 3 }).filter(Boolean)).toHaveLength(3);
  expect(rhythmForAthlete({ id: 2, weekly: 12 }).filter(Boolean)).toHaveLength(7);
  expect(rhythmForMe('2-3X/WK').filter(Boolean)).toHaveLength(3);
});

test('sync score rises with overlap and stays in the 55–98 band', () => {
  const me = rhythmForMe('4-5X/WK');
  expect(syncScore(me, me)).toBe(98);
  const none = [false, false, false, false, false, false, false];
  expect(syncScore(me, none)).toBe(55);
});

test('shared days label reads naturally', () => {
  const a = [true, true, false, false, false, true, false];
  const b = [false, true, false, false, false, true, true];
  expect(sharedDays(a, b)).toEqual([1, 5]);
  expect(sharedDaysLabel(a, b)).toBe('You both train Tue & Sat');
});
