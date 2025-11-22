// API Gateway -> APIs -> wahlinfo-api (87k3cdtkfe) -> Stufen
// const API_BASE = "https://87k3cdtkfe.execute-api.eu-central-1.amazonaws.com/dev";

// src/services/api.ts

export const API_URL = import.meta.env.VITE_API_URL;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(API_URL + path);

  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
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
