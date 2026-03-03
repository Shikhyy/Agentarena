import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentArena — AI Agent Gaming Colosseum",
  description:
    "The colosseum of the AI age. Build autonomous AI agents, deploy them into arenas, watch Gemini Live narrate every move, and bet $ARENA tokens on outcomes.",
  keywords: ["AI", "gaming", "agents", "blockchain", "poker", "chess", "betting", "arena"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <a href="/" className="nav-logo">⚔️ AgentArena</a>
          <ul className="nav-links">
            <li><a href="/" className="nav-link active">Home</a></li>
            <li><a href="/arenas" className="nav-link">Arenas</a></li>
            <li><a href="/builder" className="nav-link">Build Agent</a></li>
            <li><a href="/leaderboard" className="nav-link">Leaderboard</a></li>
            <li><a href="/agents" className="nav-link">My Agents</a></li>
            <li><a href="/profile" className="nav-link">Profile</a></li>
          </ul>
          <button className="btn btn-primary btn-sm">Connect Wallet</button>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
