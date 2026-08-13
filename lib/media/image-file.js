import { z } from "zod";
import { MAX_IMAGE_BYTES } from "./storage-url";

export const imageFileSchema = z
  .custom(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose an image file.",
  )
  .refine((file) => file.size > 0, "Choose an image file.")
  .refine((file) => file.size <= MAX_IMAGE_BYTES, "Images must be 4 MB or smaller.")
  .refine((file) => file.type.startsWith("image/"), "Only image files are supported.");

// An empty file input is a valid "keep the current image" submission, so it
// resolves successfully with a null file rather than as a validation error.
export function parseImageFile(formData, field = "image_file") {
  const file = formData.get(field);
  if (typeof File === "undefined" || !(file instanceof File) || file.size === 0) {
    return { success: true, file: null };
  }

  const result = imageFileSchema.safeParse(file);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid image file.",
    };
  }

  return { success: true, file };
}
