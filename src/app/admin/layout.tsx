import { AdminNav } from "@/components/admin-nav";
import { countPendingReports } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  await requireAdmin();
  const { t } = await getT();
  const pending = await countPendingReports();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-blue">{t.admin}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">
          {t.adminDashboard}
        </h1>
      </div>
      <AdminNav pending={pending} />
      {children}
    </div>
  );
}
