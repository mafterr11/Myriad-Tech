import { constructMetadata } from "@/lib/utils";
import { getPublishedProjects, localizeProject } from "@/lib/projects/queries";
import ProjectsPage from "./ProjectsPage";

export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "Proiecte Myriad Tech",
  description:
    "Descoperiți proiectele noastre de dezvoltare web realizate la Myriad Tech. Explorați portofoliul nostru pentru a vedea exemple de site-uri web personalizate și soluții e-commerce eficiente.",
  keywords:
    "proiecte Myriad Tech, portofoliu dezvoltare web, exemple web design, Myriad Tech lucrări, freelancer bucuresti, romania, maftei alexandru",
});

const Projects = async ({ params }) => {
  const { locale } = await params;
  const result = await getPublishedProjects();
  const projects = result.projects.map((project) =>
    localizeProject(project, locale),
  );

  return <ProjectsPage projects={projects} error={result.error} />;
};

export default Projects;
