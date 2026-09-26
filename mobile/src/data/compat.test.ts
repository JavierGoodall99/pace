import { compatibility, daysFactor, distanceFactor, paceFactor, timeFactor } from './compat';
import { ATHLETES } from './mockData';
import { freshMe } from './session';

const ALL = [true, true, true, true, true, true, true];
const NONE = [false, false, false, false, false, false, false];

test('days factor explains the shared days', () => {
  const f = daysFactor(
    [true, false, false, false, false, true, false],
    [true, false, true, false, false, true, false]
  );
  expect(f.detail).toBe('Same 2 days: Mon & Sat');
  expect(f.score).toBeCloseTo(2 / 3);
  expect(daysFactor(ALL, NONE).score).toBe(0);
});

test('pace factor rewards similar effort and flags big gaps', () => {
  expect(paceFactor(3, 3).score).toBe(1);
  expect(paceFactor(2, 3).score).toBe(0.7);
  expect(paceFactor(1, 4).detail).toMatch(/Different effort/);
});

test('time and distance factors read naturally', () => {
  expect(timeFactor(['EARLY MORNING'], ['EARLY MORNING', 'WEEKENDS']).detail).toBe(
    'You’re both early birds'
  );
  expect(distanceFactor(3, 'Pretoria').detail).toBe('3 km apart — easy to meet');
  expect(distanceFactor(1460, 'Cape Town').score).toBe(0.1);
});

test('overall score stays in the 40–99 band and neighbours outrank distant athletes', () => {
  const me = {
    ...freshMe('Tester', 't@x.co'),
    city: 'Pretoria',
    level: 4 as const,
    times: ['EVENING'],
    trainingDays: [false, true, false, false, false, true, true],
  };
  const scores = ATHLETES.map((a) => compatibility(me, a).score);
  scores.forEach((s) => {
    expect(s).toBeGreaterThanOrEqual(40);
    expect(s).toBeLessThanOrEqual(99);
  });
  const kagiso = compatibility(
    me,
    ATHLETES.find((a) => a.name === 'Kagiso')!
  );
  const jacques = compatibility(
    me,
    ATHLETES.find((a) => a.name === 'Jacques')!
  );
  expect(kagiso.score).toBeGreaterThan(jacques.score);
  expect(kagiso.factors.map((f) => f.key)).toEqual(['days', 'time', 'pace', 'distance']);
});
