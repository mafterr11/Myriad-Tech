"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/auth";
import { parseImageFile } from "@/lib/media/image-file";
import { removeStoredImage, uploadImage } from "@/lib/media/storage";
import { storagePathFromPublicUrl } from "@/lib/media/storage-url";
import {
  PROJECT_IMAGE_BUCKET,
  PUBLIC_PROJECT_PATHS,
} from "./constants";
import {
  parseProjectForm,
  parseReorderOffset,
  projectIdSchema,
  reorderScopeSchema,
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

function parseProjectId(formData) {
  const result = projectIdSchema.safeParse(getString(formData, "id"));
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Project id is invalid.",
    };
  }
  return { success: true, id: result.data };
}

// Deletes the Storage object a project no longer uses, but only once no other
// project points at the same URL. Anything uncertain leaves the object in
// place: an orphaned upload is cheaper than a broken image on a live project.
async function removeUnusedProjectImage(supabase, previousUrl, nextUrl, keepId) {
  if (!previousUrl || previousUrl === nextUrl) {
    return;
  }

  const path = storagePathFromPublicUrl(previousUrl, PROJECT_IMAGE_BUCKET);
  if (!path) {
    return;
  }

  let query = supabase
    .from("projects")
    .select("id")
    .eq("image_url", previousUrl)
    .limit(1);

  if (keepId) {
    query = query.neq("id", keepId);
  }

  const { data, error } = await query;
  if (error || (data?.length ?? 0) > 0) {
    return;
  }

  await removeStoredImage(supabase, PROJECT_IMAGE_BUCKET, path);
}

function projectRpcParameters(project, imageUrl) {
  return {
    p_slug: project.slug,
    p_name: project.name,
    p_category: project.category,
    p_description_ro: project.description_ro,
    p_description_en: project.description_en,
    p_image_url: imageUrl,
    p_project_url: project.project_url,
    p_github_url: project.github_url,
    p_is_published: project.is_published,
    p_is_featured: project.is_featured,
    p_featured_order: project.featured_order,
    p_sort_order: project.sort_order,
  };
}

export async function createProject(previousState, formData) {
  let uploadedPath = null;

  try {
    const supabase = await requireAdminClient();
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
      const uploaded = await uploadImage(
        supabase,
        PROJECT_IMAGE_BUCKET,
        "projects",
        image.file,
      );
      uploadedPath = uploaded.path;
      imageUrl = uploaded.url;
    }

    if (!imageUrl) {
      return failure("Add an image URL or choose an image file.");
    }

    const { error } = await supabase.rpc(
      "create_project_with_ordering",
      projectRpcParameters(project.data, imageUrl),
    );

    if (error) {
      throw new Error(`Project could not be created: ${error.message}`);
    }

    revalidateProjectPages();
    return success("Project created.");
  } catch (error) {
    if (uploadedPath) {
      try {
        const supabase = await requireAdminClient();
        await removeStoredImage(supabase, PROJECT_IMAGE_BUCKET, uploadedPath);
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
    const supabase = await requireAdminClient();
    const id = parseProjectId(formData);
    if (!id.success) {
      return failure(id.error);
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
      .eq("id", id.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Project could not be loaded: ${existingError.message}`);
    }

    let imageUrl = project.data.image_url || existing?.image_url || "";
    if (image.file) {
      const uploaded = await uploadImage(
        supabase,
        PROJECT_IMAGE_BUCKET,
        "projects",
        image.file,
      );
      uploadedPath = uploaded.path;
      imageUrl = uploaded.url;
    }

    if (!imageUrl) {
      return failure("Add an image URL or choose an image file.");
    }

    const { data: updated, error } = await supabase.rpc(
      "update_project_with_ordering",
      {
        p_id: id.id,
        ...projectRpcParameters(project.data, imageUrl),
      },
    );

    if (error) {
      throw new Error(`Project could not be updated: ${error.message}`);
    }
    if (!updated) {
      throw new Error("Project could not be updated because it no longer exists.");
    }

    // Covers both a fresh upload and an image URL the admin replaced by hand.
    await removeUnusedProjectImage(
      supabase,
      existing?.image_url,
      imageUrl,
      id.id,
    );

    revalidateProjectPages();
    return success("Project updated.");
  } catch (error) {
    if (uploadedPath) {
      try {
        const supabase = await requireAdminClient();
        await removeStoredImage(supabase, PROJECT_IMAGE_BUCKET, uploadedPath);
      } catch {
        // Keep the original action error; an orphaned object can be removed from Storage later.
      }
    }
    return failure(error);
  }
}

export async function toggleProjectPublished(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const id = parseProjectId(formData);
    if (!id.success) {
      return failure(id.error);
    }

    const { data: updated, error } = await supabase.rpc(
      "toggle_project_published",
      {
        p_id: id.id,
        p_is_published: !getBoolean(formData, "is_published"),
      },
    );

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

export async function reorderProject(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const id = parseProjectId(formData);
    if (!id.success) {
      return failure(id.error);
    }

    const scope = reorderScopeSchema.safeParse(getString(formData, "scope"));
    if (!scope.success) {
      return failure(scope.error.issues[0]?.message ?? "Unknown ordering scope.");
    }

    const offset = parseReorderOffset(getString(formData, "offset"));
    if (offset === null) {
      return failure("A project can only move one position at a time.");
    }

    const { data: moved, error } = await supabase.rpc("reorder_project", {
      p_id: id.id,
      p_scope: scope.data,
      p_offset: offset,
    });

    if (error) {
      throw new Error(`Project order could not be changed: ${error.message}`);
    }
    if (!moved) {
      throw new Error("Project order could not be changed because it no longer exists.");
    }

    revalidateProjectPages();
    return success("Project order updated.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProject(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const id = parseProjectId(formData);
    if (!id.success) {
      return failure(id.error);
    }

    const { data: existing, error: existingError } = await supabase
      .from("projects")
      .select("image_url")
      .eq("id", id.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Project could not be loaded: ${existingError.message}`);
    }

    const { data: deleted, error } = await supabase.rpc(
      "delete_project_with_ordering",
      { p_id: id.id },
    );

    if (error) {
      throw new Error(`Project could not be deleted: ${error.message}`);
    }
    if (!deleted) {
      throw new Error("Project could not be deleted because it no longer exists.");
    }

    // The row is gone, so any remaining match belongs to a different project.
    await removeUnusedProjectImage(supabase, existing?.image_url, null, null);
    revalidateProjectPages();
    return success("Project deleted.");
  } catch (error) {
    return failure(error);
  }
}
