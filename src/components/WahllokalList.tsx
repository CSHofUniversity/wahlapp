// src/components/WahllokalList.tsx

import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { AppCardWithSideInfo } from "./AppCardWithSideInfo";
import type { Wahllokal } from "../types/wahllokal";

export function WahllokalList({
  wahllokale,
  onMapFocus,
}: {
  wahllokale: (Wahllokal & { entfernung?: number })[];
  onMapFocus: (wl: Wahllokal) => void;
}) {
  return (
    <>
      {wahllokale.map((wl) => {
        const adr = wl.adresse;
        const dist =
          typeof wl.entfernung === "number"
            ? wl.entfernung.toFixed(1) + " km"
            : null;

        return (
          <AppCardWithSideInfo
            key={wl.id}
            parteiFarbe={"#1976d2"}
            parteiKurz={adr.ort}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {wl.name}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {adr.strasse}, {adr.plz} {adr.ort}
            </Typography>

            {dist && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Entfernung: {dist}
              </Typography>
            )}

            {wl.barrierefrei && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Barrierefrei zugänglich
              </Alert>
            )}

            {wl.geo && (
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  onMapFocus(wl);
                }}
              >
                Auf Karte anzeigen
              </Button>
            )}
          </AppCardWithSideInfo>
        );
      })}
    </>
  );
}
