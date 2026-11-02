import { Filters } from "@/components/filters";
import { ListingCard } from "@/components/listing-card";
import { listPublicListings } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { filtersFromParams } from "@/lib/search-params";
import { getViewer } from "@/lib/session";

export default async function BrowsePage({
  searchParams,
}: PageProps<"/browse">) {
  const params = await searchParams;
  const { t, locale } = await getT();
  const viewer = await getViewer();
  const filters = filtersFromParams(params);
  const items = await listPublicListings({
    filters,
    viewerId: viewer?.user.id,
    viewerCoords: viewer?.profile
      ? { lat: viewer.profile.lat, lng: viewer.profile.lng }
      : null,
    locale,
  });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          {t.browse}
        </h1>
        {filters.q ? (
          <p className="text-muted">“{filters.q}”</p>
        ) : null}
      </div>

      <Filters t={t} current={filters} />

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted">{t.noListings}</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              t={t}
              signedIn={Boolean(viewer)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
