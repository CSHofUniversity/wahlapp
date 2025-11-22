// src/components/PageHeader.tsx

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 64,
        zIndex: 9,
        bgcolor: (theme) => theme.palette.background.default,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        py: 1.5,

        /** PageHeader zentrieren  */
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Innerer Wrapper */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "lg",
          px: { xs: 2, sm: 3, lg: 0 },
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 26,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
