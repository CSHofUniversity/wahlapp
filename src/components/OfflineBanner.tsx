import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Slide direction="down" in={offline} mountOnEnter unmountOnExit>
      <Alert
        severity="warning"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 2000,
          borderRadius: 0,
        }}
      >
        Du bist offline – Daten sind evtl. nicht aktuell.
      </Alert>
    </Slide>
  );
}
