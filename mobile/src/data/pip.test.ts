import type { Plan } from './plans';
import { profileTip, todayLine } from './pip';
import { freshMe } from './session';

const now = new Date(2026, 8, 25, 18, 0);
const me = { ...freshMe('Naledi Khumalo', 'n@x.co'), city: 'Pretoria' };
const iso = (daysAhead: number) => new Date(now.getTime() + daysAhead * 86400000).toISOString();
const plan = (p: Partial<Plan>): Plan => ({
  id: 'p',
  athleteId: 1,
  activity: 'RUNNING',
  date: iso(1),
  place: 'Sea Point Promenade',
  status: 'confirmed',
  ...p,
});

test('Today puts the most urgent thing first', () => {
  const done = plan({ id: 'done', status: 'done', date: iso(-2), athleteId: 7 });
  const invite = plan({ id: 'inv', status: 'received', athleteId: 8 });
  const next = plan({ id: 'next' });

  expect(todayLine(me, [next, invite, done], 5, now).key).toBe('checkin-done');
  expect(todayLine(me, [next, invite], 5, now).text).toMatch(/^Kagiso wants to train/);
  expect(todayLine(me, [next], 5, now).text).toBe(
    'Next up: Lerato, tomorrow at 18:00. Don’t forget water!'
  );
  expect(todayLine(me, [], 3, now).text).toBe('3 pacers are waiting for you today, Naledi.');
  expect(todayLine(me, [], 0, now).key).toBe('quiet');
});

test('a mutual check-in no longer counts as pending', () => {
  const answered = plan({
    id: 'a',
    status: 'done',
    date: iso(-2),
    myCheckIn: 'again',
    theirCheckIn: 'again',
  });
  expect(todayLine(me, [answered], 0, now).key).toBe('quiet');
});

test('profile tips walk through the next best improvement', () => {
  expect(profileTip(me, now).key).toBe('tip-basics');
  const basics = { ...me, gender: 'woman' as const };
  expect(profileTip(basics, now).key).toBe('tip-photos');
  expect(profileTip({ ...basics, photos: ['a'], photoLabels: ['action' as const] }, now).key).toBe(
    'tip-offclock'
  );
  const withPhotos = {
    ...basics,
    photos: ['a', 'b', 'c'],
    photoLabels: ['offclock' as const, 'action' as const, 'post' as const],
  };
  expect(profileTip(withPhotos, now).key).toBe('tip-verify');
  expect(profileTip({ ...withPhotos, verified: true }, now).key).toBe('tip-sync');
  const synced = { ...withPhotos, verified: true, connected: ['strava' as const] };
  expect(profileTip(synced, now).key).toBe('tip-race');
  const racing = profileTip({ ...synced, goalRaceId: 'soweto-marathon' }, now);
  expect(racing.text).toBe('37 days to Soweto Marathon. Find a pacer for your long runs!');
});
