import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  bannedAt: timestamp("banned_at"),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  neighborhoodId: text("neighborhood_id").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  communicationScore: integer("communication_score").notNull().default(0),
  instagram: text("instagram"),
  facebook: text("facebook"),
  tiktok: text("tiktok"),
  whatsapp: text("whatsapp"),
  onboardedAt: timestamp("onboarded_at"),
});

export const listing = pgTable(
  "listing",
  {
    id: text("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priceAll: integer("price_all").notNull(),
    category: text("category").notNull(),
    subcategory: text("subcategory").notNull().default(""),
    color: text("color").notNull().default(""),
    gender: text("gender").notNull(),
    condition: text("condition").notNull(),
    size: text("size").notNull(),
    images: text("images").array().notNull(),
    likesCount: integer("likes_count").notNull().default(0),
    status: text("status").notNull().default("active"),
    isMockup: boolean("is_mockup").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("listing_seller_idx").on(table.sellerId),
    index("listing_category_idx").on(table.category),
    index("listing_subcategory_idx").on(table.subcategory),
    index("listing_color_idx").on(table.color),
    index("listing_created_idx").on(table.createdAt),
    index("listing_status_idx").on(table.status),
  ],
);

export const like = pgTable(
  "like",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId] }),
    index("like_listing_idx").on(table.listingId),
  ],
);

export const report = pgTable(
  "report",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    listingId: text("listing_id").references(() => listing.id, {
      onDelete: "set null",
    }),
    reason: text("reason").notNull(),
    details: text("details").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
    resolvedBy: text("resolved_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("report_status_idx").on(table.status),
    index("report_created_idx").on(table.createdAt),
    index("report_listing_idx").on(table.listingId),
    index("report_target_idx").on(table.targetUserId),
    index("report_reporter_idx").on(table.reporterId),
  ],
);

export const interest = pgTable(
  "interest",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    rating: text("rating"),
    feedback: text("feedback"),
    ratedAt: timestamp("rated_at"),
    buyerTrustScore: integer("buyer_trust_score"),
    sellerTrustScore: integer("seller_trust_score"),
    sellerFeedback: text("seller_feedback"),
    sellerRatedAt: timestamp("seller_rated_at"),
    sellerVerifiedAt: timestamp("seller_verified_at"),
    buyerVerifiedAt: timestamp("buyer_verified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("interest_listing_buyer_idx").on(table.listingId, table.buyerId),
    index("interest_seller_idx").on(table.sellerId),
    index("interest_buyer_idx").on(table.buyerId),
  ],
);

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile, { fields: [user.id], references: [profile.userId] }),
  listings: many(listing),
  likes: many(like),
  interestsSent: many(interest, { relationName: "buyerInterests" }),
  interestsReceived: many(interest, { relationName: "sellerInterests" }),
  reportsFiled: many(report, { relationName: "reporterReports" }),
  reportsReceived: many(report, { relationName: "targetReports" }),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
}));

export const listingRelations = relations(listing, ({ one, many }) => ({
  seller: one(user, { fields: [listing.sellerId], references: [user.id] }),
  likes: many(like),
  interests: many(interest),
  reports: many(report),
}));

export const reportRelations = relations(report, ({ one }) => ({
  reporter: one(user, {
    fields: [report.reporterId],
    references: [user.id],
    relationName: "reporterReports",
  }),
  target: one(user, {
    fields: [report.targetUserId],
    references: [user.id],
    relationName: "targetReports",
  }),
  listing: one(listing, {
    fields: [report.listingId],
    references: [listing.id],
  }),
}));

export const likeRelations = relations(like, ({ one }) => ({
  user: one(user, { fields: [like.userId], references: [user.id] }),
  listing: one(listing, { fields: [like.listingId], references: [listing.id] }),
}));

export const interestRelations = relations(interest, ({ one }) => ({
  listing: one(listing, {
    fields: [interest.listingId],
    references: [listing.id],
  }),
  buyer: one(user, {
    fields: [interest.buyerId],
    references: [user.id],
    relationName: "buyerInterests",
  }),
  seller: one(user, {
    fields: [interest.sellerId],
    references: [user.id],
    relationName: "sellerInterests",
  }),
}));
