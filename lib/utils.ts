import { type ClassValue, clsx } from "clsx";
import type { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE_URL = "https://www.myriad-tech.ro";
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
    en: "/en/politica-de-confidentialitate",
  },
  cookies: {
    ro: "/ro/politica-cookies",
    en: "/en/politica-cookies",
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
  image = "/Myriad Tech logo.png",
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
      images: [
        {
          url: image,
          alt: `${SITE_NAME} — web design and development`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [image],
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
    icons: "/icon.svg",
  };
}
