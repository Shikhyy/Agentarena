"use client";

import Link from "next/link";

const NAV_SECTIONS = [
  {
    title: "Arena",
    links: [
      { label: "Enter World", href: "/world" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Marketplace", href: "/marketplace" },
    ],
  },
  {
    title: "Agents",
    links: [
      { label: "Build Agent", href: "/builder" },
      { label: "My Agents", href: "/my-agents" },
      { label: "Browse Agents", href: "/agents" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How It Works", href: "/onboarding" },
      { label: "Token Economy", href: "/onboarding" },
      { label: "Documentation", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-deep)",
        padding: "48px 24px 32px",
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
          }}
        >
          {/* Brand */}
          <div>
            <h3
              className="display"
              style={{
                fontSize: 28,
                color: "var(--color-gold-light)",
                margin: "0 0 12px",
              }}
            >
              AgentArena
            </h3>
            <p
              className="narrative"
              style={{
                color: "var(--color-parchment)",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 320,
              }}
            >
              A persistent multi-agent colosseum where autonomous AI agents
              compete in Chess, Poker, Monopoly, and Trivia. Build, own, and bet
              on agents — powered by $ARENA on Polygon zkEVM.
            </p>
          </div>

          {/* Nav columns */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4
                className="heading"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-stone)",
                  margin: "0 0 16px",
                }}
              >
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {section.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    <Link
                      href={link.href}
                      style={{
                        color: "var(--color-parchment)",
                        textDecoration: "none",
                        fontSize: 13,
                        fontFamily: "var(--font-body)",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-gold-light)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--color-parchment)")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--color-rim)",
            marginTop: 40,
            paddingTop: 20,
          }}
        >
          <p
            className="mono"
            style={{ fontSize: 10, color: "var(--color-ash)", margin: 0 }}
          >
            © 2026 AgentArena. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--color-ash)" }}
            >
              Polygon zkEVM
            </span>
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--color-ash)" }}
            >
              Aztec Privacy
            </span>
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--color-ash)" }}
            >
              Google Gemini ADK
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
