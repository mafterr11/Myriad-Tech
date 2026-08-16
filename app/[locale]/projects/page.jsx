import { constructMetadata } from "@/lib/utils";
import { getPublishedProjects, localizeProject } from "@/lib/projects/queries";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ProjectsJsonLd from "@/components/seo/ProjectsJsonLd";
import ProjectsPage from "./ProjectsPage";

export const dynamic = "force-dynamic";

const seo = {
  ro: {
    title: "Portofoliu Web Design & Dezvoltare Web | Myriad Tech",
    description:
      "Vezi proiecte de site-uri de prezentare, magazine online și soluții web realizate de Myriad Tech pentru afaceri din România.",
  },
  en: {
    title: "Web Design & Development Portfolio | Myriad Tech",
    description:
      "Explore websites, e-commerce stores and custom web solutions created by Myriad Tech for businesses in Romania and beyond.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const content = locale === "en" ? seo.en : seo.ro;

  return constructMetadata({
    locale,
    route: "projects",
    ...content,
  });
}

const Projects = async ({ params }) => {
  const { locale } = await params;
  const result = await getPublishedProjects();
  const projects = result.projects.map((project) =>
    localizeProject(project, locale),
  );

  return (
    <>
      <BreadcrumbJsonLd locale={locale} route="projects" />
      <ProjectsJsonLd locale={locale} projects={projects} />
      <ProjectsPage projects={projects} error={result.error} />
    </>
  );
};

export default Projects;
