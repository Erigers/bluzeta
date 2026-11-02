import { and, desc, eq, gte, ilike, inArray, isNotNull, lte, notInArray, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/lib/db";
import { interest, like, listing, profile, report, user } from "@/lib/db/schema";
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
  isMockup: boolean;
  createdAt: Date;
  liked: boolean;
  distanceKm: number | null;
  distanceLabel: string | null;
};

type ViewerCoords = { lat: number; lng: number } | null;

export function listingIsMockup(row: {
  isMockup?: boolean | null;
  images: string[] | null;
}) {
  if (row.isMockup) return true;
  return (row.images ?? []).some((src) => src.includes("images.unsplash.com"));
}

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
    isMockup: listingIsMockup(row),
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
  const clauses = [eq(listing.status, "active"), eq(user.banned, false)];
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
    .innerJoin(user, eq(user.id, listing.sellerId))
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
    asAdmin?: boolean;
  },
) {
  const db = getDb();
  const [row] = await db
    .select({
      listing,
      sellerLat: profile.lat,
      sellerLng: profile.lng,
      sellerName: user.name,
      sellerBanned: user.banned,
    })
    .from(listing)
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .innerJoin(user, eq(user.id, listing.sellerId))
    .where(eq(listing.id, id))
    .limit(1);
  if (!row) return null;
  if (
    !options.asAdmin &&
    (row.listing.status === "removed" || row.sellerBanned)
  ) {
    return null;
  }

  const isOwner = options.viewerId === row.listing.sellerId;
  let liked = false;
  let myInterest: string | null = null;
  if (options.viewerId) {
    const [likeRow, interestRow] = await Promise.all([
      db
        .select()
        .from(like)
        .where(and(eq(like.userId, options.viewerId), eq(like.listingId, id)))
        .limit(1)
        .then((rows) => rows[0]),
      db
        .select({ status: interest.status })
        .from(interest)
        .where(
          and(eq(interest.buyerId, options.viewerId), eq(interest.listingId, id)),
        )
        .limit(1)
        .then((rows) => rows[0]),
    ]);
    liked = Boolean(likeRow);
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
    sellerName: row.sellerName,
    sellerBanned: row.sellerBanned,
    myInterest,
    isOwner,
    interests: isOwner ? await listIncomingInterests(row.listing.sellerId, id) : [],
  };
}

