"use server";

import { randomBytes, randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { user, verification } from "@/lib/db/schema";
import { sendResetPasswordEmail } from "@/lib/email";

export type PasswordResetResult =
  | { status: "sent" }
  | { status: "not_found" }
  | { status: "error" };

function authBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3010"
  ).replace(/\/$/, "");
}

export async function requestPasswordResetAction(
  emailRaw: string,
): Promise<PasswordResetResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { status: "error" };
  }

  try {
    const db = getDb();
    const [existing] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(sql`lower(${user.email}) = ${email}`)
      .limit(1);

    if (!existing) {
      return { status: "not_found" };
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.insert(verification).values({
      id: randomUUID(),
      identifier: `reset-password:${token}`,
      value: existing.id,
      expiresAt,
    });

    const callbackURL = encodeURIComponent("/reset-password");
    const url = `${authBaseUrl()}/api/auth/reset-password/${token}?callbackURL=${callbackURL}`;

    await sendResetPasswordEmail({
      to: existing.email,
      name: existing.name,
      url,
    });

    return { status: "sent" };
  } catch (error) {
    console.error("[bluzeta] password reset failed", error);
    return { status: "error" };
  }
}
