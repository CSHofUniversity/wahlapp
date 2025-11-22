export interface Favorit {
  id: string;
  kandidatId: string;
  notiz?: string | null;
  erstelltAm?: string; // ISO datetime
}
