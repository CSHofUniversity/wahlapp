// src/components/KandidatPortrait.tsx

import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";

import { toRawGitHub } from "../util/gitHubRaw";

interface Props {
  name: string;
  fotoUrl: string | null | undefined;
  borderColor: string;
  size?: number;
  onClick?: () => void;
}

export function KandidatPortrait({
  name,
  fotoUrl,
  borderColor,
  size = 72,
  onClick,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const rawUrl = toRawGitHub(fotoUrl);
  const hasImage = Boolean(rawUrl && !error);

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        cursor: hasImage && onClick ? "pointer" : "default",
      }}
      onClick={() => {
        if (hasImage && onClick) onClick();
      }}
    >
      {!hasImage ? (
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: borderColor,
            fontSize: size * 0.4,
            color: "#fff",
            border: `3px solid ${borderColor}`,
          }}
        >
          {name.charAt(0)}
        </Avatar>
      ) : (
        <>
          {!loaded && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={size * 0.5} />
            </Box>
          )}

          <Box
            component="img"
            src={rawUrl}
            alt={name}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            sx={{
              width: size,
              height: size,
              borderRadius: "50%",
              objectFit: "cover",
              border: `3px solid ${borderColor}`,
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        </>
      )}
    </Box>
  );
}
