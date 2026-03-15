/**
 * AgentArena — UI Store (Zustand 5)
 * Controls HUD visibility, modals, command palette, sidebars, toasts, and notifications.
 */

import { create } from "zustand";

// ── Toast Types ─────────────────────────────────────────────

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
}

// ── Notification Types ──────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "match" | "bet" | "agent" | "system";
  read: boolean;
  timestamp: number;
  link?: string;
}

// ── Sidebar Panels ──────────────────────────────────────────

export type SidebarPanel = "agent-card" | "betting" | "chat" | "settings" | null;

// ── State ───────────────────────────────────────────────────

interface UIState {
  // HUD
  hudVisible: boolean;
  hudOpacity: number;

  // Command palette
  commandPaletteOpen: boolean;

  // Sidebars
  leftPanel: SidebarPanel;
  rightPanel: SidebarPanel;

  // Toasts
  toasts: Toast[];

  // Notifications
  notifications: Notification[];
  notificationPanelOpen: boolean;

  // Modal
  activeModal: string | null;
  modalData: unknown;

  // Commentary ribbon
  ribbonExpanded: boolean;

  // Actions
  setHudVisible: (v: boolean) => void;
  setHudOpacity: (o: number) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setLeftPanel: (p: SidebarPanel) => void;
  setRightPanel: (p: SidebarPanel) => void;
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
  addNotification: (n: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleNotificationPanel: () => void;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
  setRibbonExpanded: (v: boolean) => void;
}

let toastCounter = 0;
let notifCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  hudVisible: true,
  hudOpacity: 1,
  commandPaletteOpen: false,
  leftPanel: null,
  rightPanel: null,
  toasts: [],
  notifications: [],
  notificationPanelOpen: false,
  activeModal: null,
  modalData: null,
  ribbonExpanded: false,

  setHudVisible: (v) => set({ hudVisible: v }),
  setHudOpacity: (o) => set({ hudOpacity: Math.max(0, Math.min(1, o)) }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  setLeftPanel: (p) => set({ leftPanel: p }),
  setRightPanel: (p) => set({ rightPanel: p }),

  addToast: (message, variant = "info", duration = 4000) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({
      toasts: [...s.toasts, { id, message, variant, duration, createdAt: Date.now() }].slice(-5),
    }));
    // Auto-remove after duration
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addNotification: (n) => {
    const id = `notif-${++notifCounter}`;
    set((s) => ({
      notifications: [
        { ...n, id, read: false, timestamp: Date.now() },
        ...s.notifications.slice(0, 49),
      ],
    }));
  },

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearNotifications: () => set({ notifications: [] }),
  toggleNotificationPanel: () => set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
  openModal: (name, data) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setRibbonExpanded: (v) => set({ ribbonExpanded: v }),
}));
