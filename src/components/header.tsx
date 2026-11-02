import { Logo } from "@/components/logo";
import { NavDrawer } from "@/components/nav-drawer";
import { SearchBar, SearchBarFallback } from "@/components/search-bar";
import Link from "next/link";
import { Suspense } from "react";

export function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto grid min-h-[var(--header-h)] max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 md:flex md:gap-4 md:py-0">
        <Link href="/" className="col-start-1 row-start-1 min-w-0 justify-self-start md:order-1">
          <Logo size={80} />
        </Link>
        <div className="col-span-2 row-start-2 min-w-0 md:order-2 md:flex-1">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
        </div>
        <div className="col-start-2 row-start-1 md:order-3">
          <NavDrawer signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}
