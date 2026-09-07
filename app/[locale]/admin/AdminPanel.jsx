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
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Languages,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
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
import {
  createProjectCategory,
  deleteProjectCategory,
  reorderProjectCategory,
  updateProjectCategory,
} from "@/lib/categories/actions";
import { DEFAULT_PROJECT_CATEGORY } from "@/lib/categories/constants";
import { resetSiteImage, updateSiteImage } from "@/lib/site-images/actions";
import AdminOverview from "./AdminOverview";

const emptyProject = {
  slug: "",
  name: "",
  category: DEFAULT_PROJECT_CATEGORY,
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

const statusFilters = ["all", "published", "draft", "featured", "incomplete"];
const initialActionState = { success: false, error: null, message: null };
const placeholderImage = "/project-bg-light.png";
const acceptedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const acceptedImageTypesAttribute = acceptedImageTypes.join(",");

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

// Romanian labels carry diacritics; the slug is ASCII because it is what the
// database stores and what the slug format check accepts.
function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ș]/gi, "s")
    .replace(/[ț]/gi, "t")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

function categoryOptionLabel(category, locale) {
  const label = locale === "en" ? category?.label_en : category?.label_ro;
  return (typeof label === "string" && label.trim()) || category?.slug || "";
}

function hasCompleteTranslations(project) {
  return Boolean(
    project?.description_ro?.trim() && project?.description_en?.trim(),
  );
}

function formatAdminDate(value, locale) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    dateStyle: "medium",
  }).format(date);
}

function createCopySlug(sourceSlug, projects) {
  const usedSlugs = new Set(projects.map((project) => project.slug));
  const base = sourceSlug.slice(0, 110).replace(/-+$/, "");
  let candidate = `${base}-copy`;
  let copyNumber = 2;

  while (usedSlugs.has(candidate)) {
    const suffix = `-copy-${copyNumber}`;
    candidate = `${base.slice(0, 120 - suffix.length)}${suffix}`;
    copyNumber += 1;
  }

  return candidate;
}

