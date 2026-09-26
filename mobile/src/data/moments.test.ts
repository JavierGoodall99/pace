import { deleteMoment, getMomentsState, postMoment } from './moments';

test('you can delete your own moment', () => {
  const m = postMoment({ source: 1, caption: 'Easy 5k', activity: 'RUNNING' });
  deleteMoment(m.id);
  expect(getMomentsState().moments.some((x) => x.id === m.id)).toBe(false);
});

test("you can't delete someone else's moment", () => {
  const theirs = getMomentsState().moments.find((x) => x.author !== 'me')!;
  deleteMoment(theirs.id);
  expect(getMomentsState().moments.some((x) => x.id === theirs.id)).toBe(true);
});
