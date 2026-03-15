"use client";

import { TopBar } from "@/components/layout/TopBar";
import { BalanceBar } from "@/components/layout/BalanceBar";
import { ZoneNav } from "@/components/layout/ZoneNav";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Minimap } from "@/components/layout/Minimap";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { CommandK } from "@/components/ui/CommandK";
import { ToastStack } from "@/components/ui/Toast";
import { TickerBar } from "@/components/layout/TickerBar";

/**
 * AppChrome — the full HUD shell that wraps every page.
 *
 * Layout:
 *  - TopBar (fixed, 60px top)
 *  - BalanceBar (fixed, 44px below topbar)
 *  - ZoneNav (fixed, 56px bottom)
 *  - LeftSidebar (fixed, agent mini-card)
 *  - RightSidebar (fixed, commentary + probability)
 *  - Minimap (fixed, bottom-left above zonebar)
 *  - NotificationPanel (slide-in overlay)
 *  - CommandK (modal overlay)
 *  - ToastStack (fixed, bottom-right)
 *  - <main> receives content with proper padding for chrome
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed chrome bars */}
      <TopBar />
      <BalanceBar />
      <ZoneNav />

      {/* Sidebars */}
      <LeftSidebar />
      <RightSidebar />

      {/* Minimap */}
      <Minimap />

      {/* Page content */}
      <main>{children}</main>

      {/* Overlays */}
      <NotificationPanel />
      <CommandK />
      <ToastStack />
      <TickerBar />
    </>
  );
}
