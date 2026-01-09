// src/components/WahllokalMap.tsx

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet-routing-machine";

import type { Wahllokal } from "../types/wahllokal";
import { distKm } from "../util/distKm";

export interface WahllokalMapHandle {
  focusOn(lat: number, lng: number): void;
}

interface Props {
  center: [number, number]; // Nutzerstandort
  wahllokale: Wahllokal[];
  darkMode: boolean;
  onSelectWahllokal?: (wl: Wahllokal) => void;
}

export const WahllokalMap = forwardRef<WahllokalMapHandle, Props>(
  function WahllokalMap(
    { center, wahllokale, darkMode, onSelectWahllokal },
    ref
  ) {
    const mapRef = useRef<L.Map | null>(null);
    const routingRef = useRef<L.Routing.Control | null>(null);
    const markersRef = useRef<{ wl: Wahllokal; marker: L.Marker }[]>([]);

    const tileUrl = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileAttribution = darkMode
      ? "&copy; OpenStreetMap contributors &copy; CARTO"
      : "&copy; OpenStreetMap contributors";

    // Icons
    const userIcon = useMemo(
      () =>
        L.icon({
          iconUrl: "/navigation/user-marker.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      []
    );

    const wahllokalIcon = useMemo(
      () =>
        L.icon({
          iconUrl: "/navigation/wahllokal-marker.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      []
    );
    const nearestIcon = useMemo(
      () =>
        L.icon({
          iconUrl: "/navigation/green-marker.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      []
    );

    // Nächstgelegenes Wahllokal bestimmen
    const nearest = useMemo(() => {
      if (!center) return null;

      let min = Infinity;
      let nearestWL: Wahllokal | null = null;

      for (const wl of wahllokale) {
        if (!wl.geo) continue;
        const d = distKm(center[0], center[1], wl.geo.lat, wl.geo.lng);
        if (d < min) {
          min = d;
          nearestWL = wl;
        }
      }
      return nearestWL;
    }, [center, wahllokale]);

    // Mapgrößen-Fix
    useEffect(() => {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    }, [center]);

    // Routing-Funktion
    const zeichneRoute = (zielLat: number, zielLng: number) => {
      if (!mapRef.current) return;

      if (routingRef.current) {
        routingRef.current.remove();
        routingRef.current = null;
      }

      const control = L.Routing.control({
        waypoints: [L.latLng(center[0], center[1]), L.latLng(zielLat, zielLng)],
        lineOptions: {
          styles: [{ color: "#1976d2", weight: 5 }],
          extendToWaypoints: false,
          missingRouteTolerance: 0,
        },
        addWaypoints: false,
        routeWhileDragging: false,
        show: false,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "foot",
        }),
      }).addTo(mapRef.current);

      // UI-Box von Leaflet Routing Machine entfernen
      setTimeout(() => {
        const els = document.getElementsByClassName(
          "leaflet-routing-container"
        );
        for (const el of els) el.remove();
      }, 50);

      routingRef.current = control;

      control.on("routesfound", (e: any) => {
        const routes = e.routes;
        if (!routes || routes.length === 0) {
          console.warn("OSRM: Keine Route vorhanden");
          return;
        }

        const route = routes[0];
        const coords = route.coordinates as L.LatLng[];

        if (!coords || coords.length === 0) {
          console.warn("Routing error: Keine Koordinaten gefunden:", route);
          return;
        }

        const bounds = L.latLngBounds(coords);
        if (!bounds.isValid()) {
          console.warn("Routing error: Bounds aus coords ungültig:", bounds);
          return;
        }

        mapRef.current!.fitBounds(bounds, {
          padding: [40, 40],
        });
      });

      control.on("routingerror", (err: any) => {
        console.error("Routing error:", err);
      });
    };

    // Public API für Parent
    useImperativeHandle(ref, () => ({
      focusOn(lat: number, lng: number) {
        if (!mapRef.current) return;

        // 1. Karte auf Marker zentrieren
        mapRef.current.setView([lat, lng], 16, { animate: true });

        // 2. Popup öffnen & Karte leicht nach oben verschieben,
        //    damit das Popup schön im Sichtbereich liegt
        setTimeout(() => {
          const entry = markersRef.current.find(
            (x) => x.wl.geo?.lat === lat && x.wl.geo?.lng === lng
          );
          if (entry) {
            entry.marker.openPopup();
          }
          // Popup im Viewport besser zentrieren
          mapRef.current!.panBy([0, -200], { animate: true });
        }, 250);
      },
    }));

    return (
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 160px)", // dynamisch für Desktop und Mobile
          maxHeight: "800px",
          minHeight: "320px",
          marginBottom: "1rem",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          whenReady={() => {
            setTimeout(() => mapRef.current?.invalidateSize(), 100);
          }}
        >
          <TileLayer
            url={tileUrl}
            attribution={tileAttribution}
            subdomains={darkMode ? ["a", "b", "c", "d"] : undefined}
          />

          {/* Nutzerstandort */}
          <Marker position={center} icon={userIcon}>
            <Popup>
              <strong>Ihr Standort</strong>
              <br />
              {center[0].toFixed(5)}, {center[1].toFixed(5)}
            </Popup>
          </Marker>

          {/* Marker-Ref bei jedem Render neu aufbauen */}
          {(() => {
            markersRef.current = [];
            return null;
          })()}

          {/* Wahllokale */}
          {wahllokale.map((wl) => {
            if (!wl.geo) return null;

            const entfernung = distKm(
              center[0],
              center[1],
              wl.geo.lat,
              wl.geo.lng
            );
            const gehzeitMin = Math.round((entfernung / 5) * 60); // 5 km/h
            const isNearest = nearest?.id === wl.id;

            return (
              <Marker
                key={wl.id}
                position={[wl.geo.lat, wl.geo.lng]}
                icon={isNearest ? nearestIcon : wahllokalIcon}
                eventHandlers={{
                  click: () => {
                    onSelectWahllokal?.(wl);
                  },
                }}
                // Marker-Ref für Fokus/Pan & Popup-Steuerung
                ref={(m) => {
                  if (m) {
                    markersRef.current.push({ wl, marker: m });
                  }
                }}
              >
                <Popup>
                  <strong>{wl.name}</strong>
                  <br />
                  {wl.adresse.strasse}
                  <br />
                  {wl.adresse.plz} {wl.adresse.ort}
                  <br />
                  <br />
                  <strong>Entfernung:</strong> {entfernung.toFixed(1)} km
                  <br />
                  <strong>Gehzeit:</strong> {gehzeitMin} min
                  <br />
                  {isNearest && (
                    <div style={{ marginTop: "6px", color: "#FBC02D" }}>
                      ⭐ Nächstgelegenes Wahllokal
                    </div>
                  )}
                  <br />
                  <button
                    onClick={() => {
                      // Popup schließen
                      const entry = markersRef.current.find(
                        (x) => x.wl.id === wl.id
                      );
                      if (entry) {
                        entry.marker.closePopup();
                      }

                      // Route einzeichnen
                      zeichneRoute(wl.geo!.lat, wl.geo!.lng);
                    }}
                    style={{
                      marginTop: "6px",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      background: "#1976d2",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Route anzeigen
                  </button>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    );
  }
);
