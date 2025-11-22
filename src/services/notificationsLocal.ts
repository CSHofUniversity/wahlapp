export interface NotificationEntry {
  id: string;
  dateISO: string;
  leadMinutes: number;
}

const STORAGE_KEY = "wahltermine_notifications";

export function loadNotifications(): NotificationEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveNotifications(list: NotificationEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addNotification(entry: NotificationEntry) {
  const list = loadNotifications();
  if (!list.some((x) => x.id === entry.id)) {
    list.push(entry);
    saveNotifications(list);
  }
}

export function updateNotification(id: string, leadMinutes: number) {
  const list = loadNotifications();
  const idx = list.findIndex((n) => n.id === id);
  if (idx >= 0) {
    list[idx].leadMinutes = leadMinutes;
    saveNotifications(list);
  }
}

export function removeNotification(id: string) {
  const list = loadNotifications().filter((n) => n.id !== id);
  saveNotifications(list);
}

export function clearAllNotifications() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isRegistered(id: string): boolean {
  return loadNotifications().some((n) => n.id === id);
}

export function getNotification(id: string): NotificationEntry | undefined {
  return loadNotifications().find((n) => n.id === id);
}
