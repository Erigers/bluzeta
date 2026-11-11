import { ContactForm } from "@/components/contact-form";
import { getT } from "@/lib/i18n/locale";
import { turnstileSiteKey } from "@/lib/turnstile";

export default async function ContactPage() {
  const { t } = await getT();
  const siteKey = turnstileSiteKey();

  return (
    <div className="py-8">
      <h1 className="mb-3 text-center font-[family-name:var(--font-display)] text-4xl">
        {t.contactTitle}
      </h1>
      <p className="mx-auto mb-8 max-w-lg text-center text-muted">{t.contactBody}</p>
      {siteKey ? (
        <ContactForm siteKey={siteKey} />
      ) : (
        <p className="mx-auto max-w-lg text-center text-sm text-tangerine">
          {t.contactUnavailable}
        </p>
      )}
    </div>
  );
}
