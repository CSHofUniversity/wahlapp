import type { KandidatApi } from "../../types/api/kandidatApi";
import type { Kandidat } from "../../types/kandidat";

export function mapKandidat(api: KandidatApi): Kandidat {
  return {
    id: api.id,
    name: api.name,
    parteiId: api.partei_id,
    parteiName: api.partei_name,
    wahlkreis: api.wahlkreis,
    foto_url: api.foto_url ?? null,
    biografie: api.biografie ?? "",
    agenda: api.agenda ?? "",
    // parteiFarbe kommt NICHT aus der API
    // Sie wird später in KandidatenPage durch Merging ergänzt:
    // k.parteiFarbe = partei.farbe
    parteiFarbe: undefined,
  };
}
