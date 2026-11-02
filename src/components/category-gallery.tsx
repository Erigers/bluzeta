import Image from "next/image";
import Link from "next/link";
import { categories, type Category } from "@/lib/constants";
import type { Messages } from "@/lib/i18n/messages";
import { browseHref, emptyFilters } from "@/lib/search-params";

const images: Record<Category, string> = {
  clothes: "/categories/clothes.jpg",
  computers: "/categories/computers.jpg",
  phones: "/categories/phones.jpg",
  books: "/categories/books.jpg",
  furniture: "/categories/furniture.jpg",
  accessories: "/categories/accessories.jpg",
  cards: "/categories/cards.jpg",
  sports: "/categories/sports.jpg",
  home: "/categories/home.jpg",
  music: "/categories/music.jpg",
  toys: "/categories/toys.jpg",
};

export function CategoryGallery({ t }: { t: Messages }) {
  return (
    <section className="space-y-6">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">
        {t.shopByCategory}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((id) => (
          <Link
            key={id}
            href={browseHref({ ...emptyFilters, categories: [id] })}
            className="group relative block overflow-hidden rounded-[1.2rem] bg-line"
          >
            <div className="relative aspect-[4/5] sm:aspect-[4/3]">
              <Image
                src={images[id]}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-5">
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-white">
                {t.categories[id]}
              </h3>
              <span className="btn btn-tangerine mt-3 w-fit !py-2 text-sm">
                {t.browse}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
