// src/services/api.ts
// API Gateway -> APIs -> wahlinfo-api (87k3cdtkfe) -> Stufen
// API_BASE = "https://87k3cdtkfe.execute-api.eu-central-1.amazonaws.com/dev";

// Basis-URL aus .env
export const API_URL = import.meta.env.VITE_API_URL;

/* ------------------------------------------------------------------ */
/* Fehlerklasse für API-Requests                                      */
/* ------------------------------------------------------------------ */
export class ApiError extends Error {
  status: number;
  path: string;
  responseBody?: unknown;

  constructor(status: number, path: string, responseBody?: unknown) {
    super(`GET ${path} failed with ${status}`);
    this.status = status;
    this.path = path;
    this.responseBody = responseBody;
  }
}

/* ------------------------------------------------------------------ */
/* GET – darf Fehler werfen, wird von safeApiCall behandelt           */
/* ------------------------------------------------------------------ */
export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // HTTP Fehler → ApiError werfen
    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        /* ignorieren – z. B. bei leerem Body */
      }

      throw new ApiError(res.status, path, body);
    }
    const json = await res.json();

    // Falls API ein "body" Feld hat (AWS Lambda Proxy)
    if (typeof json.body === "string") {
      try {
        return JSON.parse(json.body) as T;
      } catch (e) {
        console.error("Fehler beim JSON-Parse:", json.body);
        throw e;
      }
    }

    return json as T; // Normalfall
  } catch (err: any) {
    // OFFLINE
    if (!navigator.onLine) {
      console.warn(`[apiGet] Offline erkannt → GET ${path}`);
      throw new ApiError(0, path, "OFFLINE");
    }

    // Sonstige Browser/Netzwerkfehler
    console.error("[apiGet] Network error:", err);
    throw new ApiError(0, path, err?.message ?? "NETWORK_ERROR");
  }
}

/* ------------------------------------------------------------------ */
/* safeApiCall – fängt 100% aller Fehler ab und liefert fallback-Daten */
/* ------------------------------------------------------------------ */

export interface SafeApiResult<T> {
  ok: boolean;
  offline: boolean;
  data: T | null;
  error?: unknown;
}

/**
 * safeApiCall
 * - führt API-Aufruf robust aus
 * - fängt jedes throw (inkl. ApiError) ab
 * - erkennt offline / online zuverlässig
 * - liefert fallback, wenn API nicht erreichbar
 * - bricht niemals die UI
 */
export async function safeApiCall<T>(
  fn: () => Promise<T>,
  fallback: T | null = null
): Promise<SafeApiResult<T>> {
  try {
    const data = await fn();
    return {
      ok: true,
      offline: false,
      data,
    };
  } catch (error: any) {
    const isOffline = !navigator.onLine;

    if (isOffline) {
      console.warn("safeApiCall: OFFLINE – gebe fallback zurück");
    } else {
      console.warn("safeApiCall – caught error:", error);
    }

    return {
      ok: false,
      offline: isOffline,
      data: fallback,
      error,
    };
  }
}
