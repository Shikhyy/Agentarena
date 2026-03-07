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
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
