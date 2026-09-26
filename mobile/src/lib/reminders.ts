import { useRouter, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { athleteById } from '../data/mockData';
import { checkInsDue, usePlans } from '../data/plans';
import { useSettings } from '../data/settings';
import { nextStreakReminder, Streak, useMyTraining } from '../data/training';
import { useNow } from './useNow';

// Training reminders: a local notification when your streak is at risk.
// Scheduled on the device, so it works without a server. (Likes,
// messages and matches need server push — not built yet.)

const STREAK_ID = 'streak-reminder';
const supported = Platform.OS !== 'web';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Asks for permission. Returns whether notifications can be shown.
export async function allowNotifications(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function scheduleStreakReminder(streak: Streak, now: Date) {
  await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
  const { at, title, body } = nextStreakReminder(streak, now);
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_ID,
    content: { title, body, data: { url: '/log-training' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
  });
}

// Mounted once in the tabs layout: keeps the reminder in line with the
// setting and the training log.
export function useStreakReminder() {
  const router = useRouter();
  const now = useNow();
  const { activity } = useMyTraining(now);
  const { push } = useSettings();
  const on = push.reminders;
  const { weeks, atRisk } = activity.streak;
  // Re-plan when the day changes, not every minute.
  const day = now.toDateString();

  useEffect(() => {
    if (!supported) return;
    (async () => {
      if (!on) {
        await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
        return;
      }
      const perm = await Notifications.getPermissionsAsync();
      if (!perm.granted) return;
      await scheduleStreakReminder({ weeks, atRisk, best: 0 }, new Date());
    })().catch((e) => console.warn('Could not schedule streak reminder:', e));
  }, [on, weeks, atRisk, day]);

  // Tapping the reminder opens Log training.
  useEffect(() => {
    if (!supported) return;
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const url = r.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as Href);
    });
    return () => sub.remove();
  }, [router]);
}

// Safety check-ins: 90 minutes after a session with the check-in timer on,
// ask if all went well; tapping opens the Safety centre (emergency
// numbers, report, block). Kept in line with plans: cancelling, declining
// or leaving a session drops its check-in.
const CHECK_IN_PREFIX = 'checkin-';

export function useCheckInReminders() {
  const { plans, open } = usePlans();

  useEffect(() => {
    if (!supported) return;
    const due = checkInsDue({ plans, open }, (id) =>
      typeof id === 'number' ? (athleteById(id)?.name ?? 'your partner') : 'your group'
    );
    (async () => {
      const perm = await Notifications.getPermissionsAsync();
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const wanted = new Set(due.map((d) => CHECK_IN_PREFIX + d.key));
      // Drop check-ins for sessions that were cancelled, declined or left.
      await Promise.all(
        scheduled
          .map((n) => n.identifier)
          .filter((id) => id.startsWith(CHECK_IN_PREFIX) && !wanted.has(id))
          .map((id) => Notifications.cancelScheduledNotificationAsync(id))
      );
      if (!perm.granted) return;
      const have = new Set(scheduled.map((n) => n.identifier));
      for (const d of due) {
        const identifier = CHECK_IN_PREFIX + d.key;
        if (have.has(identifier)) continue;
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: { title: d.title, body: d.body, data: { url: '/safety' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: d.at },
        });
      }
    })().catch((e) => console.warn('Could not schedule check-ins:', e));
  }, [plans, open]);
}
