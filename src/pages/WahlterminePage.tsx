// src/pages/WahlterminePage.tsx

import { useEffect, useMemo, useState, type JSX } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";

import EventIcon from "@mui/icons-material/Event";
import DownloadIcon from "@mui/icons-material/Download";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import HowToVoteIcon from "@mui/icons-material/HowToVote";
import MailIcon from "@mui/icons-material/Mail";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { ladeWahltermine } from "../services/wahltermine";
import type { Termin, TerminTyp } from "../types/termin";

import {
  loadNotifications,
  addNotification,
  removeNotification,
  updateNotification,
  clearAllNotifications,
} from "../services/notificationsLocal";

import {
  loadUserTermine,
  addUserTermin,
  updateUserTermin,
  deleteUserTermin,
  type UserTermin,
} from "../services/userTermineLocal";

import { TerminEditorDialog } from "../components/TerminEditorDialog";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { Loader } from "../components/Loader";

import { parseDate } from "../util/parseDate";
import { downloadICS } from "../util/createICS";
import { useNotificationContext } from "../context/NotificationContext";
import { getIcsData } from "../util/icsHelper";
import IconButton from "@mui/material/IconButton";

type CombinedTermin =
  | (Termin & { source: "api"; icon: JSX.Element })
  | (UserTermin & { source: "user"; icon: JSX.Element });

// PERSISTENCE KEYS
const FILTER_KEY = "wahltermine_filter";

