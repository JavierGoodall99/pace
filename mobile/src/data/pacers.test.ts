import { dayIndex } from './dates';
import { DROP_SIZE, dailyPacers, standouts } from './pacers';
import { freshMe } from './session';

const me = {
  ...freshMe('Naledi', 'n@x.co'),
  city: 'Pretoria',
  level: 3 as const,
  times: ['EARLY MORNING'],
  trainingDays: [true, false, true, false, false, true, true],
};

test('the daily drop is a short, ranked list without you or blocked people', () => {
  const drop = dailyPacers(me, [8]);
  expect(drop).toHaveLength(DROP_SIZE);
  expect(drop.map((p) => p.athlete.name)).not.toContain('Naledi');
  expect(drop.map((p) => p.athlete.id)).not.toContain(8);
  const scores = drop.map((p) => p.compat.score);
  expect([...scores].sort((a, b) => b - a)).toEqual(scores);
});

test('each pacer comes with a session on a day you both train', () => {
  const now = new Date(2026, 8, 21, 20, 0); // Monday evening
  dailyPacers(me, [], now).forEach(({ compat, suggestion }) => {
    expect(suggestion.date.getTime()).toBeGreaterThan(now.getTime());
    if (compat.sharedDayIdx.length)
      expect(compat.sharedDayIdx).toContain(dayIndex(suggestion.date));
    expect(suggestion.place.length).toBeGreaterThan(0);
  });
});

test('the drop only shows people who want to see each other', () => {
  const woman = { ...me, gender: 'woman' as const };
  const drop = dailyPacers(woman, []);
  expect(drop.length).toBeGreaterThan(0);
  drop.forEach(({ athlete }) =>
    expect(['Sipho', 'Jacques', 'Dean', 'Kagiso']).toContain(athlete.name)
  );
});

test('standouts are ranked by likes this week', () => {
  const list = standouts(me, []);
  expect(list[0].name).toBe('Zanele');
  expect(list).toHaveLength(4);
});
