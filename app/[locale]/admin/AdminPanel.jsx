"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "@/app/auth/actions";
import { MAX_IMAGE_BYTES } from "@/lib/media/storage-url";
import { SITE_IMAGE_KEYS } from "@/lib/site-images/constants";
import {
  createProject,
  deleteProject,
  reorderProject,
  toggleProjectPublished,
  updateProject,
} from "@/lib/projects/actions";
import { resetSiteImage, updateSiteImage } from "@/lib/site-images/actions";

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
  sort_order: null,
};

const categories = ["presentation", "progress", "shop", "wordpress", "others"];
const statusFilters = ["all", "published", "draft", "featured"];
const initialActionState = { success: false, error: null, message: null };
const placeholderImage = "/project-bg-light.png";

function ActionFeedback({ state, className = "" }) {
  if (!state?.error && !state?.message) {
    return null;
  }

  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`${state.error ? "text-red-700" : "text-green-700"} text-sm ${className}`}
    >
      {state.error || state.message}
    </p>
  );
}

// `state` is compared by identity on purpose: each dispatch returns a fresh
// object, so repeating the same action still refreshes the server data.
function useRefreshOnSuccess(state, onSuccess) {
  const router = useRouter();

  useEffect(() => {
    if (!state.success) {
      return;
    }

    router.refresh();
    onSuccess?.();
  }, [onSuccess, router, state]);
}

function StatCard({ label, value }) {
  return (
    <div className="border border-line bg-white/65 px-4 py-3">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-[10px] font-bold tracking-[0.12em] text-black/55 uppercase">
        {label}
      </div>
    </div>
  );
}

