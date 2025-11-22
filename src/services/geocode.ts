// src/services/geocode.ts

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string;

type GeocodeResult = {
  lat: number;
  lng: number;
};

export async function geocodeAdresse(
  query: string
): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;
  if (!GEOAPIFY_API_KEY) {
    console.error("Geoapify API key fehlt (VITE_GEOAPIFY_API_KEY).");
    return null;
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", query);
  url.searchParams.set("apiKey", GEOAPIFY_API_KEY);
  // Optional: Fokus auf Deutschland
  url.searchParams.set("filter", "countrycode:de");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error("Geoapify Fehlerstatus:", res.status, await res.text());
      return null;
    }

    const data = await res.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [lng, lat] = feature.geometry.coordinates;

    return { lat, lng };
  } catch (err) {
    console.error("Fehler bei Geoapify Geocoding:", err);
    return null;
  }
}
