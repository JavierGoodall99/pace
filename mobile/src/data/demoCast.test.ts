import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetDemo } from './account';
import { depthFor } from './athleteDepth';
import { getChatState, sendLike } from './chat';
import { filteredOut } from './deck';
import { DEMO_CAST } from './demoCast';
import { DEFAULT_FILTERS } from './filters';
import type { Gender } from './identity';
import { ATHLETES } from './mockData';
import { pacerDeck } from './pacers';
import { ATHLETE_ACTION_PHOTOS, ATHLETE_PHOTOS, galleryFor } from './photos';
import { DAILY_PICKS } from './picks';
import { freshMe, Intent, updateMe } from './session';
import { demoGraphFor, getSocialState, passPacer } from './social';

const GENDERS: Gender[] = ['woman', 'man'];
const INTENTS: Intent[] = ['love', 'partner', 'both'];

function tester(gender: Gender, intent: Intent, age: number) {
  return { ...freshMe('Tester', 't@x.co'), city: 'Cape Town', gender, intent, age: String(age) };
}

// What a brand-new tester's Pacers page can draw from: everyone they'd
// qualify for, minus the demo matches onboarding hands them.
function poolFor(gender: Gender, intent: Intent, age: number) {
  const me = tester(gender, intent, age);
  const excluded = [...demoGraphFor(gender).matches, ...filteredOut(me, DEFAULT_FILTERS)];
  return pacerDeck(me, excluded);
}

describe('every tester gets a full deck', () => {
  for (const gender of GENDERS) {
    for (const intent of INTENTS) {
      test(`${gender} looking for ${intent}, any age 18–60`, () => {
        const short: string[] = [];
        for (let age = 18; age <= 60; age++) {
          const n = poolFor(gender, intent, age).length;
          if (n < DAILY_PICKS) short.push(`${age}: ${n}`);
        }
        expect(short).toEqual([]);
      });
    }
  }
});

test('no tester ever sees their own gender', () => {
  for (const gender of GENDERS)
    for (const intent of INTENTS)
      for (let age = 18; age <= 60; age++)
        poolFor(gender, intent, age).forEach(({ athlete }) =>
          expect(depthFor(athlete).gender).not.toBe(gender)
        );
});

test('cast ids and names are unique', () => {
  const ids = ATHLETES.map((a) => a.id);
  const names = ATHLETES.map((a) => a.name);
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(names).size).toBe(names.length);
});

test('every cast member has a portrait, an action shot and a gallery', () => {
  DEMO_CAST.forEach(({ athlete }) => {
    expect(ATHLETE_PHOTOS[athlete.slotId]).toBeDefined();
    expect(ATHLETE_ACTION_PHOTOS[athlete.slotId]).toBeDefined();
    expect(galleryFor(athlete.slotId)).toHaveLength(2);
  });
});

test('cast portraits are of someone the same gender', () => {
  const coreGender = (slot: string) => depthFor({ id: Number(slot.split('-')[1]) }).gender;
  DEMO_CAST.forEach(({ depth, photos }) => {
    expect(coreGender(photos.portrait)).toBe(depth.gender);
    expect(coreGender(photos.action)).toBe(depth.gender);
  });
});

describe('reset demo', () => {
  test('undoes likes, passes and matches, and re-seeds matches for your gender', async () => {
    await updateMe({ gender: 'man' });
    await passPacer(3);
    sendLike(9, { kind: 'photo', index: 0, label: 'Photo' }, '');
    expect(Object.keys(getSocialState().passed)).toContain('3');
    expect(getChatState().sentLikes).toContain(9);

    await resetDemo();

    expect(getSocialState().passed).toEqual({});
    expect(getSocialState().matches).toEqual(demoGraphFor('man').matches);
    expect(getChatState().sentLikes).not.toContain(9);
  });

  test('clears the saved demo world so a restart does not bring it back', async () => {
    await AsyncStorage.setItem('pace.chat.v1', '{"old":true}');
    await AsyncStorage.setItem('pace.session.v1', '{"keep":true}');

    await resetDemo();

    expect(await AsyncStorage.getItem('pace.chat.v1')).toBeNull();
    expect(await AsyncStorage.getItem('pace.session.v1')).not.toBeNull();
  });
});
