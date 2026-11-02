import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import { listing } from "../src/lib/db/schema";

async function main() {
  const db = getDb();
  await db
    .update(listing)
    .set({
      images: [
        "https://images.unsplash.com/photo-1572635196237-14b3f2816fef?auto=format&fit=crop&w=1200&q=80",
      ],
    })
    .where(eq(listing.title, "Syze dielli vintage"));
}

main().then(() => process.exit(0));
