"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "./auth";
import {
  PROJECT_IMAGE_BUCKET,
  PUBLIC_PROJECT_PATHS,
} from "./constants";
import {
  parseImageFile,
  parseProjectForm,
  projectIdSchema,
} from "./validation";

const initialError = "The requested project action could not be completed.";

function success(message) {
  return { success: true, error: null, message };
}

function failure(error) {
  return {
    success: false,
    error: error?.message || String(error) || initialError,
    message: null,
  };
}

function getString(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData, name) {
  const value = getString(formData, name);
  return value === "true" || value === "on" || value === "1";
}

function revalidateProjectPages() {
  PUBLIC_PROJECT_PATHS.forEach((path) => revalidatePath(path));
  revalidatePath("/ro/admin");
  revalidatePath("/en/admin");
}

function safeFileName(name) {
  const extension = name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
  const stem = name
    .replace(/\.[^/.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 80);

  return `${stem || "project-image"}${extension}`;
}

async function uploadProjectImage(supabase, file) {
  const storagePath = `projects/${randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error("Image upload succeeded, but no public image URL was returned.");
  }

  return { path: storagePath, url: data.publicUrl };
}

async function removeProjectImage(supabase, path) {
  if (!path) {
    return;
  }

  await supabase.storage.from(PROJECT_IMAGE_BUCKET).remove([path]);
}

function storagePathFromPublicUrl(imageUrl) {
  if (typeof imageUrl !== "string") {
    return null;
  }

  const marker = `/storage/v1/object/public/${PROJECT_IMAGE_BUCKET}/`;
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

async function requireAdmin() {
  const context = await getAdminContext();
  if (!context.authorized) {
    throw new Error(context.error || "Admin authorization is required.");
  }
  return context.supabase;
}

export async function createProject(previousState, formData) {
  let uploadedPath = null;

  try {
    const supabase = await requireAdmin();
    const project = parseProjectForm(formData);
    if (!project.success) {
      return failure(project.error);
    }

    const image = parseImageFile(formData);
    if (!image.success) {
      return failure(image.error);
    }

    let imageUrl = project.data.image_url;
    if (image.file) {
      const uploaded = await uploadProjectImage(supabase, image.file);
      uploadedPath = uploaded.path;
      imageUrl = uploaded.url;
    }

    if (!imageUrl) {
      return failure("Add an image URL or choose an image file.");
    }

    const { error } = await supabase.from("projects").insert({
      ...project.data,
      image_url: imageUrl,
    });

    if (error) {
      throw new Error(`Project could not be created: ${error.message}`);
    }

    revalidateProjectPages();
    return success("Project created.");
  } catch (error) {
    if (uploadedPath) {
      try {
        const supabase = await requireAdmin();
        await removeProjectImage(supabase, uploadedPath);
      } catch {
        // Keep the original action error; an orphaned object can be removed from Storage later.
      }
    }
    return failure(error);
  }
}

export async function updateProject(previousState, formData) {
  let uploadedPath = null;

  try {
    const supabase = await requireAdmin();
    const idResult = projectIdSchema.safeParse(getString(formData, "id"));
    if (!idResult.success) {
      return failure(idResult.error.issues[0]?.message ?? "Project id is invalid.");
    }

    const project = parseProjectForm(formData);
    if (!project.success) {
      return failure(project.error);
    }

    const image = parseImageFile(formData);
    if (!image.success) {
      return failure(image.error);
    }

    const { data: existing, error: existingError } = await supabase
      .from("projects")
      .select("image_url")
      .eq("id", idResult.data)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Project could not be loaded: ${existingError.message}`);
    }

    let imageUrl = project.data.image_url || existing?.image_url || "";
    if (image.file) {
      const uploaded = await uploadProjectImage(supabase, image.file);
      uploadedPath = uploaded.path;
      imageUrl = uploaded.url;
    }

    if (!imageUrl) {
      return failure("Add an image URL or choose an image file.");
    }

    const { data: updated, error } = await supabase
      .from("projects")
      .update({
        ...project.data,
        image_url: imageUrl,
      })
      .eq("id", idResult.data)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`Project could not be updated: ${error.message}`);
    }
    if (!updated) {
      throw new Error("Project could not be updated because it no longer exists.");
    }

    if (uploadedPath) {
      await removeProjectImage(
        supabase,
        storagePathFromPublicUrl(existing?.image_url),
      );
    }

    revalidateProjectPages();
    return success("Project updated.");
  } catch (error) {
    if (uploadedPath) {
      try {
        const supabase = await requireAdmin();
        await removeProjectImage(supabase, uploadedPath);
      } catch {
        // Keep the original action error; an orphaned object can be removed from Storage later.
      }
    }
    return failure(error);
  }
}

export async function toggleProjectPublished(previousState, formData) {
  try {
    const supabase = await requireAdmin();
    const idResult = projectIdSchema.safeParse(getString(formData, "id"));
    if (!idResult.success) {
      return failure(idResult.error.issues[0]?.message ?? "Project id is invalid.");
    }

    const { data: updated, error } = await supabase
      .from("projects")
      .update({ is_published: !getBoolean(formData, "is_published") })
      .eq("id", idResult.data)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`Project visibility could not be changed: ${error.message}`);
    }
    if (!updated) {
      throw new Error("Project visibility could not be changed because it no longer exists.");
    }

    revalidateProjectPages();
    return success("Project visibility updated.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProject(previousState, formData) {
  try {
    const supabase = await requireAdmin();
    const idResult = projectIdSchema.safeParse(getString(formData, "id"));
    if (!idResult.success) {
      return failure(idResult.error.issues[0]?.message ?? "Project id is invalid.");
    }

    const { data: existing, error: existingError } = await supabase
      .from("projects")
      .select("image_url")
      .eq("id", idResult.data)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Project could not be loaded: ${existingError.message}`);
    }

    const { data: deleted, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", idResult.data)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`Project could not be deleted: ${error.message}`);
    }
    if (!deleted) {
      throw new Error("Project could not be deleted because it no longer exists.");
    }

    await removeProjectImage(
      supabase,
      storagePathFromPublicUrl(existing?.image_url),
    );
    revalidateProjectPages();
    return success("Project deleted.");
  } catch (error) {
    return failure(error);
  }
}
