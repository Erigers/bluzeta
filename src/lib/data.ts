import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { interest, like, listing, profile, user } from "@/lib/db/schema";
import { formatDistanceKm, haversineKm } from "@/lib/geo";
import { legacyCategoryMap, type Locale } from "@/lib/constants";
import type { ListingFilters } from "@/lib/search-params";

export type { ListingFilters };

export type PublicListing = {
  id: string;
  title: string;
  description: string;
  priceAll: number;
  category: string;
  subcategory: string;
  color: string;
  gender: string;
  condition: string;
  size: string;
  images: string[];
  likesCount: number;
  status: string;
  createdAt: Date;
  liked: boolean;
  distanceKm: number | null;
  distanceLabel: string | null;
};

type ViewerCoords = { lat: number; lng: number } | null;

function toPublic(
  row: typeof listing.$inferSelect & { sellerLat?: number; sellerLng?: number },
  viewer: ViewerCoords,
  locale: Locale,
  likedIds: Set<string>,
): PublicListing {
  const distanceKm =
    viewer && row.sellerLat != null && row.sellerLng != null
      ? haversineKm(viewer, { lat: row.sellerLat, lng: row.sellerLng })
      : null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceAll: row.priceAll,
    category: row.category,
    subcategory: row.subcategory,
    color: row.color,
    gender: row.gender,
    condition: row.condition,
    size: row.size,
    images: row.images,
    likesCount: row.likesCount,
    status: row.status,
    createdAt: row.createdAt,
    liked: likedIds.has(row.id),
    distanceKm,
    distanceLabel:
      distanceKm == null ? null : formatDistanceKm(distanceKm, locale),
  };
}

export async function listPublicListings(options: {
  filters: ListingFilters;
  viewerId?: string;
  viewerCoords: ViewerCoords;
  locale: Locale;
}) {
  const db = getDb();
  const clauses = [eq(listing.status, "active")];
  const { filters } = options;
  if (filters.categories.length) {
    const categoryValues = new Set(filters.categories);
    for (const [oldCategory, mapped] of Object.entries(legacyCategoryMap)) {
      if (categoryValues.has(mapped.category)) categoryValues.add(oldCategory);
    }
    clauses.push(inArray(listing.category, [...categoryValues]));
  }
  if (filters.subcategories.length) {
    clauses.push(
      or(
        inArray(listing.subcategory, filters.subcategories),
        inArray(listing.category, filters.subcategories),
      )!,
    );
  }
  if (filters.colors.length) {
    clauses.push(inArray(listing.color, filters.colors));
  }
  if (filters.conditions.length) {
    clauses.push(inArray(listing.condition, filters.conditions));
  }
  if (filters.minPrice != null) {
    clauses.push(gte(listing.priceAll, filters.minPrice));
  }
  if (filters.maxPrice != null) {
    clauses.push(lte(listing.priceAll, filters.maxPrice));
  }
  if (filters.q) {
    const q = filters.q.replace(/[%_]/g, " ").trim();
    if (q) {
      clauses.push(
        or(
          ilike(listing.title, `%${q}%`),
          ilike(listing.description, `%${q}%`),
        )!,
      );
    }
  }

  const rows = await db
    .select({
      listing,
      sellerLat: profile.lat,
      sellerLng: profile.lng,
    })
    .from(listing)
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .where(and(...clauses))
    .orderBy(desc(listing.createdAt))
    .limit(60);

  const likedIds = new Set<string>();
  if (options.viewerId && rows.length) {
    const liked = await db
      .select({ listingId: like.listingId })
      .from(like)
      .where(
        and(
          eq(like.userId, options.viewerId),
          inArray(
            like.listingId,
            rows.map((r) => r.listing.id),
          ),
        ),
      );
    for (const item of liked) likedIds.add(item.listingId);
  }

  const publicRows = rows.map((row) =>
    toPublic(
      { ...row.listing, sellerLat: row.sellerLat, sellerLng: row.sellerLng },
      options.viewerCoords,
      options.locale,
      likedIds,
    ),
  );

  const sort = options.filters.sort ?? "newest";
  if (sort === "cheapest") {
    publicRows.sort((a, b) => a.priceAll - b.priceAll);
  } else if (sort === "liked") {
    publicRows.sort((a, b) => b.likesCount - a.likesCount);
  } else if (sort === "near" && options.viewerCoords) {
    publicRows.sort(
      (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999),
    );
  }
  return publicRows;
}

