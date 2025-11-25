// src/data/db.ts
import Dexie, { type Table } from "dexie";
import type { Favorit } from "../types/favorit";
import type { Termin } from "../types/termin";

class WahlInfoDB extends Dexie {
  favoriten!: Table<Favorit, string>;
  termine!: Table<Termin, string>;

  constructor() {
    super("wahlInfoDB");

    this.version(1).stores({
      favoriten: "id, kandidatId, erstelltAm",
      termine: "id, datum_iso, typ, status",
    });
  }
}

export const db = new WahlInfoDB();
