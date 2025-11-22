// src/services/userTermineLocal.ts

import { v4 as uuid } from "uuid";

export interface UserTermin {
  id: string;
  title: string;
  beschreibung: string;
  datum_iso: string;
  typ: "custom";
}

const STORAGE_KEY = "user_termine";

// Laden
export function loadUserTermine(): UserTermin[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserTermin[];
  } catch {
    return [];
  }
}

// Hinzufügen
export function addUserTermin(
  data: Omit<UserTermin, "id" | "typ">
): UserTermin {
  const list = loadUserTermine();
  const entry: UserTermin = {
    id: uuid(),
    typ: "custom",
    ...data,
  };
  list.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return entry;
}

// Aktualisieren
export function updateUserTermin(id: string, changes: Partial<UserTermin>) {
  const list = loadUserTermine();
  const idx = list.findIndex((t) => t.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...changes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

// Löschen
export function deleteUserTermin(id: string) {
  const list = loadUserTermine();
  const updated = list.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
