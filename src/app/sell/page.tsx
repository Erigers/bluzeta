import { redirect } from "next/navigation";
import { SellForm } from "@/components/sell-form";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function SellPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (!viewer.onboarded) redirect("/onboarding");
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.newListing}</h1>
      <p className="mt-2 text-muted">{t.privacyBody}</p>
      <div className="mt-8">
        <SellForm />
      </div>
    </div>
  );
}
