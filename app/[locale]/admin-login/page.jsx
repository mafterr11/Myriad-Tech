import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ params, searchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  const nextPath = typeof query?.next === "string" ? query.next : `/${locale}/admin`;
  const error = typeof query?.error === "string" ? query.error : null;

  return (
    <div className="min-h-screen pb-24 pt-36 sm:pt-44">
      <div className="container flex justify-center">
        <AdminLoginForm locale={locale} nextPath={nextPath} error={error} />
      </div>
    </div>
  );
}
