import { AuthForm } from "@/components/auth-form";
import { getT } from "@/lib/i18n/locale";

export default async function SignUpPage() {
  const { t } = await getT();
  return (
    <div className="py-8">
      <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl">
        {t.signUp}
      </h1>
      <AuthForm mode="sign-up" />
    </div>
  );
}
