import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendResetPasswordEmail } from "@/lib/email";

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
        banned: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        bannedAt: {
          type: "date",
          required: false,
          input: false,
        },
        banReason: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPasswordEmail({
          to: user.email,
          name: user.name,
          url,
        });
      },
    },
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:3010",
      "https://bluzeta.com",
      "https://www.bluzeta.com",
      "https://*.vercel.app",
    ],
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const db = getDb();
            const [row] = await db
              .select({ banned: schema.user.banned })
              .from(schema.user)
              .where(eq(schema.user.id, session.userId))
              .limit(1);
            if (row?.banned) {
              throw new APIError("FORBIDDEN", {
                message: "BANNED",
              });
            }
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let _auth: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  if (!_auth) _auth = createAuth();
  return _auth;
}
