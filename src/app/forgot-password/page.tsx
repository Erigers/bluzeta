import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { getT } from "@/lib/i18n/locale";

export default async function ForgotPasswordPage() {
  const { t } = await getT();
  return (
    <div className="py-8">
      <h1 className="mb-3 text-center font-[family-name:var(--font-display)] text-4xl">
        {t.forgotPasswordTitle}
      </h1>
      <p className="mx-auto mb-8 max-w-md text-center text-muted">{t.forgotPasswordBody}</p>
      <ForgotPasswordForm />
    </div>
  );
}
