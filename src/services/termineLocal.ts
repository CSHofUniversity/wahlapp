// src/services/termineLocal.ts
import { db } from "../data/db";
import type { Termin } from "../types/termin";
import { nanoid } from "nanoid";

/** Liste aller persönlichen Wahltermine */
export function getPersoenlicheTermine(): Promise<Termin[]> {
  return db.termine.toArray();
}

/** Termin erstellen */
export async function addTermin(
  datum_iso: string,
  typ: Termin["typ"],
  status: Termin["status"] = "offen"
): Promise<Termin> {
  const item: Termin = {
    id: nanoid(),
    datum_iso,
    typ,
    status,
  };

  await db.termine.add(item);
  return item;
}

/** Termin aktualisieren */
export async function updateTermin(
  id: string,
  data: Partial<Termin>
): Promise<void> {
  await db.termine.update(id, data);
}

/** Termin löschen */
export async function deleteTermin(id: string): Promise<void> {
  await db.termine.delete(id);
}
