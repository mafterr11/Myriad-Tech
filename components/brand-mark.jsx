import { BRAND } from "@/lib/brand";

// The four-blade logo mark, built from four rounded squares instead of the SVG
// in public/icon.svg. Satori rasterises embedded SVG through libvips on Linux
// and through a different backend locally, and the SVG failed on the Vercel
// builder, so the image routes draw the mark with plain boxes that every
// backend renders identically.
//
// Each petal is a square with two opposite corners fully rounded, leaving
// points on the other diagonal: one at the centre of the mark, one at the
// outer corner.
const PETAL_INTO_CENTRE = "100% 0 100% 0";
const PETAL_INTO_CORNER = "0 100% 0 100%";

export default function BrandMark({
  size,
  background = BRAND.accent,
  foreground = BRAND.paper,
  radius,
}) {
  const petalArea = Math.round(size * 0.78);
  const petal = petalArea / 2;
  const dot = Math.round(size * 0.14);

  const petalStyle = (borderRadius) => ({
    width: petal,
    height: petal,
    background: foreground,
    borderRadius,
  });

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        background,
        borderRadius: radius ?? Math.round(size * 0.22),
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", width: petalArea }}
      >
        <div style={{ display: "flex" }}>
          <div style={petalStyle(PETAL_INTO_CORNER)} />
          <div style={petalStyle(PETAL_INTO_CENTRE)} />
        </div>
        <div style={{ display: "flex" }}>
          <div style={petalStyle(PETAL_INTO_CENTRE)} />
          <div style={petalStyle(PETAL_INTO_CORNER)} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          width: dot,
          height: dot,
          borderRadius: dot,
          background,
        }}
      />
    </div>
  );
}
