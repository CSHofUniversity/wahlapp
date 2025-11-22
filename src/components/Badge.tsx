// src/components/Badge.tsx
import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

interface BadgeProps {
  text: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";
  sx?: SxProps<Theme>;
}

export function Badge({ text, color = "default", sx }: BadgeProps) {
  return <Chip label={text} color={color} sx={sx} />;
}
