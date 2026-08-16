import { getPublishedProjects } from "@/lib/projects/queries";
import { getLocalizedUrls } from "@/lib/utils";

// Priority and change frequency are hints, but `lastModified` is read: the
// portfolio routes report the newest published project so a crawler recrawls
// them when the work actually changes.
const routes = [
  { key: "home", changeFrequency: "weekly", priority: 1, tracksProjects: true },
  {
    key: "projects",
    changeFrequency: "weekly",
    priority: 0.9,
    tracksProjects: true,
  },
  { key: "contact", changeFrequency: "monthly", priority: 0.8 },
  { key: "privacy", changeFrequency: "yearly", priority: 0.2 },
  { key: "cookies", changeFrequency: "yearly", priority: 0.2 },
];

function newestProjectDate(projects) {
  const timestamps = projects
    .map((project) => Date.parse(project?.updated_at ?? ""))
    .filter((value) => Number.isFinite(value));

  return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date();
}

export default async function sitemap() {
  const { projects } = await getPublishedProjects();
  const projectsUpdatedAt = newestProjectDate(projects);
  const buildDate = new Date();

  return routes.flatMap(({ key, changeFrequency, priority, tracksProjects }) => {
    const urls = getLocalizedUrls(key);
    const languages = { ro: urls.ro, en: urls.en };
    const lastModified = tracksProjects ? projectsUpdatedAt : buildDate;

    return [
      {
        url: urls.ro,
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      },
      {
        url: urls.en,
        lastModified,
        changeFrequency,
        // The Romanian pages are the primary market, so the English twins sit
        // slightly lower in the same set.
        priority: Math.round((priority - 0.1) * 10) / 10,
        alternates: { languages },
      },
    ];
  });
}
