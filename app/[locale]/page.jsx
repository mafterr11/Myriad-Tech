import { setRequestLocale } from "next-intl/server";
import dynamicImport from "next/dynamic";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { getFeaturedProjects, localizeProject } from "@/lib/projects/queries";
import { getSiteImages, localizeSiteImage } from "@/lib/site-images/queries";

const Hero = dynamicImport(() => import("@/components/home/Hero"));
const About = dynamicImport(() => import("@/components/home/About"));
const Services = dynamicImport(() => import("@/components/home/Services"));
const Work = dynamicImport(() => import("@/components/home/Work"));
const Reviews = dynamicImport(() => import("@/components/home/Reviews"));
const Cta = dynamicImport(() => import("@/components/home/Cta"));

// Cached and served from the edge instead of re-querying Supabase on every
// visit. Publishing from the admin panel calls revalidatePath, so an edit is
// live immediately rather than waiting out this window.
export const revalidate = 3600;

export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [result, siteImages] = await Promise.all([
    getFeaturedProjects(),
    getSiteImages(),
  ]);
  const projects = result.projects.map((project) =>
    localizeProject(project, locale),
  );

  return (
    <>
      <OrganizationJsonLd locale={locale} />
      <Hero image={localizeSiteImage(siteImages.images.hero, locale)} />
      <About image={localizeSiteImage(siteImages.images.about, locale)} />
      <Work projects={projects} error={result.error} />
      <Services />
      <Reviews />
      <Cta />
    </>
  );
}
