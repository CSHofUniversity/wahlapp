// Mein Service Worker

self.addEventListener("install", () => {
  console.log("Service Worker installed");
});

// Hintergrund-Reminder alle 15 Minuten
self.addEventListener("periodicsync", async (event) => {
  if (event.tag === "check-reminders") {
    event.waitUntil(checkReminders());
  }
});

async function checkReminders() {
  const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
  if (clientsArr.length === 0) return;

  // Notifications laden
  const data = await clientsArr[0].postMessage({ type: "GET_NOTIFICATIONS" });
}
