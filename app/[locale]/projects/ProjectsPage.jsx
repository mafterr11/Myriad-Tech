"use client";

import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/home/ProjectCard";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/variants";

const ProjectsPage = ({ projects = [], error }) => {
  const t = useTranslations("Proiecte");
  const allProjects = t("page.tab");
  const projectData = Array.isArray(projects) ? projects : [];
  const categoryLabel = (category) =>
    t.has(`category.${category}`) ? t(`category.${category}`) : category;
  const categoryValues = [...new Set(projectData.map((item) => item.category))];
  const [category, setCategory] = useState("all");
  const filteredProjects =
    category === "all"
      ? projectData
      : projectData.filter((project) => project.category === category);

  return (
    <div className="min-h-screen pb-24 pt-36 sm:pt-44">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 xl:mb-16 xl:flex-row xl:items-end">
          <div>
            <span className="section-kicker">Portfolio / Archive</span>
            <motion.h1
              variants={fadeIn("down", 0.2)}
              initial="hidden"
              animate="show"
              className="mt-4 max-w-3xl"
            >
              {t("page.title")}
            </motion.h1>
          </div>
          <p className="section-copy xl:max-w-md xl:text-right">{t("page.demo")}</p>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="mx-auto mb-10 max-w-full sm:w-fit sm:flex-nowrap">
            <TabsTrigger value="all" className="min-w-[7.5rem] sm:flex-none">
              {allProjects}
            </TabsTrigger>
            {categoryValues.map((item) => (
              <TabsTrigger value={item} key={item} className="min-w-[7.5rem] sm:flex-none">
                {categoryLabel(item)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category}>
            {error && projectData.length === 0 ? (
              <div className="border border-line bg-white/50 px-6 py-12 text-center text-black/60">
                {t("page.error")}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="border border-line bg-white/50 px-6 py-12 text-center text-black/60">
                {t("page.empty")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard project={project} key={project.id || project.slug} />
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
