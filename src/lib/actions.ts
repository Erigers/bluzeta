"use server";

import { randomUUID } from "crypto";
import { and, eq, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import {
  conditions,
  genders,
  getNeighborhood,
  isCategory,
  isColor,
  isReportReason,
  isSubcategory,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import { interest, listing, profile, report, session, user } from "@/lib/db/schema";
import { hasSocial, getViewer, requireAdmin } from "@/lib/session";
import {
  groupIncomingByListing,
  listIncomingInterests,
  listSentInterests,
  toggleLike as toggleLikeData,
  type ThumbRating,
} from "@/lib/data";
import { parseSocials } from "@/lib/socials";
import { verifySocials } from "@/lib/verify-socials";

async function requireUser() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (viewer.banned) redirect("/");
  return viewer;
}

function revalidateListing(listingId: string, sellerId?: string) {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath(`/item/${listingId}`);
  revalidatePath("/profile");
  if (sellerId) revalidatePath(`/user/${sellerId}`);
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
  const communicationRaw = Number(formData.get("communicationScore"));
  const communicationScore = Number.isFinite(communicationRaw)
    ? Math.round(Math.min(10000, Math.max(0, communicationRaw)))
    : 0;

  const db = getDb();
  await db
    .insert(profile)
    .values({
      userId: viewer.user.id,
      neighborhoodId: neighborhood.id,
      lat,
      lng,
      communicationScore,
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
        communicationScore,
        instagram,
        facebook,
        tiktok,
        whatsapp,
        onboardedAt: new Date(),
      },
    });
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/user/${viewer.user.id}`);
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
  if (!item || item.status !== "active" || item.sellerId === viewer.user.id) {
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
  if (!row || row.status !== "pending") return { error: "invalid" as const };
  await db
    .update(interest)
    .set({ status: decision })
    .where(eq(interest.id, interestId));
  if (decision === "accepted") {
    await db
      .update(interest)
      .set({ status: "declined" })
      .where(
        and(
          eq(interest.listingId, row.listingId),
          eq(interest.sellerId, viewer.user.id),
          ne(interest.id, interestId),
          eq(interest.status, "pending"),
        ),
      );
  }
  revalidatePath("/inbox");
  revalidatePath("/profile");
  revalidatePath(`/item/${row.listingId}`);
  return { ok: true as const };
}

function parseTrustScore(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 0 || rounded > 10) return null;
  return rounded;
}

export async function rateBuyerAction(
  interestId: string,
  rating: ThumbRating,
  feedback: string,
  trustScore: number,
) {
  const viewer = await requireOnboarded();
  const comment = feedback.trim();
  const buyerTrustScore = parseTrustScore(trustScore);
  if (buyerTrustScore == null) {
    return { error: "invalid" as const };
  }
  if (rating === "down" && !comment) {
    return { error: "feedback" as const };
  }
  const db = getDb();
  const [row] = await db
    .select()
    .from(interest)
    .where(and(eq(interest.id, interestId), eq(interest.sellerId, viewer.user.id)))
    .limit(1);
  if (!row || row.status !== "accepted" || row.buyerTrustScore != null) {
    return { error: "invalid" as const };
  }
  await db
    .update(interest)
    .set({
      rating: row.rating ?? rating,
      feedback: comment || row.feedback || null,
      ratedAt: row.ratedAt ?? new Date(),
      buyerTrustScore,
    })
    .where(eq(interest.id, interestId));
  revalidatePath("/inbox");
  revalidatePath("/profile");
  revalidatePath(`/user/${row.buyerId}`);
  revalidatePath(`/item/${row.listingId}`);
  return { ok: true as const };
}

export async function rateSellerAction(
  interestId: string,
  trustScore: number,
  feedback: string,
) {
  const viewer = await requireOnboarded();
  const sellerTrustScore = parseTrustScore(trustScore);
  if (sellerTrustScore == null) {
    return { error: "invalid" as const };
  }
  const comment = feedback.trim();
  const db = getDb();
  const [row] = await db
    .select()
    .from(interest)
    .where(and(eq(interest.id, interestId), eq(interest.buyerId, viewer.user.id)))
    .limit(1);
  if (!row || row.status !== "accepted" || row.sellerTrustScore != null) {
    return { error: "invalid" as const };
  }
  await db
    .update(interest)
    .set({
      sellerTrustScore,
      sellerFeedback: comment || null,
      sellerRatedAt: new Date(),
    })
    .where(eq(interest.id, interestId));
  revalidatePath("/inbox");
  revalidatePath("/profile");
  revalidatePath(`/user/${row.sellerId}`);
  revalidatePath(`/item/${row.listingId}`);
  return { ok: true as const };
}

export async function verifyTradeAction(interestId: string) {
  const viewer = await requireOnboarded();
  const db = getDb();
  const [row] = await db
    .select()
    .from(interest)
    .where(eq(interest.id, interestId))
    .limit(1);
  if (!row || row.status !== "accepted") {
    return { error: "invalid" as const };
  }

  const isSeller = row.sellerId === viewer.user.id;
  const isBuyer = row.buyerId === viewer.user.id;
  if (!isSeller && !isBuyer) return { error: "invalid" as const };
  if (isSeller && row.sellerVerifiedAt) return { ok: true as const, already: true as const };
  if (isBuyer && row.buyerVerifiedAt) return { ok: true as const, already: true as const };

  const now = new Date();
  const nextSellerVerifiedAt = isSeller ? now : row.sellerVerifiedAt;
  const nextBuyerVerifiedAt = isBuyer ? now : row.buyerVerifiedAt;

  await db
    .update(interest)
    .set({
      sellerVerifiedAt: nextSellerVerifiedAt,
      buyerVerifiedAt: nextBuyerVerifiedAt,
    })
    .where(eq(interest.id, interestId));

  if (nextSellerVerifiedAt && nextBuyerVerifiedAt) {
    await db
      .update(listing)
      .set({ status: "sold" })
      .where(and(eq(listing.id, row.listingId), eq(listing.status, "active")));
  }

  revalidatePath("/inbox");
  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath(`/item/${row.listingId}`);
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
  const [incoming, sent] = await Promise.all([
    listIncomingInterests(viewer.user.id),
    listSentInterests(viewer.user.id),
  ]);
  return {
    incoming: groupIncomingByListing(incoming),
    sent,
  };
}

export async function removeProductAction(listingId: string) {
  const admin = await requireAdmin();
  const db = getDb();
  const [item] = await db
    .select()
    .from(listing)
    .where(eq(listing.id, listingId))
    .limit(1);
  if (!item || item.status === "removed") return { error: "invalid" as const };
  await db
    .update(listing)
    .set({ status: "removed" })
    .where(eq(listing.id, listingId));
  await db
    .update(report)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
      resolvedBy: admin.user.id,
    })
    .where(and(eq(report.listingId, listingId), eq(report.status, "pending")));
  revalidateListing(listingId, item.sellerId);
  return { ok: true as const };
}

export async function banUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.user.id) return { error: "self" as const };
  const db = getDb();
  const [target] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (
    !target ||
    target.banned ||
    target.role === "admin" ||
    isAdminEmail(target.email)
  ) {
    return { error: "invalid" as const };
  }
  await db
    .update(user)
    .set({
      banned: true,
      bannedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
  await db.delete(session).where(eq(session.userId, userId));
  await db
    .update(report)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
      resolvedBy: admin.user.id,
    })
    .where(and(eq(report.targetUserId, userId), eq(report.status, "pending")));
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath(`/user/${userId}`);
  return { ok: true as const };
}

export async function unbanUserAction(userId: string) {
  await requireAdmin();
  const db = getDb();
  await db
    .update(user)
    .set({
      banned: false,
      bannedAt: null,
      banReason: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath(`/user/${userId}`);
  return { ok: true as const };
}

export async function dismissReportAction(reportId: string) {
  const admin = await requireAdmin();
  await getDb()
    .update(report)
    .set({
      status: "dismissed",
      resolvedAt: new Date(),
      resolvedBy: admin.user.id,
    })
    .where(and(eq(report.id, reportId), eq(report.status, "pending")));
  revalidatePath("/admin/reports");
  return { ok: true as const };
}

export async function reportListingAction(listingId: string, formData: FormData) {
  const viewer = await requireOnboarded();
  const reason = String(formData.get("reason") || "");
  if (!isReportReason(reason)) return { error: "invalid" as const };
  const details = String(formData.get("details") || "").trim();
  const db = getDb();
  const [item] = await db
    .select()
    .from(listing)
    .where(eq(listing.id, listingId))
    .limit(1);
  if (!item || item.sellerId === viewer.user.id) {
    return { error: "invalid" as const };
  }
  const [existing] = await db
    .select({ id: report.id })
    .from(report)
    .where(
      and(eq(report.reporterId, viewer.user.id), eq(report.listingId, listingId)),
    )
    .limit(1);
  if (existing) return { ok: true as const, already: true as const };
  await db.insert(report).values({
    id: randomUUID(),
    reporterId: viewer.user.id,
    targetUserId: item.sellerId,
    listingId,
    reason,
    details,
  });
  revalidatePath("/admin/reports");
  return { ok: true as const };
}

export async function reportUserAction(
  userId: string,
  formData: FormData,
  listingId?: string,
) {
  const viewer = await requireOnboarded();
  const reason = String(formData.get("reason") || "");
  if (!isReportReason(reason) || userId === viewer.user.id) {
    return { error: "invalid" as const };
  }
  const details = String(formData.get("details") || "").trim();
  const db = getDb();
  const [target] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!target) return { error: "invalid" as const };

  if (listingId) {
    const [related] = await db
      .select({ id: interest.id })
      .from(interest)
      .where(
        and(
          eq(interest.listingId, listingId),
          or(
            and(eq(interest.buyerId, viewer.user.id), eq(interest.sellerId, userId)),
            and(eq(interest.sellerId, viewer.user.id), eq(interest.buyerId, userId)),
          ),
        ),
      )
      .limit(1);
    if (!related) return { error: "invalid" as const };
  }

  const [existing] = await db
    .select({ id: report.id })
    .from(report)
    .where(
      listingId
        ? and(
            eq(report.reporterId, viewer.user.id),
            eq(report.targetUserId, userId),
            eq(report.listingId, listingId),
          )
        : and(
            eq(report.reporterId, viewer.user.id),
            eq(report.targetUserId, userId),
            eq(report.status, "pending"),
          ),
    )
    .limit(1);
  if (existing) return { ok: true as const, already: true as const };
  await db.insert(report).values({
    id: randomUUID(),
    reporterId: viewer.user.id,
    targetUserId: userId,
    listingId: listingId ?? null,
    reason,
    details,
  });
  revalidatePath("/admin/reports");
  revalidatePath("/inbox");
  if (listingId) revalidatePath(`/item/${listingId}`);
  return { ok: true as const };
}
