import { createContext, useContext, useState, useEffect } from "react";
import {
  type NotificationEntry,
  loadNotifications,
} from "../services/notificationsLocal";

interface NotificationContextValue {
  notifications: NotificationEntry[];
  reloadNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  reloadNotifications: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

  const reloadNotifications = () => {
    setNotifications(loadNotifications());
  };

  useEffect(() => {
    reloadNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, reloadNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}
