import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getT } from "@/lib/i18n/locale";

export default async function ResetPasswordPage() {
  const { t } = await getT();
  return (
    <div className="py-8">
      <h1 className="mb-3 text-center font-[family-name:var(--font-display)] text-4xl">
        {t.resetPassword}
      </h1>
      <p className="mx-auto mb-8 max-w-md text-center text-muted">{t.resetPasswordBody}</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