function ImagePreview({ src, alt, className = "" }) {
  return (
    <div
      className={`border-line bg-work relative overflow-hidden border ${className}`}
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

function ReorderControls({
  id,
  scope,
  label,
  canMoveUp,
  canMoveDown,
  disabled,
  hint,
}) {
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
  categories,
  onCancel,
  onDirtyChange,
  onSaved,
}) {
  const t = useTranslations("Admin");
  const [isFeatured, setIsFeatured] = useState(project.is_featured);
  const [imageUrl, setImageUrl] = useState(project.image_url || "");
  const [previewUrl, setPreviewUrl] = useState("");
  const [clientError, setClientError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const action = isNew ? createProject : updateProject;
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  const handleSaved = useCallback(() => {
    setIsDirty(false);
    onSaved?.();
  }, [onSaved]);

  useRefreshOnSuccess(state, handleSaved);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return undefined;

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const guardClientNavigation = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      if (!window.confirm(t("confirmDiscard"))) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", guardClientNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", guardClientNavigation, true);
    };
  }, [isDirty, t]);

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

    if (!acceptedImageTypes.includes(file.type)) {
      event.target.value = "";
      setPreviewUrl("");
      setClientError(t("imageTypeInvalid"));
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

  function requestCancel() {
    if (!isDirty || window.confirm(t("confirmDiscard"))) {
      onCancel();
    }
  }

  return (
    <form
      action={formAction}
      onChangeCapture={() => setIsDirty(true)}
      onSubmit={(event) => {
        const file =
          event.currentTarget.elements.namedItem("image_file")?.files?.[0];
        const hasImageFile = Boolean(file?.size);

        if (file && file.size > MAX_IMAGE_BYTES) {
          event.preventDefault();
          setClientError(t("imageTooLarge"));
          return;
        }

        if (hasImageFile && !acceptedImageTypes.includes(file.type)) {
          event.preventDefault();
          setClientError(t("imageTypeInvalid"));
          return;
        }

        // A new project can be created before its final image is ready. The
        // first submit is stopped so cancelling never dispatches the server
        // action (and therefore cannot reset the form). After confirmation,
        // render the local placeholder into the controlled URL input and
        // submit again so FormData contains that explicit value.
        if (isNew && !hasImageFile && !imageUrl.trim()) {
          event.preventDefault();

          if (!window.confirm(t("confirmNoImage"))) return;

          const form = event.currentTarget;
          setClientError(null);
          setImageUrl(placeholderImage);
          window.setTimeout(() => form.requestSubmit(), 0);
          return;
        }

        setClientError(null);
      }}
      className="border-line border bg-white/70 p-5 sm:p-7"
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
        <Button type="button" variant="ghost" size="sm" onClick={requestCancel}>
          {t("cancel")}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border-line border-b pb-3 md:col-span-2">
          <h3 className="text-lg">{t("formSections.basic")}</h3>
          <p className="mt-1 text-sm text-black/55">
            {t("formSections.basicHint")}
          </p>
        </div>
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
          <Input
            id="project-name"
            name="name"
            defaultValue={project.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="project-category">{t("category")}</Label>
          {/* The category a project already has is always offered, even if it
              is not in the list any more, so opening an old project cannot
              silently re-file it under whichever category happens to be first. */}
          <select
            id="project-category"
            name="category"
            defaultValue={
              project.category || categories[0]?.slug || DEFAULT_PROJECT_CATEGORY
            }
            className="mt-1 flex h-[54px] w-full rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-base"
            required
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {categoryOptionLabel(category, locale)}
              </option>
            ))}
            {project.category &&
            !categories.some((item) => item.slug === project.category) ? (
              <option value={project.category}>{project.category}</option>
            ) : null}
          </select>
          {categories.length === 0 ? (
            <p className="mt-2 text-sm text-amber-800">
              {t("categories.noneHint")}
            </p>
          ) : null}
        </div>
        <div className="border-line border-b pt-3 pb-3 md:col-span-2">
          <h3 className="text-lg">{t("formSections.content")}</h3>
          <p className="mt-1 text-sm text-black/55">
            {t("formSections.contentHint")}
          </p>
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

        <div className="border-line border-b pt-3 pb-3 md:col-span-2">
          <h3 className="text-lg">{t("formSections.media")}</h3>
          <p className="mt-1 text-sm text-black/55">
            {t("formSections.mediaHint")}
          </p>
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
                accept={acceptedImageTypesAttribute}
                onChange={handleFileChange}
              />
            </div>
            <p className="text-sm text-black/55 sm:col-span-2">
              {t("imageHint")}
            </p>
          </div>
        </div>

        <div className="border-line border-b pt-3 pb-3 md:col-span-2">
          <h3 className="text-lg">{t("formSections.links")}</h3>
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
        <div>
          <Label htmlFor="project-github-url">{t("githubUrl")}</Label>
          <Input
            id="project-github-url"
            name="github_url"
            type="url"
            defaultValue={project.github_url || ""}
          />
        </div>
        <div className="border-line border-b pt-3 pb-3 md:col-span-2">
          <h3 className="text-lg">{t("formSections.publishing")}</h3>
          <p className="mt-1 text-sm text-black/55">
            {t("formSections.publishingHint")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2 md:max-w-xl">
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

      <div className="border-line mt-6 flex flex-wrap gap-6 border-t pt-5">
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

      <div className="border-line bg-body/95 sticky bottom-4 z-20 mt-6 flex flex-wrap items-center gap-4 border p-3 shadow-[0_12px_32px_rgba(27,26,23,0.14)] backdrop-blur-sm">
        <Button type="submit" disabled={isPending}>
          {isPending ? "..." : isNew ? t("createProject") : t("saveChanges")}
        </Button>
        {isDirty ? (
          <span className="text-sm font-medium text-amber-800" role="status">
            {t("unsavedChanges")}
          </span>
        ) : null}
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
  locale,
  onEdit,
  onDuplicate,
}) {
  const t = useTranslations("Admin");
  const translationsComplete = hasCompleteTranslations(project);

  return (
    <article className="border-line grid gap-5 border bg-white/65 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:p-5">
      <ImagePreview
        src={project.image_url}
        alt=""
        className="h-24 w-full sm:h-20"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl">{project.name}</h2>
          <span className="border-line border px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase">
            {project.is_published ? t("statusPublished") : t("statusDraft")}
          </span>
          {project.is_featured ? (
            <span className="border-accent text-accent border px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase">
              {t("featured")} #{project.featured_order ?? "—"}
            </span>
          ) : null}
          <span
            className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase ${
              translationsComplete
                ? "border-teal/50 text-teal"
                : "border-amber-400 text-amber-800"
            }`}
          >
            <Languages className="h-3 w-3" aria-hidden="true" />
            {translationsComplete
              ? t("translationComplete")
              : t("translationIncomplete")}
          </span>
        </div>
        <p className="mt-2 text-sm break-words text-black/60">
          {project.slug} · {project.category} · {t("sortOrder")} #
          {project.sort_order}
        </p>
        <p className="mt-1 text-xs text-black/45">
          {t("updatedAt", {
            date: formatAdminDate(project.updated_at, locale),
          })}
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
        <Button asChild variant="ghost" size="sm">
          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("preview")}
            <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDuplicate}>
          {t("duplicate")}
          <Copy className="ml-2 h-4 w-4" aria-hidden="true" />
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

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl("");
      setClientError(null);
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      event.target.value = "";
      setPreviewUrl("");
      setClientError(t("imageTypeInvalid"));
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
    <div className="border-line border bg-white/70 p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="section-kicker">
            {t(`siteImages.${imageKey}.section`)}
          </span>
          <h3 className="mt-2 text-xl">{t(`siteImages.${imageKey}.title`)}</h3>
        </div>
        {image.is_default ? (
          <span className="border-line border px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-black/55 uppercase">
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
              <Label htmlFor={`site-image-url-${imageKey}`}>
                {t("imageUrl")}
              </Label>
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
              <Label htmlFor={`site-image-file-${imageKey}`}>
                {t("imageFile")}
              </Label>
              <Input
                ref={fileInputRef}
                id={`site-image-file-${imageKey}`}
                name="image_file"
                type="file"
                accept={acceptedImageTypesAttribute}
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
            <ActionFeedback
              state={clientError ? { error: clientError } : state}
            />
          </div>
        </form>
      </div>

      <div className="border-line mt-5 border-t pt-4">
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


// One row of the category manager. Editing is inline and always shows the slug
// -- renaming it re-points every project through the foreign key cascade, which
// is worth being able to see before saving.
function CategoryRow({ category, locale, projectCount, canMoveUp, canMoveDown }) {
  const t = useTranslations("Admin");
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateProjectCategory,
    initialActionState,
  );

  const stopEditing = useCallback(() => setIsEditing(false), []);
  useRefreshOnSuccess(state, stopEditing);

  const inUse = projectCount > 0;

  return (
    <div className="border-line border bg-white/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold break-words">
            {categoryOptionLabel(category, locale)}
          </p>
          <p className="mt-1 font-mono text-xs break-all text-black/50">
            {category.slug}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-line bg-body-light text-accent shrink-0 border px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase">
            {t("categories.usage", { count: projectCount })}
          </span>
          <div className="flex items-center gap-1">
            <ActionForm
              action={reorderProjectCategory}
              size="icon"
              disabled={!canMoveUp}
              title={t("moveUp")}
              fields={
                <>
                  <input type="hidden" name="slug" value={category.slug} />
                  <input type="hidden" name="offset" value="-1" />
                </>
              }
            >
              <ArrowUp size={16} aria-hidden="true" />
              <span className="sr-only">{t("moveUp")}</span>
            </ActionForm>
            <ActionForm
              action={reorderProjectCategory}
              size="icon"
              disabled={!canMoveDown}
              title={t("moveDown")}
              fields={
                <>
                  <input type="hidden" name="slug" value={category.slug} />
                  <input type="hidden" name="offset" value="1" />
                </>
              }
            >
              <ArrowDown size={16} aria-hidden="true" />
              <span className="sr-only">{t("moveDown")}</span>
            </ActionForm>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing((editing) => !editing)}
          >
            {isEditing ? t("cancel") : t("edit")}
          </Button>
          {/* A category in use cannot be deleted: the database refuses it, so
              the button explains why instead of offering a click that fails. */}
          <ActionForm
            action={deleteProjectCategory}
            disabled={inUse}
            confirmMessage={t("categories.confirmDelete")}
            title={inUse ? t("categories.deleteBlocked") : t("delete")}
            fields={<input type="hidden" name="slug" value={category.slug} />}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span className="sr-only">{t("delete")}</span>
          </ActionForm>
        </div>
      </div>

      {inUse ? (
        <p className="mt-2 text-xs text-black/50">
          {t("categories.deleteBlocked")}
        </p>
      ) : null}

      {isEditing ? (
        <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
          <input type="hidden" name="slug" value={category.slug} />
          <div>
            <Label htmlFor={`category-label-ro-${category.slug}`}>
              {t("categories.labelRo")}
            </Label>
            <Input
              id={`category-label-ro-${category.slug}`}
              name="label_ro"
              defaultValue={category.label_ro}
              required
            />
          </div>
          <div>
            <Label htmlFor={`category-label-en-${category.slug}`}>
              {t("categories.labelEn")}
            </Label>
            <Input
              id={`category-label-en-${category.slug}`}
              name="label_en"
              defaultValue={category.label_en}
              required
            />
          </div>
          <div>
            <Label htmlFor={`category-next-slug-${category.slug}`}>
              {t("categories.slug")}
            </Label>
            <Input
              id={`category-next-slug-${category.slug}`}
              name="next_slug"
              defaultValue={category.slug}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title={t("categories.slugHint")}
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-3">
            <Button type="submit" disabled={isPending}>
              {t("saveChanges")}
            </Button>
            <ActionFeedback state={state} />
          </div>
        </form>
      ) : null}
    </div>
  );
}

// Creating a category only needs the two labels; the slug is derived from the
// Romanian name so the admin never has to think about one, but stays editable
// because it is what a project row stores.
function NewCategoryForm() {
  const t = useTranslations("Admin");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createProjectCategory,
    initialActionState,
  );
  const formRef = useRef(null);

  const handleCreated = useCallback(() => {
    formRef.current?.reset();
    setSlug("");
    setSlugTouched(false);
  }, []);

  useRefreshOnSuccess(state, handleCreated);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-line grid gap-4 border bg-white/70 p-4 md:grid-cols-3 sm:p-5"
    >
      <div className="md:col-span-3">
        <h3 className="text-lg">{t("categories.newTitle")}</h3>
        <p className="mt-1 text-sm text-black/55">{t("categories.newHint")}</p>
      </div>
      <div>
        <Label htmlFor="new-category-label-ro">{t("categories.labelRo")}</Label>
        <Input
          id="new-category-label-ro"
          name="label_ro"
          onChange={(event) => {
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          required
        />
      </div>
      <div>
        <Label htmlFor="new-category-label-en">{t("categories.labelEn")}</Label>
        <Input id="new-category-label-en" name="label_en" required />
      </div>
      <div>
        <Label htmlFor="new-category-slug">{t("categories.slug")}</Label>
        <Input
          id="new-category-slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title={t("categories.slugHint")}
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-3">
        <Button type="submit" disabled={isPending || !slug}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("categories.create")}
        </Button>
        <ActionFeedback state={state} />
      </div>
    </form>
  );
}

export default function AdminPanel({
  locale,
  projects = [],
  error,
  categories = [],
  categoriesError,
  siteImages = {},
  siteImagesError,
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [draftProject, setDraftProject] = useState(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [editorDirty, setEditorDirty] = useState(false);
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
    () =>
      new Map(featuredProjects.map((project, index) => [project.id, index])),
    [featuredProjects],
  );

  // Positions come from the full, server-ordered list so a filtered view still
  // knows which rows sit at the edges of each sequence.
  const pagePositions = useMemo(
    () => new Map(projects.map((project, index) => [project.id, index])),
    [projects],
  );

  // Counted over every project, published or not: a draft still holds the
  // category in place through the foreign key.
  const projectsPerCategory = useMemo(() => {
    const counts = new Map();
    projects.forEach((project) => {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    });
    return counts;
  }, [projects]);

  const isFiltered = query.trim() !== "" || status !== "all";

  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (status === "published" && !project.is_published) return false;
      if (status === "draft" && project.is_published) return false;
      if (status === "featured" && !project.is_featured) return false;
      if (status === "incomplete" && hasCompleteTranslations(project)) {
        return false;
      }
      if (!needle) return true;

      return [project.name, project.slug, project.category].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [projects, query, status]);

  const editingProject = projects.find(
    (project) => project.id === editingProjectId,
  );
  const isNew = editingProjectId === "new";
  const editorProject = isNew
    ? (draftProject ?? {
        ...emptyProject,
        sort_order: projects.length + 1,
        featured_order: featuredProjects.length + 1,
      })
    : editingProject;

  const closeEditor = useCallback(() => {
    setEditingProjectId(null);
    setDraftProject(null);
    setEditorDirty(false);
  }, []);

  const openNewProject = useCallback(() => {
    if (editorDirty && !window.confirm(t("confirmDiscard"))) return;
    setDraftProject(null);
    setEditingProjectId("new");
    setEditorVersion((version) => version + 1);
    setActiveTab("projects");
  }, [editorDirty, t]);

  const openEditProject = useCallback(
    (projectId) => {
      if (editorDirty && !window.confirm(t("confirmDiscard"))) return;
      setDraftProject(null);
      setEditingProjectId(projectId);
      setEditorVersion((version) => version + 1);
      setActiveTab("projects");
    },
    [editorDirty, t],
  );

  const duplicateProject = useCallback(
    (project) => {
      if (editorDirty && !window.confirm(t("confirmDiscard"))) return;
      setDraftProject({
        ...project,
        id: undefined,
        slug: createCopySlug(project.slug, projects),
        name: `${project.name} (${t("copySuffix")})`,
        is_published: false,
        is_featured: false,
        featured_order: featuredProjects.length + 1,
        sort_order: projects.length + 1,
        created_at: undefined,
        updated_at: undefined,
      });
      setEditingProjectId("new");
      setEditorVersion((version) => version + 1);
      setActiveTab("projects");
    },
    [editorDirty, featuredProjects.length, projects, t],
  );

  function changeTab(nextTab) {
    if (
      editorDirty &&
      activeTab === "projects" &&
      nextTab !== "projects" &&
      !window.confirm(t("confirmDiscard"))
    ) {
      return;
    }

    if (nextTab !== "projects" && editingProjectId) {
      closeEditor();
    }
    setActiveTab(nextTab);
  }

  return (
    <div className="min-h-screen pt-36 pb-24 sm:pt-44">
      <div className="container">
        <div className="border-line mb-8 flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-end">
          <div>
            <span className="section-kicker">Myriad Tech / Admin</span>
            <h1 className="mt-4 max-w-3xl">{t("title")}</h1>
            <p className="section-copy mt-5 max-w-2xl">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={Boolean(error)}
              onClick={openNewProject}
            >
              {t("newProject")}
            </Button>
            <form
              action={signOut}
              onSubmit={(event) => {
                if (editorDirty && !window.confirm(t("confirmDiscard"))) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" variant="secondary">
                {t("logout")}
              </Button>
            </form>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={changeTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap gap-2 sm:w-fit">
            <TabsTrigger
              value="overview"
              className="min-w-0 flex-none basis-[calc(50%-0.25rem)] sm:basis-auto sm:min-w-[10rem]"
            >
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="min-w-0 flex-none basis-[calc(50%-0.25rem)] sm:basis-auto sm:min-w-[12rem]"
            >
              {t("tabs.projects")}
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="min-w-0 flex-none basis-[calc(50%-0.25rem)] sm:basis-auto sm:min-w-[12rem]"
            >
              {t("tabs.categories")}
            </TabsTrigger>
            <TabsTrigger
              value="site-images"
              className="min-w-0 flex-none basis-[calc(50%-0.25rem)] sm:basis-auto sm:min-w-[12rem]"
            >
              {t("tabs.siteImages")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {error ? (
              <div className="flex flex-col items-start gap-4 border border-red-200 bg-red-50 px-6 py-10 text-red-800">
                <p>{t("loadError")}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => router.refresh()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("retry")}
                </Button>
              </div>
            ) : (
              <AdminOverview
                locale={locale}
                projects={projects}
                onEditProject={openEditProject}
                onNewProject={openNewProject}
              />
            )}
          </TabsContent>

          <TabsContent value="projects">
            {editorProject ? (
              <div className="mb-10">
                <ProjectForm
                  key={`${editorProject.id || "new"}-${editorVersion}`}
                  project={editorProject}
                  locale={locale}
                  isNew={isNew}
                  categories={categories}
                  projectCount={projects.length}
                  featuredCount={featuredProjects.length}
                  onCancel={closeEditor}
                  onDirtyChange={setEditorDirty}
                  onSaved={closeEditor}
                />
              </div>
            ) : null}

            {error ? (
              <div className="flex flex-col items-start gap-4 border border-red-200 bg-red-50 px-6 py-10 text-red-800">
                <p>{t("loadError")}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => router.refresh()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("retry")}
                </Button>
              </div>
            ) : projects.length === 0 ? (
              <div className="border-line border bg-white/50 px-6 py-10 text-black/60">
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
                {isFiltered ? (
                  <p className="mb-4 text-sm text-amber-800">
                    {t("reorderFilteredHint")}
                  </p>
                ) : null}

                {visibleProjects.length === 0 ? (
                  <div className="border-line border bg-white/50 px-6 py-10 text-black/60">
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
                        locale={locale}
                        onEdit={() => openEditProject(project.id)}
                        onDuplicate={() => duplicateProject(project)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <p className="section-copy mb-8 max-w-2xl">
              {t("categories.subtitle")}
            </p>
            {categoriesError ? (
              <div className="mb-6 flex flex-col items-start gap-3 border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900">
                <p>{t("categories.loadError")}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => router.refresh()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("retry")}
                </Button>
              </div>
            ) : null}
            <div className="grid gap-4">
              {categories.map((category, index) => (
                <CategoryRow
                  key={category.slug}
                  category={category}
                  locale={locale}
                  projectCount={projectsPerCategory.get(category.slug) ?? 0}
                  canMoveUp={index > 0}
                  canMoveDown={index < categories.length - 1}
                />
              ))}
              {categories.length === 0 && !categoriesError ? (
                <p className="border-line border bg-white/50 px-6 py-10 text-center text-black/60">
                  {t("categories.empty")}
                </p>
              ) : null}
              <NewCategoryForm />
            </div>
          </TabsContent>

          <TabsContent value="site-images">
            <p className="section-copy mb-8 max-w-2xl">
              {t("siteImages.subtitle")}
            </p>
            {siteImagesError ? (
              <div className="mb-6 flex flex-col items-start gap-3 border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900">
                <p>{t("siteImages.loadError")}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => router.refresh()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("retry")}
                </Button>
              </div>
            ) : null}
            <div className="grid gap-6">
              {SITE_IMAGE_KEYS.map((imageKey) =>
                siteImages[imageKey] ? (
                  <SiteImageCard
                    key={`${imageKey}-${siteImages[imageKey].image_url}`}
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
