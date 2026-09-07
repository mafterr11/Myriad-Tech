import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/auth";
import { getAllProjects } from "@/lib/projects/queries";
import { getSiteImages } from "@/lib/site-images/queries";
import { getAllProjectCategories } from "@/lib/categories/queries";
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

  const [result, siteImages, categories] = await Promise.all([
    getAllProjects(context.supabase),
    getSiteImages(),
    getAllProjectCategories(context.supabase),
  ]);

  return (
    <AdminPanel
      locale={locale}
      projects={result.projects}
      error={result.error}
      categories={categories.categories}
      categoriesError={categories.error}
      siteImages={siteImages.images}
      siteImagesError={siteImages.error}
    />
  );
}
