import { useEffect, useState } from "react";

type GeoStatus = "idle" | "loading" | "success" | "error" | "unsupported";

export interface CurrentPosition {
  status: GeoStatus;
  coords?: { lat: number; lng: number };
  errorCode?: number;
  errorMessage?: string;
}

const DEFAULT_CENTER = { lat: 48.137154, lng: 11.576124 }; // z.B. München

export function useCurrentPosition(enable: boolean): CurrentPosition {
  const [state, setState] = useState<CurrentPosition>({
    status: "idle",
  });

  useEffect(() => {
    if (!enable) return;

    if (!("geolocation" in navigator)) {
      setState({
        status: "unsupported",
        coords: DEFAULT_CENTER,
        errorMessage: "GPS wird von diesem Gerät nicht unterstützt.",
      });
      return;
    }

    let cancelled = false;

    setState((prev) => ({ ...prev, status: "loading" }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setState({
          status: "success",
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
      },
      (error) => {
        if (cancelled) return;

        let message = "Standort konnte nicht ermittelt werden.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Zugriff auf den Standort wurde verweigert.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Standortinformationen sind nicht verfügbar.";
        } else if (error.code === error.TIMEOUT) {
          message = "Standorterkennung hat zu lange gedauert.";
        }

        setState({
          status: "error",
          coords: DEFAULT_CENTER, // Fallback: zentrales Gebiet
          errorCode: error.code,
          errorMessage: message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [enable]);

  return state;
}