export default function WahlterminePage() {
  const [apiTermine, setApiTermine] = useState<Termin[]>([]);
  const [userTermine, setUserTermine] = useState<UserTermin[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Load
  const [filter, setFilter] = useState<
    "alle" | "wahl" | "briefwahl" | "frist" | "info" | "custom"
  >((localStorage.getItem(FILTER_KEY) as any) ?? "alle");

  // Notification state
  const [notifications, setNotifications] = useState(loadNotifications());
  const { reloadNotifications } = useNotificationContext();

  // Dialog state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<UserTermin | null>(null);

  function handleCloseEditor() {
    setEditorOpen(false);
    setEditing(null);
  }

  // --- FETCH DATA ---
  useEffect(() => {
    Promise.all([ladeWahltermine(), loadUserTermine()])
      .then(([api, user]) => {
        setApiTermine(api ?? []);
        setUserTermine(user ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  // FILTER + MERGE Termine
  const termine = useMemo<CombinedTermin[]>(() => {
    const iconForTyp = (typ: TerminTyp) => {
      switch (typ) {
        case "wahl":
          return <HowToVoteIcon />;
        case "briefwahl":
          return <MailIcon />;
        case "frist":
          return <NotificationsActiveIcon />;
        case "info":
          return <NotificationsNoneIcon />;
        default:
          return <EventIcon />;
      }
    };
    const apiMapped: CombinedTermin[] = apiTermine.map((t) => ({
      ...t,
      source: "api",
      icon: iconForTyp(t.typ),
    }));

    const userMapped: CombinedTermin[] = userTermine.map((t) => ({
      ...t,
      source: "user",
      icon: <EventIcon />,
    }));

    let combined = [...apiMapped, ...userMapped];

    if (filter !== "alle") {
      if (filter === "custom") {
        combined = combined.filter((t) => t.source === "user");
      } else {
        combined = combined.filter((t) => t.typ === filter);
      }
    }

    combined.sort((a, b) => {
      const da = parseDate(a.datum_iso)?.getTime() ?? 0;
      const db = parseDate(b.datum_iso)?.getTime() ?? 0;
      return da - db;
    });

    return combined;
  }, [apiTermine, userTermine, filter]);

  const handleFilterChange = (val: typeof filter) => {
    setFilter(val);
    localStorage.setItem(FILTER_KEY, val);
  };

  // === Notification Helpers ===

  const isRegistered = (id: string) => notifications.some((n) => n.id === id);

  const getLeadTime = (id: string) =>
    notifications.find((n) => n.id === id)?.leadMinutes ?? 1440;

  const toggleNotification = (t: CombinedTermin, enabled: boolean) => {
    const dateObj = parseDate(t.datum_iso);
    if (!dateObj) return;

    if (enabled) {
      const entry = {
        id: t.id,
        dateISO: dateObj.toISOString(),
        leadMinutes: 1440,
      };
      addNotification(entry);
      setNotifications((p) => [...p, entry]);
    } else {
      removeNotification(t.id);
      setNotifications((p) => p.filter((n) => n.id !== t.id));
    }
    reloadNotifications();
  };

  const updateLeadTimeForTerm = (id: string, minutes: number) => {
    updateNotification(id, minutes);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leadMinutes: minutes } : n))
    );
  };

  // === User Termin Handling ===
  const handleCreateTermin = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const handleSaveTermin = (data: {
    title: string;
    beschreibung: string;
    datum_iso: string;
  }) => {
    if (editing) {
      updateUserTermin(editing.id, data);
      setUserTermine(loadUserTermine());
    } else {
      addUserTermin(data);
      setUserTermine(loadUserTermine());
    }
    setEditorOpen(false);
  };

  const handleDeleteUserTermin = (id: string) => {
    deleteUserTermin(id);

    // Linked Notification entfernen
    removeNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    reloadNotifications();

    setUserTermine(loadUserTermine());
  };

  if (loading) return <Loader />;

  return (
    <PageTransition>
      <PageHeader
        icon={<EventIcon />}
        title="Wahltermine"
        subtitle="Alle wichtigen Termine zur Kommunalwahl."
      />

      <Container sx={{ mt: 2, mb: 10 }}>
        {/* Filter */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip
            label="Alle"
            color={filter === "alle" ? "primary" : "default"}
            onClick={() => handleFilterChange("alle")}
          />

          <Chip
            label="Wahl"
            icon={<HowToVoteIcon />}
            color={filter === "wahl" ? "primary" : "default"}
            onClick={() => handleFilterChange("wahl")}
          />

          <Chip
            label="Briefwahl"
            icon={<MailIcon />}
            color={filter === "briefwahl" ? "info" : "default"}
            onClick={() => handleFilterChange("briefwahl")}
          />

          <Chip
            label="Fristen"
            icon={<NotificationsActiveIcon />}
            color={filter === "frist" ? "error" : "default"}
            onClick={() => handleFilterChange("frist")}
          />

          <Chip
            label="Info"
            icon={<NotificationsNoneIcon />}
            color={filter === "info" ? "success" : "default"}
            onClick={() => handleFilterChange("info")}
          />

          <Chip
            label="Eigene"
            icon={<EventIcon />}
            color={filter === "custom" ? "secondary" : "default"}
            onClick={() => handleFilterChange("custom")}
          />
        </Stack>

        {/* Timeline */}
        {termine.length === 0 ? (
          <Typography color="text.secondary">
            Keine Termine für diese Auswahl.
          </Typography>
        ) : (
          <Timeline position="alternate">
            {termine.map((t, index) => {
              const dateObj = parseDate(t.datum_iso);
              const dateString = dateObj
                ? dateObj.toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Datum unbekannt";

              // ICS Helper
              const { title: icsTitle, description: icsDescription } =
                getIcsData(t);

              return (
                <TimelineItem key={t.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {dateString}
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineDot
                      sx={{
                        bgcolor:
                          t.source === "user"
                            ? "secondary.main"
                            : t.typ === "wahl"
                            ? "primary.main"
                            : t.typ === "briefwahl"
                            ? "info.main"
                            : t.typ === "frist"
                            ? "error.main"
                            : t.typ === "info"
                            ? "success.main"
                            : "grey.500",
                        color: "#fff",
                      }}
                    >
                      {t.icon}
                    </TimelineDot>
                    {index < termine.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        {/* Titel */}
                        <Typography variant="subtitle1" fontWeight={600}>
                          {"title" in t ? t.title : t.title}
                        </Typography>

                        {/* Beschreibung */}
                        <Typography variant="body2">
                          {"beschreibung" in t
                            ? t.beschreibung
                            : t.beschreibung}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          {/* ICS Export */}
                          {dateObj && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                downloadICS({
                                  title: icsTitle,
                                  description: icsDescription,
                                  start: dateObj,
                                })
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                          )}

                          {/* Notifications */}
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <IconButton
                              size="small"
                              color={isRegistered(t.id) ? "primary" : "default"}
                              onClick={() =>
                                toggleNotification(t, !isRegistered(t.id))
                              }
                            >
                              {isRegistered(t.id) ? (
                                <NotificationsActiveIcon />
                              ) : (
                                <NotificationsNoneIcon />
                              )}
                            </IconButton>

                            {isRegistered(t.id) && (
                              <Select
                                size="small"
                                value={getLeadTime(t.id)}
                                onChange={(e) =>
                                  updateLeadTimeForTerm(
                                    t.id,
                                    e.target.value as number
                                  )
                                }
                                sx={{ minWidth: 160 }}
                              >
                                <MenuItem value={30}>
                                  30 Minuten vorher
                                </MenuItem>
                                <MenuItem value={60}>1 Stunde vorher</MenuItem>
                                <MenuItem value={1440}>1 Tag vorher</MenuItem>
                                <MenuItem value={2880}>2 Tage vorher</MenuItem>
                                <MenuItem value={10080}>
                                  1 Woche vorher
                                </MenuItem>
                              </Select>
                            )}
                          </Stack>

                          {/* Edit + Delete nur für User Termine */}
                          {"typ" in t && t.typ === "custom" && (
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  if (t.source !== "user") return;
                                  setEditing({
                                    id: t.id,
                                    title: t.title,
                                    beschreibung: t.beschreibung,
                                    datum_iso: t.datum_iso,
                                    typ: "custom",
                                  });
                                  setEditorOpen(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUserTermin(t.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}

        {/* Termin hinzufügen + Alle Benachrichtigungen deaktivieren */}
        <Stack direction="row-reverse" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ mb: 3 }}
            onClick={handleCreateTermin}
          >
            Termin hinzufügen
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<NotificationsOffIcon />}
            disabled={notifications.length === 0}
            onClick={() => {
              clearAllNotifications();
              setNotifications([]);
              reloadNotifications();
            }}
          >
            Alle Benachrichtigungen deaktivieren
          </Button>
        </Stack>
      </Container>

      {/* Dialog */}
      <TerminEditorDialog
        open={editorOpen}
        initial={editing}
        onClose={handleCloseEditor}
        onSave={handleSaveTermin}
      />
    </PageTransition>
  );
}
