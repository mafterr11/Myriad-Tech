import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/supabase/public";
import {
  HOMEPAGE_PROJECT_LIMIT,
  PROJECTS_CACHE_SECONDS,
  PROJECTS_CACHE_TAG,
  PROJECT_COLUMNS,
} from "./constants";
import { PUBLISHED_PROJECTS_SNAPSHOT } from "./snapshot";

const READ_ATTEMPTS = 2;
const RETRY_DELAY_MS = 200;

// Last successful read served by this server instance. It covers the moment
// between a warm instance and a database that has just stopped answering.
let lastKnownGood = null;

function queryResult(data, error) {
  return {
    projects: data ?? [],
    error: error?.message ?? null,
  };
}

function compare(first, second) {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

function byOrder(key) {
  return (first, second) => {
    const firstOrder = first?.[key] ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = second?.[key] ?? Number.MAX_SAFE_INTEGER;

    return (
      compare(firstOrder, secondOrder) ||
      compare(first?.created_at ?? "", second?.created_at ?? "") ||
      compare(first?.id ?? "", second?.id ?? "")
    );
  };
}

// One query feeds both public pages: fewer round trips, and a single cache
// entry that either side can warm for the other.
async function readPublishedProjects() {
  const supabase = getPublicClient();

  if (!supabase) {
    throw new Error("supabase-not-configured");
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("is_published", true);

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Supabase returned an unexpected project payload.");
  }

  return data;
}

const readPublishedProjectsCached = unstable_cache(
  readPublishedProjects,
  ["published-projects"],
  { revalidate: PROJECTS_CACHE_SECONDS, tags: [PROJECTS_CACHE_TAG] },
);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Never surfaces an empty portfolio because of an infrastructure problem: a
// failed read falls back to the last good response, then to the snapshot
// committed in the repository. A successful read is always trusted, so
// unpublishing everything on purpose still empties the page.
async function loadPublishedProjects() {
  let failure = null;

  for (let attempt = 1; attempt <= READ_ATTEMPTS; attempt += 1) {
    try {
      const rows = await readPublishedProjectsCached();
      lastKnownGood = rows;
      return { rows, degraded: false };
    } catch (error) {
      failure = error;
      if (attempt < READ_ATTEMPTS) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  const fallback = lastKnownGood ?? PUBLISHED_PROJECTS_SNAPSHOT;
  console.warn(
    `[projects] Supabase read failed (${failure?.message ?? "unknown error"}); serving ${
      lastKnownGood ? "the last known good response" : "the committed snapshot"
    }.`,
  );

  return { rows: fallback, degraded: true };
}

export async function getPublishedProjects() {
  const { rows } = await loadPublishedProjects();

  return queryResult([...rows].sort(byOrder("sort_order")), null);
}

export async function getFeaturedProjects() {
  const { rows } = await loadPublishedProjects();

  const featured = rows
    .filter((project) => project?.is_featured)
    .sort(byOrder("featured_order"));

  if (featured.length > 0) {
    return queryResult(featured, null);
  }

  // Nothing is flagged as featured: show the newest published work rather than
  // an empty carousel.
  return queryResult(
    [...rows].sort(byOrder("sort_order")).slice(0, HOMEPAGE_PROJECT_LIMIT),
    null,
  );
}

export async function getAllProjects(supabase) {
  if (!supabase) {
    return { projects: [], error: "Supabase client is unavailable." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  return queryResult(data, error);
}

// `categoryLabels` maps a category slug to its label in this locale. It is
// resolved once per page from the categories table rather than per card, and
// falls back to the raw slug so a card is never left with an empty badge.
export function localizeProject(project, locale, categoryLabels = null) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    category: project.category,
    categoryLabel: categoryLabels?.[project.category] || project.category,
    description:
      locale === "ro" ? project.description_ro : project.description_en,
    image: project.image_url,
    link: project.project_url,
    github: project.github_url,
  };
}
