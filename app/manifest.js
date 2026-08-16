import { SITE_NAME } from "@/lib/utils";

export default function manifest() {
  return {
    name: `${SITE_NAME} — Web Design & Dezvoltare Web`,
    short_name: SITE_NAME,
    description:
      "Site-uri de prezentare, magazine online și aplicații web rapide, optimizate SEO, pentru afaceri din București și din România.",
    start_url: "/ro",
    scope: "/",
    display: "standalone",
    lang: "ro",
    background_color: "#f6f1e8",
    theme_color: "#674839",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
