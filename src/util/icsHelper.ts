// src/util/icsHelper.ts

import type { Termin } from "../types/termin";
import type { UserTermin } from "../services/userTermineLocal";

export function getIcsData(t: Termin | UserTermin): {
  title: string;
  description: string;
} {
  const title = t.title?.trim() || "Termin";
  const description = t.beschreibung?.trim() || "";
  return { title, description };
}
