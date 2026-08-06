import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function constructMetadata({
  title = "Servicii Profesionale de Web Design și Development - Myriad Tech",
  description = "Oferim servicii complete de web design și development, de la creare site-uri de prezentare la soluții de e-commerce personalizate. Contactează Myriad Tech pentru un site modern și optimizat SEO.",
  keywords = "creare site web, creare site, firme creare site uri, web design bucuresti, servicii web design, pret site web, design web personalizat, solutii e-commerce, Myriad Tech, design web, maftei alexandru, preturi site",
  image = "/Myriad Tech logo.png",
  icons = "/icon.svg",
}: {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  icons?: string;
} = {}): Metadata {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      site: "https://myriad-tech.ro",
      description,
      images: [image],
      creator: "@myriad-tech",
    },
    icons,
    metadataBase: new URL("https://myriad-tech.ro"),
  };
}
