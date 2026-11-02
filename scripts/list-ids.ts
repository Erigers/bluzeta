import { getDb } from "../src/lib/db";
import { listing } from "../src/lib/db/schema";

async function main() {
  const rows = await getDb().select({ id: listing.id, title: listing.title, sellerId: listing.sellerId }).from(listing);
  for (const row of rows) console.log(`${row.id}\t${row.title}\t${row.sellerId}`);
}

main().then(() => process.exit(0));
