import { SITE_URL } from "@/lib/utils";

// Replaces the static public/robots.txt so the host and sitemap always follow
// SITE_URL instead of drifting out of sync with it.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/ro/admin", "/en/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
