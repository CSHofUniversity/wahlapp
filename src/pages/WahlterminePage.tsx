// src/pages/WahlterminePage.tsx

import { useEffect, useMemo, useState, type JSX } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";

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
import { Loader } from "../components/Loader";
import { PageLayout } from "../components/PageLayout";

import { parseDate } from "../util/parseDate";
import { useNotificationContext } from "../context/NotificationContext";
import { getIcsData } from "../util/icsHelper";
import { downloadICS } from "../util/icsDownload";
import { safeApiCall } from "../services/api";
import { OfflineFallback } from "../components/OfflineFallback";
import { OfflineHint } from "../components/OfflineHint";

type TerminFilter = "alle" | "wahl" | "briefwahl" | "frist" | "info" | "custom";

// UI-normalisierte Terminstruktur
type CombinedTermin = (Termin | UserTermin) & {
  source: "api" | "user";
  icon: JSX.Element;
  displayTitle: string;
  displayDescription: string;
};

// PERSISTENCE KEYS
const FILTER_KEY = "wahltermine_filter";

export default function WahlterminePage() {
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const [apiTermine, setApiTermine] = useState<Termin[]>([]);
  const [userTermine, setUserTermine] = useState<UserTermin[]>([]);

  const [filter, setFilter] = useState<TerminFilter>(
    (localStorage.getItem(FILTER_KEY) as TerminFilter) ?? "alle"
  );

  // Notification state
  const [notifications, setNotifications] = useState(loadNotifications());
  const { reloadNotifications } = useNotificationContext();

  // Dialog state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<UserTermin | null>(null);

  // --- FETCH DATA ---
  const loadData = async () => {
    setLoading(true);

    const res = await safeApiCall(() => ladeWahltermine(), []);
    setOffline(res.offline);
    setApiTermine(res.data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- FILTER ändern & persistieren ---
  const handleFilterChange = (val: TerminFilter) => {
    setFilter(val);
    localStorage.setItem(FILTER_KEY, val);
  };

  // --- Notification Helpers ---
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
        leadMinutes: getLeadTime(t.id) ?? 1440,
      };
      addNotification(entry);
      setNotifications((prev) => {
        const withoutOld = prev.filter((n) => n.id !== t.id);
        return [...withoutOld, entry];
      });
    } else {
      removeNotification(t.id);
      setNotifications((prev) => prev.filter((n) => n.id !== t.id));
    }
    reloadNotifications();
  };

  const updateLeadTimeForTerm = (id: string, minutes: number) => {
    updateNotification(id, minutes);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leadMinutes: minutes } : n))
    );
  };

  const handleClearAllNotifications = () => {
    clearAllNotifications();
    setNotifications([]);
    reloadNotifications();
  };

  // --- User Termin Handling ---
  const handleCreateTermin = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const handleEditUserTermin = (termin: CombinedTermin) => {
    if (termin.source !== "user") return;

    setEditing({
      id: termin.id,
      title: termin.title,
      beschreibung: termin.beschreibung,
      datum_iso: termin.datum_iso,
      typ: termin.typ,
    } as UserTermin);
    setEditorOpen(true);
  };

  const handleSaveTermin = (data: {
    title: string;
    beschreibung: string;
    datum_iso: string;
  }) => {
    if (editing) {
      updateUserTermin(editing.id, data);
    } else {
      addUserTermin(data);
    }

    setUserTermine(loadUserTermine());
    setEditorOpen(false);
    setEditing(null);
  };

  const handleDeleteUserTermin = (id: string) => {
    deleteUserTermin(id);

    // Linked Notification entfernen
    removeNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    reloadNotifications();

    setUserTermine(loadUserTermine());
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  // --- Termine kombinieren & filtern ---
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
      source: "api" as const,
      icon: iconForTyp(t.typ),
      // Offizielle Termine: Beschreibung als Titel, mit Fallback
      displayTitle: t.title ?? "Offizieller Wahltermin",
      displayDescription: t.beschreibung ?? "",
    }));

    const userMapped: CombinedTermin[] = userTermine.map((t) => ({
      ...t,
      source: "user" as const,
      icon: <EventIcon />,
      // User-Termine: Titel/Beschreibung, mit Fallbacks
      displayTitle: t.title ?? "Eigener Termin",
      displayDescription: t.beschreibung ?? "",
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

  if (loading) return <Loader />;

  if (offline && apiTermine.length === 0) {
    return <OfflineFallback retry={loadData} />;
  }

  return (
    <PageLayout
      icon={<EventIcon />}
      title="Wahltermine"
      subtitle="Alle wichtigen Termine zur Kommunalwahl."
    >
      {offline && <OfflineHint />}
      <TerminFilterChips filter={filter} onFilterChange={handleFilterChange} />

      {termine.length === 0 ? (
        <Typography color="text.secondary">
          Keine Termine für diese Auswahl.
        </Typography>
      ) : (
        <TerminTimeline
          termine={termine}
          isRegistered={isRegistered}
          getLeadTime={getLeadTime}
          onToggleNotification={toggleNotification}
          onChangeLeadTime={updateLeadTimeForTerm}
          onEditUserTermin={handleEditUserTermin}
          onDeleteUserTermin={handleDeleteUserTermin}
        />
      )}

      <TerminActionsBar
        onAddTermin={handleCreateTermin}
        hasNotifications={notifications.length > 0}
        onClearNotifications={handleClearAllNotifications}
      />

      <TerminEditorDialog
        open={editorOpen}
        initial={editing}
        onClose={handleCloseEditor}
        onSave={handleSaveTermin}
      />
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Präsentationskomponenten                                          */
/* ------------------------------------------------------------------ */

interface TerminFilterChipsProps {
  filter: TerminFilter;
  onFilterChange: (val: TerminFilter) => void;
}

function TerminFilterChips({ filter, onFilterChange }: TerminFilterChipsProps) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
      <Chip
        label="Alle"
        color={filter === "alle" ? "primary" : "default"}
        onClick={() => onFilterChange("alle")}
      />

      <Chip
        label="Wahl"
        icon={<HowToVoteIcon />}
        color={filter === "wahl" ? "primary" : "default"}
        onClick={() => onFilterChange("wahl")}
      />

      <Chip
        label="Briefwahl"
        icon={<MailIcon />}
        color={filter === "briefwahl" ? "info" : "default"}
        onClick={() => onFilterChange("briefwahl")}
      />

      <Chip
        label="Fristen"
        icon={<NotificationsActiveIcon />}
        color={filter === "frist" ? "error" : "default"}
        onClick={() => onFilterChange("frist")}
      />

      <Chip
        label="Info"
        icon={<NotificationsNoneIcon />}
        color={filter === "info" ? "success" : "default"}
        onClick={() => onFilterChange("info")}
      />

      <Chip
        label="Eigene"
        icon={<EventIcon />}
        color={filter === "custom" ? "secondary" : "default"}
        onClick={() => onFilterChange("custom")}
      />
    </Stack>
  );
}

interface TerminTimelineProps {
  termine: CombinedTermin[];
  isRegistered: (id: string) => boolean;
  getLeadTime: (id: string) => number;
  onToggleNotification: (termin: CombinedTermin, enabled: boolean) => void;
  onChangeLeadTime: (id: string, minutes: number) => void;
  onEditUserTermin: (termin: CombinedTermin) => void;
  onDeleteUserTermin: (id: string) => void;
}

function TerminTimeline({
  termine,
  isRegistered,
  getLeadTime,
  onToggleNotification,
  onChangeLeadTime,
  onEditUserTermin,
  onDeleteUserTermin,
}: TerminTimelineProps) {
  return (
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

        const { title: icsTitle, description: icsDescription } = getIcsData(t);

        const dotColor =
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
            : "grey.500";

        const registered = isRegistered(t.id);

        return (
          <TimelineItem key={t.id}>
            <TimelineOppositeContent color="text.secondary">
              {dateString}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: dotColor,
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
                    {t.displayTitle}
                  </Typography>

                  {/* Beschreibung */}
                  {t.displayDescription && (
                    <Typography variant="body2">
                      {t.displayDescription}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} alignItems="center">
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        size="small"
                        color={registered ? "primary" : "default"}
                        onClick={() => onToggleNotification(t, !registered)}
                      >
                        {registered ? (
                          <NotificationsActiveIcon />
                        ) : (
                          <NotificationsNoneIcon />
                        )}
                      </IconButton>

                      {registered && (
                        <Select
                          size="small"
                          value={getLeadTime(t.id)}
                          onChange={(e) =>
                            onChangeLeadTime(t.id, e.target.value as number)
                          }
                          sx={{ minWidth: 160 }}
                        >
                          <MenuItem value={30}>30 Minuten vorher</MenuItem>
                          <MenuItem value={60}>1 Stunde vorher</MenuItem>
                          <MenuItem value={1440}>1 Tag vorher</MenuItem>
                          <MenuItem value={2880}>2 Tage vorher</MenuItem>
                          <MenuItem value={10080}>1 Woche vorher</MenuItem>
                        </Select>
                      )}
                    </Stack>

                    {/* Edit + Delete nur für User-Termine */}
                    {t.source === "user" && (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditUserTermin(t)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteUserTermin(t.id)}
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
  );
}

interface TerminActionsBarProps {
  onAddTermin: () => void;
  hasNotifications: boolean;
  onClearNotifications: () => void;
}

function TerminActionsBar({
  onAddTermin,
  hasNotifications,
  onClearNotifications,
}: TerminActionsBarProps) {
  return (
    <Stack direction="row-reverse" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddCircleOutlineIcon />}
        sx={{ mb: 3 }}
        onClick={onAddTermin}
      >
        Termin hinzufügen
      </Button>

      <Button
        variant="outlined"
        color="error"
        startIcon={<NotificationsOffIcon />}
        disabled={!hasNotifications}
        onClick={onClearNotifications}
      >
        Alle Benachrichtigungen deaktivieren
      </Button>
    </Stack>
  );
}
