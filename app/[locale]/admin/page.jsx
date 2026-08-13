import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/auth";
import { getAllProjects } from "@/lib/projects/queries";
import { getSiteImages } from "@/lib/site-images/queries";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }) {
  const { locale } = await params;
  const context = await getAdminContext();

  if (!context.authorized) {
    redirect(
      `/${locale}/admin-login?next=${encodeURIComponent(`/${locale}/admin`)}`,
    );
  }

  const [result, siteImages] = await Promise.all([
    getAllProjects(context.supabase),
    getSiteImages(),
  ]);

  return (
    <AdminPanel
      locale={locale}
      projects={result.projects}
      error={result.error}
      siteImages={siteImages.images}
      siteImagesError={siteImages.error}
    />
  );
}
