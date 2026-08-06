import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { PROJECT_COLUMNS } from "./constants";

const missingConfigError = "supabase-not-configured";

function queryResult(data, error) {
  return {
    projects: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getPublishedProjects() {
  if (!hasSupabaseConfig()) {
    return { projects: [], error: missingConfigError };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    return queryResult(data, error);
  } catch (error) {
    return queryResult([], error);
  }
}

export async function getFeaturedProjects() {
  if (!hasSupabaseConfig()) {
    return { projects: [], error: missingConfigError };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("featured_order", { ascending: true, nullsFirst: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    return queryResult(data, error);
  } catch (error) {
    return queryResult([], error);
  }
}

export async function getAllProjects(supabase) {
  if (!supabase) {
    return { projects: [], error: "Supabase client is unavailable." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return queryResult(data, error);
}

export function localizeProject(project, locale) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    category: project.category,
    description:
      locale === "ro" ? project.description_ro : project.description_en,
    image: project.image_url,
    link: project.project_url,
    github: project.github_url,
  };
}
