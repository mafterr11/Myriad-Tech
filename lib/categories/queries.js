import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/supabase/public";
import {
  PROJECT_CATEGORIES_CACHE_SECONDS,
  PROJECT_CATEGORIES_CACHE_TAG,
  PROJECT_CATEGORY_COLUMNS,
  PROJECT_CATEGORY_DEFAULTS,
} from "./constants";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function bySortOrder(first, second) {
  const firstOrder = first?.sort_order ?? Number.MAX_SAFE_INTEGER;
  const secondOrder = second?.sort_order ?? Number.MAX_SAFE_INTEGER;
  if (firstOrder !== secondOrder) {
    return firstOrder - secondOrder;
  }
  return text(first?.slug).localeCompare(text(second?.slug));
}

// A row only counts when it can actually name a category in both languages;
// anything half-filled falls back to the slug rather than rendering an empty
// tab.
function normalize(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => text(row?.slug))
    .map((row) => ({
      slug: text(row.slug),
      label_ro: text(row.label_ro) || text(row.slug),
      label_en: text(row.label_en) || text(row.label_ro) || text(row.slug),
      sort_order: row.sort_order ?? null,
      updated_at: row.updated_at ?? null,
    }))
    .sort(bySortOrder);
}

async function readProjectCategories() {
  const supabase = getPublicClient();

  if (!supabase) {
    throw new Error("supabase-not-configured");
  }

  const { data, error } = await supabase
    .from("project_categories")
    .select(PROJECT_CATEGORY_COLUMNS);

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Supabase returned an unexpected category payload.");
  }

  return data;
}

const readProjectCategoriesCached = unstable_cache(
  readProjectCategories,
  ["project-categories"],
  {
    revalidate: PROJECT_CATEGORIES_CACHE_SECONDS,
    tags: [PROJECT_CATEGORIES_CACHE_TAG],
  },
);

let lastKnownGood = null;

// A failed read falls back to the last good response and then to the built-in
// set, which is what the app used before categories were editable. So the
// projects page keeps its tabs when the table is unreachable -- and before the
// migration has been applied at all.
export async function getProjectCategories() {
  try {
    const rows = await readProjectCategoriesCached();
    // An empty table is a failed migration, not a deliberately empty portfolio:
    // every project still points at some category, so serve the defaults.
    if (rows.length === 0) {
      return { categories: normalize(PROJECT_CATEGORY_DEFAULTS), error: null };
    }

    lastKnownGood = rows;
    return { categories: normalize(rows), error: null };
  } catch (error) {
    return {
      categories: normalize(lastKnownGood ?? PROJECT_CATEGORY_DEFAULTS),
      error: error?.message ?? null,
    };
  }
}

// The admin panel reads through the signed-in client so an edit is visible
// immediately, without waiting out the public cache window.
export async function getAllProjectCategories(supabase) {
  if (!supabase) {
    return { categories: [], error: "Supabase client is unavailable." };
  }

  const { data, error } = await supabase
    .from("project_categories")
    .select(PROJECT_CATEGORY_COLUMNS)
    .order("sort_order", { ascending: true });

  if (error) {
    return { categories: [], error: error.message };
  }

  return { categories: normalize(data), error: null };
}

export function categoryLabel(category, locale) {
  const label = locale === "en" ? category?.label_en : category?.label_ro;
  return text(label) || text(category?.slug);
}

// slug -> label in one locale, for the card badges and the filter tabs.
export function categoryLabelMap(categories, locale) {
  return Object.fromEntries(
    (Array.isArray(categories) ? categories : []).map((category) => [
      category.slug,
      categoryLabel(category, locale),
    ]),
  );
}
