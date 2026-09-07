import { setRequestLocale } from "next-intl/server";
import { constructMetadata } from "@/lib/utils";
import { getPublishedProjects, localizeProject } from "@/lib/projects/queries";
import {
  categoryLabelMap,
  getProjectCategories,
} from "@/lib/categories/queries";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ProjectsJsonLd from "@/components/seo/ProjectsJsonLd";
import ProjectsPage from "./ProjectsPage";

// See the note in app/[locale]/page.jsx: cached, with the admin panel pushing
// a revalidation whenever the project list changes.
export const revalidate = 3600;

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
  setRequestLocale(locale);
  const [result, categoryResult] = await Promise.all([
    getPublishedProjects(),
    getProjectCategories(),
  ]);
  const labels = categoryLabelMap(categoryResult.categories, locale);
  const projects = result.projects.map((project) =>
    localizeProject(project, locale, labels),
  );
  const categories = categoryResult.categories.map((category) => ({
    slug: category.slug,
    label: labels[category.slug],
  }));

  return (
    <>
      <BreadcrumbJsonLd locale={locale} route="projects" />
      <ProjectsJsonLd locale={locale} projects={projects} />
      <ProjectsPage
        projects={projects}
        categories={categories}
        error={result.error}
      />
    </>
  );
};

export default Projects;
