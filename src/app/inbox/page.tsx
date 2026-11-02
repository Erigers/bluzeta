import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InboxActions } from "@/components/inbox-actions";
import { SocialList } from "@/components/social-list";
import { getInbox } from "@/lib/actions";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function InboxPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (!viewer.onboarded) redirect("/onboarding");
  const { t } = await getT();
  const data = await getInbox();

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.inbox}</h1>
      <section>
        <h2 className="text-xl font-semibold">{t.incoming}</h2>
        {data.incoming.length === 0 ? (
          <p className="mt-3 text-muted">{t.noIncoming}</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {data.incoming.map((row) => (
              <li key={row.id} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex gap-4">
                  {row.listingImage ? (
                    <Image
                      src={row.listingImage}
                      alt=""
                      width={72}
                      height={90}
                      className="h-[90px] w-[72px] rounded-xl object-cover"
                    />
                  ) : null}
                  <div className="flex-1">
                    <Link href={`/item/${row.listingId}`} className="font-medium">
                      {row.listingTitle}
                    </Link>
                    <p className="text-sm text-muted">{row.buyerName}</p>
                    <p className="mt-2 text-sm font-medium">{t.buyerSocials}</p>
                    <SocialList socials={row.socials} />
                    <div className="mt-3">
                      <InboxActions id={row.id} status={row.status} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold">{t.sent}</h2>
        {data.sent.length === 0 ? (
          <p className="mt-3 text-muted">{t.noSent}</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {data.sent.map((row) => (
              <li key={row.id} className="rounded-2xl border border-line bg-card p-4">
                <Link href={`/item/${row.listingId}`} className="font-medium">
                  {row.listingTitle}
                </Link>
                <p className="text-sm text-muted">
                  {row.status === "accepted"
                    ? t.accepted
                    : row.status === "declined"
                      ? t.declined
                      : t.pending}
                </p>
                {row.socials ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium">{t.sellerSocials}</p>
                    <SocialList socials={row.socials} />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">{t.hiddenUntilAccept}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
