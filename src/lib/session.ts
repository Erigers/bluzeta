import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { isAdminEmail } from "@/lib/admin";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { profile, user } from "@/lib/db/schema";

export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export const getViewer = cache(async () => {
  const session = await getSession();
  if (!session?.user) return null;
  const db = getDb();
  const [row] = await db
    .select({
      profile,
      role: user.role,
      banned: user.banned,
    })
    .from(user)
    .leftJoin(profile, eq(profile.userId, user.id))
    .where(eq(user.id, session.user.id))
    .limit(1);
  if (!row) return null;
  const banned = Boolean(row.banned);
  return {
    user: session.user,
    profile: row.profile ?? null,
    onboarded: Boolean(row.profile?.onboardedAt),
    banned,
    isAdmin: !banned && (row.role === "admin" || isAdminEmail(session.user.email)),
  };
});

export async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=/admin");
  if (!viewer.isAdmin) redirect("/");
  return viewer;
}

export function hasSocial(row: {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
}) {
  return Boolean(row.instagram || row.facebook || row.tiktok || row.whatsapp);
}
