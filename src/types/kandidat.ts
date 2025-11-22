export interface Links {
  programm?: string | null;
}

export interface Kandidat {
  id: string;
  name: string;
  parteiId: string;
  parteiName?: string;
  parteiKurz?: string;
  parteiFarbe?: string;
  wahlkreis: string;
  foto_url?: string | null;
  biografie?: string;
  agenda?: string;
  links?: Links;
}
