import { z } from "zod";
import { isLocalImagePath, isPublicStorageUrl } from "@/lib/media/storage-url";
import { SITE_IMAGE_BUCKET, SITE_IMAGE_KEYS } from "./constants";

export const siteImageKeySchema = z.enum(SITE_IMAGE_KEYS, {
  message: "Unknown site image.",
});

const siteImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === "" ||
      isLocalImagePath(value) ||
      isPublicStorageUrl(value, [SITE_IMAGE_BUCKET]),
    "Image URL must be a public Supabase site-images URL or a local path.",
  );

export const siteImagePayloadSchema = z.object({
  key: siteImageKeySchema,
  image_url: siteImageUrlSchema,
  alt_ro: z.string().trim().max(300),
  alt_en: z.string().trim().max(300),
});

function formString(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function parseSiteImageForm(formData) {
  const result = siteImagePayloadSchema.safeParse({
    key: formString(formData, "key"),
    image_url: formString(formData, "image_url"),
    alt_ro: formString(formData, "alt_ro"),
    alt_en: formString(formData, "alt_en"),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid site image data.",
    };
  }

  return { success: true, data: result.data };
}
