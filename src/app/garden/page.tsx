import { FlowerGarden } from "@/components/flower-garden";
import { getTotalLikes } from "@/lib/data";
import { getT } from "@/lib/i18n/locale";

const localeTag = {
  sq: "sq-AL",
  en: "en",
  it: "it",
  tr: "tr",
} as const;

export async function generateMetadata() {
  const { t } = await getT();
  return { title: `${t.garden} — bluzeta` };
}

export default async function GardenPage() {
  const { t, locale } = await getT();
  const total = await getTotalLikes();

  return (
    <FlowerGarden
      count={total.toLocaleString(localeTag[locale])}
      caption={t.gardenCount}
    />
  );
}
