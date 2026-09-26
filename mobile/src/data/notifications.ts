import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { AppNotification, NOTIFICATIONS } from './mockData';

// In-app notifications feed. The list itself is still mock data (a real
// build gets it from the server); which ones you've read is remembered
// across launches. Blocked people are left out.

const STORAGE_KEY = 'pace.notifications.v1';

let read: number[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(read)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    // Keep anything marked read before the load finished.
    read = [...new Set([...(JSON.parse(raw) as number[]), ...read])];
    emit();
  })
  .catch(() => {});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useReadNotifications(): number[] {
  return useSyncExternalStore(subscribe, () => read);
}

export function visibleNotifications(blocked: number[]): AppNotification[] {
  return NOTIFICATIONS.filter((n) => !blocked.includes(n.athleteId));
}

export function isUnread(n: AppNotification, readIds: number[]): boolean {
  return n.unread && !readIds.includes(n.id);
}

export function unreadCount(blocked: number[], readIds: number[]): number {
  return visibleNotifications(blocked).filter((n) => isUnread(n, readIds)).length;
}

export function markRead(id: number) {
  if (read.includes(id)) return;
  read = [...read, id];
  emit();
  persist();
}

export function markAllRead() {
  read = [...new Set([...read, ...NOTIFICATIONS.map((n) => n.id)])];
  emit();
  persist();
}

export function resetNotifications() {
  read = [];
  emit();
}
