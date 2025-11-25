// API Gateway -> APIs -> wahlinfo-api (87k3cdtkfe) -> Stufen
// API_BASE = "https://87k3cdtkfe.execute-api.eu-central-1.amazonaws.com/dev";
// API_BASE in die .env ausgelagert
// src/services/api.ts

export const API_URL = import.meta.env.VITE_API_URL;
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

export async function apiGet<T>(path: string): Promise<T> {
  let res: Response;

  try {
    res = await fetch(API_URL + path);
  } catch (err) {
    console.error("Network error", err);
    throw new ApiError(0, path);
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // ignore parse errors
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
}
