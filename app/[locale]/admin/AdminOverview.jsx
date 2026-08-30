"use client";

import { ExternalLink, Languages, Pencil, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

function StatCard({ label, value, tone = "default" }) {
  return (
    <div
      className={`border px-4 py-4 ${
        tone === "warning"
          ? "border-amber-300 bg-amber-50/80"
          : "border-line bg-white/65"
      }`}
    >
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-[10px] font-bold tracking-[0.12em] text-black/55 uppercase">
        {label}
      </div>
    </div>
  );
}

function hasTranslations(project) {
  return Boolean(
    project?.description_ro?.trim() && project?.description_en?.trim(),
  );
}

function formatDate(value, locale) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    dateStyle: "medium",
  }).format(date);
}

export default function AdminOverview({
  locale,
  projects,
  onEditProject,
  onNewProject,
}) {
  const t = useTranslations("Admin");
  const incomplete = projects.filter((project) => !hasTranslations(project));
  const recent = [...projects]
    .sort(
      (first, second) =>
        Date.parse(second.updated_at ?? "") -
        Date.parse(first.updated_at ?? ""),
    )
    .slice(0, 5);

  const stats = {
    total: projects.length,
    published: projects.filter((project) => project.is_published).length,
    drafts: projects.filter((project) => !project.is_published).length,
    featured: projects.filter((project) => project.is_featured).length,
  };

  return (
    <div className="grid gap-8">
      <section aria-labelledby="admin-overview-heading">
        <div className="border-line flex flex-col justify-between gap-5 border bg-white/55 p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <span className="section-kicker">Portfolio / CMS</span>
            <h2 id="admin-overview-heading" className="mt-3 text-2xl">
              {t("overview.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-black/60">
              {t("overview.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" onClick={onNewProject}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("newProject")}
            </Button>
            <Button asChild size="sm" variant="secondary">
              <a href={`/${locale}`} target="_blank" rel="noopener noreferrer">
                {t("openWebsite")}
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section aria-label={t("overview.statsLabel")}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label={t("stats.total")} value={stats.total} />
          <StatCard label={t("stats.published")} value={stats.published} />
          <StatCard label={t("stats.drafts")} value={stats.drafts} />
          <StatCard label={t("stats.featured")} value={stats.featured} />
          <StatCard
            label={t("stats.incomplete")}
            value={incomplete.length}
            tone={incomplete.length > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      <section aria-labelledby="recent-projects-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <span className="section-kicker">
              {t("overview.activityKicker")}
            </span>
            <h2 id="recent-projects-heading" className="mt-2 text-2xl">
              {t("overview.recent")}
            </h2>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="border-line border bg-white/50 px-6 py-10 text-black/60">
            {t("empty")}
          </div>
        ) : (
          <div className="divide-line border-line divide-y border bg-white/60">
            {recent.map((project) => {
              const translated = hasTranslations(project);

              return (
                <article
                  key={project.id}
                  className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg">{project.name}</h3>
                      <span className="border-line border px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase">
                        {project.is_published
                          ? t("statusPublished")
                          : t("statusDraft")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase ${
                          translated
                            ? "border-teal/50 text-teal"
                            : "border-amber-400 text-amber-800"
                        }`}
                      >
                        <Languages className="h-3 w-3" aria-hidden="true" />
                        {translated
                          ? t("translationComplete")
                          : t("translationIncomplete")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-black/55">
                      {t("updatedAt", {
                        date: formatDate(project.updated_at, locale),
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditProject(project.id)}
                    >
                      <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t("edit")}
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("preview")}
                        <ExternalLink
                          className="ml-2 h-4 w-4"
                          aria-hidden="true"
                        />
                      </a>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
