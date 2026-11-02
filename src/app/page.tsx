import dynamic from "next/dynamic";
import { CategoryGallery } from "@/components/category-gallery";
import { HeroCtas } from "@/components/hero-ctas";
import { HowItWorksStack } from "@/components/how-it-works-stack";
import { ScrollBasedVelocity } from "@/components/scroll-based-velocity";
import { getMostLikedListings } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";
import { getViewer } from "@/lib/session";

const CollectionSurfer = dynamic(
  () =>
    import("@/components/collection-surfer").then((mod) => mod.CollectionSurfer),
  {
    loading: () => (
      <div className="full-bleed h-[calc(100svh-var(--header-h))] bg-background dark:bg-black" />
    ),
  },
);

export default async function Home() {
  const { t } = await getT();
  const viewer = await getViewer();
  const surfItems = await getMostLikedListings(10);

  return (
    <div className="space-y-8">
      <ScrollBasedVelocity lines={[t.velocityLine1, t.velocityLine2]} />

      {surfItems.length > 0 ? (
        <CollectionSurfer items={surfItems} signedIn={Boolean(viewer)} />
      ) : (
        <section className="px-1 py-10">
          <p className="text-sm font-semibold tracking-[0.18em] text-blue uppercase">
            {t.tagline}
          </p>
          <h1 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-4xl leading-tight md:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">{t.heroBody}</p>
          <HeroCtas t={t} signedIn={Boolean(viewer)} />
        </section>
      )}

      <HowItWorksStack />
      <CategoryGallery t={t} />
    </div>
  );
}
