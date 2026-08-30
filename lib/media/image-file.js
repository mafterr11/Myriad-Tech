import { z } from "zod";
import { MAX_IMAGE_BYTES } from "./storage-url.js";

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const imageFileSchema = z
  .custom(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Choose an image file.",
  )
  .refine((file) => file.size > 0, "Choose an image file.")
  .refine(
    (file) => file.size <= MAX_IMAGE_BYTES,
    "Images must be 4 MB or smaller.",
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.has(file.type),
    "Only JPEG, PNG, WebP, or AVIF image files are supported.",
  );

function hasBytes(bytes, expected, offset = 0) {
  return expected.every((byte, index) => bytes[offset + index] === byte);
}

function ascii(bytes, offset, length) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function hasAvifSignature(bytes) {
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== "ftyp") {
    return false;
  }

  const declaredSize =
    (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  let boxEnd = declaredSize === 0 ? bytes.length : declaredSize >>> 0;

  if (declaredSize === 1) {
    if (bytes.length < 24) {
      return false;
    }

    const largeSizeHigh =
      bytes[8] * 0x1000000 + bytes[9] * 0x10000 + bytes[10] * 0x100 + bytes[11];
    const largeSizeLow =
      bytes[12] * 0x1000000 +
      bytes[13] * 0x10000 +
      bytes[14] * 0x100 +
      bytes[15];

    if (largeSizeHigh !== 0) {
      return false;
    }

    boxEnd = largeSizeLow;
  }

  if (boxEnd < 16 || boxEnd > bytes.length) {
    return false;
  }

  if (ascii(bytes, 8, 4) === "avif" || ascii(bytes, 8, 4) === "avis") {
    return true;
  }

  for (let offset = 16; offset + 4 <= boxEnd; offset += 4) {
    const brand = ascii(bytes, offset, 4);
    if (brand === "avif" || brand === "avis") {
      return true;
    }
  }

  return false;
}

function matchesDeclaredType(bytes, type) {
  switch (type) {
    case "image/jpeg":
      return hasBytes(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return (
        hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      );
    case "image/avif":
      return hasAvifSignature(bytes);
    default:
      return false;
  }
}

// An empty file input is a valid "keep the current image" submission, so it
// resolves successfully with a null file rather than as a validation error.
export async function parseImageFile(formData, field = "image_file") {
  const file = formData.get(field);
  if (
    typeof File === "undefined" ||
    !(file instanceof File) ||
    file.size === 0
  ) {
    return { success: true, file: null };
  }

  const result = imageFileSchema.safeParse(file);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid image file.",
    };
  }

  let bytes;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return {
      success: false,
      error: "The image file could not be validated.",
    };
  }

  if (!matchesDeclaredType(bytes, file.type)) {
    return {
      success: false,
      error: "The image file content does not match its declared type.",
    };
  }

  return { success: true, file };
}
