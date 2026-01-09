# Wahlinfo & Wahllokalfinder (PWA)

Eine Progressive Web App (PWA) zur kommunalen Wahlinformation für den Wahlkreis Hof.  
Die App bietet kompakte Infos zu Parteien, Kandidaten, Wahllokalen und wichtigen Wahlterminen – inkl. Favoritenverwaltung, persönlichen Wahlterminen und Erinnerungsfunktionen.

## Features

- **Parteien-Übersicht**

  - Liste aller relevanten Parteien mit Kurzbezeichnung, Farbe und Programm.
  - Sortierbar nach Name, Kurzbezeichnung oder Farbe.
  - Direkter Absprung zur Kandidaten-Übersicht einer Partei.

- **Kandidaten-Übersicht**

  - Filterbare Liste aller Kandidaten (Name, Wahlkreis, Partei).
  - Filter nach:
    - Name oder Wahlkreis (Volltextsuche)
    - Partei
    - Wahlkreis
    - Nur Favoriten
  - Detailansicht mit Biografie & Agenda (ausklappbar).
  - Portrait-Anzeige mit Bildvergrößerung (Lightbox).

- **Favoriten-Verwaltung**

  - Kandidaten als Favoriten markieren.
  - Pro Favorit eine persönliche Notiz hinterlegen.
  - Favoriten nach Partei gruppiert.
  - Schutz: Favoriten mit Notiz können nicht versehentlich gelöscht werden.

- **Wahllokalfinder**

  - Ermittelt das eigene Wahllokal anhand des aktuellen Standorts (GPS) oder einer eingegebenen Adresse (Geocoding via Geoapify).
  - Darstellung:
    - Kartenansicht (Leaflet) mit allen Wahllokalen.
    - Liste der Wahllokale, sortiert nach Entfernung.
  - Funktionen:
    - Sortierung (nächstes zuerst / weitestes zuerst)
    - Klick auf Eintrag zeigt Wahllokal auf der Karte
    - Anzeige von Adresse, Entfernung und Barrierefreiheit.

- **Wahltermine & Erinnerungen**

  - Offizielle Wahltermine (Server, AWS/Postgres) + persönliche Termine (lokal).
  - Filter nach Typ (Wahl, Briefwahl, Fristen, Infos, eigene Termine).
  - Export von Terminen als `.ics` (Kalenderdateien).
  - Browser-Notifications:
    - Lokale Speicherung von Erinnerungseinstellungen (Lead Time in Minuten).
    - Aktivier-/Deaktivierbare Erinnerungen pro Termin.
    - Button zum Deaktivieren aller Erinnerungen.

- **Settings / Theme**

  - Umschaltbarer Light-/Dark-Mode, persistent via `localStorage`.
  - Anzeige von App-Informationen.
  - Button zum „App neu laden“.

- **PWA-Eigenschaften**
  - Als PWA installierbar (Homescreen).
  - Nutzbar im Standalone-Modus (app-ähnliche Darstellung).
  - Offline-Fähigkeit für:
    - Favoriten
    - persönliche Wahltermine
  - Optionaler Service Worker / Caching (abhängig von Vite-PWA-Konfiguration).

---

## Tech-Stack

- **Frontend**

  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) als Build-Tool
  - [MUI](https://mui.com/) (Material UI) als UI-Framework
  - [React Router](https://reactrouter.com/) für Routing
  - [Day.js](https://day.js.org/) + MUI X DatePicker für Datumauswahl
  - [Leaflet](https://leafletjs.com/) + `react-leaflet` für Karten
  - `leaflet-routing-machine` für Routing-Anzeige

- **Backend / APIs**

  - REST-API über AWS API Gateway + Lambda + RDS (PostgreSQL)
  - Endpoints (Beispiele):
    - `GET /parteien`
    - `GET /kandidaten`
    - `GET /wahllokale`
    - `GET /wahltermine`
  - Geocoding: [Geoapify Geocoding API](https://www.geoapify.com/)

- **Lokale Persistenz**
  - `localStorage` für:
    - Favoriten (`favoritenLocal.ts`)
    - Notification-Einstellungen (`notificationsLocal.ts`)
    - Persönliche Termine (`userTermineLocal.ts`)
    - Theme-Mode (`ThemeContext.tsx`)

---

## Projektstruktur

```text
src/
  components/       # Wiederverwendbare UI-Komponenten (Cards, Map, Lightbox, etc.)
  pages/            # Seiten (Parteien, Kandidaten, Favoriten, Wahllokale, Wahltermine, Settings, Landing)
  hooks/            # Custom Hooks (Favoriten, Theme, Wahllokale-Controller)
  services/         # API-HTTP-Client, Geoapify, lokale Services (Favoriten, Termine, Notifications)
  context/          # React Contexts (Favoriten, Notifications, Theme)
  data/             # Mapper & ggf. zusätzliche Daten-Helper
  types/            # TypeScript-Typen für API-Responses und Domänenobjekte
  util/             # Kleine Hilfsfunktionen (ICS, GitHub-RAW-URLs, Distanzberechnung, Datum)
  App.tsx           # Routing & Layout (TopBar, Bottom Navigation, PageLayout)
  main.tsx          # Einstiegspunkt, Context-Provider, ThemeProvider, Router
  theme.ts          # Zentrales Theme (Light/Dark) für MUI
public/
  icons/            # PWA-Icons
  sw.js             # (optional genutzter) Service Worker
  ...
```
