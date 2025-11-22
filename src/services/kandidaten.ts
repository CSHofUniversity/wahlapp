import { mapKandidat } from "../data/mappers/kandidatMapper";
import type { KandidatApi } from "../types/api/kandidatApi";
import type { Kandidat } from "../types/kandidat";
import { apiGet } from "./api";

export async function ladeKandidaten(): Promise<Kandidat[]> {
  const apiData = await apiGet<KandidatApi[]>("/kandidaten");
  return apiData.map(mapKandidat);
}

export async function ladeKandidat(id: string): Promise<Kandidat> {
  const apiData = await apiGet<KandidatApi>(`/kandidaten/${id}`);
  return mapKandidat(apiData);
}
