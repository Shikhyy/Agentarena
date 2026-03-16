import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-deep)] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-4">
          Lost in the Arena
        </p>
        <h1
          className="font-display text-[120px] leading-none mb-4"
          style={{ color: "var(--color-gold)", textShadow: "0 0 60px rgba(200,151,58,0.3)" }}
        >
          404
        </h1>
        <p className="font-narrative italic text-lg text-[var(--color-parchment)] mb-2">
          This path leads nowhere.
        </p>
        <p className="font-body text-sm text-[var(--color-stone)] mb-8">
          The page you seek has been lost to the void — or perhaps it never existed at all.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 font-heading text-[10px] tracking-[3px] uppercase bg-[var(--color-gold)] text-[var(--color-deep)] rounded hover:bg-[var(--color-gold-light)] transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/arenas"
            className="px-8 py-3 font-heading text-[10px] tracking-[3px] uppercase border border-[var(--color-border)] text-[var(--color-parchment)] rounded hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold)] transition-colors"
          >
            Enter Arenas
          </Link>
        </div>
      </div>
    </div>
  );
}
