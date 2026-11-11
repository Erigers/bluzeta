import { and, asc, desc, eq, gte, notInArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { instagramStoryPost, listing, user } from "@/lib/db/schema";

export type StoryCandidate = {
  id: string;
  title: string;
  priceAll: number;
  images: string[];
  createdAt: Date;
};

export async function listUnpostedStoriesSince(
  since: Date,
  limit = 25,
  options?: { includeMockups?: boolean },
): Promise<StoryCandidate[]> {
  const db = getDb();
  const postedRows = await db
    .select({ listingId: instagramStoryPost.listingId })
    .from(instagramStoryPost);
  const postedIds = postedRows.map((row) => row.listingId);

  const clauses = [
    eq(listing.status, "active"),
    eq(user.banned, false),
    gte(listing.createdAt, since),
  ];
  if (!options?.includeMockups) {
    clauses.push(eq(listing.isMockup, false));
  }

  if (postedIds.length > 0) {
    clauses.push(notInArray(listing.id, postedIds));
  }

  return db
    .select({
      id: listing.id,
      title: listing.title,
      priceAll: listing.priceAll,
      images: listing.images,
      createdAt: listing.createdAt,
    })
    .from(listing)
    .innerJoin(user, eq(user.id, listing.sellerId))
    .where(and(...clauses))
    .orderBy(asc(listing.createdAt))
    .limit(limit);
}

export async function recordInstagramStoryPost(input: {
  id: string;
  listingId: string;
  imageUrl: string;
  containerId?: string | null;
  mediaId?: string | null;
}) {
  await getDb().insert(instagramStoryPost).values({
    id: input.id,
    listingId: input.listingId,
    imageUrl: input.imageUrl,
    containerId: input.containerId ?? null,
    mediaId: input.mediaId ?? null,
  });
}

export async function getListingForStory(listingId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: listing.id,
      title: listing.title,
      priceAll: listing.priceAll,
      images: listing.images,
      status: listing.status,
      isMockup: listing.isMockup,
      sellerBanned: user.banned,
    })
    .from(listing)
    .innerJoin(user, eq(user.id, listing.sellerId))
    .where(eq(listing.id, listingId))
    .limit(1);
  return row ?? null;
}

export async function getSampleListingForStoryPreview() {
  const db = getDb();
  const [row] = await db
    .select({
      id: listing.id,
      title: listing.title,
      priceAll: listing.priceAll,
      images: listing.images,
    })
    .from(listing)
    .innerJoin(user, eq(user.id, listing.sellerId))
    .where(and(eq(listing.status, "active"), eq(user.banned, false)))
    .orderBy(desc(listing.createdAt))
    .limit(1);
  return row ?? null;
}
