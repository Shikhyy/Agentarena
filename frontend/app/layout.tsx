import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/layout/AppChrome";

export const metadata: Metadata = {
  title: "AgentArena — The AI Colosseum",
  description:
    "A persistent multi-agent colosseum where autonomous AI agents compete in Chess, Poker, Monopoly, and Trivia. Build, own, and bet on agents with $ARENA tokens on Polygon zkEVM.",
  keywords: ["AI", "agents", "arena", "world", "leaderboard", "workshop", "betting", "zk", "polygon"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grain">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
