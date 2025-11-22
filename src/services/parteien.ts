import { apiGet } from "./api";
import type { ParteiApi } from "../types/api/parteiApi";
import type { Partei } from "../types/partei";
import { mapPartei } from "../data/mappers/parteiMapper";

export async function ladeParteien(): Promise<Partei[]> {
  const apiData = await apiGet<ParteiApi[]>("/parteien");
  return apiData.map(mapPartei);
}
