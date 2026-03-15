"use client";

import { motion, AnimatePresence } from "motion/react";
import { useUIStore, type Notification } from "@/lib/stores/uiStore";

const TYPE_COLORS: Record<Notification["type"], string> = {
  match: "var(--color-gold)",
  bet: "var(--color-gold)",
  agent: "var(--color-teal-light)",
  system: "var(--color-stone)",
};

const TYPE_ICONS: Record<Notification["type"], string> = {
  match: "⚔",
  bet: "🎲",
  agent: "🤖",
  system: "⚙",
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationItem({ notification }: { notification: Notification }) {
  const markNotificationRead = useUIStore((s) => s.markNotificationRead);
  const color = TYPE_COLORS[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid rgba(40, 40, 104, 0.4)",
        cursor: "pointer",
        opacity: notification.read ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
      onClick={() => markNotificationRead(notification.id)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>
          {TYPE_ICONS[notification.type]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color,
              }}
            >
              {notification.title}
            </span>
            {!notification.read && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--color-gold)",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-stone)",
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {notification.body}
          </div>
          <div
            className="mono"
            style={{ fontSize: 9, color: "var(--color-stone)", marginTop: 4, opacity: 0.6 }}
          >
            {timeAgo(notification.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationPanel() {
  const open = useUIStore((s) => s.notificationPanelOpen);
  const notifications = useUIStore((s) => s.notifications);
  const clearNotifications = useUIStore((s) => s.clearNotifications);
  const toggleNotificationPanel = useUIStore((s) => s.toggleNotificationPanel);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleNotificationPanel}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 400,
              background: "rgba(0,0,0,0.3)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 340,
              zIndex: 410,
              background: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                height: "var(--topbar-h)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span className="display" style={{ fontSize: 20, color: "var(--color-text)" }}>
                Notifications
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {notifications.length > 0 && (
                  <button
                    className="btn"
                    style={{ padding: "4px 8px", fontSize: 9 }}
                    onClick={clearNotifications}
                  >
                    Clear All
                  </button>
                )}
                <button
                  className="btn"
                  style={{ padding: "4px 8px", fontSize: 12 }}
                  onClick={toggleNotificationPanel}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--color-stone)",
                    fontSize: 13,
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notif) => (
                    <NotificationItem key={notif.id} notification={notif} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
