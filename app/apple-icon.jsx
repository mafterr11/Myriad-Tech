import { ImageResponse } from "next/og";
import BrandMark from "@/components/brand-mark";

// iOS ignores SVG favicons, so the home-screen icon is rasterised from the same
// mark at the size Apple asks for. iOS applies its own corner mask, so the tile
// is drawn square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} radius={0} />, size);
}
