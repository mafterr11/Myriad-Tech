import { ImageResponse } from "next/og";
import { BRAND, markDataUri } from "@/lib/brand";
import { SITE_NAME } from "@/lib/utils";

// The logo file is square, so link previews used to crop it into a grey box.
// This renders a real 1.91:1 card instead.
export const alt =
  "Myriad Tech — web design, dezvoltare web și SEO din București";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          background: BRAND.paper,
          color: BRAND.ink,
          fontSize: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img width="88" height="88" src={markDataUri()} alt="" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.1,
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 700 }}>{SITE_NAME}</span>
            <span style={{ fontSize: 24, color: BRAND.accent }}>
              Alexandru Maftei
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.05 }}>
            Web design, dezvoltare web
          </span>
          <span
            style={{
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.05,
              color: BRAND.accent,
            }}
          >
            și SEO din București
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${BRAND.line}`,
            paddingTop: 28,
            fontSize: 28,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>myriad-tech.ro</span>
          <span style={{ color: BRAND.accent }}>
            Site-uri · Magazine online · Aplicații web
          </span>
        </div>
      </div>
    ),
    size,
  );
}
