import { clearThread } from './chat';
import { removePlansWith } from './plans';
import { blockAthlete, fileReport, ReportReason, unmatchAthlete } from './social';

// Safety actions that touch more than one store. Unmatching removes the
// match, the chat and any plans; blocking also hides them everywhere;
// reporting always blocks too, so nobody has to see someone they
// reported again.

export const REPORT_REASONS: { id: ReportReason; label: string; detail: string }[] = [
  { id: 'money', label: 'Asked for money', detail: 'Cash, crypto, gift cards or “investments”' },
  { id: 'fake', label: 'Fake profile or photos', detail: 'Not who they say they are' },
  { id: 'inappropriate', label: 'Inappropriate content', detail: 'Photos, prompts or messages' },
  { id: 'harassment', label: 'Harassment or hate', detail: 'Rude, threatening or abusive' },
  { id: 'safety', label: 'Made me feel unsafe', detail: 'At a session or in chat' },
  { id: 'underage', label: 'Might be under 18', detail: 'Pace is for adults only' },
  { id: 'other', label: 'Something else', detail: 'Tell us what happened' },
];

export async function unmatch(athleteId: number) {
  removePlansWith(athleteId);
  clearThread(athleteId);
  await unmatchAthlete(athleteId);
}

export async function block(athleteId: number) {
  removePlansWith(athleteId);
  clearThread(athleteId);
  await blockAthlete(athleteId);
}

export async function report(athleteId: number, reason: ReportReason, detail: string) {
  await fileReport({ athleteId, reason, detail: detail.trim() });
  await block(athleteId);
}
