import { NextResponse } from "next/server";
import { getListingForStory } from "@/lib/instagram/listings";
import { renderListingStoryImage } from "@/lib/instagram/story-image";
import { verifyStoryMediaUrl } from "@/lib/instagram/story-url";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  const url = new URL(request.url);
  if (
    !verifyStoryMediaUrl(
      listingId,
      url.searchParams.get("exp"),
      url.searchParams.get("sig"),
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await getListingForStory(listingId);
  if (!row || row.status === "removed" || row.sellerBanned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return renderListingStoryImage({
    id: row.id,
    title: row.title,
    priceAll: row.priceAll,
    imageUrl: row.images[0] ?? null,
  });
}
