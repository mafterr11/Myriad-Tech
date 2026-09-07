export const PROJECT_CATEGORIES_CACHE_TAG = "project-categories";

export const PROJECT_CATEGORIES_CACHE_SECONDS = 300;

export const PROJECT_CATEGORY_COLUMNS = [
  "slug",
  "label_ro",
  "label_en",
  "sort_order",
  "updated_at",
].join(", ");

// The set the app shipped with, in the order the tabs used to appear, with the
// labels that used to live in messages/{ro,en}.json. They are the seed rows of
// the migration and the fallback here, so the projects page renders exactly as
// before when the table is empty, unreachable, or not migrated yet.
export const PROJECT_CATEGORY_DEFAULTS = [
  {
    slug: "presentation",
    label_ro: "Site de prezentare",
    label_en: "Presentation",
    sort_order: 1,
  },
  {
    slug: "progress",
    label_ro: "În desfășurare",
    label_en: "In progress",
    sort_order: 2,
  },
  {
    slug: "shop",
    label_ro: "Magazin online",
    label_en: "E-commerce",
    sort_order: 3,
  },
  {
    slug: "wordpress",
    label_ro: "Wordpress",
    label_en: "Wordpress",
    sort_order: 4,
  },
  { slug: "others", label_ro: "Altele", label_en: "Others", sort_order: 5 },
];

export const DEFAULT_PROJECT_CATEGORY = "presentation";
