import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import { account, interest, listing, profile, report, user } from "../src/lib/db/schema";
import { legacyCategoryMap } from "../src/lib/constants";

const DEMO_PASSWORD = "bluzeta-demo";

const people = [
  {
    name: "Bluzeta Admin",
    email: "admin@bluzeta.com",
    role: "admin",
    neighborhoodId: "qender",
    lat: 41.3275,
    lng: 19.8187,
    communicationScore: 9200,
    instagram: "bluzeta",
    facebook: null as string | null,
    tiktok: null as string | null,
    whatsapp: "+355690000000",
  },
  {
    name: "Ana Hoxha",
    email: "ana@bluzeta.al",
    role: "user",
    neighborhoodId: "blloku",
    lat: 41.3218,
    lng: 19.8165,
    communicationScore: 7800,
    instagram: "ana.hoxha",
    facebook: null as string | null,
    tiktok: null as string | null,
    whatsapp: "+355692000001",
  },
  {
    name: "Lira Meta",
    email: "lira@bluzeta.al",
    role: "user",
    neighborhoodId: "komuna",
    lat: 41.3182,
    lng: 19.8042,
    communicationScore: 6400,
    instagram: "lira.fits",
    facebook: null,
    tiktok: "lirafits",
    whatsapp: null,
  },
  {
    name: "Arben Dervishi",
    email: "arben@bluzeta.al",
    role: "user",
    neighborhoodId: "lapraka",
    lat: 41.3412,
    lng: 19.794,
    communicationScore: 5100,
    instagram: null,
    facebook: "arben.dervishi",
    tiktok: null,
    whatsapp: "+355693000003",
  },
];

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const items = [
  {
    email: "ana@bluzeta.al",
    title: "Xhaketë lëkure e zezë",
    description: "Mban ende formën, pa gërvishtje të mëdha. Më shkon e ngushtë tani.",
    priceAll: 4500,
    category: "clothes",
    subcategory: "outerwear",
    color: "black",
    gender: "women",
    condition: "like_new",
    size: "M",
    images: [photo("photo-1551028719-00167b16eac5")],
  },
  {
    email: "ana@bluzeta.al",
    title: "Fustan veror me lule",
    description: "Veshur 2 herë. Pambuk i lehtë, i përsosur për Bllokun.",
    priceAll: 2200,
    category: "clothes",
    subcategory: "dresses",
    color: "pink",
    gender: "women",
    condition: "like_new",
    size: "S",
    images: [photo("photo-1539008835657-9e8e9680c956")],
  },
  {
    email: "ana@bluzeta.al",
    title: "Çantë lëkure kafe",
    description: "Ka disa shenja përdorimi te doreza, por qëndron shumë mirë.",
    priceAll: 3000,
    category: "clothes",
    subcategory: "bags",
    color: "brown",
    gender: "women",
    condition: "used",
    size: "One size",
    images: [photo("photo-1548036328-c9fa89d128fa")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Xhinse blu Zara",
    description: "Mom fit, pothuajse të reja. Më kanë mbetur të mëdha.",
    priceAll: 1800,
    category: "clothes",
    subcategory: "jeans",
    color: "blue",
    gender: "women",
    condition: "new",
    size: "M",
    images: [photo("photo-1542272604-787c3835535d")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Bluzë e bardhë oversize",
    description: "Pambuk i trashë. E re, me etiketë.",
    priceAll: 900,
    category: "clothes",
    subcategory: "tops",
    color: "white",
    gender: "unisex",
    condition: "new",
    size: "L",
    images: [photo("photo-1521572163474-6864f9cf17ab")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Syze dielli vintage",
    description: "Pa gërvishtje në xham. Kuti nuk ka.",
    priceAll: 700,
    category: "accessories",
    subcategory: "sunglasses",
    color: "brown",
    gender: "unisex",
    condition: "like_new",
    size: "",
    images: [photo("photo-1473496169904-658ba7c44d8a")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Fund e zezë midi",
    description: "Për dalje. Ka një fill të lirshëm te tepiha, lehtësisht i rregullueshëm.",
    priceAll: 1100,
    category: "clothes",
    subcategory: "skirts",
    color: "black",
    gender: "women",
    condition: "used",
    size: "S",
    images: [photo("photo-1583496661160-fb5886a0aaaa")],
  },
  {
    email: "arben@bluzeta.al",
    title: "Nike Air Force 1",
    description: "Të pastra, me kuti. Numër 42. I kam veshur pak.",
    priceAll: 5500,
    category: "clothes",
    subcategory: "shoes",
    color: "white",
    gender: "men",
    condition: "like_new",
    size: "42",
    images: [photo("photo-1542291026-7eec264c27ff")],
  },
  {
    email: "arben@bluzeta.al",
    title: "Pallto leshi gri",
    description: "E ngrohtë për dimër. Ka një njollë të vogël te mënga.",
    priceAll: 4000,
    category: "clothes",
    subcategory: "outerwear",
    color: "gray",
    gender: "men",
    condition: "used",
    size: "L",
    images: [photo("photo-1539533018447-63fcce2678e3")],
  },
  {
    email: "arben@bluzeta.al",
    title: "Këmishë blu e kaltër",
    description: "Oxford classic. E reja e dollapit, s’e kam veshur.",
    priceAll: 1500,
    category: "clothes",
    subcategory: "shirts",
    color: "blue",
    gender: "men",
    condition: "new",
    size: "M",
    images: [photo("photo-1596755094514-f87e34085b2c")],
  },
  {
    email: "arben@bluzeta.al",
    title: "Çizme dimri",
    description: "Të forta, por jo për dalje elegante. Për shi dhe të ftohtë.",
    priceAll: 2000,
    category: "clothes",
    subcategory: "shoes",
    color: "brown",
    gender: "unisex",
    condition: "worn",
    size: "41",
    images: [photo("photo-1543163521-1bf539c55dd2")],
  },
  {
    email: "ana@bluzeta.al",
    title: "Xhaketë për fëmijë",
    description: "Për 4-5 vjeç. E pastër, e larë. Fëmija u rrit.",
    priceAll: 1300,
    category: "clothes",
    subcategory: "kids",
    color: "red",
    gender: "kids",
    condition: "like_new",
    size: "S",
    images: [photo("photo-1519238263530-99bdd11df2ea")],
  },
  {
    email: "arben@bluzeta.al",
    title: "MacBook Air M1",
    description: "8GB RAM, 256GB. Punon shumë mirë, bateria mban. Me karikues.",
    priceAll: 65000,
    category: "computers",
    subcategory: "laptops",
    color: "silver",
    gender: "unisex",
    condition: "like_new",
    size: "",
    images: [photo("photo-1517336714731-489689fd1ca8")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Monitor 27\" Dell",
    description: "IPS, 144Hz. I përsosur për punë dhe lojëra. Pa kuti.",
    priceAll: 12000,
    category: "computers",
    subcategory: "monitors",
    color: "black",
    gender: "unisex",
    condition: "used",
    size: "",
    images: [photo("photo-1527443224154-c4a3942d3acf")],
  },
  {
    email: "ana@bluzeta.al",
    title: "iPhone 13",
    description: "128GB, bateri 86%. Ekrani pa gërvishtje. Me kuti dhe kabllo.",
    priceAll: 38000,
    category: "phones",
    subcategory: "smartphones",
    color: "blue",
    gender: "unisex",
    condition: "like_new",
    size: "",
    images: [photo("photo-1511707171634-5f897ff02aa9")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Koleksion kartash Pokémon",
    description: "Rreth 80 karta, disa holo. Pa rarities ultra, por të pastra.",
    priceAll: 3500,
    category: "cards",
    subcategory: "pokemon",
    color: "yellow",
    gender: "unisex",
    condition: "used",
    size: "",
    images: [photo("photo-1613771404784-3a5686aa2be3")],
  },
  {
    email: "arben@bluzeta.al",
    title: "Deck Yu-Gi-Oh! Blue-Eyes",
    description: "Deck i gatshëm, karta origjinale. I luajtur pak në lokale.",
    priceAll: 2800,
    category: "cards",
    subcategory: "yugioh",
    color: "blue",
    gender: "unisex",
    condition: "like_new",
    size: "",
    images: [photo("photo-1606107557195-0e29a4b5b4aa")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Libra shkollorë gjimnazi",
    description: "Matematikë, fizikë, letërsi. Të nënvizuar pak, por të plota.",
    priceAll: 1500,
    category: "books",
    subcategory: "textbooks",
    color: "blue",
    gender: "unisex",
    condition: "used",
    size: "",
    images: [photo("photo-1512820790803-83ca734da794")],
  },
  {
    email: "ana@bluzeta.al",
    title: "Divan 3-vendësh gri",
    description: "I rehatshëm, pa njolla të mëdha. Duhet furgon për ta marrë.",
    priceAll: 18000,
    category: "furniture",
    subcategory: "sofas",
    color: "gray",
    gender: "unisex",
    condition: "used",
    size: "",
    images: [photo("photo-1555041469-a586c61ea9bc")],
  },
  {
    email: "arben@bluzeta.al",
    title: "Bicikletë qyteti",
    description: "Marsh 6, frena në rregull. E përdorur për në punë.",
    priceAll: 8000,
    category: "sports",
    subcategory: "cycling",
    color: "green",
    gender: "unisex",
    condition: "used",
    size: "",
    images: [photo("photo-1485965120184-e220f721d03e")],
  },
  {
    email: "lira@bluzeta.al",
    title: "Kitarë akustike Yamaha",
    description: "Për fillestarë dhe mesatarë. Me këllëf të butë.",
    priceAll: 9000,
    category: "music",
    subcategory: "guitars",
    color: "brown",
    gender: "unisex",
    condition: "like_new",
    size: "",
    images: [photo("photo-1510915361894-db8b60106cb1")],
  },
];

const legacyColors: Record<string, string> = {
  tops: "white",
  shirts: "blue",
  dresses: "pink",
  skirts: "black",
  jeans: "blue",
  pants: "beige",
  outerwear: "black",
  shoes: "white",
  bags: "brown",
  accessories: "black",
  sport: "red",
  kids: "red",
};

async function main() {
  const db = getDb();
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const person of people) {
    const [existing] = await db
      .select()
      .from(user)
      .where(eq(user.email, person.email))
      .limit(1);
    const userId = existing?.id ?? randomUUID();
    if (!existing) {
      const now = new Date();
      await db.insert(user).values({
        id: userId,
        name: person.name,
        email: person.email,
        emailVerified: true,
        role: person.role ?? "user",
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }
    await db
      .update(user)
      .set({ role: person.role ?? "user" })
      .where(eq(user.email, person.email));
    await db
      .insert(profile)
      .values({
        userId,
        neighborhoodId: person.neighborhoodId,
        lat: person.lat,
        lng: person.lng,
        communicationScore: person.communicationScore,
        instagram: person.instagram,
        facebook: person.facebook,
        tiktok: person.tiktok,
        whatsapp: person.whatsapp,
        onboardedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profile.userId,
        set: {
          neighborhoodId: person.neighborhoodId,
          lat: person.lat,
          lng: person.lng,
          communicationScore: person.communicationScore,
          instagram: person.instagram,
          facebook: person.facebook,
          tiktok: person.tiktok,
          whatsapp: person.whatsapp,
          onboardedAt: new Date(),
        },
      });
  }

  for (const [oldCategory, mapped] of Object.entries(legacyCategoryMap)) {
    await db
      .update(listing)
      .set({
        category: mapped.category,
        subcategory: mapped.subcategory,
        color: legacyColors[oldCategory] ?? "black",
      })
      .where(eq(listing.category, oldCategory));
  }

  const existing = await db.select({ title: listing.title }).from(listing);
  const existingTitles = new Set(existing.map((row) => row.title));
  const users = await db.select().from(user);
  const idByEmail = new Map(users.map((row) => [row.email, row.id]));
  const toInsert = items.filter((item) => !existingTitles.has(item.title));
  if (toInsert.length > 0) {
    await db.insert(listing).values(
      toInsert.map((item) => ({
        id: randomUUID(),
        sellerId: idByEmail.get(item.email)!,
        title: item.title,
        description: item.description,
        priceAll: item.priceAll,
        category: item.category,
        subcategory: item.subcategory,
        color: item.color,
        gender: item.gender,
        condition: item.condition,
        size: item.size,
        images: [...item.images],
        isMockup: true,
      })),
    );
  }

  await db
    .update(listing)
    .set({ isMockup: true })
    .where(
      inArray(
        listing.title,
        items.map((item) => item.title),
      ),
    );

  const listingsNow = await db
    .select({
      id: listing.id,
      title: listing.title,
      sellerId: listing.sellerId,
    })
    .from(listing);
  const listingByTitle = new Map(listingsNow.map((row) => [row.title, row]));

  async function ensureInterest(options: {
    listingTitle: string;
    buyerEmail: string;
    status?: string;
    rating?: "up" | "down" | null;
    feedback?: string | null;
    buyerTrustScore?: number | null;
    sellerTrustScore?: number | null;
    sellerFeedback?: string | null;
  }) {
    const item = listingByTitle.get(options.listingTitle);
    const buyerId = idByEmail.get(options.buyerEmail);
    if (!item || !buyerId || item.sellerId === buyerId) return;
    const values = {
      status: options.status ?? "pending",
      rating: options.rating ?? null,
      feedback: options.feedback ?? null,
      ratedAt: options.rating ? new Date() : null,
      buyerTrustScore: options.buyerTrustScore ?? null,
      sellerTrustScore: options.sellerTrustScore ?? null,
      sellerFeedback: options.sellerFeedback ?? null,
      sellerRatedAt: options.sellerTrustScore != null ? new Date() : null,
    };
    const [existing] = await db
      .select({ id: interest.id })
      .from(interest)
      .where(and(eq(interest.listingId, item.id), eq(interest.buyerId, buyerId)))
      .limit(1);
    if (existing) {
      await db.update(interest).set(values).where(eq(interest.id, existing.id));
      return;
    }
    await db.insert(interest).values({
      id: randomUUID(),
      listingId: item.id,
      buyerId,
      sellerId: item.sellerId,
      ...values,
    });
  }

  await ensureInterest({
    listingTitle: "Xhaketë lëkure e zezë",
    buyerEmail: "lira@bluzeta.al",
  });
  await ensureInterest({
    listingTitle: "Xhaketë lëkure e zezë",
    buyerEmail: "arben@bluzeta.al",
  });
  await ensureInterest({
    listingTitle: "Nike Air Force 1",
    buyerEmail: "lira@bluzeta.al",
    status: "accepted",
    rating: "up",
    feedback: "Takimi në Bllok ishte i qetë, pagesa cash pa problem.",
    buyerTrustScore: 9,
    sellerTrustScore: 8,
    sellerFeedback: "Shitësi erdhi në kohë dhe ishte korrekt.",
  });
  await ensureInterest({
    listingTitle: "Xhinse blu Zara",
    buyerEmail: "ana@bluzeta.al",
  });

  const [sampleListing] = await db
    .select({ id: listing.id, sellerId: listing.sellerId })
    .from(listing)
    .where(eq(listing.title, "Xhaketë lëkure e zezë"))
    .limit(1);
  const liraId = idByEmail.get("lira@bluzeta.al");
  if (sampleListing && liraId) {
    const [existingReport] = await db
      .select({ id: report.id })
      .from(report)
      .where(eq(report.listingId, sampleListing.id))
      .limit(1);
    if (!existingReport) {
      await db.insert(report).values({
        id: randomUUID(),
        reporterId: liraId,
        targetUserId: sampleListing.sellerId,
        listingId: sampleListing.id,
        reason: "fake",
        details: "Foto duket e kopjuar.",
      });
    }
  }

  console.log(
    "Seed complete. Demo logins: admin@bluzeta.com / ana@bluzeta.al / lira@bluzeta.al / arben@bluzeta.al (password: bluzeta-demo)",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
