import { type ClassValue, clsx } from "clsx";
import type { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE_URL = "https://myriad-tech.ro";
export const SITE_NAME = "Myriad Tech";

export const localizedRoutes = {
  home: {
    ro: "/ro",
    en: "/en",
  },
  projects: {
    ro: "/ro/proiecte",
    en: "/en/projects",
  },
  contact: {
    ro: "/ro/contact",
    en: "/en/contact",
  },
  privacy: {
    ro: "/ro/politica-de-confidentialitate",
    en: "/en/privacy-policy",
  },
  cookies: {
    ro: "/ro/politica-cookies",
    en: "/en/cookie-policy",
  },
} as const;

type SiteLocale = keyof (typeof localizedRoutes)["home"];
type RouteKey = keyof typeof localizedRoutes;

const defaultMetadata = {
  ro: {
    title: "Web Design București & Dezvoltare Web | Myriad Tech",
    description:
      "Site-uri de prezentare, magazine online și aplicații web rapide, optimizate SEO, pentru afaceri din București și din România.",
  },
  en: {
    title: "Web Design & Development in Bucharest | Myriad Tech",
    description:
      "Custom websites, e-commerce stores and fast web applications for businesses in Bucharest, Romania and beyond.",
  },
} as const;

function getLocale(locale?: string): SiteLocale {
  return locale === "en" ? "en" : "ro";
}

export function getLocalizedUrls(route: RouteKey) {
  const paths = localizedRoutes[route];

  return {
    ro: `${SITE_URL}${paths.ro}`,
    en: `${SITE_URL}${paths.en}`,
  };
}

export function constructMetadata({
  locale: requestedLocale = "ro",
  route = "home",
  title,
  description,
  image,
  noIndex = false,
}: {
  locale?: string;
  route?: RouteKey;
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const locale = getLocale(requestedLocale);
  const alternateLocale = locale === "ro" ? "en_US" : "ro_RO";
  const openGraphLocale = locale === "ro" ? "ro_RO" : "en_US";
  const pageTitle = title ?? defaultMetadata[locale].title;
  const pageDescription = description ?? defaultMetadata[locale].description;
  const path = localizedRoutes[route][locale];
  const alternateUrls = getLocalizedUrls(route);
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  // Points at the selected card in app/opengraph-image.png. Naming it here
  // rather than relying on the file convention is necessary because this
  // object already defines `openGraph`, which suppresses the automatic tag.
  const socialImages = [
    {
      url: image ?? "/opengraph-image.png",
      width: 1200,
      height: 630,
      type: "image/png",
      alt:
        locale === "ro"
          ? `${SITE_NAME} — web design, dezvoltare web și SEO din București`
          : `${SITE_NAME} — web design, web development and SEO from Bucharest`,
    },
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description: pageDescription,
    applicationName: SITE_NAME,
    authors: [{ name: "Alexandru Maftei", url: SITE_URL }],
    creator: "Alexandru Maftei",
    publisher: SITE_NAME,
    alternates: {
      canonical: path,
      languages: {
        ro: alternateUrls.ro,
        en: alternateUrls.en,
        "x-default": alternateUrls.ro,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: path,
      siteName: SITE_NAME,
      locale: openGraphLocale,
      alternateLocale: [alternateLocale],
      type: "website",
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: socialImages,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    icons: {
      // favicon.ico first: browsers and crawlers that ignore <link rel="icon">
      // (Google's favicon fetcher included) still request it by convention,
      // and app/favicon.ico's own auto-injected tag is suppressed once this
      // manual `icons` object is set, so it has to be listed explicitly.
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
    category: "technology",
    verification: googleVerification
      ? { google: googleVerification }
      : undefined,
  };
}
