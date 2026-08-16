import { ImageResponse } from "next/og";
import { BRAND, markDataUri } from "@/lib/brand";

// iOS ignores SVG favicons, so the home-screen icon is rasterised from the same
// mark at the size Apple asks for.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: BRAND.accent,
        }}
      >
        <img
          width="180"
          height="180"
          src={markDataUri({ radius: 0 })}
          alt=""
        />
      </div>
    ),
    size,
  );
}
