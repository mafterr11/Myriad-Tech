import { randomUUID } from "node:crypto";
import { safeFileName } from "./storage-url";

export async function uploadImage(supabase, bucket, prefix, file) {
  const storagePath = `${prefix}/${randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error("Image upload succeeded, but no public image URL was returned.");
  }

  return { path: storagePath, url: data.publicUrl };
}

export async function removeStoredImage(supabase, bucket, path) {
  if (!path) {
    return;
  }

  await supabase.storage.from(bucket).remove([path]);
}
