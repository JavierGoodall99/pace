// On-device liveness check. The camera feeds ML Kit face readings in; this
// decides whether a live person completed a random sequence of challenges
// (blink, smile, look both ways). A photo or a replayed clip can't follow a
// sequence it doesn't know in advance.
//
// It runs on the phone, so the `verified` flag it earns is only as
// trustworthy as the app itself. When accounts move server-side, the pass
// should upload a frame for a provider (e.g. Rekognition Face Liveness) to
// confirm, and the server sets `verified` — this state machine stays as the
// guided UX in front of that.

export type Challenge = 'blink' | 'smile' | 'turn';

// One detected face, reduced to what the challenges read. Probabilities are
// undefined when ML Kit can't classify (e.g. head turned too far).
export interface FaceReading {
  trackingId?: number;
  leftEyeOpen?: number;
  rightEyeOpen?: number;
  smiling?: number;
  yaw: number; // degrees; sign depends on camera mirroring, so we never rely on it
}

export type Hint = 'ok' | 'no-face' | 'multiple';
export type FailReason = 'timeout';

export interface LivenessState {
  steps: Challenge[];
  index: number;
  // The current challenge has seen its neutral starting pose.
  armed: boolean;
  // `turn` only: the side (±1) the first look went to.
  turnSide: 0 | 1 | -1;
  trackingId?: number;
  startedAt: number;
  hint: Hint;
  status: 'running' | 'passed' | 'failed';
  failReason?: FailReason;
}

export const TIMEOUT_MS = 30_000;

const EYES_OPEN = 0.7;
const EYES_CLOSED = 0.35;
const SMILE_NEUTRAL = 0.3;
const SMILE_FULL = 0.8;
const YAW_CENTRE = 10;
const YAW_TURNED = 25;

export function shuffledChallenges(random: () => number = Math.random): Challenge[] {
  const steps: Challenge[] = ['blink', 'smile', 'turn'];
  for (let i = steps.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [steps[i], steps[j]] = [steps[j], steps[i]];
  }
  return steps;
}

export function startLiveness(now: number, random?: () => number): LivenessState {
  return {
    steps: shuffledChallenges(random),
    index: 0,
    armed: false,
    turnSide: 0,
    startedAt: now,
    hint: 'no-face',
    status: 'running',
  };
}

function restart(state: LivenessState, trackingId: number | undefined): LivenessState {
  return { ...state, index: 0, armed: false, turnSide: 0, trackingId };
}

function advance(state: LivenessState): LivenessState {
  const index = state.index + 1;
  const status = index >= state.steps.length ? 'passed' : 'running';
  return { ...state, index, armed: false, turnSide: 0, status };
}

// Feeds one camera frame's faces in. Returns the same object when nothing
// changed, so callers can skip re-rendering on most frames.
export function stepLiveness(
  state: LivenessState,
  faces: FaceReading[],
  now: number
): LivenessState {
  if (state.status !== 'running') return state;
  if (now - state.startedAt > TIMEOUT_MS) {
    return { ...state, status: 'failed', failReason: 'timeout' };
  }

  if (faces.length !== 1) {
    const hint: Hint = faces.length === 0 ? 'no-face' : 'multiple';
    return state.hint === hint ? state : { ...state, hint };
  }

  const face = faces[0];
  let next: LivenessState = state.hint === 'ok' ? state : { ...state, hint: 'ok' };

  // A different face took over mid-sequence: start again for the new one.
  if (face.trackingId !== undefined && face.trackingId !== next.trackingId) {
    const progressed = next.index > 0 || next.armed;
    next = progressed ? restart(next, face.trackingId) : { ...next, trackingId: face.trackingId };
  }

  const step = next.steps[next.index];
  const yaw = Math.abs(face.yaw);

  if (step === 'blink') {
    const { leftEyeOpen: l, rightEyeOpen: r } = face;
    if (l === undefined || r === undefined) return next;
    if (!next.armed) return l > EYES_OPEN && r > EYES_OPEN ? { ...next, armed: true } : next;
    return l < EYES_CLOSED && r < EYES_CLOSED ? advance(next) : next;
  }

  if (step === 'smile') {
    const s = face.smiling;
    if (s === undefined) return next;
    if (!next.armed) return s < SMILE_NEUTRAL && yaw < YAW_CENTRE ? { ...next, armed: true } : next;
    return s > SMILE_FULL ? advance(next) : next;
  }

  // turn: start facing the camera, look to one side, then the other.
  if (!next.armed) return yaw < YAW_CENTRE ? { ...next, armed: true } : next;
  if (yaw < YAW_TURNED) return next;
  const side = face.yaw > 0 ? 1 : -1;
  if (next.turnSide === 0) return { ...next, turnSide: side };
  return side !== next.turnSide ? advance(next) : next;
}

export function instruction(state: LivenessState): string {
  if (state.status === 'passed') return 'All done';
  if (state.status === 'failed') return 'That took too long';
  if (state.hint === 'no-face') return 'Fit your face in the circle';
  if (state.hint === 'multiple') return 'Just you in the frame, please';
  const step = state.steps[state.index];
  if (step === 'blink') return state.armed ? 'Blink slowly' : 'Look at the circle, eyes open';
  if (step === 'smile') return state.armed ? 'Now give us a big smile' : 'Relax your face';
  if (!state.armed) return 'Face the camera';
  return state.turnSide === 0 ? 'Slowly turn your head to one side' : 'Now turn to the other side';
}

export function progressPct(state: LivenessState): number {
  return Math.round((state.index / state.steps.length) * 100);
}
