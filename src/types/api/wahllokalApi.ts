// src/types/api/wahllokalApi.ts

export interface WahllokalApi {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  geo: string;
  datum?: string;
  von?: string;
  bis?: string;
  barrierefrei?: boolean;
}
