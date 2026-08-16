export const SITE_IMAGE_BUCKET = "site-images";

export const SITE_IMAGES_CACHE_TAG = "site-images";

export const SITE_IMAGES_CACHE_SECONDS = 300;

export const SITE_IMAGE_KEYS = ["hero", "about"];

// The values the components used before the images became editable. They are
// also the seed rows of the migration, so the site renders identically when the
// table is empty, unreachable, or not migrated yet.
export const SITE_IMAGE_DEFAULTS = {
  hero: {
    key: "hero",
    image_url: "/alexandru-maftei-hero.jpeg",
    alt_ro: "Alexandru Maftei, dezvoltator full stack",
    alt_en: "Alexandru Maftei, Full Stack Developer",
  },
  about: {
    key: "about",
    image_url: "/about-option-2-process-v2.png",
    alt_ro: "Proces de web design cu schite de site",
    alt_en: "Web design process with website wireframes",
  },
};

export const SITE_IMAGE_COLUMNS = [
  "key",
  "image_url",
  "alt_ro",
  "alt_en",
  "updated_at",
].join(", ");

export const SITE_IMAGE_PATHS = ["/ro", "/en"];
