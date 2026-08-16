// Brand constants shared by the generated icons, the social image and the
// structured data, so a colour only ever changes in one place.
export const BRAND = {
  accent: "#674839",
  paper: "#f6f1e8",
  ink: "#1b1a17",
  line: "#d7cfc2",
  teal: "#5c8587",
};

// Deliberately chunky: thin blades disappear at 16px in a browser tab.
const BLADE = "M32 32C33.5 18 41 10 55 8C53.5 22 46 30 32 32Z";

// The four-blade mark from the Myriad Tech logo, reduced to the shapes that
// survive at favicon size.
export function markSvg({
  background = BRAND.accent,
  foreground = BRAND.paper,
  radius = 14,
} = {}) {
  const blades = [0, 90, 180, 270]
    .map((angle) =>
      angle === 0
        ? `<path d="${BLADE}"/>`
        : `<path d="${BLADE}" transform="rotate(${angle} 32 32)"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="${background}"/><g fill="${foreground}">${blades}</g><circle cx="32" cy="32" r="4.5" fill="${background}"/></svg>`;
}

export function markDataUri(options) {
  return `data:image/svg+xml;base64,${Buffer.from(markSvg(options)).toString("base64")}`;
}
