import {
  type FaceReading,
  instruction,
  startLiveness,
  stepLiveness,
  TIMEOUT_MS,
  type LivenessState,
} from './liveness';

const face = (over: Partial<FaceReading> = {}): FaceReading => ({
  trackingId: 1,
  leftEyeOpen: 0.95,
  rightEyeOpen: 0.95,
  smiling: 0.05,
  yaw: 0,
  ...over,
});

// Deterministic order: random() = 0.99 keeps blink, smile, turn.
const start = () => startLiveness(0, () => 0.99);

function feed(state: LivenessState, frames: FaceReading[], t = 1): LivenessState {
  return frames.reduce((s, f, i) => stepLiveness(s, [f], t + i), state);
}

test('blink, smile and a look both ways passes', () => {
  let s = start();
  expect(s.steps).toEqual(['blink', 'smile', 'turn']);
  s = feed(s, [face(), face({ leftEyeOpen: 0.1, rightEyeOpen: 0.1 })]);
  expect(s.index).toBe(1);
  s = feed(s, [face(), face({ smiling: 0.95 })]);
  expect(s.index).toBe(2);
  s = feed(s, [face(), face({ yaw: 30 }), face({ yaw: 5 }), face({ yaw: -32 })]);
  expect(s.status).toBe('passed');
  expect(instruction(s)).toBe('All done');
});

test('a still photo never passes', () => {
  let s = start();
  for (let i = 0; i < 200; i++) s = stepLiveness(s, [face()], i);
  expect(s.index).toBe(0);
  expect(s.status).toBe('running');
  s = stepLiveness(s, [face()], TIMEOUT_MS + 1);
  expect(s.status).toBe('failed');
});

test('must start neutral: a face already smiling or eyes shut does not count', () => {
  let s = feed(start(), [face({ leftEyeOpen: 0.1, rightEyeOpen: 0.1 })]);
  expect(s.index).toBe(0);
  s = feed(s, [face(), face({ leftEyeOpen: 0.1, rightEyeOpen: 0.1 })]);
  expect(s.index).toBe(1);
  s = feed(s, [face({ smiling: 0.95 })]);
  expect(s.index).toBe(1);
});

test('turning to the same side twice is not both ways', () => {
  let s = { ...start(), index: 2 };
  s = feed(s, [face(), face({ yaw: 30 }), face({ yaw: 0 }), face({ yaw: 35 })]);
  expect(s.status).toBe('running');
});

test('a new face mid-sequence restarts it; extra faces pause it', () => {
  let s = feed(start(), [face(), face({ leftEyeOpen: 0.1, rightEyeOpen: 0.1 })]);
  expect(s.index).toBe(1);
  s = stepLiveness(s, [face(), face({ trackingId: 2 })], 10);
  expect(s.hint).toBe('multiple');
  expect(s.index).toBe(1);
  s = stepLiveness(s, [face({ trackingId: 2 })], 11);
  expect(s.index).toBe(0);
});

test('unchanged frames return the same state object', () => {
  const s = feed(start(), [face()]);
  expect(stepLiveness(s, [face()], 5)).toBe(s);
});
