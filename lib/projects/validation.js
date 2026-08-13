import { z } from "zod";
import { isLocalImagePath, isPublicStorageUrl } from "@/lib/media/storage-url";
import { PROJECT_IMAGE_BUCKET } from "./constants";

const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === "" ||
      isLocalImagePath(value) ||
      isPublicStorageUrl(value, [PROJECT_IMAGE_BUCKET]),
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

export const reorderScopeSchema = z.enum(["page", "featured"], {
  message: "Unknown ordering scope.",
});

// A move is always a single step, so the offset is a closed set rather than a
// number the client can widen.
export function parseReorderOffset(value) {
  if (value === "-1") {
    return -1;
  }
  if (value === "1") {
    return 1;
  }
  return null;
}

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
