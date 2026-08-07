import { z } from "zod";

function isPublicProjectImageUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/project-images/") &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === "" ||
      (value.startsWith("/") && !value.startsWith("//")) ||
      isPublicProjectImageUrl(value),
    "Image URL must be a public Supabase project-images URL or a local path.",
  );

export const projectPayloadSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  name: z.string().trim().min(1, "Name is required.").max(160),
  category: z.string().trim().min(1, "Category is required.").max(80),
  description_ro: z.string().trim().min(1, "Romanian description is required.").max(10000),
  description_en: z.string().trim().min(1, "English description is required.").max(10000),
  image_url: imageUrlSchema,
  project_url: z.string().trim().url("Project URL must be a valid URL."),
  github_url: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, "GitHub URL must be a valid URL.")
    .transform((value) => value || null),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  featured_order: z.number().int().min(1).nullable(),
  sort_order: z.number().int().min(1).nullable(),
});

export const projectIdSchema = z.string().uuid("Project id is invalid.");

export const imageFileSchema = z
  .custom(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose an image file.",
  )
  .refine((file) => file.size > 0, "Choose an image file.")
  .refine((file) => file.size <= 4 * 1024 * 1024, "Images must be 4 MB or smaller.")
  .refine((file) => file.type.startsWith("image/"), "Only image files are supported.");

function formString(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formBoolean(formData, name) {
  const value = formData.get(name);
  return value === "true" || value === "on" || value === "1";
}

function formNumber(formData, name, nullable = false) {
  const value = formString(formData, name);
  if (nullable && value === "") {
    return null;
  }
  return Number(value || 0);
}

export function parseProjectForm(formData) {
  const result = projectPayloadSchema.safeParse({
    slug: formString(formData, "slug"),
    name: formString(formData, "name"),
    category: formString(formData, "category"),
    description_ro: formString(formData, "description_ro"),
    description_en: formString(formData, "description_en"),
    image_url: formString(formData, "image_url"),
    project_url: formString(formData, "project_url"),
    github_url: formString(formData, "github_url"),
    is_published: formBoolean(formData, "is_published"),
    is_featured: formBoolean(formData, "is_featured"),
    featured_order: formNumber(formData, "featured_order", true),
    sort_order: formNumber(formData, "sort_order", true),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid project data." };
  }

  return {
    success: true,
    data: {
      ...result.data,
      featured_order: result.data.is_featured
        ? result.data.featured_order
        : null,
    },
  };
}

export function parseImageFile(formData) {
  const file = formData.get("image_file");
  if (typeof File === "undefined" || !(file instanceof File) || file.size === 0) {
    return { success: true, file: null };
  }

  const result = imageFileSchema.safeParse(file);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid image file." };
  }

  return { success: true, file };
}
