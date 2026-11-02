import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarkSoldButton } from "@/components/mark-sold-button";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { getMyListings } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  const { t } = await getT();
  const listings = await getMyListings(viewer.user.id);

  return (
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
      <section>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.profile}</h1>
        <p className="mt-2 text-muted">{viewer.user.name}</p>
        <p className="mt-4 text-sm text-muted">{t.privacyBody}</p>
        <div className="mt-6">
          <ProfileForm initial={viewer.profile ?? undefined} />
        </div>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">{t.yourListings}</h2>
        {listings.length === 0 ? (
          <p className="mt-4 text-muted">{t.emptySell}</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {listings.map((item) => (
              <li key={item.id} className="flex gap-4 rounded-2xl border border-line p-3">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt=""
                    width={72}
                    height={90}
                    className="h-[90px] w-[72px] rounded-xl object-cover"
                  />
                ) : null}
                <div className="flex-1">
                  <Link href={`/item/${item.id}`} className="font-medium">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {item.status === "sold" ? t.sold : t.active} · {item.likesCount} {t.likesCount}
                  </p>
                  {item.status !== "sold" ? <MarkSoldButton listingId={item.id} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
