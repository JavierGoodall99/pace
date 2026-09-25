import { dayIndex } from './dates';
import { DROP_SIZE, weeklyPacers } from './pacers';
import { freshMe } from './session';

const me = {
  ...freshMe('Naledi', 'n@x.co'),
  city: 'Pretoria',
  level: 3 as const,
  times: ['EARLY MORNING'],
  trainingDays: [true, false, true, false, false, true, true],
};

test('the weekly drop is a short, ranked list without you or blocked people', () => {
  const drop = weeklyPacers(me, [8]);
  expect(drop).toHaveLength(DROP_SIZE);
  expect(drop.map((p) => p.athlete.name)).not.toContain('Naledi');
  expect(drop.map((p) => p.athlete.id)).not.toContain(8);
  const scores = drop.map((p) => p.compat.score);
  expect([...scores].sort((a, b) => b - a)).toEqual(scores);
});

test('each pacer comes with a session on a day you both train', () => {
  const now = new Date(2026, 8, 21, 20, 0); // Monday evening
  weeklyPacers(me, [], now).forEach(({ compat, suggestion }) => {
    expect(suggestion.date.getTime()).toBeGreaterThan(now.getTime());
    if (compat.sharedDayIdx.length)
      expect(compat.sharedDayIdx).toContain(dayIndex(suggestion.date));
    expect(suggestion.place.length).toBeGreaterThan(0);
  });
});
