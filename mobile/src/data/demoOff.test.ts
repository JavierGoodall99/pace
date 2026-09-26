// Modules must load after DEMO_DATA is switched off, hence require().
/* eslint-disable @typescript-eslint/no-require-imports */
// With DEMO_DATA off, every data source is empty and nothing throws.
describe('DEMO_DATA off', () => {
  const env = process.env.EXPO_PUBLIC_DEMO_DATA;
  beforeAll(() => {
    process.env.EXPO_PUBLIC_DEMO_DATA = 'false';
    jest.resetModules();
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_DEMO_DATA = env;
    jest.resetModules();
  });

  test('no demo people, chats, plans, moments or notifications', () => {
    const { DEMO_DATA } = require('../config');
    const mock = require('./mockData');
    const { getChatState } = require('./chat');
    const { getPlansState } = require('./plans');
    const { getMomentsState } = require('./moments');
    const { getSocialState, demoGraphFor } = require('./social');
    const { EVENT_ATTENDEES, CREW_MEMBERS } = require('./explore');

    expect(DEMO_DATA).toBe(false);
    expect(mock.ATHLETES).toEqual([]);
    expect(mock.NOTIFICATIONS).toEqual([]);
    expect(getChatState().threads).toEqual({});
    expect(getPlansState().plans).toEqual([]);
    expect(getPlansState().open).toEqual([]);
    expect(getMomentsState().moments).toEqual([]);
    expect(getSocialState().matches).toEqual([]);
    expect(getSocialState().likes).toEqual([]);
    expect(demoGraphFor('woman')).toEqual({ likes: [], matches: [] });
    expect(EVENT_ATTENDEES).toEqual({});
    expect(CREW_MEMBERS).toEqual({});
  });

  test('decks, lists and summaries come back empty instead of throwing', () => {
    const { freshMe } = require('./session');
    const { pacerDeck } = require('./pacers');
    const { pacersAmong, getExploreState } = require('./explore');
    const { athletesTrainingFor, upcomingRaces } = require('./races');
    const { visibleNotifications } = require('./notifications');
    const { todayLine, weekDigest } = require('./pip');
    const me = { ...freshMe('Ana', 'a@x.co'), gender: 'woman', age: '29', city: 'Cape Town' };

    expect(pacerDeck(me, [])).toEqual([]);
    expect(pacersAmong(me, [1, 2, 3])).toEqual([]);
    expect(visibleNotifications([])).toEqual([]);
    upcomingRaces().forEach((r: { id: string }) => expect(athletesTrainingFor(r.id)).toEqual([]));
    expect(() => weekDigest(me, getExploreState(), [])).not.toThrow();
    expect(() => todayLine(me, [], 0)).not.toThrow();
  });
});
