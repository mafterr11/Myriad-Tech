import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Category slug is required.")
  .max(80)
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Category slug must use lowercase letters, numbers, and hyphens.",
  );

export const projectCategoryPayloadSchema = z.object({
  slug: slugSchema,
  label_ro: z.string().trim().min(1, "The Romanian name is required.").max(120),
  label_en: z.string().trim().min(1, "The English name is required.").max(120),
});

// An edit keeps its original slug unless a new one is supplied, so renaming is
// opt-in and a label-only edit cannot move a category out from under its
// projects by accident.
export const projectCategoryUpdateSchema = projectCategoryPayloadSchema.extend({
  next_slug: z.union([slugSchema, z.literal("")]),
});

export const projectCategorySlugSchema = slugSchema;

function formString(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function firstIssue(result, fallback) {
  return result.error.issues[0]?.message ?? fallback;
}

export function parseProjectCategoryForm(formData) {
  const result = projectCategoryPayloadSchema.safeParse({
    slug: formString(formData, "slug"),
    label_ro: formString(formData, "label_ro"),
    label_en: formString(formData, "label_en"),
  });

  if (!result.success) {
    return { success: false, error: firstIssue(result, "Invalid category.") };
  }

  return { success: true, data: result.data };
}

export function parseProjectCategoryUpdateForm(formData) {
  const result = projectCategoryUpdateSchema.safeParse({
    slug: formString(formData, "slug"),
    next_slug: formString(formData, "next_slug"),
    label_ro: formString(formData, "label_ro"),
    label_en: formString(formData, "label_en"),
  });

  if (!result.success) {
    return { success: false, error: firstIssue(result, "Invalid category.") };
  }

  return { success: true, data: result.data };
}

// A move is a single step, so the offset is a closed set rather than a number
// the client can widen.
export function parseCategoryReorderOffset(value) {
  if (value === "-1") return -1;
  if (value === "1") return 1;
  return null;
}
