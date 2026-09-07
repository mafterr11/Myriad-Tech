"use client";

import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/home/ProjectCard";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const ProjectsPage = ({ projects = [], categories = [], error }) => {
  const t = useTranslations("Proiecte");
  const allProjects = t("page.tab");
  // Memoised so the tab list below is not rebuilt on every render: the
  // fallback array is a new identity each time otherwise.
  const projectData = useMemo(
    () => (Array.isArray(projects) ? projects : []),
    [projects],
  );
  const [category, setCategory] = useState("all");

  // Tabs follow the order set in the admin panel, and only categories that
  // actually have published work get one -- an empty tab is a dead end. A
  // project whose category is missing from the list still gets a tab of its
  // own, so nothing can become unreachable through the filter.
  const tabs = useMemo(() => {
    const counts = new Map();
    projectData.forEach((project) => {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    });

    const ordered = [];
    const seen = new Set();

    (Array.isArray(categories) ? categories : []).forEach(({ slug, label }) => {
      const count = counts.get(slug) ?? 0;
      if (count > 0) {
        ordered.push({ slug, label: label || slug, count });
        seen.add(slug);
      }
    });

    counts.forEach((count, slug) => {
      if (!seen.has(slug)) {
        const label = t.has(`category.${slug}`) ? t(`category.${slug}`) : slug;
        ordered.push({ slug, label, count });
      }
    });

    return ordered;
  }, [categories, projectData, t]);

  const filteredProjects =
    category === "all"
      ? projectData
      : projectData.filter((project) => project.category === category);

  // A filter can disappear while it is selected -- its last project is
  // unpublished, or the category is renamed in the admin panel -- which would
  // otherwise leave the page showing an empty list under a tab that is no
  // longer there.
  const activeCategory =
    category === "all" || tabs.some((tab) => tab.slug === category)
      ? category
      : "all";
  const visibleProjects =
    activeCategory === category ? filteredProjects : projectData;

  return (
    <div className="min-h-screen pt-20 pb-24 sm:pt-44">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 xl:mb-16 xl:flex-row xl:items-end">
          <div>
            <span className="section-kicker">Portfolio / Archive</span>
            {/* Plain, like the hero. A mount-triggered fade fires the moment
                the route commits -- which is while the curtain is still over
                the page -- so it played to nobody and left the h1, an LCP
                candidate, sitting at opacity 0. The curtain lift is the
                reveal. Everything further down still animates on scroll. */}
            <h1 className="mt-4 max-w-3xl">{t("page.title")}</h1>
          </div>
          <p className="section-copy xl:max-w-md xl:text-right">
            {t("page.subtitle")}
          </p>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={setCategory}
          className="w-full"
        >
          {/* Categories are editable, so the number of tabs and the length of
              each label are both unbounded. The row wraps instead of fitting a
              fixed column count, and every trigger is content-sized and free to
              wrap its own text, so adding a tenth category adds a row rather
              than squashing the other nine or pushing the page sideways. */}
          <TabsList className="mx-auto mb-12 flex w-full max-w-full flex-wrap justify-center gap-2 sm:w-fit sm:gap-3">
            <TabsTrigger
              value="all"
              className="min-w-0 max-w-full flex-none basis-full justify-between gap-3 whitespace-normal sm:basis-auto sm:min-w-[8.5rem]"
            >
              <span className="min-w-0 leading-tight break-words">
                {allProjects}
              </span>
              <span className="border-line bg-body-light text-accent shrink-0 rounded-[1px] border px-2 py-1 text-[0.65rem] leading-none tracking-normal">
                {projectData.length}
              </span>
            </TabsTrigger>
            {tabs.map((tab) => (
              <TabsTrigger
                value={tab.slug}
                key={tab.slug}
                className="min-w-0 max-w-full flex-none basis-full justify-between gap-3 whitespace-normal min-[360px]:basis-[calc(50%-0.25rem)] sm:basis-auto sm:min-w-[8.5rem]"
              >
                {/* break-words so a single long category name wraps inside its
                    own tab instead of being cut off by the overflow-hidden. */}
                <span className="min-w-0 leading-tight break-words">
                  {tab.label}
                </span>
                <span className="border-line bg-body-light text-accent shrink-0 rounded-[1px] border px-2 py-1 text-[0.65rem] leading-none tracking-normal">
                  {tab.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory}>
            {error && projectData.length === 0 ? (
              <div className="border-line border bg-white/50 px-6 py-12 text-center text-black/60">
                {t("page.error")}
              </div>
            ) : visibleProjects.length === 0 ? (
              <div className="border-line border bg-white/50 px-6 py-12 text-center text-black/60">
                {t("page.empty")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visibleProjects.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.id || project.slug}
                    compactMobile
                    headingLevel="h2"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectsPage;
