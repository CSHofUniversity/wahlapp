// src/components/AppCardWithSideInfo.tsx
import type { ReactNode } from "react";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

interface Props {
  children: ReactNode;
  parteiFarbe: string;
  parteiKurz: string;
  elevation?: number;
}

export function AppCardWithSideInfo({
  children,
  parteiFarbe,
  parteiKurz,
  elevation = 2,
}: Props) {
  return (
    <MuiCard
      elevation={elevation}
      sx={{
        mb: 2,
        borderRadius: 1,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Sidebar links */}
      <Box
        sx={{
          width: 48,
          backgroundColor: parteiFarbe,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-rl",
          color: "#fff",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.75rem",
        }}
      >
        {parteiKurz}
      </Box>

      {/* Inhalt */}
      <CardContent sx={{ flexGrow: 1 }}>{children}</CardContent>
    </MuiCard>
  );
}
