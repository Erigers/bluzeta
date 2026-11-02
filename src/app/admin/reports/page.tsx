import Image from "next/image";
import Link from "next/link";
import { ConfirmAction } from "@/components/confirm-action";
import {
  banUserAction,
  dismissReportAction,
  removeProductAction,
} from "@/lib/actions";
import { listAdminReports } from "@/lib/data";
import { formatWhen, listingStatusLabel } from "@/lib/format";
import { getT } from "@/lib/i18n/locale";
import { isReportReason } from "@/lib/constants";

export default async function AdminReportsPage() {
  const { t, locale } = await getT();
  const rows = await listAdminReports();

  return (
    <section>
      <h2 className="text-xl font-semibold">{t.adminReports}</h2>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted">{t.noReports}</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {rows.map((row) => {
            const reason = isReportReason(row.reason)
              ? t.reportReasons[row.reason]
              : row.reason;
            const statusLabel =
              row.status === "resolved"
                ? t.reportStatusResolved
                : row.status === "dismissed"
                  ? t.reportStatusDismissed
                  : t.reportStatusPending;
            const image = row.listingImage?.[0];
            return (
              <li
                key={row.id}
                className="admin-row rounded-2xl border border-line bg-card p-4"
              >
                <div className="flex gap-4">
                  {image ? (
                    <Link href={`/item/${row.listingId}`} className="shrink-0">
                      <Image
                        src={image}
                        alt=""
                        width={72}
                        height={90}
                        className="h-[90px] w-[72px] rounded-xl object-cover"
                      />
                    </Link>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip" data-active={row.status === "pending"}>
                        {statusLabel}
                      </span>
                      <span className="text-sm text-muted">
                        {formatWhen(row.createdAt, locale)}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{reason}</p>
                    {row.details ? (
                      <p className="mt-1 text-sm text-muted">{row.details}</p>
                    ) : null}
                    <p className="mt-2 text-sm">
                      {t.reportedBy}:{" "}
                      <Link href={`/user/${row.reporterId}`} className="text-blue">
                        {row.reporterName}
                      </Link>
                    </p>
                    <p className="text-sm">
                      {t.reportedUser}:{" "}
                      <Link href={`/user/${row.targetId}`} className="text-blue">
                        {row.targetName}
                      </Link>
                      {row.targetBanned ? (
                        <span className="ml-2 chip">{t.adminBanned}</span>
                      ) : null}
                    </p>
                    {row.listingId && row.listingTitle ? (
                      <p className="text-sm">
                        <Link href={`/item/${row.listingId}`} className="text-blue">
                          {row.listingTitle}
                        </Link>
                        {row.listingStatus ? (
                          <span className="text-muted">
                            {" "}
                            · {listingStatusLabel(t, row.listingStatus)}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    {row.status === "pending" ? (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {row.listingId && row.listingStatus !== "removed" ? (
                          <ConfirmAction
                            action={removeProductAction.bind(null, row.listingId)}
                            label={t.adminRemoveProduct}
                            confirm={t.adminRemoveConfirm}
                            className="text-sm text-tangerine underline"
                          />
                        ) : null}
                        {row.targetBanned ? null : (
                          <ConfirmAction
                            action={banUserAction.bind(null, row.targetId)}
                            label={t.adminBanUser}
                            confirm={t.adminBanConfirm}
                            className="text-sm text-tangerine underline"
                          />
                        )}
                        <ConfirmAction
                          action={dismissReportAction.bind(null, row.id)}
                          label={t.dismissReport}
                          confirm={t.dismissReport}
                          className="text-sm text-muted underline"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
