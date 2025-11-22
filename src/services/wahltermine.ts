// src/services/wahltermine.ts
import { apiGet } from "./api";
import type { Termin } from "../types/termin";

/**
 * Nur für offizielle Wahltermine (serverseitig).
 * Persönliche Termine liegen lokal (IndexedDB).
 */
export function ladeWahltermine(): Promise<Termin[]> {
  return apiGet<Termin[]>("/wahltermine");
}
