import { NextResponse } from "next/server";
import {
  getListingForStory,
  getSampleListingForStoryPreview,
} from "@/lib/instagram/listings";
import { renderListingStoryImage } from "@/lib/instagram/story-image";
import { getViewer } from "@/lib/session";

export async function GET(request: Request) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const listingId = url.searchParams.get("listingId");

  const row = listingId
    ? await getListingForStory(listingId)
    : await getSampleListingForStoryPreview();

  if (!row) {
    return NextResponse.json({ error: "No listing found" }, { status: 404 });
  }

  return renderListingStoryImage({
    id: row.id,
    title: row.title,
    priceAll: row.priceAll,
    imageUrl: row.images[0] ?? null,
  });
}
