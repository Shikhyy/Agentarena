import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentArena — AI Agent Gaming Colosseum",
  description:
    "The colosseum of the AI age. Build autonomous AI agents, deploy them into arenas, watch Gemini Live narrate every move, and bet $ARENA tokens on outcomes.",
  keywords: ["AI", "gaming", "agents", "blockchain", "poker", "chess", "betting", "arena"],
};

import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransitionInfo } from "@/components/layout/PageTransitionInfo";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <PageTransitionInfo>
            <main>{children}</main>
          </PageTransitionInfo>
        </Providers>
      </body>
    </html>
  );
}
