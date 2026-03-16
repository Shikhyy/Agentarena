"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BalanceBar } from "@/components/layout/BalanceBar";
import { ZoneNav } from "@/components/layout/ZoneNav";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Minimap } from "@/components/layout/Minimap";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { CommandK } from "@/components/ui/CommandK";
import { ToastStack } from "@/components/ui/Toast";

/**
 * AppChrome — the full HUD shell that wraps every page.
 *
 * - TopBar appears on all pages (single clean navbar)
 * - BalanceBar, ZoneNav, Minimap, Sidebars only on /world routes (game HUD)
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorldRoute = pathname.startsWith("/world");
  const isArenaRoute = pathname.startsWith("/world/arena");

  return (
    <>
      <TopBar />

      {/* World HUD — only on /world routes */}
      {isWorldRoute && <BalanceBar />}
      {isWorldRoute && <ZoneNav />}
      {isWorldRoute && <Minimap />}

      {/* Sidebars — only in arena match view */}
      {isArenaRoute && <LeftSidebar />}
      {isArenaRoute && <RightSidebar />}

      {/* Page content — class toggles padding */}
      <main className={isWorldRoute ? "world-chrome" : ""}>{children}</main>

      {/* Overlays */}
      <NotificationPanel />
      <CommandK />
      <ToastStack />
    </>
  );
}
