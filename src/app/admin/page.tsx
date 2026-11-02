import Image from "next/image";
import Link from "next/link";
import { ConfirmAction } from "@/components/confirm-action";
import { MockupBadge } from "@/components/mockup-badge";
import { removeProductAction } from "@/lib/actions";
import { listAdminListings } from "@/lib/data";
import { formatPrice, formatWhen, listingStatusLabel } from "@/lib/format";
import { getT } from "@/lib/i18n/locale";
import { categoryLabel } from "@/lib/labels";

export default async function AdminProductsPage() {
  const { t, locale } = await getT();
  const items = await listAdminListings();

  return (
    <section>
      <h2 className="text-xl font-semibold">{t.adminLatestListings}</h2>
      {items.length === 0 ? (
        <p className="mt-6 text-muted">{t.adminEmptyProducts}</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="admin-row flex gap-4 rounded-2xl border border-line bg-card p-3"
            >
              <Link href={`/item/${item.id}`} className="shrink-0">
                <div className="card-media relative h-[90px] w-[72px]">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt=""
                      width={72}
                      height={90}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  {item.isMockup ? <MockupBadge label={t.mockup} /> : null}
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/item/${item.id}`} className="font-medium">
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {formatPrice(item.priceAll)} {t.lek} ·{" "}
                  {listingStatusLabel(t, item.status)} ·{" "}
                  {categoryLabel(t, item.category)} ·{" "}
                  {formatWhen(item.createdAt, locale)}
                </p>
                <p className="mt-1 text-sm">
                  {t.seller}:{" "}
                  <Link href={`/user/${item.sellerId}`} className="text-blue">
                    {item.sellerName}
                  </Link>
                  {item.sellerBanned ? (
                    <span className="ml-2 chip">{t.adminBanned}</span>
                  ) : null}
                </p>
                {item.status !== "removed" ? (
                  <ConfirmAction
                    action={removeProductAction.bind(null, item.id)}
                    label={t.adminRemoveProduct}
                    confirm={t.adminRemoveConfirm}
                    className="mt-2 text-sm text-tangerine underline"
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
