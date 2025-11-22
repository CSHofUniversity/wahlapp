import type { ParteiApi } from "../../types/api/parteiApi";
import type { Partei } from "../../types/partei";

export function mapPartei(api: ParteiApi): Partei {
  return {
    id: api.id,
    name: api.name,
    kurz: api.kurz ?? undefined,
    farbe: api.farbe ?? "#808080",
    programm: api.programm ?? null, // 🔥 Wichtig!
  };
}
