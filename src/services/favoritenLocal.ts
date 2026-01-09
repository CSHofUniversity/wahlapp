// services/favoritenLocal.ts
import type { Kandidat } from "../types/kandidat";

const STORAGE_KEY = "favoriten";

export interface FavoritEntry {
  id: string;
  notiz: string;
}

// SYNCHRON laden
export function getFavoriten(): FavoritEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { id: string; notiz?: string }[];
    return parsed.map((f) => ({
      id: f.id,
      notiz: f.notiz ?? "",
    }));
  } catch {
    return [];
  }
}

// ASYNC laden (Wrapper)
export async function loadFavoriten(): Promise<FavoritEntry[]> {
  return getFavoriten();
}

// hinzufügen
export async function addFavorit(k: Kandidat): Promise<void> {
  const list = getFavoriten();
  if (!list.some((x) => x.id === k.id)) {
    list.push({ id: k.id, notiz: "" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

// löschen
export async function deleteFavorit(id: string): Promise<void> {
  const list = getFavoriten().filter((x) => x.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// notiz aktualisieren
export async function updateFavorit(
  id: string,
  data: { notiz: string }
): Promise<void> {
  const list = getFavoriten();
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) {
    list[idx].notiz = data.notiz;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

// Details laden
export async function loadFavoritenDetails(
  kandidaten: Kandidat[]
): Promise<(Kandidat & { notiz: string })[]> {
  const favs = getFavoriten();
  const map = new Map(favs.map((f) => [f.id, f.notiz ?? ""]));

  return kandidaten
    .filter((k) => map.has(k.id))
    .map((k) => ({
      ...k,
      notiz: map.get(k.id) ?? "",
    }));
}

// NEU: FavoritEntry holen
export function getFavoritEntry(id: string): FavoritEntry | null {
  return getFavoriten().find((f) => f.id === id) ?? null;
}