function ImagePreview({ src, alt, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden border border-line bg-work ${className}`}
    >
      {/* A plain img keeps blob: previews of a freshly picked file working. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || placeholderImage}
        alt={alt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// Shared by every single-purpose form in the panel (publish, delete, reorder).
function ActionForm({
  action,
  fields,
  children,
  confirmMessage,
  disabled = false,
  title,
  variant = "ghost",
  size = "sm",
  showErrors = true,
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  useRefreshOnSuccess(state);

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
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={disabled || isPending}
        title={title}
      >
        {children}
      </Button>
      {showErrors && state.error ? <ActionFeedback state={state} /> : null}
    </form>
  );
}

function ReorderControls({ id, scope, label, canMoveUp, canMoveDown, disabled, hint }) {
  const t = useTranslations("Admin");

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-[10px] font-bold tracking-[0.12em] text-black/45 uppercase">
        {label}
      </span>
      <ActionForm
        action={reorderProject}
        size="icon"
        disabled={disabled || !canMoveUp}
        title={disabled ? hint : t("moveUp")}
        showErrors={false}
        fields={
          <>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="scope" value={scope} />
            <input type="hidden" name="offset" value="-1" />
          </>
        }
      >
        <ArrowUp size={16} aria-hidden="true" />
        <span className="sr-only">{t("moveUp")}</span>
      </ActionForm>
      <ActionForm
        action={reorderProject}
        size="icon"
        disabled={disabled || !canMoveDown}
        title={disabled ? hint : t("moveDown")}
        showErrors={false}
        fields={
          <>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="scope" value={scope} />
            <input type="hidden" name="offset" value="1" />
          </>
        }
      >
        <ArrowDown size={16} aria-hidden="true" />
        <span className="sr-only">{t("moveDown")}</span>
      </ActionForm>
    </div>
  );
}

function ProjectForm({
  project,
  locale,
  isNew,
  projectCount,
  featuredCount,
  onCancel,
  onSaved,
}) {
  const t = useTranslations("Admin");
  const [isFeatured, setIsFeatured] = useState(project.is_featured);
  const [imageUrl, setImageUrl] = useState(project.image_url || "");
  const [previewUrl, setPreviewUrl] = useState("");
  const [clientError, setClientError] = useState(null);
  const action = isNew ? createProject : updateProject;
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  useRefreshOnSuccess(state, onSaved);

  useEffect(() => {
    if (!previewUrl) {
      return undefined;
    }
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const pageOrderMax = isNew ? projectCount + 1 : projectCount;
  // Marking a project as featured adds a slot; unmarking it frees one, so the
  // ceiling follows the checkbox instead of the saved value.
  const featuredOrderMax =
    project.is_featured && isFeatured
      ? Math.max(featuredCount, 1)
      : featuredCount + 1;

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl("");
      setClientError(null);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setPreviewUrl("");
      setClientError(t("imageTooLarge"));
      return;
    }

    setClientError(null);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const file = event.currentTarget.elements.namedItem("image_file")
          ?.files?.[0];

        if (file && file.size > MAX_IMAGE_BYTES) {
          event.preventDefault();
          setClientError(t("imageTooLarge"));
          return;
        }

        setClientError(null);
      }}
      className="border border-line bg-white/70 p-5 sm:p-7"
    >
      {isNew ? null : <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="locale" value={locale} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="section-kicker">Portfolio / CMS</span>
          <h2 className="mt-2 text-2xl">
            {isNew ? t("newProject") : t("editProject")}
          </h2>
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

        <div className="grid gap-5 md:col-span-2 md:grid-cols-[10rem_1fr] md:items-start">
          <div>
            <span className="text-sm font-medium">{t("imagePreview")}</span>
            <ImagePreview
              src={previewUrl || imageUrl}
              alt=""
              className="mt-1 aspect-[4/3] w-full"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="project-image-url">{t("imageUrl")}</Label>
              <Input
                id="project-image-url"
                name="image_url"
                type="text"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://... or /work/example.png"
              />
            </div>
            <div>
              <Label htmlFor="project-image-file">{t("imageFile")}</Label>
              <Input
                id="project-image-file"
                name="image_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-sm text-black/55 sm:col-span-2">{t("imageHint")}</p>
          </div>
        </div>

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
              min="1"
              max={pageOrderMax}
              defaultValue={project.sort_order ?? pageOrderMax}
            />
          </div>
          <div>
            <Label htmlFor="project-featured-order">{t("featuredOrder")}</Label>
            <Input
              id="project-featured-order"
              name="featured_order"
              type="number"
              min="1"
              max={featuredOrderMax}
              defaultValue={project.featured_order ?? featuredOrderMax}
              disabled={!isFeatured}
            />
          </div>
        </div>
        <p className="text-sm text-black/55 md:col-span-2">{t("orderHint")}</p>
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
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          {t("featured")}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "..." : isNew ? t("createProject") : t("saveChanges")}
        </Button>
        <ActionFeedback state={clientError ? { error: clientError } : state} />
      </div>
    </form>
  );
}

function ProjectRow({
  project,
  pageIndex,
  projectCount,
  featuredIndex,
  featuredCount,
  reorderDisabled,
  reorderHint,
  onEdit,
}) {
  const t = useTranslations("Admin");

  return (
    <article className="grid gap-5 border border-line bg-white/65 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:p-5">
      <ImagePreview
        src={project.image_url}
        alt=""
        className="h-24 w-full sm:h-20"
      />
      <div className="min-w-0">
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
        <p className="mt-2 text-sm break-words text-black/60">
          {project.slug} · {project.category} · {t("sortOrder")} #{project.sort_order}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <ReorderControls
            id={project.id}
            scope="page"
            label={t("orderPage")}
            canMoveUp={pageIndex > 0}
            canMoveDown={pageIndex < projectCount - 1}
            disabled={reorderDisabled}
            hint={reorderHint}
          />
          {project.is_featured ? (
            <ReorderControls
              id={project.id}
              scope="featured"
              label={t("orderHome")}
              canMoveUp={featuredIndex > 0}
              canMoveDown={featuredIndex < featuredCount - 1}
              disabled={reorderDisabled}
              hint={reorderHint}
            />
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
          {t("edit")}
        </Button>
        <ActionForm
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
        </ActionForm>
        <ActionForm
          action={deleteProject}
          confirmMessage={t("confirmDelete")}
          fields={<input type="hidden" name="id" value={project.id} />}
        >
          {t("delete")}
        </ActionForm>
      </div>
    </article>
  );
}

function SiteImageCard({ imageKey, image }) {
  const t = useTranslations("Admin");
  const [imageUrl, setImageUrl] = useState(image.image_url || "");
  const [previewUrl, setPreviewUrl] = useState("");
  const [clientError, setClientError] = useState(null);
  const fileInputRef = useRef(null);
  const [state, formAction, isPending] = useActionState(
    updateSiteImage,
    initialActionState,
  );

  useRefreshOnSuccess(state);

  useEffect(() => {
    if (!previewUrl) {
      return undefined;
    }
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Server data wins after a save: show the stored URL and drop the consumed
  // file so a second save does not upload the same image again.
  useEffect(() => {
    setImageUrl(image.image_url || "");
    setPreviewUrl("");
    setClientError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [image.image_url]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl("");
      setClientError(null);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setPreviewUrl("");
      setClientError(t("imageTooLarge"));
      return;
    }

    setClientError(null);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="border border-line bg-white/70 p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="section-kicker">{t(`siteImages.${imageKey}.section`)}</span>
          <h3 className="mt-2 text-xl">{t(`siteImages.${imageKey}.title`)}</h3>
        </div>
        {image.is_default ? (
          <span className="border border-line px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-black/55 uppercase">
            {t("siteImages.defaultBadge")}
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:items-start">
        <ImagePreview
          src={previewUrl || imageUrl}
          alt=""
          className="aspect-[4/3] w-full"
        />

        {/* Remounting on saved values refills the alt fields after a save or reset. */}
        <form
          key={`${image.image_url}|${image.alt_ro}|${image.alt_en}`}
          action={formAction}
          className="grid gap-5"
        >
          <input type="hidden" name="key" value={imageKey} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor={`site-image-url-${imageKey}`}>{t("imageUrl")}</Label>
              <Input
                id={`site-image-url-${imageKey}`}
                name="image_url"
                type="text"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="/alexandru-maftei-hero.jpeg"
              />
            </div>
            <div>
              <Label htmlFor={`site-image-file-${imageKey}`}>{t("imageFile")}</Label>
              <Input
                ref={fileInputRef}
                id={`site-image-file-${imageKey}`}
                name="image_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <Label htmlFor={`site-image-alt-ro-${imageKey}`}>
                {t("siteImages.altRo")}
              </Label>
              <Input
                id={`site-image-alt-ro-${imageKey}`}
                name="alt_ro"
                type="text"
                maxLength={300}
                defaultValue={image.alt_ro}
              />
            </div>
            <div>
              <Label htmlFor={`site-image-alt-en-${imageKey}`}>
                {t("siteImages.altEn")}
              </Label>
              <Input
                id={`site-image-alt-en-${imageKey}`}
                name="alt_en"
                type="text"
                maxLength={300}
                defaultValue={image.alt_en}
              />
            </div>
          </div>

          <p className="text-sm text-black/55">{t("siteImages.hint")}</p>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "..." : t("saveChanges")}
            </Button>
            <ActionFeedback state={clientError ? { error: clientError } : state} />
          </div>
        </form>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <ActionForm
          action={resetSiteImage}
          confirmMessage={t("siteImages.confirmReset")}
          fields={<input type="hidden" name="key" value={imageKey} />}
        >
          {t("siteImages.reset")}
        </ActionForm>
      </div>
    </div>
  );
}

export default function AdminPanel({
  locale,
  projects = [],
  error,
  siteImages = {},
  siteImagesError,
}) {
  const t = useTranslations("Admin");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const featuredProjects = useMemo(
    () =>
      projects
        .filter((project) => project.is_featured)
        .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0)),
    [projects],
  );

  const featuredPositions = useMemo(
    () => new Map(featuredProjects.map((project, index) => [project.id, index])),
    [featuredProjects],
  );

  // Positions come from the full, server-ordered list so a filtered view still
  // knows which rows sit at the edges of each sequence.
  const pagePositions = useMemo(
    () => new Map(projects.map((project, index) => [project.id, index])),
    [projects],
  );

  const stats = useMemo(
    () => ({
      total: projects.length,
      published: projects.filter((project) => project.is_published).length,
      drafts: projects.filter((project) => !project.is_published).length,
      featured: featuredProjects.length,
    }),
    [featuredProjects.length, projects],
  );

  const isFiltered = query.trim() !== "" || status !== "all";

  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (status === "published" && !project.is_published) return false;
      if (status === "draft" && project.is_published) return false;
      if (status === "featured" && !project.is_featured) return false;
      if (!needle) return true;

      return [project.name, project.slug, project.category].some((value) =>
        String(value ?? "").toLowerCase().includes(needle),
      );
    });
  }, [projects, query, status]);

  const editingProject = projects.find(
    (project) => project.id === editingProjectId,
  );
  const isNew = editingProjectId === "new";
  const editorProject = isNew
    ? {
        ...emptyProject,
        sort_order: projects.length + 1,
        featured_order: featuredProjects.length + 1,
      }
    : editingProject;

  const closeEditor = useCallback(() => setEditingProjectId(null), []);

  return (
    <div className="min-h-screen pb-24 pt-36 sm:pt-44">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
          <div>
            <span className="section-kicker">Myriad Tech / Admin</span>
            <h1 className="mt-4 max-w-3xl">{t("title")}</h1>
            <p className="section-copy mt-5 max-w-2xl">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={Boolean(error)}
              onClick={() => setEditingProjectId("new")}
            >
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

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:w-fit">
            <TabsTrigger value="projects" className="sm:min-w-[12rem]">
              {t("tabs.projects")}
            </TabsTrigger>
            <TabsTrigger value="site-images" className="sm:min-w-[12rem]">
              {t("tabs.siteImages")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label={t("stats.total")} value={stats.total} />
              <StatCard label={t("stats.published")} value={stats.published} />
              <StatCard label={t("stats.drafts")} value={stats.drafts} />
              <StatCard label={t("stats.featured")} value={stats.featured} />
            </div>

            {editorProject ? (
              <div className="mb-10">
                <ProjectForm
                  key={editorProject.id || "new"}
                  project={editorProject}
                  locale={locale}
                  isNew={isNew}
                  projectCount={projects.length}
                  featuredCount={featuredProjects.length}
                  onCancel={closeEditor}
                  onSaved={closeEditor}
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
              <>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-black/40"
                    />
                    <Input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("searchPlaceholder")}
                      aria-label={t("searchPlaceholder")}
                      className="pl-11"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={status === value ? "default" : "secondary"}
                        onClick={() => setStatus(value)}
                        aria-pressed={status === value}
                      >
                        {t(`filters.${value}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                <p className="mb-4 text-sm text-black/55" role="status">
                  {t("resultCount", {
                    shown: visibleProjects.length,
                    total: projects.length,
                  })}
                </p>

                {visibleProjects.length === 0 ? (
                  <div className="border border-line bg-white/50 px-6 py-10 text-black/60">
                    {t("noMatches")}
                  </div>
                ) : (
                  <div className="grid gap-5">
                    {visibleProjects.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        pageIndex={pagePositions.get(project.id) ?? -1}
                        projectCount={projects.length}
                        featuredIndex={featuredPositions.get(project.id) ?? -1}
                        featuredCount={featuredProjects.length}
                        reorderDisabled={isFiltered}
                        reorderHint={t("reorderFilteredHint")}
                        onEdit={() => setEditingProjectId(project.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="site-images">
            <p className="section-copy mb-8 max-w-2xl">{t("siteImages.subtitle")}</p>
            {siteImagesError ? (
              <div className="mb-6 border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900">
                {t("siteImages.loadError")}
              </div>
            ) : null}
            <div className="grid gap-6">
              {SITE_IMAGE_KEYS.map((imageKey) =>
                siteImages[imageKey] ? (
                  <SiteImageCard
                    key={imageKey}
                    imageKey={imageKey}
                    image={siteImages[imageKey]}
                  />
                ) : null,
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
