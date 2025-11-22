export interface KandidatApi {
  id: string;
  name: string;
  partei_id: string;
  partei_name?: string;
  wahlkreis: string;
  foto_url?: string | null;
  biografie?: string | null;
  agenda?: string | null;
}
