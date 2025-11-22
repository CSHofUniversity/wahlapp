// src/types/wahllokal.ts

interface Adresse {
  strasse: string;
  plz: string;
  ort: string;
}

interface Geo {
  lat: number;
  lng: number;
}

interface Oeffnung {
  datum?: string;
  von?: string;
  bis?: string;
}

export interface Wahllokal {
  id: string;
  name: string;
  adresse: Adresse;
  geo?: Geo;
  oeffnung?: Oeffnung;
  barrierefrei?: boolean;
}
