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

export const dynamic = "force-dynamic";

export default async function Home({ params }) {
  const { locale } = await params;
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
      <Services />
      <Work projects={projects} error={result.error} />
      <Reviews />
      <Cta />
    </>
  );
}
