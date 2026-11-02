"use server";

import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  conditions,
  genders,
  getNeighborhood,
  isCategory,
  isColor,
  isSubcategory,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import { interest, listing, profile, user } from "@/lib/db/schema";
import { hasSocial, getViewer } from "@/lib/session";
import { toggleLike as toggleLikeData } from "@/lib/data";
import { parseSocials } from "@/lib/socials";
import { verifySocials } from "@/lib/verify-socials";

async function requireUser() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  return viewer;
}

async function requireOnboarded() {
  const viewer = await requireUser();
  if (!viewer.onboarded) redirect("/onboarding");
  return viewer;
}

export async function saveProfileAction(formData: FormData) {
  const viewer = await requireUser();
  const neighborhoodId = String(formData.get("neighborhoodId") || "");
  const neighborhood = getNeighborhood(neighborhoodId);
  const latRaw = formData.get("lat");
  const lngRaw = formData.get("lng");
  const lat = latRaw ? Number(latRaw) : neighborhood.lat;
  const lng = lngRaw ? Number(lngRaw) : neighborhood.lng;
  const parsed = parseSocials({
    instagram: String(formData.get("instagram") || ""),
    facebook: String(formData.get("facebook") || ""),
    tiktok: String(formData.get("tiktok") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
  });
  if (parsed.invalid.length) {
    return { error: "invalid" as const, fields: parsed.invalid };
  }
  if (parsed.empty || !hasSocial(parsed.values)) {
    return { error: "social" as const };
  }
  const missing = await verifySocials(parsed.values);
  if (missing.length) {
    return { error: "invalid" as const, fields: missing };
  }
  const { instagram, facebook, tiktok, whatsapp } = parsed.values;

  const db = getDb();
  await db
    .insert(profile)
    .values({
      userId: viewer.user.id,
      neighborhoodId: neighborhood.id,
      lat,
      lng,
      instagram,
      facebook,
      tiktok,
      whatsapp,
      onboardedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        neighborhoodId: neighborhood.id,
        lat,
        lng,
        instagram,
        facebook,
        tiktok,
        whatsapp,
        onboardedAt: new Date(),
      },
    });
  revalidatePath("/");
  redirect("/");
}

export async function createListingAction(formData: FormData) {
  const viewer = await requireOnboarded();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceAll = Number(formData.get("priceAll"));
  const category = String(formData.get("category") || "");
  const subcategory = String(formData.get("subcategory") || "");
  const color = String(formData.get("color") || "");
  const condition = String(formData.get("condition") || "");
  const isClothes = category === "clothes";
  const gender = isClothes
    ? String(formData.get("gender") || "")
    : "unisex";
  const size = isClothes ? String(formData.get("size") || "").trim() : "";
  const images = String(formData.get("images") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (
    !title ||
    !description ||
    !Number.isFinite(priceAll) ||
    priceAll <= 0 ||
    !isCategory(category) ||
    !isSubcategory(category, subcategory) ||
    !isColor(color) ||
    !conditions.includes(condition as never) ||
    (isClothes && (!genders.includes(gender as never) || !size)) ||
    images.length === 0
  ) {
    return { error: "invalid" as const };
  }

  const id = randomUUID();
  await getDb()
    .insert(listing)
    .values({
      id,
      sellerId: viewer.user.id,
      title,
      description,
      priceAll: Math.round(priceAll),
      category,
      subcategory,
      color,
      gender,
      condition,
      size,
      images,
    });
  revalidatePath("/");
  revalidatePath("/browse");
  redirect(`/item/${id}`);
}

export async function toggleLikeAction(listingId: string) {
  const viewer = await requireUser();
  const liked = await toggleLikeData(viewer.user.id, listingId);
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath(`/item/${listingId}`);
  revalidatePath("/likes");
  revalidatePath("/garden");
  return { liked };
}

export async function expressInterestAction(listingId: string) {
  const viewer = await requireOnboarded();
  const db = getDb();
  const [item] = await db
    .select()
    .from(listing)
    .where(eq(listing.id, listingId))
    .limit(1);
  if (!item || item.sellerId === viewer.user.id) {
    return { error: "invalid" as const };
  }
  await db
    .insert(interest)
    .values({
      id: randomUUID(),
      listingId,
      buyerId: viewer.user.id,
      sellerId: item.sellerId,
      status: "pending",
    })
    .onConflictDoNothing();
  revalidatePath(`/item/${listingId}`);
  revalidatePath("/inbox");
  return { ok: true as const };
}

export async function decideInterestAction(
  interestId: string,
  decision: "accepted" | "declined",
) {
  const viewer = await requireOnboarded();
  const db = getDb();
  const [row] = await db
    .select()
    .from(interest)
    .where(and(eq(interest.id, interestId), eq(interest.sellerId, viewer.user.id)))
    .limit(1);
  if (!row) return { error: "invalid" as const };
  await db
    .update(interest)
    .set({ status: decision })
    .where(eq(interest.id, interestId));
  revalidatePath("/inbox");
  return { ok: true as const };
}

export async function markSoldAction(listingId: string) {
  const viewer = await requireOnboarded();
  await getDb()
    .update(listing)
    .set({ status: "sold" })
    .where(and(eq(listing.id, listingId), eq(listing.sellerId, viewer.user.id)));
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/profile");
  revalidatePath(`/item/${listingId}`);
}

export async function getInbox() {
  const viewer = await requireOnboarded();
  const db = getDb();
  const incoming = await db
    .select({
      interest,
      listing,
      buyerName: user.name,
      buyerInstagram: profile.instagram,
      buyerFacebook: profile.facebook,
      buyerTiktok: profile.tiktok,
      buyerWhatsapp: profile.whatsapp,
    })
    .from(interest)
    .innerJoin(listing, eq(listing.id, interest.listingId))
    .innerJoin(user, eq(user.id, interest.buyerId))
    .innerJoin(profile, eq(profile.userId, interest.buyerId))
    .where(eq(interest.sellerId, viewer.user.id))
    .orderBy(desc(interest.createdAt));

  const sent = await db
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
    .where(eq(interest.buyerId, viewer.user.id))
    .orderBy(desc(interest.createdAt));

  return {
    incoming: incoming.map((row) => ({
      id: row.interest.id,
      status: row.interest.status,
      createdAt: row.interest.createdAt,
      listingId: row.listing.id,
      listingTitle: row.listing.title,
      listingImage: row.listing.images[0],
      buyerName: row.buyerName.split(" ")[0],
      socials: {
        instagram: row.buyerInstagram,
        facebook: row.buyerFacebook,
        tiktok: row.buyerTiktok,
        whatsapp: row.buyerWhatsapp,
      },
    })),
    sent: sent.map((row) => ({
      id: row.interest.id,
      status: row.interest.status,
      createdAt: row.interest.createdAt,
      listingId: row.listing.id,
      listingTitle: row.listing.title,
      listingImage: row.listing.images[0],
      socials:
        row.interest.status === "accepted"
          ? {
              instagram: row.sellerInstagram,
              facebook: row.sellerFacebook,
              tiktok: row.sellerTiktok,
              whatsapp: row.sellerWhatsapp,
            }
          : null,
    })),
  };
}
