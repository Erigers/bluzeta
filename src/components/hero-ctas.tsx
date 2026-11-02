import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages";

export function HeroCtas({
  t,
  signedIn,
}: {
  t: Messages;
  signedIn: boolean;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={signedIn ? "/sell" : "/sign-up"}
        className="btn btn-tangerine px-5"
      >
        {t.startSelling}
      </Link>
      <Link href="/browse" className="btn btn-ghost bg-card/80 px-5 backdrop-blur-sm">
        {t.browseAll}
      </Link>
    </div>
  );
}
