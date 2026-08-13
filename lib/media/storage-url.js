// Pure helpers shared by the project and site-image admin flows. This module is
// safe to import from client components: it has no server-only dependencies.

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function isLocalImagePath(value) {
  return (
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
  );
}

export function isPublicStorageUrl(value, buckets) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
      return false;
    }

    if (url.search !== "" || url.hash !== "") {
      return false;
    }

    return buckets.some((bucket) =>
      url.pathname.startsWith(`/storage/v1/object/public/${bucket}/`),
    );
  } catch {
    return false;
  }
}

export function storagePathFromPublicUrl(imageUrl, bucket) {
  if (typeof imageUrl !== "string") {
    return null;
  }

  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  try {
    return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export function safeFileName(name) {
  const extension = name.includes(".")
    ? `.${name.split(".").pop().toLowerCase()}`
    : "";
  const stem = name
    .replace(/\.[^/.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 80);

  return `${stem || "image"}${extension}`;
}
