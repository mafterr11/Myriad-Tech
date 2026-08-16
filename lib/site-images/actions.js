"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminClient } from "@/lib/admin/auth";
import { parseImageFile } from "@/lib/media/image-file";
import { removeStoredImage, uploadImage } from "@/lib/media/storage";
import { storagePathFromPublicUrl } from "@/lib/media/storage-url";
import {
  SITE_IMAGES_CACHE_TAG,
  SITE_IMAGE_BUCKET,
  SITE_IMAGE_DEFAULTS,
  SITE_IMAGE_PATHS,
} from "./constants";
import { parseSiteImageForm, siteImageKeySchema } from "./validation";

function success(message) {
  return { success: true, error: null, message };
}

function failure(error) {
  return {
    success: false,
    error:
      error?.message ||
      String(error) ||
      "The site image could not be updated.",
    message: null,
  };
}

function revalidateSiteImagePages() {
  revalidateTag(SITE_IMAGES_CACHE_TAG);
  SITE_IMAGE_PATHS.forEach((path) => revalidatePath(path));
  revalidatePath("/ro/admin");
  revalidatePath("/en/admin");
}

async function currentImageUrl(supabase, key) {
  const { data, error } = await supabase
    .from("site_images")
    .select("image_url")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw new Error(`The site image could not be loaded: ${error.message}`);
  }

  return data?.image_url ?? "";
}

// Mirrors the project cleanup: the replaced object only goes away when the
// other site image is not pointing at it too.
async function removeUnusedSiteImage(supabase, key, previousUrl, nextUrl) {
  if (!previousUrl || previousUrl === nextUrl) {
    return;
  }

  const path = storagePathFromPublicUrl(previousUrl, SITE_IMAGE_BUCKET);
  if (!path) {
    return;
  }

  const { data, error } = await supabase
    .from("site_images")
    .select("key")
    .eq("image_url", previousUrl)
    .neq("key", key)
    .limit(1);

  if (error || (data?.length ?? 0) > 0) {
    return;
  }

  await removeStoredImage(supabase, SITE_IMAGE_BUCKET, path);
}

export async function updateSiteImage(previousState, formData) {
  let uploadedPath = null;

  try {
    const supabase = await requireAdminClient();
    const parsed = parseSiteImageForm(formData);
    if (!parsed.success) {
      return failure(parsed.error);
    }

    const image = parseImageFile(formData);
    if (!image.success) {
      return failure(image.error);
    }

    const existingUrl = await currentImageUrl(supabase, parsed.data.key);
    let imageUrl = parsed.data.image_url || existingUrl;

    if (image.file) {
      const uploaded = await uploadImage(
        supabase,
        SITE_IMAGE_BUCKET,
        parsed.data.key,
        image.file,
      );
      uploadedPath = uploaded.path;
      imageUrl = uploaded.url;
    }

    if (!imageUrl) {
      return failure("Add an image URL or choose an image file.");
    }

    const { error } = await supabase.rpc("upsert_site_image", {
      p_key: parsed.data.key,
      p_image_url: imageUrl,
      p_alt_ro: parsed.data.alt_ro,
      p_alt_en: parsed.data.alt_en,
    });

    if (error) {
      throw new Error(`The site image could not be saved: ${error.message}`);
    }

    // The previous upload is only removed once the new URL is committed.
    await removeUnusedSiteImage(
      supabase,
      parsed.data.key,
      existingUrl,
      imageUrl,
    );

    revalidateSiteImagePages();
    return success("Site image updated.");
  } catch (error) {
    if (uploadedPath) {
      try {
        const supabase = await requireAdminClient();
        await removeStoredImage(supabase, SITE_IMAGE_BUCKET, uploadedPath);
      } catch {
        // Keep the original action error; an orphaned object can be removed from Storage later.
      }
    }
    return failure(error);
  }
}

export async function resetSiteImage(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const rawKey = formData.get("key");
    const keyResult = siteImageKeySchema.safeParse(
      typeof rawKey === "string" ? rawKey.trim() : "",
    );

    if (!keyResult.success) {
      return failure(keyResult.error.issues[0]?.message ?? "Unknown site image.");
    }

    const defaults = SITE_IMAGE_DEFAULTS[keyResult.data];
    const existingUrl = await currentImageUrl(supabase, keyResult.data);

    const { error } = await supabase.rpc("upsert_site_image", {
      p_key: defaults.key,
      p_image_url: defaults.image_url,
      p_alt_ro: defaults.alt_ro,
      p_alt_en: defaults.alt_en,
    });

    if (error) {
      throw new Error(`The site image could not be restored: ${error.message}`);
    }

    await removeUnusedSiteImage(
      supabase,
      defaults.key,
      existingUrl,
      defaults.image_url,
    );

    revalidateSiteImagePages();
    return success("Site image restored to the default.");
  } catch (error) {
    return failure(error);
  }
}
