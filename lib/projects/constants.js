export const PROJECT_IMAGE_BUCKET = "project-images";

export const PROJECTS_CACHE_TAG = "projects";

// How long a public project read is served from the Next.js data cache before
// it is refreshed in the background. Admin mutations invalidate the tag, so the
// window only ever delays changes made straight in the Supabase dashboard.
export const PROJECTS_CACHE_SECONDS = 300;

// The homepage carousel falls back to the newest published work when nothing is
// marked as featured, so the section is never empty for a visitor.
export const HOMEPAGE_PROJECT_LIMIT = 6;

export const PROJECT_COLUMNS = [
  "id",
  "slug",
  "name",
  "category",
  "description_ro",
  "description_en",
  "image_url",
  "project_url",
  "github_url",
  "is_published",
  "is_featured",
  "featured_order",
  "sort_order",
  "created_at",
  "updated_at",
].join(", ");

export const PUBLIC_PROJECT_PATHS = [
  "/ro",
  "/en",
  "/ro/proiecte",
  "/en/projects",
];
