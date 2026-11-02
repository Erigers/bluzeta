import { AuthForm } from "@/components/auth-form";
import { getT } from "@/lib/i18n/locale";

export default async function SignInPage() {
  const { t } = await getT();
  return (
    <div className="py-8">
      <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl">
        {t.signIn}
      </h1>
      <AuthForm mode="sign-in" />
    </div>
  );
}
