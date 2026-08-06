"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/app/auth/actions";
import {
  createProject,
  deleteProject,
  toggleProjectPublished,
  updateProject,
} from "@/lib/projects/actions";

const emptyProject = {
  slug: "",
  name: "",
  category: "presentation",
  description_ro: "",
  description_en: "",
  image_url: "",
  project_url: "",
  github_url: "",
  is_published: false,
  is_featured: false,
  featured_order: null,
  sort_order: 0,
};

const categories = ["presentation", "progress", "shop", "wordpress", "others"];
const initialActionState = { success: false, error: null, message: null };

function ActionFeedback({ state }) {
  if (!state?.error && !state?.message) {
    return null;
  }

  return (
    <p
      role={state.error ? "alert" : "status"}
      className={state.error ? "text-sm text-red-700" : "text-sm text-green-700"}
    >
      {state.error || state.message}
    </p>
  );
}

function ProjectForm({ project, locale, onCancel, onSaved }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const action = project.id ? updateProject : createProject;
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    router.refresh();
    onSaved();
  }, [onSaved, router, state.success]);

  return (
    <form
      action={formAction}
      className="border border-line bg-white/70 p-5 sm:p-7"
    >
      {project.id ? <input type="hidden" name="id" value={project.id} /> : null}
      <input type="hidden" name="locale" value={locale} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="section-kicker">Portfolio / CMS</span>
          <h2 className="mt-2 text-2xl">{project.id ? t("editProject") : t("newProject")}</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="project-slug">{t("slug")}</Label>
          <Input
            id="project-slug"
            name="slug"
            defaultValue={project.slug}
            placeholder="my-project"
            required
          />
        </div>
        <div>
          <Label htmlFor="project-name">{t("name")}</Label>
          <Input id="project-name" name="name" defaultValue={project.name} required />
        </div>
        <div>
          <Label htmlFor="project-category">{t("category")}</Label>
          <select
            id="project-category"
            name="category"
            defaultValue={project.category || "presentation"}
            className="mt-1 flex h-[54px] w-full rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-base"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {t(`categoryOptions.${category}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="project-url">{t("projectUrl")}</Label>
          <Input
            id="project-url"
            name="project_url"
            type="url"
            defaultValue={project.project_url || ""}
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="project-description-ro">{t("descriptionRo")}</Label>
          <Textarea
            id="project-description-ro"
            name="description_ro"
            defaultValue={project.description_ro}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="project-description-en">{t("descriptionEn")}</Label>
          <Textarea
            id="project-description-en"
            name="description_en"
            defaultValue={project.description_en}
            required
          />
        </div>
        <div>
          <Label htmlFor="project-image-url">{t("imageUrl")}</Label>
          <Input
            id="project-image-url"
            name="image_url"
            type="text"
            defaultValue={project.image_url || ""}
            placeholder="https://... or /work/example.png"
          />
        </div>
        <div>
          <Label htmlFor="project-image-file">{t("imageFile")}</Label>
          <Input id="project-image-file" name="image_file" type="file" accept="image/*" />
        </div>
        <p className="text-sm text-black/55 md:col-span-2">{t("imageHint")}</p>
        <div>
          <Label htmlFor="project-github-url">{t("githubUrl")}</Label>
          <Input
            id="project-github-url"
            name="github_url"
            type="url"
            defaultValue={project.github_url || ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project-sort-order">{t("sortOrder")}</Label>
            <Input
              id="project-sort-order"
              name="sort_order"
              type="number"
              min="0"
              defaultValue={project.sort_order ?? 0}
            />
          </div>
          <div>
            <Label htmlFor="project-featured-order">{t("featuredOrder")}</Label>
            <Input
              id="project-featured-order"
              name="featured_order"
              type="number"
              min="0"
              defaultValue={project.featured_order ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-6 border-t border-line pt-5">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_published"
            value="true"
            defaultChecked={project.is_published}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          {t("published")}
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_featured"
            value="true"
            defaultChecked={project.is_featured}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          {t("featured")}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "..." : project.id ? t("saveChanges") : t("createProject")}
        </Button>
        <ActionFeedback state={state} />
      </div>
    </form>
  );
}

function ProjectActionForm({ action, fields, children, confirmMessage }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      {fields}
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {children}
      </Button>
      {state.error ? <ActionFeedback state={state} /> : null}
    </form>
  );
}

export default function AdminPanel({ locale, projects = [], error }) {
  const t = useTranslations("Admin");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const editingProject = projects.find((project) => project.id === editingProjectId);
  const editorProject = editingProjectId === "new" ? emptyProject : editingProject;

  return (
    <div className="min-h-screen pb-24 pt-36 sm:pt-44">
      <div className="container">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
          <div>
            <span className="section-kicker">Myriad Tech / Admin</span>
            <h1 className="mt-4 max-w-3xl">{t("title")}</h1>
            <p className="section-copy mt-5 max-w-2xl">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => setEditingProjectId("new")}>
              {t("newProject")}
            </Button>
            <form action={signOut}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" variant="secondary">
                {t("logout")}
              </Button>
            </form>
          </div>
        </div>

        {editorProject ? (
          <div className="mb-10">
            <ProjectForm
              key={editorProject.id || "new"}
              project={editorProject}
              locale={locale}
              onCancel={() => setEditingProjectId(null)}
              onSaved={() => setEditingProjectId(null)}
            />
          </div>
        ) : null}

        {error ? (
          <div className="border border-red-200 bg-red-50 px-6 py-10 text-red-800">
            {t("loadError")}
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-line bg-white/50 px-6 py-10 text-black/60">
            {t("empty")}
          </div>
        ) : (
          <div className="grid gap-5">
            {projects.map((project) => (
              <article
                key={project.id}
                className="grid gap-5 border border-line bg-white/65 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:p-5"
              >
                <div className="relative h-24 overflow-hidden bg-work sm:h-20">
                  <Image
                    src={project.image_url || "/project-bg-light.png"}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl">{project.name}</h2>
                    <span className="border border-line px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase">
                      {project.is_published ? t("statusPublished") : t("statusDraft")}
                    </span>
                    {project.is_featured ? (
                      <span className="border border-accent px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-accent uppercase">
                        {t("featured")} #{project.featured_order ?? "—"}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-black/60">
                    {project.slug} · {project.category} · {t("sortOrder")} #{project.sort_order}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingProjectId(project.id)}
                  >
                    {t("edit")}
                  </Button>
                  <ProjectActionForm
                    action={toggleProjectPublished}
                    fields={
                      <>
                        <input type="hidden" name="id" value={project.id} />
                        <input
                          type="hidden"
                          name="is_published"
                          value={project.is_published ? "true" : "false"}
                        />
                      </>
                    }
                  >
                    {project.is_published ? t("unpublish") : t("publish")}
                  </ProjectActionForm>
                  <ProjectActionForm
                    action={deleteProject}
                    confirmMessage={t("confirmDelete")}
                    fields={<input type="hidden" name="id" value={project.id} />}
                  >
                    {t("delete")}
                  </ProjectActionForm>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
