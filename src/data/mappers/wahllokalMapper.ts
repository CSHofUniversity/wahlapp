// src/data/mappers/wahllokalMapper.ts

import type { WahllokalApi } from "../../types/api/wahllokalApi";
import type { Wahllokal } from "../../types/wahllokal";

export function mapWahllokal(api: WahllokalApi): Wahllokal {
  // Geo parsen: POINT(lng lat)
  let geo;
  if (api.geo && typeof api.geo === "string") {
    const m = api.geo.match(/POINT\(([-0-9.]+) ([-0-9.]+)\)/);
    if (m) {
      geo = {
        lng: parseFloat(m[1]),
        lat: parseFloat(m[2]),
      };
    }
  }

  return {
    id: api.id,
    name: api.name,
    adresse: {
      strasse: api.strasse,
      plz: api.plz,
      ort: api.ort,
    },
    geo,
    oeffnung: {
      datum: api.datum,
      von: api.von,
      bis: api.bis,
    },
    barrierefrei: api.barrierefrei ?? false,
  };
}