export async function getMostLikedListings(limit = 10) {
  const db = getDb();
  const rows = await db
    .select({
      id: listing.id,
      title: listing.title,
      images: listing.images,
      isMockup: listing.isMockup,
    })
    .from(listing)
    .innerJoin(user, eq(user.id, listing.sellerId))
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .where(
      and(
        eq(listing.status, "active"),
        eq(user.banned, false),
        sql`coalesce(array_length(${listing.images}, 1), 0) > 0`,
      ),
    )
    .orderBy(desc(listing.likesCount), desc(listing.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    image: row.images[0],
    title: row.title,
    isMockup: listingIsMockup(row),
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
    .innerJoin(user, eq(user.id, listing.sellerId))
    .innerJoin(profile, eq(profile.userId, listing.sellerId))
    .where(and(eq(like.userId, viewerId), eq(user.banned, false)))
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

export type ThumbRating = "up" | "down";

export type BuyerReputation = {
  up: number;
  down: number;
  comments: { rating: ThumbRating; text: string }[];
};

export type IncomingInterest = {
  id: string;
  status: string;
  createdAt: Date;
  listingId: string;
  listingTitle: string;
  listingImage: string | undefined;
  listingStatus: string;
  buyerId: string;
  buyerName: string;
  socials: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    whatsapp: string | null;
  };
  rating: ThumbRating | null;
  feedback: string | null;
  buyerTrustScore: number | null;
  sellerVerifiedAt: Date | null;
  buyerVerifiedAt: Date | null;
  reputation: BuyerReputation;
  communicationScore: number;
  trustScore: number;
};

export type SentInterest = {
  id: string;
  status: string;
  createdAt: Date;
  listingId: string;
  listingTitle: string;
  listingImage: string | undefined;
  sellerId: string;
  socials: IncomingInterest["socials"] | null;
  rating: ThumbRating | null;
  feedback: string | null;
  buyerTrustScore: number | null;
  sellerTrustScore: number | null;
  sellerFeedback: string | null;
  sellerVerifiedAt: Date | null;
  buyerVerifiedAt: Date | null;
};

export type ReceivedFeedback = {
  rating: ThumbRating;
  feedback: string | null;
  listingTitle: string;
  listingId: string;
  ratedAt: Date | null;
};

export type IncomingListingGroup = {
  listingId: string;
  listingTitle: string;
  listingImage: string | undefined;
  listingStatus: string;
  hasChosen: boolean;
  buyers: IncomingInterest[];
};

function asThumb(value: string | null | undefined): ThumbRating | null {
  return value === "up" || value === "down" ? value : null;
}

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function emptyReputation(): BuyerReputation {
  return { up: 0, down: 0, comments: [] };
}

export async function getBuyerReputations(
  buyerIds: string[],
  excludeInterestIds: string[] = [],
) {
  const map = new Map<string, BuyerReputation>();
  for (const id of buyerIds) map.set(id, emptyReputation());
  if (buyerIds.length === 0) return map;

  const filters = [
    inArray(interest.buyerId, buyerIds),
    isNotNull(interest.rating),
  ];
  if (excludeInterestIds.length > 0) {
    filters.push(notInArray(interest.id, excludeInterestIds));
  }

  const rows = await getDb()
    .select({
      buyerId: interest.buyerId,
      rating: interest.rating,
      feedback: interest.feedback,
      ratedAt: interest.ratedAt,
    })
    .from(interest)
    .where(and(...filters))
    .orderBy(desc(interest.ratedAt));

  for (const row of rows) {
    const entry = map.get(row.buyerId);
    if (!entry) continue;
    const thumb = asThumb(row.rating);
    if (thumb === "up") entry.up += 1;
    else if (thumb === "down") entry.down += 1;
    if (thumb && row.feedback && entry.comments.length < 3) {
      entry.comments.push({ rating: thumb, text: row.feedback });
    }
  }
  return map;
}

export async function getTrustScores(userIds: string[]) {
  const map = new Map<string, number>();
  for (const id of userIds) map.set(id, 0);
  if (userIds.length === 0) return map;

  const rows = await getDb()
    .select({
      buyerId: interest.buyerId,
      sellerId: interest.sellerId,
      buyerTrustScore: interest.buyerTrustScore,
      sellerTrustScore: interest.sellerTrustScore,
    })
    .from(interest)
    .where(
      or(
        and(inArray(interest.buyerId, userIds), isNotNull(interest.buyerTrustScore)),
        and(inArray(interest.sellerId, userIds), isNotNull(interest.sellerTrustScore)),
      ),
    );

  const totals = new Map<string, { sum: number; count: number }>();
  for (const id of userIds) totals.set(id, { sum: 0, count: 0 });

  for (const row of rows) {
    if (row.buyerTrustScore != null) {
      const entry = totals.get(row.buyerId);
      if (entry) {
        entry.sum += row.buyerTrustScore;
        entry.count += 1;
      }
    }
    if (row.sellerTrustScore != null) {
      const entry = totals.get(row.sellerId);
      if (entry) {
        entry.sum += row.sellerTrustScore;
        entry.count += 1;
      }
    }
  }

  for (const [id, entry] of totals) {
    map.set(id, entry.count ? Math.round((entry.sum / entry.count) * 10) / 10 : 0);
  }
  return map;
}

export async function listIncomingInterests(sellerId: string, listingId?: string) {
  const db = getDb();
  const rows = await db
    .select({
      interest,
      listing,
      buyerName: user.name,
      buyerId: user.id,
      buyerInstagram: profile.instagram,
      buyerFacebook: profile.facebook,
      buyerTiktok: profile.tiktok,
      buyerWhatsapp: profile.whatsapp,
      communicationScore: profile.communicationScore,
    })
    .from(interest)
    .innerJoin(listing, eq(listing.id, interest.listingId))
    .innerJoin(user, eq(user.id, interest.buyerId))
    .innerJoin(profile, eq(profile.userId, interest.buyerId))
    .where(
      listingId
        ? and(eq(interest.sellerId, sellerId), eq(interest.listingId, listingId))
        : eq(interest.sellerId, sellerId),
    )
    .orderBy(desc(interest.createdAt));

  const buyerIds = rows.map((row) => row.buyerId);
  const [reputations, trustScores] = await Promise.all([
    getBuyerReputations(buyerIds, rows.map((row) => row.interest.id)),
    getTrustScores(buyerIds),
  ]);

  return rows.map((row) => ({
    id: row.interest.id,
    status: row.interest.status,
    createdAt: row.interest.createdAt,
    listingId: row.listing.id,
    listingTitle: row.listing.title,
    listingImage: row.listing.images[0],
    listingStatus: row.listing.status,
    buyerId: row.buyerId,
    buyerName: firstName(row.buyerName),
    socials: {
      instagram: row.buyerInstagram,
      facebook: row.buyerFacebook,
      tiktok: row.buyerTiktok,
      whatsapp: row.buyerWhatsapp,
    },
    rating: asThumb(row.interest.rating),
    feedback: row.interest.feedback,
    buyerTrustScore: row.interest.buyerTrustScore,
    sellerVerifiedAt: row.interest.sellerVerifiedAt,
    buyerVerifiedAt: row.interest.buyerVerifiedAt,
    reputation: reputations.get(row.buyerId) ?? emptyReputation(),
    communicationScore: row.communicationScore ?? 0,
    trustScore: trustScores.get(row.buyerId) ?? 0,
  })) satisfies IncomingInterest[];
}

export function groupIncomingByListing(rows: IncomingInterest[]): IncomingListingGroup[] {
  const groups: IncomingListingGroup[] = [];
  const index = new Map<string, number>();
  for (const row of rows) {
    const existing = index.get(row.listingId);
    if (existing == null) {
      index.set(row.listingId, groups.length);
      groups.push({
        listingId: row.listingId,
        listingTitle: row.listingTitle,
        listingImage: row.listingImage,
        listingStatus: row.listingStatus,
        hasChosen: row.status === "accepted",
        buyers: [row],
      });
    } else {
      const group = groups[existing];
      group.buyers.push(row);
      if (row.status === "accepted") group.hasChosen = true;
    }
  }
  return groups;
}

export async function listSentInterests(buyerId: string) {
  const db = getDb();
  const rows = await db
    .select({
      interest,
      listing,
      sellerInstagram: profile.instagram,
      sellerFacebook: profile.facebook,
      sellerTiktok: profile.tiktok,
      sellerWhatsapp: profile.whatsapp,
    })
    .from(interest)
    .innerJoin(listing, eq(listing.id, interest.listingId))
    .leftJoin(profile, eq(profile.userId, interest.sellerId))
    .where(eq(interest.buyerId, buyerId))
    .orderBy(desc(interest.createdAt));

  return rows.map((row) => ({
    id: row.interest.id,
    status: row.interest.status,
    createdAt: row.interest.createdAt,
    listingId: row.listing.id,
    listingTitle: row.listing.title,
    listingImage: row.listing.images[0],
    sellerId: row.listing.sellerId,
    socials:
      row.interest.status === "accepted"
        ? {
            instagram: row.sellerInstagram,
            facebook: row.sellerFacebook,
            tiktok: row.sellerTiktok,
            whatsapp: row.sellerWhatsapp,
          }
        : null,
    rating: asThumb(row.interest.rating),
    feedback: row.interest.feedback,
    buyerTrustScore: row.interest.buyerTrustScore,
    sellerTrustScore: row.interest.sellerTrustScore,
    sellerFeedback: row.interest.sellerFeedback,
    sellerVerifiedAt: row.interest.sellerVerifiedAt,
    buyerVerifiedAt: row.interest.buyerVerifiedAt,
  })) satisfies SentInterest[];
}

export async function getReceivedFeedback(userId: string) {
  const rows = await getDb()
    .select({
      rating: interest.rating,
      feedback: interest.feedback,
      ratedAt: interest.ratedAt,
      listingTitle: listing.title,
      listingId: listing.id,
    })
    .from(interest)
    .innerJoin(listing, eq(listing.id, interest.listingId))
    .where(and(eq(interest.buyerId, userId), isNotNull(interest.rating)))
    .orderBy(desc(interest.ratedAt));

  return rows.flatMap((row) => {
    const rating = asThumb(row.rating);
    if (!rating) return [];
    return [
      {
        rating,
        feedback: row.feedback,
        listingTitle: row.listingTitle,
        listingId: row.listingId,
        ratedAt: row.ratedAt,
      } satisfies ReceivedFeedback,
    ];
  });
}

export async function getPublicSeller(
  userId: string,
  options: {
    viewerId?: string;
    viewerCoords: ViewerCoords;
    locale: Locale;
    asAdmin?: boolean;
  },
) {
  const db = getDb();
  const [seller] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
      communicationScore: profile.communicationScore,
    })
    .from(user)
    .leftJoin(profile, eq(profile.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);
  if (!seller) return null;

  const trustScores = await getTrustScores([userId]);
  const scores = {
    communicationScore: seller.communicationScore ?? 0,
    trustScore: trustScores.get(userId) ?? 0,
  };

  if (seller.banned && !options.asAdmin) {
    return {
      id: seller.id,
      name: seller.name,
      image: seller.image,
      banned: seller.banned,
      createdAt: seller.createdAt,
      ...scores,
      listings: [] as PublicListing[],
    };
  }

  const clauses = [eq(listing.sellerId, userId)];
  if (!options.asAdmin) clauses.push(eq(listing.status, "active"));

  const rows = await db
    .select({
      listing,
      sellerLat: profile.lat,
      sellerLng: profile.lng,
    })
    .from(listing)
    .leftJoin(profile, eq(profile.userId, listing.sellerId))
    .where(and(...clauses))
    .orderBy(desc(listing.createdAt));

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

  return {
    id: seller.id,
    name: seller.name,
    image: seller.image,
    banned: seller.banned,
    createdAt: seller.createdAt,
    ...scores,
    listings: rows.map((row) =>
      toPublic(
        { ...row.listing, sellerLat: row.sellerLat ?? undefined, sellerLng: row.sellerLng ?? undefined },
        options.viewerCoords,
        options.locale,
        likedIds,
      ),
    ),
  };
}

export async function listAdminListings() {
  const db = getDb();
  return db
    .select({
      id: listing.id,
      title: listing.title,
      priceAll: listing.priceAll,
      status: listing.status,
      images: listing.images,
      isMockup: listing.isMockup,
      createdAt: listing.createdAt,
      likesCount: listing.likesCount,
      category: listing.category,
      sellerId: user.id,
      sellerName: user.name,
      sellerBanned: user.banned,
    })
    .from(listing)
    .innerJoin(user, eq(user.id, listing.sellerId))
    .orderBy(desc(listing.createdAt))
    .limit(120);
}

export async function countPendingReports() {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(report)
    .where(eq(report.status, "pending"));
  return Number(row?.total ?? 0);
}

export async function listAdminReports() {
  const db = getDb();
  const reporter = alias(user, "reporter");
  const target = alias(user, "target");
  return db
    .select({
      id: report.id,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      listingId: report.listingId,
      listingTitle: listing.title,
      listingImage: listing.images,
      listingStatus: listing.status,
      reporterId: reporter.id,
      reporterName: reporter.name,
      targetId: target.id,
      targetName: target.name,
      targetBanned: target.banned,
    })
    .from(report)
    .innerJoin(reporter, eq(reporter.id, report.reporterId))
    .innerJoin(target, eq(target.id, report.targetUserId))
    .leftJoin(listing, eq(listing.id, report.listingId))
    .orderBy(
      sql`case when ${report.status} = 'pending' then 0 else 1 end`,
      desc(report.createdAt),
    )
    .limit(120);
}
