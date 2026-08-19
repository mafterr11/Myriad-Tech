"use client";

import { useEffect } from "react";

// Last resort: this replaces the entire document, so it renders its own <html>
// and <body> and cannot rely on the layout, the fonts, the stylesheet or the
// next-intl provider. Everything it needs is inline, and the copy is Romanian
// because that is the site's default locale.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f6f1e8",
          color: "#1b1a17",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          <p
            style={{
              margin: 0,
              color: "#674839",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Myriad Tech
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            Ceva nu a funcționat
          </h1>
          <p
            style={{
              margin: "1.5rem 0 0",
              lineHeight: 1.8,
              color: "rgba(27, 26, 23, 0.72)",
            }}
          >
            A apărut o eroare neașteptată. Încearcă din nou — dacă problema
            persistă, scrie-mi la{" "}
            <a
              href="mailto:alexandrumaftei95@gmail.com"
              style={{ color: "#674839" }}
            >
              alexandrumaftei95@gmail.com
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.85rem 1.5rem",
              border: "1px solid #674839",
              background: "#674839",
              color: "#fffdf8",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Încearcă din nou
          </button>
        </main>
      </body>
    </html>
  );
}
