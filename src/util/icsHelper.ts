import type { Termin } from "../types/termin";
import type { UserTermin } from "../services/userTermineLocal";

export function getIcsData(t: Termin | UserTermin): {
  title: string;
  description: string;
} {
  const title =
    "title" in t && t.title?.trim() ? t.title : t.title?.trim() || "Termin";

  const description =
    "beschreibung" in t && t.beschreibung?.trim()
      ? t.beschreibung
      : t.beschreibung || "";

  return { title, description };
}
