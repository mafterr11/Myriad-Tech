import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/projects/auth";
import { getAllProjects } from "@/lib/projects/queries";
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

  const result = await getAllProjects(context.supabase);

  return (
    <AdminPanel
      locale={locale}
      projects={result.projects}
      error={result.error}
    />
  );
}