export async function getPublicListing(
  id: string,
  options: {
    viewerId?: string;
    viewerCoords: ViewerCoords;
    locale: Locale;
  },
) {
  const db = getDb();
  const [row] = await db
    .select({
      listing,
      sellerLat: profile.lat,
      sellerLng: profile.lng,
      sellerName: user.name,
    })
    .from(listing)
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .innerJoin(user, eq(user.id, listing.sellerId))
    .where(eq(listing.id, id))
    .limit(1);
  if (!row) return null;

  let liked = false;
  let myInterest: string | null = null;
  if (options.viewerId) {
    const [likeRow] = await db
      .select()
      .from(like)
      .where(and(eq(like.userId, options.viewerId), eq(like.listingId, id)))
      .limit(1);
    liked = Boolean(likeRow);
    const [interestRow] = await db
      .select({ status: interest.status })
      .from(interest)
      .where(
        and(eq(interest.buyerId, options.viewerId), eq(interest.listingId, id)),
      )
      .limit(1);
    myInterest = interestRow?.status ?? null;
  }

  return {
    ...toPublic(
      { ...row.listing, sellerLat: row.sellerLat, sellerLng: row.sellerLng },
      options.viewerCoords,
      options.locale,
      liked ? new Set([id]) : new Set(),
    ),
    sellerId: row.listing.sellerId,
    myInterest,
    isOwner: options.viewerId === row.listing.sellerId,
  };
}

export async function getMostLikedListings(limit = 10) {
  const db = getDb();
  const rows = await db
    .select({
      id: listing.id,
      title: listing.title,
      images: listing.images,
    })
    .from(listing)
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .where(
      and(
        eq(listing.status, "active"),
        sql`coalesce(array_length(${listing.images}, 1), 0) > 0`,
      ),
    )
    .orderBy(desc(listing.likesCount), desc(listing.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    image: row.images[0],
    title: row.title,
  }));
}

export async function getTotalLikes() {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(like);
  return Number(row?.total ?? 0);
}

export async function getLikedListings(
  viewerId: string,
  viewerCoords: ViewerCoords,
  locale: Locale,
) {
  const db = getDb();
  const rows = await db
    .select({
      listing,
      sellerLat: profile.lat,
      sellerLng: profile.lng,
    })
    .from(like)
    .innerJoin(listing, eq(listing.id, like.listingId))
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .where(eq(like.userId, viewerId))
    .orderBy(desc(like.createdAt));
  return rows.map((row) =>
    toPublic(
      { ...row.listing, sellerLat: row.sellerLat, sellerLng: row.sellerLng },
      viewerCoords,
      locale,
      new Set(rows.map((r) => r.listing.id)),
    ),
  );
}

export async function getMyListings(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(listing)
    .where(eq(listing.sellerId, userId))
    .orderBy(desc(listing.createdAt));
}

export async function toggleLike(userId: string, listingId: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(like)
    .where(and(eq(like.userId, userId), eq(like.listingId, listingId)))
    .limit(1);
  if (existing) {
    await db
      .delete(like)
      .where(and(eq(like.userId, userId), eq(like.listingId, listingId)));
    await db
      .update(listing)
      .set({ likesCount: sql`greatest(${listing.likesCount} - 1, 0)` })
      .where(eq(listing.id, listingId));
    return false;
  }
  await db.insert(like).values({ userId, listingId });
  await db
    .update(listing)
    .set({ likesCount: sql`${listing.likesCount} + 1` })
    .where(eq(listing.id, listingId));
  return true;
}
