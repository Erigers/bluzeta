import Image from "next/image";
import Link from "next/link";
import { getSampleListingForStoryPreview } from "@/lib/instagram/listings";
import { formatStoryDate } from "@/lib/instagram/story-image";
import { getT } from "@/lib/i18n/locale";

export default async function AdminInstagramPage() {
  const { t } = await getT();
  const sample = await getSampleListingForStoryPreview();
  const dateLabel = formatStoryDate(new Date());
  const previewSrc = sample
    ? `/api/instagram/story?listingId=${encodeURIComponent(sample.id)}`
    : "/api/instagram/story";

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <h2 className="text-xl font-semibold">{t.adminInstagram}</h2>
        <p className="mt-2 max-w-xl text-muted">{t.adminInstagramBody}</p>
        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li>{t.adminInstagramSchedule}</li>
          <li>{t.adminInstagramTemplateNote}</li>
          <li>
            {t.adminInstagramDate}: <span className="text-foreground">{dateLabel}</span>
          </li>
        </ul>
        {sample ? (
          <p className="mt-6 text-sm">
            {t.adminInstagramPreviewOf}{" "}
            <Link href={`/item/${sample.id}`} className="text-blue">
              {sample.title}
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-sm text-muted">{t.adminInstagramNoListing}</p>
        )}
      </div>
      <div className="mx-auto w-full max-w-[320px]">
        <div className="overflow-hidden rounded-[28px] border border-line bg-card shadow-[var(--shadow)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={t.adminInstagramPreviewAlt}
            width={1080}
            height={1920}
            className="h-auto w-full"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Image
            src="/brand/bluzeta-icon.png"
            alt=""
            width={20}
            height={20}
            className="size-5 object-contain"
          />
          <span>
            1080×1920 · {t.adminInstagramStoryLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
