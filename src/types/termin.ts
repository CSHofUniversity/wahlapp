export type TerminTyp = "wahl" | "briefwahl" | "frist" | "info";
export type TerminStatus = "offen" | "geplant" | "erledigt";

export interface Termin {
  title?: string;
  id: string;
  typ: TerminTyp;
  datum_iso: string;
  beschreibung?: string;
  status?: string;
}
