/**
 * Erstellt eine ICS-Datei für einen Termin
 * und triggert den Download im Browser.
 */
export function downloadICS({
  title,
  description,
  start,
}: {
  title: string;
  description?: string;
  start: Date;
}) {
  function formatICSDate(d: Date) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const content = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wahlinfo App//DE
BEGIN:VEVENT
DTSTART:${formatICSDate(start)}
SUMMARY:${title}
DESCRIPTION:${description ?? ""}
END:VEVENT
END:VCALENDAR
`.trim();

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.ics`;
  a.click();

  URL.revokeObjectURL(url);
}
