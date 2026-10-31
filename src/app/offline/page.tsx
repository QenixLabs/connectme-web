import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You're offline – RootIn",
  description: "RootIn needs an internet connection to load this page.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Static offline fallback used by the service worker for failed navigations.
 * Styles are inline so the page remains readable even if the stylesheet has not
 * been cached yet.
 */
export default function OfflinePage() {
  return (
    <main
      style={{
        alignItems: "center",
        background: "#00060C",
        color: "#F4F6FA",
        display: "flex",
        fontFamily:
          "Rubik, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "420px" }}>
        <Image
          src="/icons/icon-192.png"
          alt="RootIn"
          width={72}
          height={72}
          unoptimized
          style={{
            borderRadius: "18px",
            display: "block",
            height: "72px",
            margin: "0 auto 24px",
            width: "72px",
          }}
        />
        <h1
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}
        >
          You&apos;re offline
        </h1>
        <p
          style={{
            color: "#8B95A5",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}
        >
          RootIn needs an internet connection to load this page. Reconnect, then
          try again.
        </p>
        <Link
          href="/"
          style={{
            background: "#1A5BDB",
            borderRadius: "999px",
            color: "#FFFFFF",
            display: "inline-flex",
            fontSize: "0.9rem",
            fontWeight: 600,
            padding: "10px 22px",
            textDecoration: "none",
          }}
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
