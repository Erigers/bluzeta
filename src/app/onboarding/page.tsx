import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function OnboardingPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.onboardingTitle}</h1>
      <p className="mt-3 text-muted">{t.onboardingBody}</p>
      <div className="mt-8">
        <ProfileForm initial={viewer.profile ?? undefined} />
      </div>
    </div>
  );
}
