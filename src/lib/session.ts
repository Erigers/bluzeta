import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export async function getViewer() {
  const session = await getSession();
  if (!session?.user) return null;
  const db = getDb();
  const [row] = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1);
  return {
    user: session.user,
    profile: row ?? null,
    onboarded: Boolean(row?.onboardedAt),
  };
}

export function hasSocial(row: {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
}) {
  return Boolean(row.instagram || row.facebook || row.tiktok || row.whatsapp);
}
