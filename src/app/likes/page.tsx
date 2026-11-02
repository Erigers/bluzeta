import { redirect } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { getLikedListings } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

export default async function LikesPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  const { t, locale } = await getT();
  const items = await getLikedListings(
    viewer.user.id,
    viewer.profile ? { lat: viewer.profile.lat, lng: viewer.profile.lng } : null,
    locale,
  );
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.likes}</h1>
      {items.length === 0 ? (
        <p className="mt-10 text-muted">{t.noLikes}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} t={t} signedIn />
          ))}
        </div>
      )}
    </div>
  );
}
