import { athleteById } from './mockData';
import { matchKind } from './pacers';
import { choosePicks, DAILY_PICKS, pickReason } from './picks';
import { checkInsDue, type OpenSession, type Plan } from './plans';
import { buildUpRuns } from './races';
import { freshMe } from './session';

const amahle = athleteById(3)!; // training for UTCT, runs with Running Late Club

describe('daily picks', () => {
  test('a new day takes the top of the ranked deck', () => {
    const ranked = [9, 8, 7, 6, 5, 4, 3];
    expect(choosePicks(ranked, { day: 'yesterday', ids: [1] }, 'today')).toEqual(
      ranked.slice(0, DAILY_PICKS)
    );
  });

  test('upgrading to Pro mid-day tops up to the bigger allowance', () => {
    expect(choosePicks([1, 2, 3], { day: 'today', ids: [7, 8], size: 5 }, 'today', 7)).toEqual([
      7, 8, 1, 2,
    ]);
  });

  test('the same day keeps its picks, even as the deck changes', () => {
    expect(choosePicks([1, 2, 3], { day: 'today', ids: [7, 8] }, 'today')).toEqual([7, 8]);
  });
});

describe('pick reasons', () => {
  const me = { ...freshMe('Ana', 'a@x.co'), goalRaceId: 'utct', times: ['EARLY MORNING'] };

  test('leads with a shared race, then a shared crew', () => {
    expect(pickReason(me, amahle, { sharedDayIdx: [1, 3] }, ['running-late-club'])).toBe(
      'Training for Ultra-Trail Cape Town too · Also runs with Running Late Club'
    );
  });

  test('falls back to shared days', () => {
    const noRace = { ...me, goalRaceId: null };
    expect(pickReason(noRace, amahle, { sharedDayIdx: [1, 3] }, [])).toMatch(
      /^Same Tue & Thu sessions/
    );
  });

  test('always says something', () => {
    expect(pickReason(freshMe('', ''), amahle, { sharedDayIdx: [] }, [])).toBe(
      'Trains close to you'
    );
  });
});

describe('build-up long runs', () => {
  // Wednesday 17 Sep 2025.
  const now = new Date(2025, 8, 17, 12);

  test('the next Saturdays before race day, counting down', () => {
    const runs = buildUpRuns({ date: '2025-10-19' }, now);
    expect(runs.map((r) => r.date.getDate())).toEqual([20, 27, 4, 11]);
    expect(runs.map((r) => r.weeksToGo)).toEqual([5, 4, 3, 2]);
  });

  test('race week gets no long run', () => {
    expect(buildUpRuns({ date: '2025-09-24' }, now)).toEqual([]);
  });
});

describe('safety check-ins', () => {
  const now = new Date(2025, 8, 17, 12);
  const at = (h: number) => new Date(2025, 8, 17, h).toISOString();
  const plan = (p: Partial<Plan>): Plan => ({
    id: 'p1',
    athleteId: 3,
    activity: 'RUNNING',
    date: at(18),
    place: 'Sea Point',
    status: 'confirmed',
    checkInTimer: true,
    ...p,
  });
  const open = (o: Partial<OpenSession>): OpenSession => ({
    id: 'o1',
    hostId: 1,
    title: 'Sunset run',
    activity: 'RUNNING',
    date: at(18),
    place: 'Sea Point',
    city: 'Cape Town',
    distance: '8 km',
    level: 2,
    spots: 8,
    joined: ['me'],
    myCheckIn: true,
    ...o,
  });
  const name = () => 'Amahle';

  test('90 minutes after sessions with the timer on', () => {
    const due = checkInsDue({ plans: [plan({})], open: [open({})] }, name, now);
    expect(due.map((d) => [d.key, d.at.getHours(), d.at.getMinutes()])).toEqual([
      ['plan-p1', 19, 30],
      ['open-o1', 19, 30],
    ]);
  });

  test('none for declined plans, timer off, sessions you left, or the past', () => {
    const due = checkInsDue(
      {
        plans: [
          plan({ id: 'a', status: 'declined' }),
          plan({ id: 'b', checkInTimer: false }),
          plan({ id: 'c', date: at(9) }),
        ],
        open: [open({ joined: [] })],
      },
      name,
      now
    );
    expect(due).toEqual([]);
  });
});

test('partner-only intent makes it a training-partner match', () => {
  const man = { ...freshMe('Tom', 't@x.co'), gender: 'man' as const };
  const woman = athleteById(1)!;
  expect(matchKind({ ...man, intent: 'love' }, woman)).toBe('date');
  expect(matchKind({ ...man, intent: 'partner' }, woman)).toBe('partner');
});
