import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/supabase/public";
import {
  SITE_IMAGES_CACHE_SECONDS,
  SITE_IMAGES_CACHE_TAG,
  SITE_IMAGE_COLUMNS,
  SITE_IMAGE_DEFAULTS,
  SITE_IMAGE_KEYS,
} from "./constants";

const missingConfigError = "supabase-not-configured";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Rows only ever override the built-in defaults, field by field. A half-filled
// or unexpected row can never blank out an image or its alt text.
function withDefaults(rows) {
  const byKey = new Map(
    (Array.isArray(rows) ? rows : []).map((row) => [row?.key, row]),
  );

  return Object.fromEntries(
    SITE_IMAGE_KEYS.map((key) => {
      const fallback = SITE_IMAGE_DEFAULTS[key];
      const row = byKey.get(key);

      return [
        key,
        {
          key,
          image_url: text(row?.image_url) || fallback.image_url,
          alt_ro: text(row?.alt_ro) || fallback.alt_ro,
          alt_en: text(row?.alt_en) || fallback.alt_en,
          updated_at: row?.updated_at ?? null,
          is_default: !row,
        },
      ];
    }),
  );
}

async function readSiteImages() {
  const supabase = getPublicClient();

  if (!supabase) {
    throw new Error(missingConfigError);
  }

  const { data, error } = await supabase
    .from("site_images")
    .select(SITE_IMAGE_COLUMNS);

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data : [];
}

const readSiteImagesCached = unstable_cache(readSiteImages, ["site-images"], {
  revalidate: SITE_IMAGES_CACHE_SECONDS,
  tags: [SITE_IMAGES_CACHE_TAG],
});

let lastKnownGood = null;

export async function getSiteImages() {
  try {
    const rows = await readSiteImagesCached();
    lastKnownGood = rows;
    return { images: withDefaults(rows), error: null };
  } catch (error) {
    // The built-in defaults are the same images the components used before the
    // table existed, so a failed read is invisible to a visitor.
    return { images: withDefaults(lastKnownGood ?? []), error: error?.message ?? null };
  }
}

export function localizeSiteImage(image, locale) {
  const fallback = SITE_IMAGE_DEFAULTS[image?.key] ?? SITE_IMAGE_DEFAULTS.hero;
  const alt = locale === "en" ? image?.alt_en : image?.alt_ro;

  return {
    src: text(image?.image_url) || fallback.image_url,
    alt: text(alt) || (locale === "en" ? fallback.alt_en : fallback.alt_ro),
  };
}
