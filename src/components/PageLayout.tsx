// src/components/PageLayout.tsx
import type { ReactNode } from "react";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import { PageTransition } from "./PageTransition";
import { PageHeader } from "./PageHeader";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({
  title,
  subtitle,
  icon,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <PageTransition>
      <PageHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        actions={actions}
      />

      <Container sx={{ mt: 2, mb: 10 }}>
        <Stack spacing={2}>{children}</Stack>
      </Container>
    </PageTransition>
  );
}
