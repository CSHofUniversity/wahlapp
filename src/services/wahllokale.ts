// src/services/wahllokale.ts

import { apiGet } from "./api";
import type { Wahllokal } from "../types/wahllokal";
import type { WahllokalApi } from "../types/api/wahllokalApi";
import { mapWahllokal } from "../data/mappers/wahllokalMapper";

/**
 * Suche Wahllokale über Koordinaten oder Adresse.
 * Mindestens lat/lng ODER adresse muss angegeben sein.
 */

export async function sucheWahllokale(params: {
  lat?: number;
  lng?: number;
  adresse?: string;
}): Promise<Wahllokal[]> {
  const query = new URLSearchParams();
  if (params.lat !== undefined) query.append("lat", String(params.lat));
  if (params.lng !== undefined) query.append("lng", String(params.lng));
  if (params.adresse !== undefined) query.append("adresse", params.adresse);

  const apiData = await apiGet<WahllokalApi[]>(`/wahllokale?...`);

  return apiData.map(mapWahllokal).filter((wl): wl is Wahllokal => wl !== null);
}
