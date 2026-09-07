"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminClient } from "@/lib/admin/auth";
import {
  PROJECTS_CACHE_TAG,
  PUBLIC_PROJECT_PATHS,
} from "@/lib/projects/constants";
import { PROJECT_CATEGORIES_CACHE_TAG } from "./constants";
import {
  parseCategoryReorderOffset,
  parseProjectCategoryForm,
  parseProjectCategoryUpdateForm,
  projectCategorySlugSchema,
} from "./validation";

const initialError = "The requested category action could not be completed.";

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

// A category change renames the tabs and can re-point projects through the
// foreign key cascade, so both caches are dropped, not just the category one.
function revalidateCategoryPages() {
  revalidateTag(PROJECT_CATEGORIES_CACHE_TAG);
  revalidateTag(PROJECTS_CACHE_TAG);
  PUBLIC_PROJECT_PATHS.forEach((path) => revalidatePath(path));
  revalidatePath("/ro/admin");
  revalidatePath("/en/admin");
}

function parseSlug(formData, name = "slug") {
  const result = projectCategorySlugSchema.safeParse(getString(formData, name));
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Category slug is invalid.",
    };
  }
  return { success: true, slug: result.data };
}

export async function createProjectCategory(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const category = parseProjectCategoryForm(formData);
    if (!category.success) {
      return failure(category.error);
    }

    const { error } = await supabase.rpc("create_project_category", {
      p_slug: category.data.slug,
      p_label_ro: category.data.label_ro,
      p_label_en: category.data.label_en,
    });

    if (error) {
      throw new Error(`Category could not be created: ${error.message}`);
    }

    revalidateCategoryPages();
    return success("Category created.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateProjectCategory(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const category = parseProjectCategoryUpdateForm(formData);
    if (!category.success) {
      return failure(category.error);
    }

    const { data: updated, error } = await supabase.rpc(
      "update_project_category",
      {
        p_slug: category.data.slug,
        p_next_slug: category.data.next_slug,
        p_label_ro: category.data.label_ro,
        p_label_en: category.data.label_en,
      },
    );

    if (error) {
      throw new Error(`Category could not be updated: ${error.message}`);
    }
    if (!updated) {
      throw new Error("Category could not be updated because it no longer exists.");
    }

    revalidateCategoryPages();
    return success("Category updated.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProjectCategory(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const slug = parseSlug(formData);
    if (!slug.success) {
      return failure(slug.error);
    }

    // The database refuses while any project still points at the category and
    // says how many, so that message is the one worth surfacing as-is.
    const { data: deleted, error } = await supabase.rpc(
      "delete_project_category",
      { p_slug: slug.slug },
    );

    if (error) {
      throw new Error(error.message);
    }
    if (!deleted) {
      throw new Error("Category could not be deleted because it no longer exists.");
    }

    revalidateCategoryPages();
    return success("Category deleted.");
  } catch (error) {
    return failure(error);
  }
}

export async function reorderProjectCategory(previousState, formData) {
  try {
    const supabase = await requireAdminClient();
    const slug = parseSlug(formData);
    if (!slug.success) {
      return failure(slug.error);
    }

    const offset = parseCategoryReorderOffset(getString(formData, "offset"));
    if (offset === null) {
      return failure("A category can only move one position at a time.");
    }

    const { data: moved, error } = await supabase.rpc(
      "reorder_project_category",
      { p_slug: slug.slug, p_offset: offset },
    );

    if (error) {
      throw new Error(`Category order could not be changed: ${error.message}`);
    }
    if (!moved) {
      throw new Error("Category order could not be changed because it no longer exists.");
    }

    revalidateCategoryPages();
    return success("Category order updated.");
  } catch (error) {
    return failure(error);
  }
}
