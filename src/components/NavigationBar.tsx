// src/components/NavigationBar.tsx
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";

import { useNavigate, useLocation } from "react-router-dom";
import { useFavoritenContext } from "../context/FavoritenContext";
import { useNotificationContext } from "../context/NotificationContext";

import PolicyIcon from "@mui/icons-material/Policy";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import type { JSX } from "react";

interface NavTab {
  path: string;
  label: string;
  icon: JSX.Element;
}

const TABS: NavTab[] = [
  { path: "/parteien", label: "Parteien", icon: <PolicyIcon /> },
  { path: "/kandidaten", label: "Kandidaten", icon: <PeopleIcon /> },
  { path: "/favoriten", label: "Favoriten", icon: <StarIcon /> },
  { path: "/wahllokale", label: "Wahllokale", icon: <LocationOnIcon /> },
  { path: "/wahltermine", label: "Termine", icon: <EventIcon /> },
];

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { favoriten } = useFavoritenContext();
  const { notifications } = useNotificationContext();

  function withBadge(tab: NavTab) {
    if (tab.path === "/favoriten" && favoriten.length > 0) {
      return (
        <Badge badgeContent={favoriten.length} color="secondary">
          {tab.icon}
        </Badge>
      );
    }
    if (tab.path === "/wahltermine" && notifications.length > 0) {
      return (
        <Badge badgeContent={notifications.length} color="info">
          {tab.icon}
        </Badge>
      );
    }
    return tab.icon;
  }

  return (
    <Paper
      elevation={3}
      square
      sx={{
        zIndex: 10,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          whiteSpace: "nowrap",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <BottomNavigation
          value={location.pathname}
          onChange={(_, value) => navigate(value)}
          showLabels={false}
          sx={{
            display: "flex",
            minWidth: "max-content",
            width: "100%",
            px: 1,
            height: 64,
          }}
        >
          {TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);

            return (
              <BottomNavigationAction
                key={tab.path}
                value={tab.path}
                label={isActive ? tab.label : ""}
                icon={
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.7,
                      borderRadius: "24px",
                      display: "flex",
                      alignItems: "center",
                      gap: isActive ? 1 : 0,
                      transition: "all 0.25s ease",
                      bgcolor: (theme) =>
                        isActive
                          ? theme.palette.primary[
                              theme.palette.mode === "dark" ? "dark" : "main"
                            ]
                          : "transparent",
                      color: isActive ? "primary.contrastText" : "inherit",
                    }}
                  >
                    {withBadge(tab)}
                    {isActive && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "inline-flex",
                        }}
                      >
                        {tab.label}
                      </Box>
                    )}
                  </Box>
                }
                sx={{
                  minWidth: 68,
                  "& .MuiBottomNavigationAction-label": { display: "none" },
                }}
              />
            );
          })}
        </BottomNavigation>
      </Box>
    </Paper>
  );
}
