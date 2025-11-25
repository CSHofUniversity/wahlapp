// src/hooks/useWahllokaleController.ts

import { useEffect, useRef, useState } from "react";
import { sucheWahllokale } from "../services/wahllokale";
import { geocodeAdresse } from "../services/geocode";
import type { Wahllokal } from "../types/wahllokal";
import type { WahllokalMapHandle } from "../components/WahllokalMap";
import { distKm } from "../util/distKm";
import { useSettingsTheme } from "./useSettingsTheme";

export function useWahllokaleController() {
  const { darkMode } = useSettingsTheme();
  const [loading, setLoading] = useState(true);
  const [adresse, setAdresse] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);

  const [result, setResult] = useState<Wahllokal[]>([]);
  const [center, setCenter] = useState<[number, number] | null>(null);

  const [sortMode, setSortMode] = useState<"asc" | "desc">("asc");
  const mapRef = useRef<WahllokalMapHandle>(null);

  useEffect(() => {
    initWithGps();
  }, []);

  async function initWithGps() {
    setLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const centerPos: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setCenter(centerPos);

        try {
          const alle = await sucheWahllokale({});
          const sorted = sortWahllokale(sortMode, centerPos, alle);
          setResult(sorted);
        } catch {
          setGeoError("Fehler beim Laden der Wahllokale.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setGeoError("GPS konnte nicht aktiviert werden.");
        setLoading(false);
      }
    );
  }

  async function handleAdresseSearch() {
    if (!adresse.trim()) return;

    setLoading(true);
    setGeoError(null);

    const pos = await geocodeAdresse(adresse);
    if (!pos) {
      setGeoError("Adresse konnte nicht lokalisiert werden.");
      setLoading(false);
      return;
    }

    const newCenter: [number, number] = [pos.lat, pos.lng];
    setCenter(newCenter);

    try {
      const data = await sucheWahllokale({});
      const sorted = sortWahllokale(sortMode, newCenter, data);
      setResult(sorted);
      setAdresse("");
    } catch {
      setGeoError("Fehler beim Abrufen der Wahllokale.");
    } finally {
      setLoading(false);
    }
  }

  async function resetToGps() {
    setAdresse("");
    await initWithGps();
  }

  function handleSortChange(mode: "asc" | "desc") {
    setSortMode(mode);
    if (center) {
      setResult(sortWahllokale(mode, center, result));
    }
  }

  function handleMapFocus(wl: Wahllokal) {
    if (wl.geo && mapRef.current) {
      mapRef.current.focusOn(wl.geo.lat, wl.geo.lng);
    }
  }

  return {
    loading,
    adresse,
    setAdresse,
    geoError,
    center,
    result,
    sortMode,
    mapRef,
    handleAdresseSearch,
    resetToGps,
    handleSortChange,
    handleMapFocus,
    darkMode,
  };
}

// -------------------------------------------------------------
// Sorting Utility
// -------------------------------------------------------------

export function sortWahllokale(
  mode: "asc" | "desc",
  center: [number, number] | null,
  data: Wahllokal[]
) {
  if (!center) return data;

  const withDist = data.map((wl) => {
    const entfernung = wl.geo
      ? distKm(center[0], center[1], wl.geo.lat, wl.geo.lng)
      : Number.POSITIVE_INFINITY;
    return { ...wl, entfernung };
  });

  return withDist.sort((a, b) =>
    mode === "asc" ? a.entfernung - b.entfernung : b.entfernung - a.entfernung
  );
}
