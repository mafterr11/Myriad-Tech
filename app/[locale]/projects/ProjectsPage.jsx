"use client";

import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/home/ProjectCard";
import { useTranslations } from "next-intl";
import { useState } from "react";

const ProjectsPage = ({ projects = [], error }) => {
  const t = useTranslations("Proiecte");
  const allProjects = t("page.tab");
  const projectData = Array.isArray(projects) ? projects : [];
  const categoryLabel = (category) =>
    t.has(`category.${category}`) ? t(`category.${category}`) : category;
  const categoryValues = [...new Set(projectData.map((item) => item.category))];
  const projectCountByCategory = Object.fromEntries(
    categoryValues.map((item) => [
      item,
      projectData.filter((project) => project.category === item).length,
    ]),
  );
  const [category, setCategory] = useState("all");
  const filteredProjects =
    category === "all"
      ? projectData
      : projectData.filter((project) => project.category === category);

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

        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="mx-auto mb-12 grid w-full max-w-full grid-cols-2 gap-2 sm:flex sm:w-fit sm:flex-nowrap sm:justify-center sm:gap-3">
            <TabsTrigger
              value="all"
              className="col-span-2 min-w-0 flex-none justify-between gap-3 whitespace-normal sm:col-span-1 sm:min-w-[8.5rem]"
            >
              <span className="min-w-0 leading-tight">{allProjects}</span>
              <span className="border-line bg-body-light text-accent shrink-0 rounded-[1px] border px-2 py-1 text-[0.65rem] leading-none tracking-normal">
                {projectData.length}
              </span>
            </TabsTrigger>
            {categoryValues.map((item) => (
              <TabsTrigger
                value={item}
                key={item}
                className="min-w-0 flex-none justify-between gap-3 whitespace-normal sm:min-w-[8.5rem]"
              >
                <span className="min-w-0 leading-tight">
                  {categoryLabel(item)}
                </span>
                <span className="border-line bg-body-light text-accent shrink-0 rounded-[1px] border px-2 py-1 text-[0.65rem] leading-none tracking-normal">
                  {projectCountByCategory[item]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category}>
            {error && projectData.length === 0 ? (
              <div className="border-line border bg-white/50 px-6 py-12 text-center text-black/60">
                {t("page.error")}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="border-line border bg-white/50 px-6 py-12 text-center text-black/60">
                {t("page.empty")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.id || project.slug}
                    compactMobile
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
